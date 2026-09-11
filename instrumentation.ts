import * as Sentry from "@sentry/nextjs";
import { getEnv, observabilityWarnings } from "@/lib/env";

// Runs once when the server starts (dev and prod), before it accepts any
// requests - this is what makes a missing env var fail fast instead of only
// surfacing lazily on whichever route happens to be hit first.
export async function register() {
  if (process.env.NEXT_RUNTIME === "nodejs") {
    getEnv();
    for (const warning of observabilityWarnings(process.env)) {
      console.warn(`[observability] ${warning}`);
    }
    await import("./sentry.server.config");
  }

  if (process.env.NEXT_RUNTIME === "edge") {
    await import("./sentry.edge.config");
  }
}

// Catches errors Next.js handles internally (server component renders, route
// handlers, server actions), which never reach our own try/catch blocks.
export const onRequestError = Sentry.captureRequestError;
