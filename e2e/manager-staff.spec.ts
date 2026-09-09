import path from "node:path";
import { test, expect, request as playwrightRequest } from "@playwright/test";
import { getWorkplace, resetTestShifts } from "./db";

test.beforeEach(async () => {
  await resetTestShifts();
});

test("manager sees a clocked-in worker on the live staff view and their history after clock-out", async ({
  page,
  baseURL,
}) => {
  const workplace = await getWorkplace();
  const workerApi = await playwrightRequest.newContext({
    baseURL,
    storageState: path.join(__dirname, "..", "playwright", ".auth", "worker.json"),
  });

  const me = await (await workerApi.get("/api/me")).json();
  const worker: { id: string; name: string } = me.data;

  const clockInNote = `e2e drill-down check ${Date.now()}`;
  const clockIn = await workerApi.post("/api/shifts/clock-in", {
    data: { latitude: workplace.latitude, longitude: workplace.longitude, note: clockInNote },
  });
  expect(clockIn.ok()).toBeTruthy();

  await page.goto("/manager/dashboard");
  const workerRow = page.getByRole("row", { name: new RegExp(worker.name) });
  await expect(workerRow.getByText("Clocked in")).toBeVisible();

  const clockOut = await workerApi.post("/api/shifts/clock-out", {
    data: { latitude: workplace.latitude, longitude: workplace.longitude },
  });
  expect(clockOut.ok()).toBeTruthy();
  await workerApi.dispose();

  await page.goto(`/manager/staff/${worker.id}`);
  await expect(page.getByRole("heading", { name: worker.name })).toBeVisible();
  await expect(page.getByText("Clocked out", { exact: true })).toBeVisible();
  await expect(page.getByText(`Clock-in note: ${clockInNote}`)).toBeVisible();
});
