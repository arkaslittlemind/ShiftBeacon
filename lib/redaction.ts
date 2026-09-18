// Shared by both scrubbers: lib/observability/scrub.ts redacts Sentry event
// fields, lib/ai/scrub-notes.ts redacts free prose. They agree on what an email
// looks like because they read the same pattern, not because someone kept two
// copies in step.
//
// Callers must only use this with String.replace, which resets lastIndex. A
// bare .test() on a shared /g regex would carry state between call sites.
export const EMAIL_PATTERN =
  /[^\s@<>()[\]{},;:"']+@[^\s@<>()[\]{},;:"']+\.[a-z]{2,}/gi;
