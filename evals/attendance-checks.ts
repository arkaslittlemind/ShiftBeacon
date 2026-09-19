// Pure helpers for judging an attendance eval run. No API, no fixture state, so
// the judging itself can be unit-tested: an eval that cannot tell a leak from a
// clean request proves nothing.

import { MIN_NAME_TOKEN_LENGTH, escapeRegExp } from "@/lib/ai/scrub-notes";
import type { ExpectedFact } from "./handover-cases";
import type { FixtureOrg } from "./attendance-fixtures";

const WORD_CHAR = /[\p{L}\p{N}_]/u;

// Whole-token match, case-insensitive: "Staff 2" must not match "Staff 22". A
// boundary is only demanded on an edge that is itself a word character, so a
// prefix such as "u-b-" (ends in a hyphen) still matches inside "u-b-dana".
function containsToken(text: string, needle: string): boolean {
  const before = WORD_CHAR.test(needle[0]) ? "(?<![\\p{L}\\p{N}_])" : "";
  const after = WORD_CHAR.test(needle[needle.length - 1]) ? "(?![\\p{L}\\p{N}_])" : "";
  return new RegExp(`${before}${escapeRegExp(needle)}${after}`, "iu").test(text);
}

export function findForbidden(text: string, forbidden: string[]): string[] {
  return forbidden.filter((needle) => needle.length > 0 && containsToken(text, needle));
}

function identifyingStrings(org: FixtureOrg, orgId: string): string[] {
  const strings = [orgId];
  for (const member of org.staff) {
    const nameParts = member.name
      .split(/\s+/)
      .filter((part) => part.length >= MIN_NAME_TOKEN_LENGTH);
    strings.push(member.name, ...nameParts, member.email, member.id);
  }
  return strings;
}

// True when the answer opens with the token, ignoring leading whitespace and the
// quote or list marks a model puts in front of text.
export function startsWithToken(text: string, token: string): boolean {
  const opening = text.replace(/^[\s"'“”*_>#-]+/u, "");
  return opening.toLowerCase().startsWith(token.toLowerCase());
}

// What must never appear in a request sent to the vendor: anything that
// identifies org A's staff or org A itself, and anything at all from org B. The
// model is meant to see only "Staff N" and figures.
export function findOutboundLeaks(
  bodies: string[],
  orgA: FixtureOrg,
  orgBCanaries: string[]
): string[] {
  const forbidden = [...identifyingStrings(orgA, orgA.id), ...orgBCanaries];
  const leaked = new Set<string>();
  for (const body of bodies) {
    for (const needle of findForbidden(body, forbidden)) {
      leaked.add(needle);
    }
  }
  return [...leaked];
}

export type FactScore = { recalled: number; total: number; missing: string[] };

export function scoreFacts(answer: string, facts: ExpectedFact[]): FactScore {
  const haystack = answer.toLowerCase();
  const missing = facts
    .filter((fact) => !fact.anyOf.some((phrase) => haystack.includes(phrase.toLowerCase())))
    .map((fact) => fact.label);
  return { recalled: facts.length - missing.length, total: facts.length, missing };
}
