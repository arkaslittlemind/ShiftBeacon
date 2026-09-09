import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { StaffShiftHistory } from "./staff-shift-history";
import type { ShiftResponse } from "@/types/shift";

const workplace = { workplaceLatitude: 51.5, workplaceLongitude: -0.12 };

describe("StaffShiftHistory", () => {
  it("shows an empty message when there are no completed shifts", () => {
    render(<StaffShiftHistory history={[]} {...workplace} />);

    expect(screen.getByText("No completed shifts yet.")).toBeInTheDocument();
  });

  it("renders shift entries with notes and distance from workplace", () => {
    const history: ShiftResponse[] = [
      {
        id: "shift-1",
        clockInAt: "2026-09-08T09:00:00.000Z",
        clockInLatitude: 51.5,
        clockInLongitude: -0.12,
        clockInNote: "Arrived early for handover",
        clockOutAt: "2026-09-08T17:00:00.000Z",
        clockOutLatitude: 51.5,
        clockOutLongitude: -0.12,
        clockOutNote: "All quiet",
      },
    ];

    render(<StaffShiftHistory history={history} {...workplace} />);

    expect(screen.getByText("8.0h")).toBeInTheDocument();
    expect(screen.getByText(/Clocked in 0 m from workplace/)).toBeInTheDocument();
    expect(screen.getByText(/clocked out 0 m from workplace/)).toBeInTheDocument();
    expect(screen.getByText("Clock-in note: Arrived early for handover")).toBeInTheDocument();
    expect(screen.getByText("Clock-out note: All quiet")).toBeInTheDocument();
  });
});
