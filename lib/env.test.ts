import { beforeEach, describe, expect, it, vi } from "vitest";
import { parseEnv } from "./env";

const validEnv = {
  AUTH0_DOMAIN: "example.auth0.com",
  AUTH0_CLIENT_ID: "client-id",
  AUTH0_CLIENT_SECRET: "client-secret",
  AUTH0_SECRET: "session-secret",
  APP_BASE_URL: "http://localhost:3000",
  DATABASE_URL: "postgresql://user:password@localhost:5432/shiftbeacon",
};

describe("parseEnv", () => {
  it("parses a complete, valid environment", () => {
    expect(parseEnv(validEnv)).toEqual(validEnv);
  });

  it("throws naming every missing variable", () => {
    const incomplete = { ...validEnv };
    delete (incomplete as Record<string, string | undefined>).AUTH0_DOMAIN;
    delete (incomplete as Record<string, string | undefined>).DATABASE_URL;

    expect(() => parseEnv(incomplete)).toThrowError(
      /AUTH0_DOMAIN.*DATABASE_URL|DATABASE_URL.*AUTH0_DOMAIN/
    );
  });

  it("throws when a variable is present but empty", () => {
    expect(() => parseEnv({ ...validEnv, AUTH0_SECRET: "" })).toThrowError(
      /AUTH0_SECRET/
    );
  });
});

describe("getEnv", () => {
  beforeEach(() => {
    vi.resetModules();
  });

  it("memoizes the parsed environment instead of reparsing each call", async () => {
    const { getEnv } = await import("./env");

    const first = getEnv();
    const second = getEnv();

    expect(second).toBe(first);
  });
});
