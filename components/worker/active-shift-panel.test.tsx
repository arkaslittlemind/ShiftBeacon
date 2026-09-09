import { act, render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { ActiveShiftPanel } from "./active-shift-panel";
import { useGeolocation } from "./use-geolocation";
import type { ShiftResponse } from "@/types/shift";

vi.mock("next/navigation", () => ({
  useRouter: () => ({ refresh: vi.fn() }),
}));

vi.mock("./use-geolocation", () => ({
  useGeolocation: vi.fn(),
}));

const mockUseGeolocation = vi.mocked(useGeolocation);

const shift: ShiftResponse = {
  id: "shift-1",
  clockInAt: new Date("2026-09-09T09:00:00.000Z").toISOString(),
  clockInLatitude: 1,
  clockInLongitude: 2,
  clockInNote: null,
  clockOutAt: null,
  clockOutLatitude: null,
  clockOutLongitude: null,
  clockOutNote: null,
};

beforeEach(() => {
  vi.restoreAllMocks();
  mockUseGeolocation.mockReturnValue({
    status: "granted",
    coords: { latitude: 1, longitude: 2 },
    error: null,
  });
});

afterEach(() => {
  vi.useRealTimers();
});

describe("ActiveShiftPanel", () => {
  it("renders the elapsed shift duration and ticks as time passes", () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date("2026-09-09T09:05:00.000Z"));

    render(<ActiveShiftPanel shift={shift} />);
    expect(screen.getByText("00:05:00")).toBeInTheDocument();

    act(() => {
      vi.advanceTimersByTime(1000);
    });
    expect(screen.getByText("00:05:01")).toBeInTheDocument();
  });

  it("shows a submitting state while clocking out", async () => {
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
    render(<ActiveShiftPanel shift={shift} />);
    await user.click(screen.getByRole("button", { name: "Clock Out" }));

    expect(screen.getByRole("button", { name: "Clocking out..." })).toBeDisabled();

    resolveFetch(new Response(JSON.stringify({ data: {} }), { status: 200 }));
  });

  it("shows an error message when the clock-out request fails", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue(
        new Response(JSON.stringify({ error: { message: "No active shift found." } }), {
          status: 409,
        })
      )
    );

    const user = userEvent.setup();
    render(<ActiveShiftPanel shift={shift} />);
    await user.click(screen.getByRole("button", { name: "Clock Out" }));

    await waitFor(() => {
      expect(screen.getByRole("alert")).toHaveTextContent("No active shift found.");
    });
  });
});
