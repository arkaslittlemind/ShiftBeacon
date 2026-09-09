import { render, screen, waitFor } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { PerimeterStatusBanner } from "./perimeter-status-banner";
import { useGeolocation } from "./use-geolocation";
import type { OrganizationResponse } from "@/types/organization";

vi.mock("./use-geolocation", () => ({
  useGeolocation: vi.fn(),
}));

const mockUseGeolocation = vi.mocked(useGeolocation);

const organization: OrganizationResponse = {
  id: "org-1",
  name: "Riverside Care Home",
  latitude: 51.5,
  longitude: -0.12,
  clockInRadiusMeters: 200,
};

beforeEach(() => {
  vi.restoreAllMocks();
});

describe("PerimeterStatusBanner", () => {
  it("shows a loading state while location and workplace are being resolved", () => {
    mockUseGeolocation.mockReturnValue({ status: "prompting", coords: null, error: null });
    vi.stubGlobal("fetch", vi.fn(() => new Promise(() => {})));

    render(<PerimeterStatusBanner />);

    expect(screen.getByText("Checking your location")).toBeInTheDocument();
  });

  it("shows a location-unavailable state when geolocation is denied", () => {
    mockUseGeolocation.mockReturnValue({
      status: "denied",
      coords: null,
      error: "Location access was denied.",
    });
    vi.stubGlobal("fetch", vi.fn(() => new Promise(() => {})));

    render(<PerimeterStatusBanner />);

    expect(screen.getByText("Location unavailable")).toBeInTheDocument();
    expect(screen.getByText("Location access was denied.")).toBeInTheDocument();
  });

  it("shows an error state when the workplace can't be loaded", async () => {
    mockUseGeolocation.mockReturnValue({
      status: "granted",
      coords: { latitude: 51.5, longitude: -0.12 },
      error: null,
    });
    vi.stubGlobal("fetch", vi.fn().mockRejectedValue(new Error("network error")));

    render(<PerimeterStatusBanner />);

    await waitFor(() => {
      expect(screen.getByText("Couldn't load your workplace")).toBeInTheDocument();
    });
  });

  it("shows the inside-perimeter state when within the clock-in radius", async () => {
    mockUseGeolocation.mockReturnValue({
      status: "granted",
      coords: { latitude: 51.5, longitude: -0.12 },
      error: null,
    });
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue(new Response(JSON.stringify({ data: organization }), { status: 200 }))
    );

    render(<PerimeterStatusBanner />);

    await waitFor(() => {
      expect(screen.getByText("You're inside the perimeter")).toBeInTheDocument();
    });
  });

  it("shows the outside-perimeter state when beyond the clock-in radius", async () => {
    mockUseGeolocation.mockReturnValue({
      status: "granted",
      coords: { latitude: 52.5, longitude: 0.5 },
      error: null,
    });
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue(new Response(JSON.stringify({ data: organization }), { status: 200 }))
    );

    render(<PerimeterStatusBanner />);

    await waitFor(() => {
      expect(screen.getByText("You're outside the perimeter")).toBeInTheDocument();
    });
  });
});
