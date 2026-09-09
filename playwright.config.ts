import path from "node:path";
import { config } from "dotenv";
import { defineConfig, devices } from "@playwright/test";

config({ path: ".env.local" });

const authDir = path.join(__dirname, "playwright", ".auth");

export default defineConfig({
  testDir: "./e2e",
  fullyParallel: true,
  workers: 1,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  reporter: "list",
  use: {
    baseURL: "http://localhost:3000",
    trace: "on-first-retry",
  },
  projects: [
    {
      name: "chromium",
      testMatch: "smoke.spec.ts",
      use: { ...devices["Desktop Chrome"] },
    },
    {
      name: "setup",
      testMatch: "auth.setup.ts",
      use: { ...devices["Desktop Chrome"] },
    },
    {
      name: "worker",
      testMatch: "worker-*.spec.ts",
      use: { ...devices["Desktop Chrome"], storageState: path.join(authDir, "worker.json") },
      dependencies: ["setup"],
    },
    {
      name: "manager",
      testMatch: "manager-*.spec.ts",
      use: { ...devices["Desktop Chrome"], storageState: path.join(authDir, "manager.json") },
      dependencies: ["setup"],
    },
  ],
  webServer: {
    command: "npm run dev",
    url: "http://localhost:3000",
    reuseExistingServer: true,
    timeout: 120_000,
  },
});
