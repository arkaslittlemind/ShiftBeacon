import { getEnv } from "@/lib/env";

// Runs once when the server starts (dev and prod), before it accepts any
// requests - this is what makes a missing env var fail fast instead of only
// surfacing lazily on whichever route happens to be hit first.
export function register() {
  if (process.env.NEXT_RUNTIME === "nodejs") {
    getEnv();
  }
}
