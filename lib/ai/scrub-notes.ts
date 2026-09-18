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
const MIN_NAME_TOKEN_LENGTH = 3;

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

function redactNames(note: string, roster: string[]): string {
  const tokens = nameTokens(roster);
  if (tokens.length === 0) {
    return note;
  }

  const pattern = new RegExp(
    `\\b(?:${tokens.map(escapeRegExp).join("|")})\\b${POSSESSIVE}`,
    "gi"
  );
  return note.replace(pattern, REDACTED_NAME);
}

export function scrubNote(note: string, roster: string[]): string {
  // Emails first: an address contains name-shaped tokens, and redacting those
  // individually would leave a mangled address behind instead of removing it.
  return redactNames(
    redactPhones(note.replace(EMAIL_PATTERN, REDACTED_EMAIL)),
    roster
  );
}
