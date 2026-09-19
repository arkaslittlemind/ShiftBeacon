// Scrubs free prose before it leaves the app for the AI vendor. This is not
// lib/observability/scrub.ts, which redacts Sentry event fields by key name;
// there is no key to look at here, only sentences a care worker typed.
//
// Known limitations, stated rather than papered over:
//
// 1. Roster matching catches staff names because we know them, but it cannot
//    reliably catch a resident's name typed into a note.
// 2. Roster tokens under MIN_NAME_TOKEN_LENGTH are skipped, so a genuinely
//    short staff name ("Jo", "Li") is not redacted. Matching it would redact
//    ordinary prose everywhere it appeared.
// 3. A roster token on COMMON_WORDS (below) only redacts when capitalised, so
//    a sentence-initial common word ("Worker was late today.") still redacts,
//    and a lowercase common-word surname used mid-sentence ("covering for
//    worker") no longer does. Both are accepted: the alternative was blanking
//    ordinary prose every time the word appeared (see COMMON_WORDS).
//
// Those gaps are why the deployed demo runs on synthetic seeded notes, and why
// anything sent from here is treated as permanently disclosed.

import { EMAIL_PATTERN } from "@/lib/redaction";

export const REDACTED_NAME = "[name]";
export const REDACTED_EMAIL = "[email]";
export const REDACTED_PHONE = "[phone]";

// Deliberately loose, then filtered by digit count below. Care notes are full
// of room numbers, times, and dates, and none of those reach nine digits.
const PHONE_CANDIDATE = /\+?\d[\d\s().-]{6,}\d/g;
const MIN_PHONE_DIGITS = 9;

// Two-letter tokens like "Al" or "Jo" would match ordinary prose, so a roster
// entry only contributes tokens long enough to plausibly identify someone.
export const MIN_NAME_TOKEN_LENGTH = 3;

// Care-setting role words that also turn up as staff names ("Casey Worker",
// "Morgan Manager") or as ordinary nouns in handover prose ("the senior on
// duty", "an agency worker", "unsettled for most of the night"). Matching
// these case-insensitively, like every other token, would blank that prose
// every time the word appeared, not just when it names someone. Restricting
// them to their capitalised form fails safe: a word missing from this list
// still over-redacts exactly as before, and only a word on the list can ever
// under-redact. Every entry here is a collision actually observed in this
// feature's own seed notes (prisma/seed-data.ts) - keep it that way; add a
// word only once a real collision shows up, not speculatively.
const COMMON_WORDS = new Set(["worker", "manager", "agency", "care", "senior", "night"]);

export function isCommonNameWord(token: string): boolean {
  return COMMON_WORDS.has(token.toLowerCase());
}

const POSSESSIVE = "(?:['’]s)?";

function escapeRegExp(value: string): string {
  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

function nameTokens(roster: string[]): string[] {
  const tokens = new Set<string>();
  for (const name of roster) {
    for (const token of name.split(/\s+/)) {
      if (token.length >= MIN_NAME_TOKEN_LENGTH) {
        tokens.add(token);
      }
    }
  }
  // Longest first so "Nowak" cannot consume part of a longer overlapping token.
  return [...tokens].sort((a, b) => b.length - a.length);
}

function redactPhones(note: string): string {
  return note.replace(PHONE_CANDIDATE, (match) => {
    const digits = match.replace(/\D/g, "").length;
    return digits >= MIN_PHONE_DIGITS ? REDACTED_PHONE : match;
  });
}

function capitalize(token: string): string {
  return token.charAt(0).toUpperCase() + token.slice(1).toLowerCase();
}

function namePattern(tokens: string[], caseInsensitive: boolean): RegExp {
  return new RegExp(
    `\\b(?:${tokens.map(escapeRegExp).join("|")})\\b${POSSESSIVE}`,
    caseInsensitive ? "gi" : "g"
  );
}

function redactNames(note: string, roster: string[]): string {
  const tokens = nameTokens(roster);
  if (tokens.length === 0) {
    return note;
  }

  const distinctive = tokens.filter((token) => !COMMON_WORDS.has(token.toLowerCase()));
  const ambiguous = tokens.filter((token) => COMMON_WORDS.has(token.toLowerCase()));

  let result = note;
  if (distinctive.length > 0) {
    result = result.replace(namePattern(distinctive, true), REDACTED_NAME);
  }
  if (ambiguous.length > 0) {
    // Matched against a forced-capitalised form, not the roster's stored
    // casing: a non-title-cased roster entry must not silently invert this
    // into matching the lowercase word instead of the actual name.
    result = result.replace(namePattern(ambiguous.map(capitalize), false), REDACTED_NAME);
  }
  return result;
}

export function scrubNote(note: string, roster: string[]): string {
  // Emails first: an address contains name-shaped tokens, and redacting those
  // individually would leave a mangled address behind instead of removing it.
  return redactNames(
    redactPhones(note.replace(EMAIL_PATTERN, REDACTED_EMAIL)),
    roster
  );
}
