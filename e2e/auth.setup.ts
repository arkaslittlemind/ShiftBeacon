import path from "node:path";
import { test as setup, expect, type Page } from "@playwright/test";
import { requireEnv } from "./env";

const authDir = path.join(__dirname, "..", "playwright", ".auth");

async function loginViaUniversalLogin(page: Page, email: string, password: string) {
  await page.goto("/auth/login");

  await page.getByLabel(/email|username/i).fill(email);
  await page.getByLabel(/^password\s*\*?$/i).fill(password);
  await page.getByRole("button", { name: "Continue", exact: true }).click();

  await page.waitForURL((url) => !url.hostname.endsWith("auth0.com"));
}

setup("authenticate as worker", async ({ page }) => {
  const email = requireEnv("E2E_WORKER_EMAIL");
  const password = requireEnv("E2E_WORKER_PASSWORD");

  await loginViaUniversalLogin(page, email, password);
  await page.goto("/worker/home");
  await expect(page).toHaveURL(/\/worker\/home/);

  await page.context().storageState({ path: path.join(authDir, "worker.json") });
});

setup("authenticate as manager", async ({ page }) => {
  const email = requireEnv("E2E_MANAGER_EMAIL");
  const password = requireEnv("E2E_MANAGER_PASSWORD");

  await loginViaUniversalLogin(page, email, password);
  await page.goto("/manager/dashboard");
  await expect(page).toHaveURL(/\/manager\/dashboard/);

  await page.context().storageState({ path: path.join(authDir, "manager.json") });
});
