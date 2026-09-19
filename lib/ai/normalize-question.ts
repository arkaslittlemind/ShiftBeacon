import { createHash } from "node:crypto";

// Two spellings of the same question should share one cache row, so the key
// ignores case, spacing and trailing punctuation and nothing else: a rewording
// is a different question and costs a fresh answer.
export function normalizeQuestion(question: string): string {
  return question
    .normalize("NFKC")
    .toLowerCase()
    .replace(/\s+/g, " ")
    .replace(/[\s?.!]+$/, "")
    .trim();
}

// The hash is the cache key so the question text itself is never stored.
export function hashQuestion(question: string): string {
  return createHash("sha256").update(normalizeQuestion(question)).digest("hex");
}
