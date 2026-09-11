// Sentry initialization for the browser. Next.js loads this automatically.
import * as Sentry from "@sentry/nextjs";
import { sharedSentryOptions } from "@/lib/observability/sentry-options";

Sentry.init({
  ...sharedSentryOptions,
});

export const onRouterTransitionStart = Sentry.captureRouterTransitionStart;
