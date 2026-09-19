// The alias layer that keeps staff identity out of the attendance questions
// sent to the AI vendor. The model only ever sees "Staff N"; this module maps
// a manager's typed names to those aliases on the way out and maps the model's
// aliases back to real names on the way in, so the mapping never leaves the app.
//
// Aliasing is a convenience for answering well, not the privacy control: the
// scrubber runs last as the backstop, so a name this layer declines to guess at
// still never reaches the vendor.

import { EMAIL_PATTERN } from "@/lib/redaction";
import {
  MIN_NAME_TOKEN_LENGTH,
  REDACTED_EMAIL,
  isCommonNameWord,
  scrubNote,
} from "@/lib/ai/scrub-notes";

const ALIAS_PREFIX = "Staff";
const ALIAS_IN_ANSWER = new RegExp(`\\b${ALIAS_PREFIX} (\\d+)\\b`, "g");
const POSSESSIVE = "(['’]s)?";

export type StaffRef = { id: string; name: string };

export type AliasEntry = { alias: string; id: string; name: string };

export type AliasMap = {
  aliasForId(id: string): string | undefined;
  entries: readonly AliasEntry[];
};

function escapeRegExp(value: string): string {
  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

export function createAliasMap(staff: StaffRef[]): AliasMap {
  // Sorted so an alias depends on the roster, not on the order the database
  // happened to return it in: the same person keeps the same alias between calls.
  const named = staff
    .filter((member) => member.name.trim().length > 0)
    .sort((a, b) => a.name.localeCompare(b.name) || a.id.localeCompare(b.id));

  const entries = named.map((member, index) => ({
    alias: `${ALIAS_PREFIX} ${index + 1}`,
    id: member.id,
    name: member.name.trim(),
  }));
  const aliasById = new Map(entries.map((entry) => [entry.id, entry.alias]));

  return { aliasForId: (id) => aliasById.get(id), entries };
}

function replaceWithAlias(text: string, source: string, alias: string): string {
  return text.replace(
    new RegExp(`\\b${source}\\b${POSSESSIVE}`, "gi"),
    (_match, possessive: string | undefined) => `${alias}${possessive ?? ""}`
  );
}

function aliasFullNames(text: string, entries: readonly AliasEntry[]): string {
  // Longest first, so a full name is consumed before any shorter name inside it.
  const byLength = [...entries].sort((a, b) => b.name.length - a.name.length);
  return byLength.reduce((result, entry) => {
    const flexibleSpacing = entry.name.split(/\s+/).map(escapeRegExp).join("\\s+");
    return replaceWithAlias(result, flexibleSpacing, entry.alias);
  }, text);
}

// A single name is only aliased when it points at exactly one person. A shared
// first name, or a word that is also ordinary prose, is left for the scrubber to
// redact: a wrong alias would answer about the wrong person, which is worse than
// a redaction.
function uniqueNameTokens(entries: readonly AliasEntry[]): Map<string, string> {
  const owners = new Map<string, Set<string>>();
  for (const entry of entries) {
    for (const token of entry.name.split(/\s+/)) {
      if (token.length < MIN_NAME_TOKEN_LENGTH || isCommonNameWord(token)) {
        continue;
      }
      const key = token.toLowerCase();
      owners.set(key, (owners.get(key) ?? new Set()).add(entry.alias));
    }
  }

  const unique = new Map<string, string>();
  for (const [token, aliases] of owners) {
    if (aliases.size === 1) {
      unique.set(token, [...aliases][0]);
    }
  }
  return unique;
}

function aliasSingleNames(text: string, entries: readonly AliasEntry[]): string {
  const tokens = uniqueNameTokens(entries);
  if (tokens.size === 0) {
    return text;
  }

  const alternation = [...tokens.keys()]
    .sort((a, b) => b.length - a.length)
    .map(escapeRegExp)
    .join("|");
  return text.replace(
    new RegExp(`\\b(${alternation})\\b${POSSESSIVE}`, "gi"),
    (_match, token: string, possessive: string | undefined) =>
      `${tokens.get(token.toLowerCase())}${possessive ?? ""}`
  );
}

export function aliasQuestion(question: string, map: AliasMap): string {
  // Emails first: an address contains name-shaped pieces, and aliasing those
  // would leave a mangled address behind instead of removing it.
  const withoutEmails = question.replace(EMAIL_PATTERN, REDACTED_EMAIL);
  const aliased = aliasSingleNames(aliasFullNames(withoutEmails, map.entries), map.entries);

  return scrubNote(
    aliased,
    map.entries.map((entry) => entry.name)
  );
}

export function dealiasAnswer(answer: string, map: AliasMap): string {
  const nameByAlias = new Map(map.entries.map((entry) => [entry.alias, entry.name]));
  return answer.replace(
    ALIAS_IN_ANSWER,
    (match, number: string) => nameByAlias.get(`${ALIAS_PREFIX} ${number}`) ?? match
  );
}
