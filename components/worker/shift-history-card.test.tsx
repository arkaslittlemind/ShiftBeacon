import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { ShiftHistoryCard } from "./shift-history-card";
import type { ShiftResponse } from "@/types/shift";

describe("ShiftHistoryCard", () => {
  it("shows an empty message when there is no shift history", () => {
    render(<ShiftHistoryCard history={[]} />);

    expect(screen.getByText("No completed shifts yet.")).toBeInTheDocument();
  });

  it("renders completed shifts with their duration", () => {
    const history: ShiftResponse[] = [
      {
        id: "shift-1",
        clockInAt: "2026-09-08T09:00:00.000Z",
        clockInLatitude: 1,
        clockInLongitude: 2,
        clockInNote: null,
        clockOutAt: "2026-09-08T11:30:00.000Z",
        clockOutLatitude: 1,
        clockOutLongitude: 2,
        clockOutNote: null,
      },
    ];

    render(<ShiftHistoryCard history={history} />);

    expect(screen.queryByText("No completed shifts yet.")).not.toBeInTheDocument();
    expect(screen.getByText("2.5h")).toBeInTheDocument();
  });
});
