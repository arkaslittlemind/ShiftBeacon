import { beforeEach, describe, expect, it, vi } from "vitest";
import { observabilityWarnings, parseEnv } from "./env";

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

  // Sentry config is deliberately optional: a missing DSN must degrade to
  // "no monitoring", never to a server that refuses to boot.
  it("parses without any Sentry variables", () => {
    expect(() => parseEnv(validEnv)).not.toThrow();
  });

  it("keeps Sentry variables when they are present", () => {
    const withSentry = {
      ...validEnv,
      NEXT_PUBLIC_SENTRY_DSN: "https://key@o1.ingest.de.sentry.io/2",
      SENTRY_ORG: "an-org",
      SENTRY_PROJECT: "a-project",
    };

    expect(parseEnv(withSentry)).toMatchObject({
      NEXT_PUBLIC_SENTRY_DSN: "https://key@o1.ingest.de.sentry.io/2",
      SENTRY_ORG: "an-org",
      SENTRY_PROJECT: "a-project",
    });
  });
});

describe("observabilityWarnings", () => {
  it("warns about a missing Sentry DSN in production", () => {
    const warnings = observabilityWarnings({ NODE_ENV: "production" });

    expect(warnings).toHaveLength(1);
    expect(warnings[0]).toMatch(/NEXT_PUBLIC_SENTRY_DSN/);
  });

  it("stays silent in production once a DSN is configured", () => {
    const warnings = observabilityWarnings({
      NODE_ENV: "production",
      NEXT_PUBLIC_SENTRY_DSN: "https://key@o1.ingest.de.sentry.io/2",
    });

    expect(warnings).toEqual([]);
  });

  it("stays silent outside production, where Sentry is meant to be off", () => {
    expect(observabilityWarnings({ NODE_ENV: "development" })).toEqual([]);
    expect(observabilityWarnings({ NODE_ENV: "test" })).toEqual([]);
    expect(observabilityWarnings({})).toEqual([]);
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
