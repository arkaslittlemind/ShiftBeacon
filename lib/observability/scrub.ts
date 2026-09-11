import type { Event } from "@sentry/nextjs";

export const REDACTED = "[redacted]";

// Substrings safe to match anywhere in a lowercased key. Chosen so camelCase
// composites are caught too: "clockInLatitude" and "workplaceLongitude" both
// need to go, and an exact-name list would miss them.
const SENSITIVE_KEY_PARTS = [
  "latitude",
  "longitude",
  "coord",
  "geoloc",
  "distance",
  "note",
  "email",
  "password",
  "token",
  "secret",
  "authorization",
  "cookie",
  "phone",
];

// Short or ambiguous names that would false-positive as substrings. "name"
// must stay exact or it would swallow "routeName", the tag we rely on most.
const SENSITIVE_KEYS_EXACT = new Set([
  "lat",
  "lng",
  "lon",
  "long",
  "location",
  "name",
  "fullname",
  "username",
  "address",
]);

function isSensitiveKey(key: string): boolean {
  const lower = key.toLowerCase();
  return (
    SENSITIVE_KEYS_EXACT.has(lower) ||
    SENSITIVE_KEY_PARTS.some((part) => lower.includes(part))
  );
}

const EMAIL = /[^\s@<>()[\]{},;:"']+@[^\s@<>()[\]{},;:"']+\.[a-z]{2,}/gi;

function redactEmails(value: string): string {
  return value.replace(EMAIL, REDACTED);
}

function scrubValue(value: unknown): unknown {
  if (typeof value === "string") {
    return redactEmails(value);
  }
  if (Array.isArray(value)) {
    return value.map(scrubValue);
  }
  if (value && typeof value === "object") {
    return scrubRecord(value as Record<string, unknown>);
  }
  return value;
}

function scrubRecord(input: Record<string, unknown>): Record<string, unknown> {
  const output: Record<string, unknown> = {};
  for (const [key, value] of Object.entries(input)) {
    output[key] = isSensitiveKey(key) ? REDACTED : scrubValue(value);
  }
  return output;
}

function scrubRequest(request: NonNullable<Event["request"]>) {
  const scrubbed = { ...request };
  if (scrubbed.url) {
    // A query string can carry coordinates; the path alone is what aids debugging.
    scrubbed.url = redactEmails(scrubbed.url.split("?")[0]);
  }
  if (scrubbed.query_string) {
    scrubbed.query_string = REDACTED;
  }
  if (scrubbed.data !== undefined) {
    scrubbed.data = scrubValue(scrubbed.data);
  }
  if (scrubbed.headers) {
    scrubbed.headers = scrubRecord(scrubbed.headers) as Record<string, string>;
  }
  if (scrubbed.cookies) {
    scrubbed.cookies = REDACTED as unknown as Record<string, string>;
  }
  return scrubbed;
}

function scrubBreadcrumbs(breadcrumbs: NonNullable<Event["breadcrumbs"]>) {
  return breadcrumbs.map((breadcrumb) => ({
    ...breadcrumb,
    ...(breadcrumb.data ? { data: scrubRecord(breadcrumb.data) } : {}),
    ...(breadcrumb.message ? { message: redactEmails(breadcrumb.message) } : {}),
  }));
}

function scrubException(exception: NonNullable<Event["exception"]>) {
  if (!exception.values) {
    return exception;
  }
  return {
    ...exception,
    values: exception.values.map((value) => ({
      ...value,
      ...(value.value ? { value: redactEmails(value.value) } : {}),
    })),
  };
}

// Spans are the bulk of a transaction event, and span attributes routinely
// carry URLs, query params, and DB statements.
function scrubSpans(spans: NonNullable<Event["spans"]>) {
  return spans.map((span) => ({
    ...span,
    ...(span.data
      ? { data: scrubRecord(span.data) as NonNullable<typeof span.data> }
      : {}),
  }));
}

// Last line of defence before an event leaves the process. The SDK is already
// configured not to collect bodies, cookies, locals, or DB data (see
// sentry-options.ts); this catches anything attached by hand or by an
// integration we did not anticipate.
//
// Generic so it satisfies both beforeSend (ErrorEvent) and
// beforeSendTransaction (TransactionEvent) without widening either.
export function scrubSentryEvent<T extends Event>(event: T): T {
  const scrubbed: Event = { ...event };

  if (scrubbed.message) {
    scrubbed.message = redactEmails(scrubbed.message);
  }
  if (scrubbed.request) {
    scrubbed.request = scrubRequest(scrubbed.request);
  }
  // The internal ShiftBeacon id is the one identifier we deliberately send.
  if (scrubbed.user) {
    scrubbed.user = { id: scrubbed.user.id };
  }
  if (scrubbed.extra) {
    scrubbed.extra = scrubRecord(scrubbed.extra);
  }
  if (scrubbed.contexts) {
    scrubbed.contexts = scrubRecord(scrubbed.contexts) as Event["contexts"];
  }
  if (scrubbed.tags) {
    scrubbed.tags = scrubRecord(scrubbed.tags) as Event["tags"];
  }
  if (scrubbed.breadcrumbs) {
    scrubbed.breadcrumbs = scrubBreadcrumbs(scrubbed.breadcrumbs);
  }
  if (scrubbed.exception) {
    scrubbed.exception = scrubException(scrubbed.exception);
  }
  if (scrubbed.spans) {
    scrubbed.spans = scrubSpans(scrubbed.spans);
  }

  // Safe: only existing fields were replaced, no shape change.
  return scrubbed as T;
}
