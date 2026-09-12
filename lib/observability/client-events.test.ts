import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { captureClientEvent } from "./client-events";

const capture = vi.fn();

vi.mock("posthog-js", () => ({
  default: {
    capture: (...args: unknown[]) => capture(...args),
  },
}));

beforeEach(() => {
  capture.mockReset();
});

afterEach(() => {
  vi.unstubAllEnvs();
});

function enableAnalytics() {
  vi.stubEnv("NODE_ENV", "production");
  vi.stubEnv("NEXT_PUBLIC_POSTHOG_PROJECT_TOKEN", "phc_abc123");
}

describe("captureClientEvent", () => {
  it("sends manager_view_opened with only the view", () => {
    enableAnalytics();

    captureClientEvent({ name: "manager_view_opened", view: "staff_detail" });

    expect(capture).toHaveBeenCalledWith("manager_view_opened", {
      view: "staff_detail",
    });
  });

  // No error message: the API's message can echo a submitted coordinate back.
  it("sends workplace_settings_save_failed with no properties", () => {
    enableAnalytics();

    captureClientEvent({ name: "workplace_settings_save_failed" });

    expect(capture).toHaveBeenCalledWith("workplace_settings_save_failed", {});
  });

  it("is a no-op when analytics are unconfigured", () => {
    vi.stubEnv("NODE_ENV", "production");
    vi.stubEnv("NEXT_PUBLIC_POSTHOG_PROJECT_TOKEN", undefined);

    captureClientEvent({ name: "manager_view_opened", view: "dashboard" });

    expect(capture).not.toHaveBeenCalled();
  });

  it("swallows a failing capture rather than breaking the caller", () => {
    enableAnalytics();
    capture.mockImplementation(() => {
      throw new Error("posthog exploded");
    });
    const warn = vi.spyOn(console, "warn").mockImplementation(() => {});

    expect(() =>
      captureClientEvent({ name: "manager_view_opened", view: "dashboard" })
    ).not.toThrow();
    expect(warn).toHaveBeenCalled();

    warn.mockRestore();
  });
});
