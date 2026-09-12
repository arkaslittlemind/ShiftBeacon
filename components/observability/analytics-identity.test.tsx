import { render } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { AnalyticsIdentity } from "./analytics-identity";

const identify = vi.fn();

vi.mock("posthog-js", () => ({
  default: {
    identify: (...args: unknown[]) => identify(...args),
  },
}));

beforeEach(() => {
  identify.mockReset();
});

afterEach(() => {
  vi.unstubAllEnvs();
});

function enableAnalytics() {
  vi.stubEnv("NODE_ENV", "production");
  vi.stubEnv("NEXT_PUBLIC_POSTHOG_PROJECT_TOKEN", "phc_abc123");
}

describe("AnalyticsIdentity", () => {
  it("identifies by the internal id, with only role and organizationId attached", () => {
    enableAnalytics();

    render(
      <AnalyticsIdentity id="usr_123" role="MANAGER" organizationId="org_1" />
    );

    expect(identify).toHaveBeenCalledTimes(1);
    expect(identify).toHaveBeenCalledWith("usr_123", {
      role: "MANAGER",
      organizationId: "org_1",
    });
  });

  it("renders nothing", () => {
    enableAnalytics();

    const { container } = render(
      <AnalyticsIdentity id="usr_123" role="CARE_WORKER" organizationId="org_1" />
    );

    expect(container).toBeEmptyDOMElement();
  });

  it("is a no-op when analytics are unconfigured", () => {
    vi.stubEnv("NODE_ENV", "production");
    vi.stubEnv("NEXT_PUBLIC_POSTHOG_PROJECT_TOKEN", undefined);

    expect(() =>
      render(
        <AnalyticsIdentity id="usr_123" role="CARE_WORKER" organizationId="org_1" />
      )
    ).not.toThrow();
    expect(identify).not.toHaveBeenCalled();
  });

  it("does not let a failing identify break the page", () => {
    enableAnalytics();
    identify.mockImplementation(() => {
      throw new Error("posthog exploded");
    });
    const warn = vi.spyOn(console, "warn").mockImplementation(() => {});

    expect(() =>
      render(
        <AnalyticsIdentity id="usr_123" role="CARE_WORKER" organizationId="org_1" />
      )
    ).not.toThrow();
    expect(warn).toHaveBeenCalled();

    warn.mockRestore();
  });
});
