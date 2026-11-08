import { render, screen, within } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { StaffTable } from "./staff-table";
import type { StaffMemberResponse } from "@/types/staff";

const workplace = { latitude: 51.5, longitude: -0.12, clockInRadiusMeters: 150 };
const NOW = new Date("2026-09-09T10:00:00.000Z").getTime();

function onShift(
  id: string,
  name: string,
  clockInAt: string,
  coords = { clockInLatitude: 51.5, clockInLongitude: -0.12 }
): StaffMemberResponse {
  return {
    id,
    name,
    email: `${id}@example.com`,
    role: "CARE_WORKER",
    status: "CLOCKED_IN",
    activeShift: { clockInAt, ...coords },
  };
}

function offShift(id: string, name: string, role: StaffMemberResponse["role"] = "CARE_WORKER") {
  return {
    id,
    name,
    email: `${id}@example.com`,
    role,
    status: "CLOCKED_OUT",
    activeShift: null,
  } satisfies StaffMemberResponse;
}

function bodyRows() {
  return screen.getAllByRole("row").slice(1);
}

describe("StaffTable", () => {
  it("renders an on-shift member with time, duration, location, and a link", () => {
    render(
      <StaffTable
        staff={[onShift("user-1", "Ada Lovelace", "2026-09-09T08:49:00.000Z")]}
        workplace={workplace}
        onShift={1}
        now={NOW}
      />
    );

    expect(screen.getByRole("link", { name: "Ada Lovelace" })).toHaveAttribute(
      "href",
      "/manager/staff/user-1"
    );
    const row = within(bodyRows()[0]);
    expect(row.getByText("Care worker")).toBeInTheDocument();
    expect(row.getByText("08:49")).toBeInTheDocument();
    expect(row.getByText("1h 11m")).toBeInTheDocument();
    expect(row.getByText("Inside · 0 m")).toBeInTheDocument();
    expect(row.getByText("On shift")).toBeInTheDocument();
  });

  it("says when a member clocked in from outside the perimeter", () => {
    render(
      <StaffTable
        staff={[
          onShift("user-1", "Ada Lovelace", "2026-09-09T09:00:00.000Z", {
            clockInLatitude: 51.5035,
            clockInLongitude: -0.12,
          }),
        ]}
        workplace={workplace}
        onShift={1}
        now={NOW}
      />
    );

    expect(screen.getByText("Outside · 390 m")).toBeInTheDocument();
  });

  it("shows dashes and an off-shift badge for a clocked-out member", () => {
    render(
      <StaffTable
        staff={[offShift("user-2", "Grace Hopper", "MANAGER")]}
        workplace={workplace}
        onShift={0}
        now={NOW}
      />
    );

    const row = within(bodyRows()[0]);
    expect(row.getByText("Manager")).toBeInTheDocument();
    expect(row.getByText("Off shift")).toBeInTheDocument();
    expect(row.getAllByText("-")).toHaveLength(3);
  });

  it("lists on-shift members first, earliest clock-in first, then the rest by name", () => {
    render(
      <StaffTable
        staff={[
          offShift("z", "Zara Ahmed"),
          onShift("late", "Lee Late", "2026-09-09T09:30:00.000Z"),
          offShift("a", "Amy Brown"),
          onShift("early", "Eve Early", "2026-09-09T06:00:00.000Z"),
        ]}
        workplace={workplace}
        onShift={2}
        now={NOW}
      />
    );

    expect(bodyRows().map((row) => within(row).getByRole("link").textContent)).toEqual([
      "Eve Early",
      "Lee Late",
      "Amy Brown",
      "Zara Ahmed",
    ]);
  });

  it("counts the members on shift in the header", () => {
    render(
      <StaffTable
        staff={[onShift("a", "Ada", "2026-09-09T09:00:00.000Z"), offShift("b", "Bo")]}
        workplace={workplace}
        onShift={1}
        now={NOW}
      />
    );

    expect(screen.getByText("1 on shift")).toBeInTheDocument();
  });
});
