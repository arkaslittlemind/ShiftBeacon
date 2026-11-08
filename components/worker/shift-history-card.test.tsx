import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { ShiftHistoryCard } from "./shift-history-card";
import type { ShiftResponse } from "@/types/shift";

function completedShift(overrides: Partial<ShiftResponse> = {}): ShiftResponse {
  return {
    id: "shift-1",
    clockInAt: "2026-09-08T09:00:00.000Z",
    clockInLatitude: 1,
    clockInLongitude: 2,
    clockInNote: null,
    clockOutAt: "2026-09-08T11:30:00.000Z",
    clockOutLatitude: 1,
    clockOutLongitude: 2,
    clockOutNote: null,
    ...overrides,
  };
}

describe("ShiftHistoryCard", () => {
  it("shows the empty state when there is no shift history", () => {
    render(<ShiftHistoryCard history={[]} />);

    expect(screen.getByText("No completed shifts yet")).toBeInTheDocument();
  });

  it("renders completed shifts with their duration", () => {
    render(<ShiftHistoryCard history={[completedShift()]} />);

    expect(screen.queryByText("No completed shifts yet")).not.toBeInTheDocument();
    expect(screen.getByText("2h 30m")).toBeInTheDocument();
  });

  it("shows the clock-out note, falling back to the clock-in note, then to no note", () => {
    render(
      <ShiftHistoryCard
        history={[
          completedShift({ id: "a", clockInNote: "Arrived early", clockOutNote: "Room 4 settled" }),
          completedShift({ id: "b", clockInNote: "Covering handover" }),
          completedShift({ id: "c" }),
        ]}
      />
    );

    expect(screen.getByText("Room 4 settled")).toBeInTheDocument();
    expect(screen.queryByText("Arrived early")).not.toBeInTheDocument();
    expect(screen.getByText("Covering handover")).toBeInTheDocument();
    expect(screen.getByText("No note")).toBeInTheDocument();
  });
});
