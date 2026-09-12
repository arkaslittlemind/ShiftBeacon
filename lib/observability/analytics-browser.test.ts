import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import {
  browserAnalyticsEnabled,
  browserAnalyticsOptions,
  identifyBrowserUser,
  initBrowserAnalytics,
  resetBrowserAnalytics,
} from "./analytics-browser";

const init = vi.fn();
const identify = vi.fn();
const reset = vi.fn();

vi.mock("posthog-js", () => ({
  default: {
    init: (...args: unknown[]) => init(...args),
    identify: (...args: unknown[]) => identify(...args),
    reset: (...args: unknown[]) => reset(...args),
  },
}));

describe("browserAnalyticsEnabled", () => {
  afterEach(() => {
    vi.unstubAllEnvs();
  });

  it("is false when no project token is configured", () => {
    vi.stubEnv("NODE_ENV", "production");
    vi.stubEnv("NEXT_PUBLIC_POSTHOG_PROJECT_TOKEN", undefined);

    expect(browserAnalyticsEnabled()).toBe(false);
  });

  // Production-only, matching sentryEnabled: local clicking must not pollute
  // the dashboard.
  it("is false outside production even with a token", () => {
    vi.stubEnv("NODE_ENV", "development");
    vi.stubEnv("NEXT_PUBLIC_POSTHOG_PROJECT_TOKEN", "phc_abc123");

    expect(browserAnalyticsEnabled()).toBe(false);
  });

  it("is true in production with a token", () => {
    vi.stubEnv("NODE_ENV", "production");
    vi.stubEnv("NEXT_PUBLIC_POSTHOG_PROJECT_TOKEN", "phc_abc123");

    expect(browserAnalyticsEnabled()).toBe(true);
  });
});

describe("browserAnalyticsOptions", () => {
  afterEach(() => {
    vi.unstubAllEnvs();
  });

  // These are the privacy gates from project-overview.md. A dependency bump
  // that flips a default must fail here rather than start collecting.
  it("disables autocapture, session replay, and automatic pageview capture", () => {
    expect(browserAnalyticsOptions()).toMatchObject({
      autocapture: false,
      disable_session_recording: true,
      capture_pageview: false,
      capture_pageleave: false,
      person_profiles: "identified_only",
    });
  });

  it("points at the configured ingest host", () => {
    vi.stubEnv("NEXT_PUBLIC_POSTHOG_HOST", "https://eu.i.posthog.com");

    expect(browserAnalyticsOptions()).toMatchObject({
      api_host: "https://eu.i.posthog.com",
    });
  });

  it("omits the host entirely when none is configured", () => {
    vi.stubEnv("NEXT_PUBLIC_POSTHOG_HOST", undefined);

    expect(browserAnalyticsOptions()).not.toHaveProperty("api_host");
  });
});

describe("initBrowserAnalytics", () => {
  beforeEach(() => {
    init.mockReset();
  });

  afterEach(() => {
    vi.unstubAllEnvs();
  });

  it("does not touch posthog when analytics are unconfigured", () => {
    vi.stubEnv("NODE_ENV", "production");
    vi.stubEnv("NEXT_PUBLIC_POSTHOG_PROJECT_TOKEN", undefined);

    initBrowserAnalytics();

    expect(init).not.toHaveBeenCalled();
  });

  it("initializes with the hardened options in production", () => {
    vi.stubEnv("NODE_ENV", "production");
    vi.stubEnv("NEXT_PUBLIC_POSTHOG_PROJECT_TOKEN", "phc_abc123");

    initBrowserAnalytics();

    expect(init).toHaveBeenCalledWith(
      "phc_abc123",
      expect.objectContaining({ autocapture: false })
    );
  });

  it("swallows a failing init rather than breaking page load", () => {
    vi.stubEnv("NODE_ENV", "production");
    vi.stubEnv("NEXT_PUBLIC_POSTHOG_PROJECT_TOKEN", "phc_abc123");
    init.mockImplementation(() => {
      throw new Error("posthog exploded");
    });
    const warn = vi.spyOn(console, "warn").mockImplementation(() => {});

    expect(() => initBrowserAnalytics()).not.toThrow();
    expect(warn).toHaveBeenCalled();

    warn.mockRestore();
  });
});

describe("identifyBrowserUser", () => {
  beforeEach(() => {
    identify.mockReset();
  });

  afterEach(() => {
    vi.unstubAllEnvs();
  });

  it("sends the internal id and nothing personal", () => {
    vi.stubEnv("NODE_ENV", "production");
    vi.stubEnv("NEXT_PUBLIC_POSTHOG_PROJECT_TOKEN", "phc_abc123");

    identifyBrowserUser({ id: "usr_123", role: "MANAGER", organizationId: "org_1" });

    expect(identify).toHaveBeenCalledWith("usr_123", {
      role: "MANAGER",
      organizationId: "org_1",
    });
  });

  it("is a no-op when analytics are unconfigured", () => {
    vi.stubEnv("NODE_ENV", "production");
    vi.stubEnv("NEXT_PUBLIC_POSTHOG_PROJECT_TOKEN", undefined);

    identifyBrowserUser({ id: "usr_123", role: "MANAGER", organizationId: "org_1" });

    expect(identify).not.toHaveBeenCalled();
  });
});

describe("resetBrowserAnalytics", () => {
  beforeEach(() => {
    reset.mockReset();
  });

  afterEach(() => {
    vi.unstubAllEnvs();
  });

  it("clears the stored identity", () => {
    vi.stubEnv("NODE_ENV", "production");
    vi.stubEnv("NEXT_PUBLIC_POSTHOG_PROJECT_TOKEN", "phc_abc123");

    resetBrowserAnalytics();

    expect(reset).toHaveBeenCalledTimes(1);
  });

  it("is a no-op when analytics are unconfigured", () => {
    vi.stubEnv("NODE_ENV", "production");
    vi.stubEnv("NEXT_PUBLIC_POSTHOG_PROJECT_TOKEN", undefined);

    resetBrowserAnalytics();

    expect(reset).not.toHaveBeenCalled();
  });
});
