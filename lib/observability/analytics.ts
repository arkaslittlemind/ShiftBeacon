import { PostHog } from "posthog-node";

// `undefined` means "not resolved yet", `null` means "resolved to disabled".
let client: PostHog | null | undefined;

export function getAnalyticsClient(): PostHog | null {
  if (client !== undefined) {
    return client;
  }

  // Read from process.env directly rather than getEnv(), matching
  // sentry-options.ts: getEnv() throws when required config is missing, and
  // analytics must never be the thing that takes a request down. The Zod
  // schema still validates these when they are present.
  const token = process.env.NEXT_PUBLIC_POSTHOG_PROJECT_TOKEN;
  if (process.env.NODE_ENV !== "production" || !token) {
    client = null;
    return client;
  }

  client = new PostHog(token, {
    host: process.env.NEXT_PUBLIC_POSTHOG_HOST,
    // Events are dispatched from after(), which runs post-response on a
    // serverless function that may freeze immediately afterwards. Batching
    // would lose them, so send each one as it arrives.
    flushAt: 1,
    flushInterval: 0,
  });
  return client;
}
