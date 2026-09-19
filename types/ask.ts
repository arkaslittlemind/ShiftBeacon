// A plain constant, not a schema, so a client component can import the limit
// without pulling zod into its bundle (the same reason as NOTE_MAX_LENGTH).
export const QUESTION_MAX_LENGTH = 300;

// Questions one manager may ask per hour. Plain constant so a client component
// can show it without importing the server module that enforces it.
export const ASK_LIMIT_PER_HOUR = 10;

// Every non-answer is a value the UI has to render, not an exception a caller
// can forget to catch. answeredAt is when the answer was produced, which for a
// cached answer is earlier than now.
export type AskResult =
  | { status: "ok"; answer: string; answeredAt: Date }
  | { status: "invalid"; reason: string }
  | { status: "unavailable" }
  | { status: "rate_limited"; retryAfterSeconds: number };
