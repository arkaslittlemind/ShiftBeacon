import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { StaffTable } from "./staff-table";
import type { StaffMemberResponse } from "@/types/staff";

const workplace = { workplaceLatitude: 51.5, workplaceLongitude: -0.12 };

describe("StaffTable", () => {
  it("renders an empty table when there is no staff", () => {
    render(<StaffTable staff={[]} {...workplace} now={Date.now()} />);

    expect(screen.getByRole("table")).toBeInTheDocument();
    expect(screen.queryAllByRole("row")).toHaveLength(1);
  });

  it("renders clocked-in staff with a status badge and distance from workplace", () => {
    const now = new Date("2026-09-09T10:00:00.000Z").getTime();
    const staff: StaffMemberResponse[] = [
      {
        id: "user-1",
        name: "Ada Lovelace",
        email: "ada@example.com",
        role: "CARE_WORKER",
        status: "CLOCKED_IN",
        activeShift: {
          clockInAt: "2026-09-09T09:00:00.000Z",
          clockInLatitude: 51.5,
          clockInLongitude: -0.12,
        },
      },
    ];

    render(<StaffTable staff={staff} {...workplace} now={now} />);

    expect(screen.getByRole("link", { name: "Ada Lovelace" })).toHaveAttribute(
      "href",
      "/manager/staff/user-1"
    );
    expect(screen.getByText("Clocked in")).toBeInTheDocument();
    expect(screen.getByText("1.0h")).toBeInTheDocument();
    expect(screen.getByText("0 m")).toBeInTheDocument();
  });

  it("renders clocked-out staff with placeholders for clock-in details", () => {
    const staff: StaffMemberResponse[] = [
      {
        id: "user-2",
        name: "Grace Hopper",
        email: "grace@example.com",
        role: "CARE_WORKER",
        status: "CLOCKED_OUT",
        activeShift: null,
      },
    ];

    render(<StaffTable staff={staff} {...workplace} now={Date.now()} />);

    expect(screen.getByText("Clocked out")).toBeInTheDocument();
    expect(screen.getAllByText("—")).toHaveLength(3);
  });
});
