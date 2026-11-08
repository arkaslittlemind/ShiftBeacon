import { act, render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { ShiftCard, type ActiveShiftView } from "./shift-card";
import { useGeolocation, type GeolocationState } from "./use-geolocation";

vi.mock("next/navigation", () => ({
  useRouter: () => ({ refresh: vi.fn() }),
}));

vi.mock("./use-geolocation", () => ({
  useGeolocation: vi.fn(),
}));

const mockUseGeolocation = vi.mocked(useGeolocation);

const workplace = {
  name: "Riverside Care Home",
  latitude: 51.5,
  longitude: -0.12,
  clockInRadiusMeters: 200,
};

const INSIDE: GeolocationState = {
  status: "granted",
  coords: { latitude: 51.5, longitude: -0.12 },
  error: null,
};
const OUTSIDE: GeolocationState = {
  status: "granted",
  coords: { latitude: 51.51, longitude: -0.12 },
  error: null,
};
const PROMPTING: GeolocationState = { status: "prompting", coords: null, error: null };

const activeShift: ActiveShiftView = {
  clockInAt: "2026-09-09T09:00:00.000Z",
  clockInTimeLabel: "09:00",
  clockInDistanceMeters: 42,
};

function pendingFetch() {
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
  return (value: Response) => resolveFetch(value);
}

function failingFetch(status: number, message: string) {
  vi.stubGlobal(
    "fetch",
    vi.fn().mockResolvedValue(new Response(JSON.stringify({ error: { message } }), { status }))
  );
}

beforeEach(() => {
  vi.restoreAllMocks();
});

afterEach(() => {
  vi.useRealTimers();
});

describe("ShiftCard, ready to clock in", () => {
  it("renders the idle state with an empty note and no error", () => {
    mockUseGeolocation.mockReturnValue(INSIDE);

    render(<ShiftCard workplace={workplace} activeShift={null} />);

    expect(screen.getByRole("heading", { name: "Riverside Care Home" })).toBeInTheDocument();
    expect(screen.getByText("Not clocked in")).toBeInTheDocument();
    expect(screen.getByLabelText(/Clock-in note/)).toHaveValue("");
    expect(screen.getByLabelText(/Clock-in note/)).toHaveAccessibleDescription(
      "Don't include residents' names. Notes go into the handover summary."
    );
    expect(screen.queryByRole("alert")).not.toBeInTheDocument();
  });

  it("disables clock in while location hasn't been granted", () => {
    mockUseGeolocation.mockReturnValue(PROMPTING);

    render(<ShiftCard workplace={workplace} activeShift={null} />);

    expect(screen.getByRole("status")).toHaveTextContent("Checking your location");
    expect(screen.getByRole("button", { name: "Clock in unavailable" })).toBeDisabled();
  });

  it("enables clock in when inside the perimeter", () => {
    mockUseGeolocation.mockReturnValue(INSIDE);

    render(<ShiftCard workplace={workplace} activeShift={null} />);

    expect(screen.getByRole("status")).toHaveTextContent("You're inside the perimeter");
    expect(screen.getByRole("status")).toHaveTextContent("0 m from the workplace.");
    expect(screen.getByRole("button", { name: "Clock in" })).toBeEnabled();
  });

  it("disables clock in and says why when outside the perimeter", () => {
    mockUseGeolocation.mockReturnValue(OUTSIDE);

    render(<ShiftCard workplace={workplace} activeShift={null} />);

    expect(screen.getByRole("status")).toHaveTextContent("You're outside the perimeter");
    expect(screen.getByRole("status")).toHaveTextContent(
      "About 1.1 km away. Move within 200 m of Riverside Care Home to clock in."
    );
    expect(screen.getByRole("button", { name: "Clock in unavailable" })).toBeDisabled();
  });

  it("explains when location is unavailable", () => {
    mockUseGeolocation.mockReturnValue({
      status: "denied",
      coords: null,
      error: "Location access was denied.",
    });

    render(<ShiftCard workplace={workplace} activeShift={null} />);

    expect(screen.getByRole("status")).toHaveTextContent("Location unavailable");
    expect(screen.getByRole("status")).toHaveTextContent("Location access was denied.");
  });

  it("sends the location and note, and shows a submitting state", async () => {
    mockUseGeolocation.mockReturnValue(INSIDE);
    const resolveFetch = pendingFetch();

    const user = userEvent.setup();
    render(<ShiftCard workplace={workplace} activeShift={null} />);
    await user.type(screen.getByLabelText(/Clock-in note/), "  Covering handover  ");
    await user.click(screen.getByRole("button", { name: "Clock in" }));

    expect(screen.getByRole("button", { name: "Clocking in..." })).toBeDisabled();
    expect(fetch).toHaveBeenCalledWith(
      "/api/shifts/clock-in",
      expect.objectContaining({
        body: JSON.stringify({ latitude: 51.5, longitude: -0.12, note: "Covering handover" }),
      })
    );

    resolveFetch(new Response(JSON.stringify({ data: {} }), { status: 200 }));
  });

  it("shows an error message when the clock-in request fails", async () => {
    mockUseGeolocation.mockReturnValue(INSIDE);
    failingFetch(422, "You're outside the clock-in perimeter.");

    const user = userEvent.setup();
    render(<ShiftCard workplace={workplace} activeShift={null} />);
    await user.click(screen.getByRole("button", { name: "Clock in" }));

    await waitFor(() => {
      expect(screen.getByRole("alert")).toHaveTextContent("You're outside the clock-in perimeter.");
    });
  });
});

describe("ShiftCard, network failure", () => {
  it("shows a generic error and re-enables the button when the request can't be sent", async () => {
    mockUseGeolocation.mockReturnValue(INSIDE);
    vi.stubGlobal("fetch", vi.fn().mockRejectedValue(new TypeError("Failed to fetch")));

    const user = userEvent.setup();
    render(<ShiftCard workplace={workplace} activeShift={null} />);
    await user.click(screen.getByRole("button", { name: "Clock in" }));

    await waitFor(() => {
      expect(screen.getByRole("alert")).toHaveTextContent("Couldn't reach ShiftBeacon.");
    });
    expect(screen.getByRole("button", { name: "Clock in" })).toBeEnabled();
  });
});

describe("ShiftCard, on shift", () => {
  beforeEach(() => {
    mockUseGeolocation.mockReturnValue(INSIDE);
  });

  it("renders the elapsed shift duration and ticks as time passes", () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date("2026-09-09T09:05:00.000Z"));

    render(<ShiftCard workplace={workplace} activeShift={activeShift} />);
    expect(screen.getByText("00:05:00")).toBeInTheDocument();
    expect(screen.getByText("On shift")).toBeInTheDocument();
    expect(screen.getByText(/inside, 42 m/)).toBeInTheDocument();

    act(() => {
      vi.advanceTimersByTime(1000);
    });
    expect(screen.getByText("00:05:01")).toBeInTheDocument();
  });

  it("shows a submitting state while clocking out", async () => {
    const resolveFetch = pendingFetch();

    const user = userEvent.setup();
    render(<ShiftCard workplace={workplace} activeShift={activeShift} />);
    await user.click(screen.getByRole("button", { name: "Clock out" }));

    expect(screen.getByRole("button", { name: "Clocking out..." })).toBeDisabled();
    expect(fetch).toHaveBeenCalledWith("/api/shifts/clock-out", expect.anything());

    resolveFetch(new Response(JSON.stringify({ data: {} }), { status: 200 }));
  });

  it("shows an error message when the clock-out request fails", async () => {
    failingFetch(409, "No active shift found.");

    const user = userEvent.setup();
    render(<ShiftCard workplace={workplace} activeShift={activeShift} />);
    await user.click(screen.getByRole("button", { name: "Clock out" }));

    await waitFor(() => {
      expect(screen.getByRole("alert")).toHaveTextContent("No active shift found.");
    });
  });

  it("keeps the same button element and clears the note when the shift starts", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue(new Response(JSON.stringify({ data: {} }), { status: 200 }))
    );

    const user = userEvent.setup();
    const { rerender } = render(<ShiftCard workplace={workplace} activeShift={null} />);
    const button = screen.getByRole("button", { name: "Clock in" });
    await user.type(screen.getByLabelText(/Clock-in note/), "Arrived early");
    await user.click(button);

    rerender(<ShiftCard workplace={workplace} activeShift={activeShift} />);

    await waitFor(() => {
      expect(screen.getByRole("button", { name: "Clock out" })).toBe(button);
    });
    expect(screen.getByLabelText(/Handover note/)).toHaveValue("");
  });
});
