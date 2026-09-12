// Browser-side observability init. Next.js loads this automatically, before
// the app becomes interactive.
import * as Sentry from "@sentry/nextjs";
import { sharedSentryOptions } from "@/lib/observability/sentry-options";
import { initBrowserAnalytics } from "@/lib/observability/analytics-browser";

Sentry.init({
  ...sharedSentryOptions,
});

// The module-level posthog-js import can itself throw in a hostile browser;
// nothing on this path may take page load down with it.
try {
  initBrowserAnalytics();
} catch {
  // initBrowserAnalytics already logs its own failures.
}

export const onRouterTransitionStart = Sentry.captureRouterTransitionStart;
