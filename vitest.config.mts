import path from "node:path";
import { defineConfig } from "vitest/config";

export default defineConfig({
  resolve: {
    alias: {
      "@": path.resolve(import.meta.dirname),
    },
  },
  test: {
    environment: "jsdom",
    setupFiles: ["./vitest.setup.ts"],
    include: ["**/*.test.ts", "**/*.test.tsx"],
    exclude: ["node_modules", ".next", "e2e"],
    env: {
      // Dummy values so lib/env.ts validation passes when a test transitively
      // imports lib/prisma.ts or lib/auth0.ts without mocking them directly.
      AUTH0_DOMAIN: "test.auth0.com",
      AUTH0_CLIENT_ID: "test-client-id",
      AUTH0_CLIENT_SECRET: "test-client-secret",
      AUTH0_SECRET: "test-session-secret",
      APP_BASE_URL: "http://localhost:3000",
      DATABASE_URL: "postgresql://test:test@localhost:5432/shiftbeacon_test",
    },
  },
});
