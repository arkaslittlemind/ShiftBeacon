import { render } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { ManagerViewTracker } from "./manager-view-tracker";

const captureClientEvent = vi.fn();

vi.mock("@/lib/observability/client-events", () => ({
  captureClientEvent: (...args: unknown[]) => captureClientEvent(...args),
}));

beforeEach(() => {
  captureClientEvent.mockReset();
});

describe("ManagerViewTracker", () => {
  it("fires exactly one manager_view_opened per mount", () => {
    render(<ManagerViewTracker view="dashboard" />);

    expect(captureClientEvent).toHaveBeenCalledTimes(1);
    expect(captureClientEvent).toHaveBeenCalledWith({
      name: "manager_view_opened",
      view: "dashboard",
    });
  });

  it("reports the view it was given", () => {
    render(<ManagerViewTracker view="workplace_settings" />);

    expect(captureClientEvent).toHaveBeenCalledWith({
      name: "manager_view_opened",
      view: "workplace_settings",
    });
  });

  it("renders nothing", () => {
    const { container } = render(<ManagerViewTracker view="staff_detail" />);

    expect(container).toBeEmptyDOMElement();
  });
});
