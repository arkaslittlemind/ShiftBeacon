import { render, screen, within } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { StaffShiftHistory } from "./staff-shift-history";
import type { ShiftResponse } from "@/types/shift";

const workplace = { latitude: 51.5, longitude: -0.12, clockInRadiusMeters: 150 };

function shift(overrides: Partial<ShiftResponse> = {}): ShiftResponse {
  return {
    id: "shift-1",
    clockInAt: "2026-11-06T09:00:00.000Z",
    clockInLatitude: 51.5,
    clockInLongitude: -0.12,
    clockInNote: null,
    clockOutAt: "2026-11-06T17:00:00.000Z",
    clockOutLatitude: 51.5,
    clockOutLongitude: -0.12,
    clockOutNote: null,
    ...overrides,
  };
}

function bodyRows() {
  return screen.getAllByRole("row").slice(1);
}

describe("StaffShiftHistory", () => {
  it("shows an empty message when there are no completed shifts", () => {
    render(<StaffShiftHistory history={[]} workplace={workplace} />);

    expect(screen.getByText("No completed shifts yet.")).toBeInTheDocument();
    expect(screen.queryByRole("table")).toBeNull();
  });

  it("renders the date, both clock times, locations, and duration for a shift", () => {
    render(
      <StaffShiftHistory
        history={[
          shift({ clockInNote: "Arrived early for handover", clockOutNote: "All quiet" }),
        ]}
        workplace={workplace}
      />
    );

    const row = within(bodyRows()[0]);
    expect(row.getByText("Fri 6 Nov")).toBeInTheDocument();
    expect(row.getByText("09:00")).toBeInTheDocument();
    expect(row.getByText("17:00")).toBeInTheDocument();
    expect(row.getAllByText("Inside · 0 m")).toHaveLength(2);
    expect(row.getByText("8h 0m")).toBeInTheDocument();
  });

  it("tags the clock-in and clock-out notes", () => {
    render(
      <StaffShiftHistory
        history={[
          shift({ clockInNote: "Arrived early for handover", clockOutNote: "All quiet" }),
        ]}
        workplace={workplace}
      />
    );

    const notes = within(bodyRows()[0]);
    expect(notes.getByText("Arrived early for handover")).toBeInTheDocument();
    expect(notes.getByText("All quiet")).toBeInTheDocument();
    expect(notes.getByText("IN")).toBeInTheDocument();
    expect(notes.getByText("OUT")).toBeInTheDocument();
  });

  it("renders note text literally, never as markup", () => {
    render(
      <StaffShiftHistory
        history={[shift({ clockOutNote: "<b>bold</b> note" })]}
        workplace={workplace}
      />
    );

    expect(screen.getByText("<b>bold</b> note")).toBeInTheDocument();
  });

  it("shows a dash instead of notes when a shift has none", () => {
    render(<StaffShiftHistory history={[shift()]} workplace={workplace} />);

    const row = within(bodyRows()[0]);
    expect(row.queryByText("IN")).toBeNull();
    expect(row.queryByText("OUT")).toBeNull();
    expect(row.getByText("-")).toBeInTheDocument();
  });

  it("says when a shift started or ended outside the perimeter", () => {
    render(
      <StaffShiftHistory
        history={[shift({ clockOutLatitude: 51.5035, clockOutLongitude: -0.12 })]}
        workplace={workplace}
      />
    );

    expect(screen.getByText("Outside · 390 m")).toBeInTheDocument();
    expect(screen.getByText("Inside · 0 m")).toBeInTheDocument();
  });

  it("uses the UTC day, not the host's local day", () => {
    render(
      <StaffShiftHistory
        history={[
          shift({
            clockInAt: "2026-11-06T23:30:00.000Z",
            clockOutAt: "2026-11-07T07:30:00.000Z",
          }),
        ]}
        workplace={workplace}
      />
    );

    const row = within(bodyRows()[0]);
    expect(row.getByText("Fri 6 Nov")).toBeInTheDocument();
    expect(row.getByText("23:30")).toBeInTheDocument();
  });
});
