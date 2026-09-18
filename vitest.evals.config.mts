import path from "node:path";
import { config } from "dotenv";
import { defineConfig } from "vitest/config";

// Separate from vitest.config.mts on purpose: these cases call the real Gemini
// API and spend free-tier quota, so `npm test` stays fast and offline.
config({ path: ".env.local" });

export default defineConfig({
  resolve: {
    alias: {
      "@": path.resolve(import.meta.dirname),
      "server-only": path.resolve(
        import.meta.dirname,
        "node_modules/server-only/empty.js"
      ),
    },
  },
  test: {
    environment: "node",
    include: ["evals/**/*.eval.ts"],
    // One request at a time, or the free tier's per-minute limit answers for us.
    fileParallelism: false,
    // The pacing gap between cases lives in an afterEach hook and is longer
    // than the 10s default, which would otherwise fail every case.
    hookTimeout: 120_000,
    // The reporter hides console output on a passing run, which hid the score
    // summary exactly when it was worth reading. The summary is the point of
    // this suite, not a debugging aid.
    disableConsoleIntercept: true,
    env: {
      AUTH0_DOMAIN: "evals.auth0.com",
      AUTH0_CLIENT_ID: "evals-client-id",
      AUTH0_CLIENT_SECRET: "evals-client-secret",
      AUTH0_SECRET: "evals-session-secret",
      APP_BASE_URL: "http://localhost:3000",
      DATABASE_URL: "postgresql://evals:evals@localhost:5432/shiftbeacon_evals",
    },
  },
});
