// A plain constant, not a schema, so a client component can import the limit
// without pulling zod into its bundle (the same reason as NOTE_MAX_LENGTH).
export const QUESTION_MAX_LENGTH = 300;

// Three states on purpose: "the vendor is down" and "that question is not
// valid" are values the UI has to render, not exceptions a caller can forget
// to catch. The rate-limited variant arrives with feature 20c; add it rather
// than reshaping these.
export type AskResult =
  | { status: "ok"; answer: string }
  | { status: "invalid"; reason: string }
  | { status: "unavailable" };
