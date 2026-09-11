import type { NodeOptions } from "@sentry/nextjs";
import { scrubSentryEvent } from "./scrub";

const dsn = process.env.NEXT_PUBLIC_SENTRY_DSN;

// Production-only by design: local errors belong in the terminal, and dev
// noise would drown the signal in the dashboard.
export const sentryEnabled =
  process.env.NODE_ENV === "production" && Boolean(dsn);

// ShiftBeacon stores worker coordinates, so several SDK defaults are actively
// dangerous here. Each of these is off for a specific reason, not for tidiness:
//
// - httpBodies: the clock-in POST body is { latitude, longitude, note }
// - stackFrameVariables: locals inside clockIn() hold lat/lng and the computed
//   distance from the workplace
// - databaseQueryData: Prisma results carry coordinates, names, and emails
// - cookies/httpHeaders: carry the Auth0 session
//
// beforeSend (see scrub.ts) is the second line of defence, not the first.
export const sharedSentryOptions = {
  dsn,
  enabled: sentryEnabled,
  tracesSampleRate: 0.1,
  dataCollection: {
    userInfo: false,
    cookies: false,
    httpHeaders: { request: false, response: false },
    httpBodies: [],
    urlQueryParams: false,
    databaseQueryData: false,
    stackFrameVariables: false,
  },
  beforeSend: scrubSentryEvent,
  beforeSendTransaction: scrubSentryEvent,
  // `satisfies` rather than a plain literal: a misspelled dataCollection key
  // would otherwise be silently ignored, quietly re-enabling collection.
} satisfies NodeOptions;
