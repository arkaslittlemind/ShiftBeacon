// Sentry initialization for the edge runtime (proxy/middleware, edge routes).
// Loaded by register() in instrumentation.ts.
import * as Sentry from "@sentry/nextjs";
import { sharedSentryOptions } from "@/lib/observability/sentry-options";

Sentry.init({
  ...sharedSentryOptions,
});
