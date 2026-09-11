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

  it("parses without any PostHog variables", () => {
    expect(() => parseEnv(validEnv)).not.toThrow();
  });

  // Optional means optional everywhere. Making observability config required in
  // production would let a missing key take the whole app down with it.
  it("parses without observability variables in production too", () => {
    expect(() =>
      parseEnv({ ...validEnv, NODE_ENV: "production" })
    ).not.toThrow();
  });

  it("keeps PostHog variables when they are present", () => {
    const withPostHog = {
      ...validEnv,
      NEXT_PUBLIC_POSTHOG_PROJECT_TOKEN: "phc_abc123",
      NEXT_PUBLIC_POSTHOG_HOST: "https://eu.i.posthog.com",
    };

    expect(parseEnv(withPostHog)).toMatchObject({
      NEXT_PUBLIC_POSTHOG_PROJECT_TOKEN: "phc_abc123",
      NEXT_PUBLIC_POSTHOG_HOST: "https://eu.i.posthog.com",
    });
  });
});

describe("observabilityWarnings", () => {
  const SENTRY_DSN = "https://key@o1.ingest.de.sentry.io/2";
  const POSTHOG_TOKEN = "phc_abc123";

  it("warns about both missing integrations in production", () => {
    const warnings = observabilityWarnings({ NODE_ENV: "production" });

    expect(warnings).toHaveLength(2);
    expect(warnings.join(" ")).toMatch(/NEXT_PUBLIC_SENTRY_DSN/);
    expect(warnings.join(" ")).toMatch(/NEXT_PUBLIC_POSTHOG_PROJECT_TOKEN/);
  });

  it("warns about each integration independently", () => {
    const withSentryOnly = observabilityWarnings({
      NODE_ENV: "production",
      NEXT_PUBLIC_SENTRY_DSN: SENTRY_DSN,
    });
    expect(withSentryOnly).toHaveLength(1);
    expect(withSentryOnly[0]).toMatch(/POSTHOG/);

    const withPostHogOnly = observabilityWarnings({
      NODE_ENV: "production",
      NEXT_PUBLIC_POSTHOG_PROJECT_TOKEN: POSTHOG_TOKEN,
    });
    expect(withPostHogOnly).toHaveLength(1);
    expect(withPostHogOnly[0]).toMatch(/SENTRY/);
  });

  it("stays silent in production once both are configured", () => {
    const warnings = observabilityWarnings({
      NODE_ENV: "production",
      NEXT_PUBLIC_SENTRY_DSN: SENTRY_DSN,
      NEXT_PUBLIC_POSTHOG_PROJECT_TOKEN: POSTHOG_TOKEN,
    });

    expect(warnings).toEqual([]);
  });

  it("stays silent outside production, where both are meant to be off", () => {
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
