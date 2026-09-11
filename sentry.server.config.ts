// Sentry initialization for the Node.js server runtime.
// Loaded by register() in instrumentation.ts.
import * as Sentry from "@sentry/nextjs";
import { sharedSentryOptions } from "@/lib/observability/sentry-options";

Sentry.init({
  ...sharedSentryOptions,
});
