import path from "node:path";
import { execFileSync } from "node:child_process";
import { requireEnv } from "./env";

// The generated Prisma client relies on import.meta, which only works under
// ESM. Playwright's test runner transforms .spec.ts files as CommonJS, so DB
// access happens in a separate tsx (ESM) subprocess instead of an in-process
// import.
const tsxCli = path.join(path.dirname(require.resolve("tsx/package.json")), "dist/cli.mjs");
const runnerScript = path.join(__dirname, "db-runner.ts");

function runDbCommand(args: string[]): string {
  return execFileSync(process.execPath, [tsxCli, runnerScript, ...args], {
    cwd: path.join(__dirname, ".."),
    encoding: "utf-8",
  });
}

export async function resetTestShifts(): Promise<void> {
  const emails = [requireEnv("E2E_WORKER_EMAIL"), requireEnv("E2E_MANAGER_EMAIL")];
  runDbCommand(["reset-shifts", ...emails]);
}

export type Workplace = {
  name: string;
  latitude: number;
  longitude: number;
  clockInRadiusMeters: number;
};

export async function getWorkplace(): Promise<Workplace> {
  const output = runDbCommand(["get-workplace"]);
  return JSON.parse(output) as Workplace;
}
