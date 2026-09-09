import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { ClockInPanel } from "./clock-in-panel";
import { useGeolocation } from "./use-geolocation";

vi.mock("next/navigation", () => ({
  useRouter: () => ({ refresh: vi.fn() }),
}));

vi.mock("./use-geolocation", () => ({
  useGeolocation: vi.fn(),
}));

const mockUseGeolocation = vi.mocked(useGeolocation);

beforeEach(() => {
  vi.restoreAllMocks();
});

describe("ClockInPanel", () => {
  it("renders the idle state with an empty note and no error", () => {
    mockUseGeolocation.mockReturnValue({
      status: "prompting",
      coords: null,
      error: null,
    });

    render(<ClockInPanel />);

    expect(screen.getByLabelText("Optional note")).toHaveValue("");
    expect(screen.queryByRole("alert")).not.toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Clock In" })).toBeInTheDocument();
  });

  it("disables clock in while location hasn't been granted", () => {
    mockUseGeolocation.mockReturnValue({
      status: "prompting",
      coords: null,
      error: null,
    });

    render(<ClockInPanel />);

    expect(screen.getByRole("button", { name: "Clock In" })).toBeDisabled();
  });

  it("enables clock in once location is granted", () => {
    mockUseGeolocation.mockReturnValue({
      status: "granted",
      coords: { latitude: 1, longitude: 2 },
      error: null,
    });

    render(<ClockInPanel />);

    expect(screen.getByRole("button", { name: "Clock In" })).toBeEnabled();
  });

  it("shows a submitting state and disables the button while the request is in flight", async () => {
    mockUseGeolocation.mockReturnValue({
      status: "granted",
      coords: { latitude: 1, longitude: 2 },
      error: null,
    });
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
    render(<ClockInPanel />);
    await user.click(screen.getByRole("button", { name: "Clock In" }));

    expect(screen.getByRole("button", { name: "Clocking in..." })).toBeDisabled();

    resolveFetch(new Response(JSON.stringify({ data: {} }), { status: 200 }));
  });

  it("shows an error message when the clock-in request fails", async () => {
    mockUseGeolocation.mockReturnValue({
      status: "granted",
      coords: { latitude: 1, longitude: 2 },
      error: null,
    });
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue(
        new Response(
          JSON.stringify({ error: { message: "You're outside the clock-in perimeter." } }),
          { status: 422 }
        )
      )
    );

    const user = userEvent.setup();
    render(<ClockInPanel />);
    await user.click(screen.getByRole("button", { name: "Clock In" }));

    await waitFor(() => {
      expect(screen.getByRole("alert")).toHaveTextContent(
        "You're outside the clock-in perimeter."
      );
    });
  });
});
