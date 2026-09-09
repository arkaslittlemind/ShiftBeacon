import { test, expect } from "@playwright/test";
import { getWorkplace, type Workplace } from "./db";

let original: Workplace;

test.beforeEach(async () => {
  original = await getWorkplace();
});

test.afterEach(async ({ page }) => {
  await page.goto("/manager/workplace");
  await page.getByLabel("Name").fill(original.name);
  await page.getByLabel("Latitude").fill(String(original.latitude));
  await page.getByLabel("Longitude").fill(String(original.longitude));
  await page.getByLabel("Clock-in radius (m)").fill(String(original.clockInRadiusMeters));
  await page.getByRole("button", { name: "Save" }).click();
  await expect(page.getByText("Saved.")).toBeVisible();
});

test("manager can update the workplace settings and see them persist", async ({ page }) => {
  await page.goto("/manager/workplace");
  await expect(page.getByLabel("Name")).toHaveValue(original.name);

  const updatedName = `${original.name} (e2e)`;
  const updatedRadius = original.clockInRadiusMeters + 50;

  await page.getByLabel("Name").fill(updatedName);
  await page.getByLabel("Clock-in radius (m)").fill(String(updatedRadius));
  await page.getByRole("button", { name: "Save" }).click();
  await expect(page.getByText("Saved.")).toBeVisible();

  await page.reload();
  await expect(page.getByLabel("Name")).toHaveValue(updatedName);
  await expect(page.getByLabel("Clock-in radius (m)")).toHaveValue(String(updatedRadius));
});
