import { test, expect } from "@playwright/test";
import { getWorkplace, resetTestShifts } from "./db";

test.beforeEach(async ({ context, page }) => {
  await resetTestShifts();
  const workplace = await getWorkplace();

  await context.grantPermissions(["geolocation"]);
  await context.setGeolocation({ latitude: workplace.latitude, longitude: workplace.longitude });

  await page.goto("/worker/home");
});

test("worker can clock in, see the active shift, and clock out", async ({ page }) => {
  await expect(page.getByRole("status")).toContainText("You're inside the perimeter");

  await page.getByLabel("Optional note").fill("Covering an extra hour for handover");
  await page.getByRole("button", { name: "Clock In" }).click();

  await expect(page.getByText("Shift duration")).toBeVisible({ timeout: 15_000 });
  await expect(page.getByRole("button", { name: "Clock Out" })).toBeVisible();

  await page.getByLabel("Optional note").fill("Handover complete");
  await page.getByRole("button", { name: "Clock Out" }).click();

  await expect(page.getByRole("button", { name: "Clock In" })).toBeVisible({ timeout: 15_000 });
  await expect(page.getByText("Recent shifts")).toBeVisible();
  await expect(page.getByText("No completed shifts yet.")).not.toBeVisible();
});
