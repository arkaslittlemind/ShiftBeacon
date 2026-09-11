import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

const postHogConstructor = vi.fn();

vi.mock("posthog-node", () => ({
  PostHog: class {
    constructor(...args: unknown[]) {
      postHogConstructor(...args);
    }
  },
}));

describe("getAnalyticsClient", () => {
  beforeEach(() => {
    vi.resetModules();
    postHogConstructor.mockClear();
  });

  afterEach(() => {
    vi.unstubAllEnvs();
  });

  async function load() {
    const analytics = await import("./analytics");
    return analytics.getAnalyticsClient();
  }

  it("returns null when no project token is configured", async () => {
    vi.stubEnv("NODE_ENV", "production");
    vi.stubEnv("NEXT_PUBLIC_POSTHOG_PROJECT_TOKEN", undefined);

    expect(await load()).toBeNull();
    expect(postHogConstructor).not.toHaveBeenCalled();
  });

  // Analytics are production-only, matching Sentry: local clicking must not
  // pollute the dashboard.
  it("returns null outside production even with a token", async () => {
    vi.stubEnv("NODE_ENV", "development");
    vi.stubEnv("NEXT_PUBLIC_POSTHOG_PROJECT_TOKEN", "phc_abc123");

    expect(await load()).toBeNull();
    expect(postHogConstructor).not.toHaveBeenCalled();
  });

  it("builds a client in production, pointed at the configured host", async () => {
    vi.stubEnv("NODE_ENV", "production");
    vi.stubEnv("NEXT_PUBLIC_POSTHOG_PROJECT_TOKEN", "phc_abc123");
    vi.stubEnv("NEXT_PUBLIC_POSTHOG_HOST", "https://eu.i.posthog.com");

    expect(await load()).not.toBeNull();
    expect(postHogConstructor).toHaveBeenCalledWith(
      "phc_abc123",
      expect.objectContaining({ host: "https://eu.i.posthog.com" })
    );
  });

  it("builds the client once and reuses it", async () => {
    vi.stubEnv("NODE_ENV", "production");
    vi.stubEnv("NEXT_PUBLIC_POSTHOG_PROJECT_TOKEN", "phc_abc123");

    const analytics = await import("./analytics");
    const first = analytics.getAnalyticsClient();
    const second = analytics.getAnalyticsClient();

    expect(second).toBe(first);
    expect(postHogConstructor).toHaveBeenCalledTimes(1);
  });
});
