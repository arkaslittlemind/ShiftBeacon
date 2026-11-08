import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { WorkplaceSettingsForm } from "./workplace-settings-form";
import type { OrganizationResponse } from "@/types/organization";

const captureClientEvent = vi.fn();

vi.mock("@/lib/observability/client-events", () => ({
  captureClientEvent: (...args: unknown[]) => captureClientEvent(...args),
}));

const organization: OrganizationResponse = {
  id: "org-1",
  name: "Riverside Care Home",
  latitude: 51.5,
  longitude: -0.12,
  clockInRadiusMeters: 200,
};

beforeEach(() => {
  vi.restoreAllMocks();
  captureClientEvent.mockReset();
});

describe("WorkplaceSettingsForm", () => {
  it("renders the organization's current values", () => {
    render(<WorkplaceSettingsForm organization={organization} />);

    expect(screen.getByLabelText("Name")).toHaveValue("Riverside Care Home");
    expect(screen.getByLabelText("Latitude")).toHaveValue(51.5);
    expect(screen.getByLabelText("Longitude")).toHaveValue(-0.12);
    expect(screen.getByLabelText("Clock-in radius (m)")).toHaveValue(200);
  });

  it("disables submit and shows a saving state while the request is in flight", async () => {
    let resolveFetch: (value: Response) => void = () => {};
    vi.stubGlobal(
      "fetch",
      vi.fn(
        () =>
          new Promise<Response>((resolve) => {
            resolveFetch = resolve;
          })
      )
    );

    const user = userEvent.setup();
    render(<WorkplaceSettingsForm organization={organization} />);
    await user.click(screen.getByRole("button", { name: "Save" }));

    expect(screen.getByRole("button", { name: "Saving..." })).toBeDisabled();

    resolveFetch(new Response(JSON.stringify({ data: organization }), { status: 200 }));
  });

  it("shows a success message when the save succeeds", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue(new Response(JSON.stringify({ data: organization }), { status: 200 }))
    );

    const user = userEvent.setup();
    render(<WorkplaceSettingsForm organization={organization} />);
    await user.click(screen.getByRole("button", { name: "Save" }));

    await waitFor(() => {
      expect(screen.getByText("Saved.")).toBeInTheDocument();
    });
  });

  it("shows an error message when the save fails", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue(
        new Response(JSON.stringify({ error: { message: "Radius must be a positive number." } }), {
          status: 422,
        })
      )
    );

    const user = userEvent.setup();
    render(<WorkplaceSettingsForm organization={organization} />);
    await user.click(screen.getByRole("button", { name: "Save" }));

    await waitFor(() => {
      expect(screen.getByRole("alert")).toHaveTextContent("Radius must be a positive number.");
    });
    expect(screen.getByLabelText("Name")).toHaveAttribute("aria-invalid", "true");
    expect(captureClientEvent).toHaveBeenCalledWith({
      name: "workplace_settings_save_failed",
    });
  });

  it("describes the radius field with the hint", () => {
    render(<WorkplaceSettingsForm organization={organization} />);

    const radius = screen.getByLabelText("Clock-in radius (m)");
    const hint = screen.getByText(/large buildings or car parks/i);
    expect(radius).toHaveAttribute("aria-describedby", hint.id);
  });

  it("describes the radius field with the hint and the alert after a failed save", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue(
        new Response(JSON.stringify({ error: { message: "Radius must be a positive number." } }), {
          status: 422,
        })
      )
    );

    const user = userEvent.setup();
    render(<WorkplaceSettingsForm organization={organization} />);
    await user.click(screen.getByRole("button", { name: "Save" }));

    const alert = await screen.findByRole("alert");
    const hint = screen.getByText(/large buildings or car parks/i);
    const describedBy = screen.getByLabelText("Clock-in radius (m)").getAttribute("aria-describedby");
    expect(describedBy?.split(" ")).toEqual(expect.arrayContaining([hint.id, alert.id]));
    expect(screen.getByLabelText("Name").getAttribute("aria-describedby")).toBe(alert.id);
  });

  it("shows the radius being typed as a live value", async () => {
    const user = userEvent.setup();
    render(<WorkplaceSettingsForm organization={organization} />);

    expect(screen.getByText("200 m")).toBeInTheDocument();
    const radius = screen.getByLabelText("Clock-in radius (m)");
    await user.clear(radius);
    await user.type(radius, "350");

    expect(screen.getByText("350 m")).toBeInTheDocument();
  });

  it("does not report a failure when the save succeeds", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue(new Response(JSON.stringify({ data: organization }), { status: 200 }))
    );

    const user = userEvent.setup();
    render(<WorkplaceSettingsForm organization={organization} />);
    await user.click(screen.getByRole("button", { name: "Save" }));

    await waitFor(() => {
      expect(screen.getByText("Saved.")).toBeInTheDocument();
    });
    expect(captureClientEvent).not.toHaveBeenCalled();
  });
});
