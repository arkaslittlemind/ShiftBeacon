import { beforeEach, describe, expect, it, vi } from "vitest";
import type { AnalyticsResponse } from "@/types/analytics";

vi.mock("@/lib/prisma", () => ({ prisma: {} }));

vi.mock("@/lib/services/analytics-service", async () => {
  const actual = await vi.importActual<typeof import("@/lib/services/analytics-service")>(
    "@/lib/services/analytics-service"
  );
  return { ...actual, getAnalyticsForOrganization: vi.fn() };
});

vi.mock("@/lib/services/handover-service", () => ({
  getScrubbedNotesForDay: vi.fn(),
}));

import { getAnalyticsForOrganization } from "@/lib/services/analytics-service";
import { getScrubbedNotesForDay } from "@/lib/services/handover-service";
import { createAliasMap } from "./attendance-aliases";
import { createAttendanceTools } from "./attendance-tools";

const mockedAnalytics = vi.mocked(getAnalyticsForOrganization);
const mockedNotes = vi.mocked(getScrubbedNotesForDay);

const NOW = new Date("2026-09-19T12:00:00.000Z");

const aliases = createAliasMap([
  { id: "u-casey", name: "Casey Worker" },
  { id: "u-priya", name: "Priya Nowak" },
]);

const analytics: AnalyticsResponse = {
  windowDays: 7,
  averageHoursPerDay: 5.123456,
  dailyClockIns: [
    { date: "2026-09-18", count: 3 },
    { date: "2026-09-19", count: 1 },
  ],
  staffHours: [
    { userId: "u-priya", name: "Priya Nowak", totalHours: 20.456789 },
    { userId: "u-casey", name: "Casey Worker", totalHours: 12 },
  ],
};

function tools(organizationId = "org-session") {
  return createAttendanceTools({ organizationId, aliases, now: () => NOW });
}

async function run(name: string, args: unknown, organizationId?: string) {
  return tools(organizationId).execute(name, args);
}

beforeEach(() => {
  vi.clearAllMocks();
  mockedAnalytics.mockResolvedValue(analytics);
  mockedNotes.mockResolvedValue([]);
});

describe("declarations", () => {
  it("offers exactly the four read-only tools", () => {
    expect(tools().declarations.map((declaration) => declaration.name)).toEqual([
      "get_attendance_summary",
      "get_daily_clock_ins",
      "get_staff_hours",
      "get_shift_notes",
    ]);
  });

  it("gives the model no way to name an organization or a user", () => {
    const declared = JSON.stringify(tools().declarations);

    expect(declared).not.toMatch(/organi[sz]ation/i);
    expect(declared).not.toMatch(/user/i);
    expect(declared).not.toMatch(/\bid\b/i);
  });

  it("omits parameters for tools that take none", () => {
    const summary = tools().declarations.find((d) => d.name === "get_attendance_summary");

    expect(summary?.parameters).toBeUndefined();
  });
});

describe("organization scoping", () => {
  it("reads every tool's data for the session's organization, whatever the model asks", async () => {
    await run("get_attendance_summary", {}, "org-session");
    await run("get_daily_clock_ins", {}, "org-session");
    await run("get_staff_hours", {}, "org-session");
    await run("get_shift_notes", { date: "2026-09-18" }, "org-session");

    for (const [organizationId] of mockedAnalytics.mock.calls) {
      expect(organizationId).toBe("org-session");
    }
    expect(mockedAnalytics).toHaveBeenCalledTimes(3);
    expect(mockedNotes).toHaveBeenCalledWith("org-session", "2026-09-18");
  });

  it("rejects an organizationId argument on every tool without reading anything", async () => {
    const attempts: [string, Record<string, unknown>][] = [
      ["get_attendance_summary", { organizationId: "org-other" }],
      ["get_daily_clock_ins", { organizationId: "org-other" }],
      ["get_staff_hours", { organizationId: "org-other" }],
      ["get_shift_notes", { date: "2026-09-18", organizationId: "org-other" }],
    ];

    for (const [name, args] of attempts) {
      const result = await run(name, args);
      expect(result.ok).toBe(false);
    }
    expect(mockedAnalytics).not.toHaveBeenCalled();
    expect(mockedNotes).not.toHaveBeenCalled();
  });

  it("rejects a userId argument", async () => {
    const result = await run("get_staff_hours", { userId: "u-casey" });

    expect(result.ok).toBe(false);
    expect(mockedAnalytics).not.toHaveBeenCalled();
  });
});

describe("aggregate tools", () => {
  it("summarizes the window, rounded to two decimals", async () => {
    const result = await run("get_attendance_summary", {});

    expect(result).toEqual({
      ok: true,
      data: { windowDays: 7, averageHoursPerDay: 5.12 },
    });
  });

  it("returns clock-ins per day", async () => {
    const result = await run("get_daily_clock_ins", {});

    expect(result).toEqual({
      ok: true,
      data: {
        dailyClockIns: [
          { date: "2026-09-18", count: 3 },
          { date: "2026-09-19", count: 1 },
        ],
      },
    });
  });

  it("returns staff hours under aliases only, in alias order", async () => {
    const result = await run("get_staff_hours", {});

    expect(result).toEqual({
      ok: true,
      data: {
        staffHours: [
          { staff: "Staff 1", totalHours: 12 },
          { staff: "Staff 2", totalHours: 20.46 },
        ],
      },
    });
    const serialized = JSON.stringify(result);
    expect(serialized).not.toMatch(/casey|priya|nowak|worker|u-casey|u-priya/i);
  });

  it("labels staff who have no alias instead of dropping their hours", async () => {
    mockedAnalytics.mockResolvedValue({
      ...analytics,
      staffHours: [{ userId: "u-blank", name: "", totalHours: 4 }],
    });

    const result = await run("get_staff_hours", {});

    expect(result).toEqual({
      ok: true,
      data: { staffHours: [{ staff: "Unnamed staff member", totalHours: 4 }] },
    });
  });
});

describe("get_shift_notes", () => {
  it("returns the day's scrubbed notes and flags them as untrusted data", async () => {
    mockedNotes.mockResolvedValue(["Hoist in room 4 is grinding."]);

    const result = await run("get_shift_notes", { date: "2026-09-18" });

    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(result.data).toMatchObject({
        date: "2026-09-18",
        totalNotes: 1,
        notes: ["Hoist in room 4 is grinding."],
        truncated: false,
      });
      expect(JSON.stringify(result.data)).toMatch(/untrusted/i);
    }
  });

  it("accepts the oldest and newest day of the window", async () => {
    expect((await run("get_shift_notes", { date: "2026-09-13" })).ok).toBe(true);
    expect((await run("get_shift_notes", { date: "2026-09-19" })).ok).toBe(true);
  });

  it("rejects days outside the window and malformed dates without reading notes", async () => {
    for (const date of ["2026-09-12", "2026-09-20", "yesterday", "2026-9-18", ""]) {
      const result = await run("get_shift_notes", { date });
      expect(result.ok).toBe(false);
    }
    expect(mockedNotes).not.toHaveBeenCalled();
  });

  it("rejects a missing date", async () => {
    expect((await run("get_shift_notes", {})).ok).toBe(false);
  });

  it("caps the note count and length, because stored notes can be long", async () => {
    mockedNotes.mockResolvedValue(Array.from({ length: 40 }, () => "x".repeat(600)));

    const result = await run("get_shift_notes", { date: "2026-09-18" });

    expect(result.ok).toBe(true);
    if (result.ok) {
      const data = result.data as { notes: string[]; totalNotes: number; truncated: boolean };
      expect(data.notes).toHaveLength(30);
      expect(data.totalNotes).toBe(40);
      expect(data.truncated).toBe(true);
      for (const note of data.notes) {
        expect(note.startsWith("x".repeat(500))).toBe(true);
        expect(note.length).toBeLessThan(530);
      }
    }
  });

  it("does not mark short notes as truncated", async () => {
    mockedNotes.mockResolvedValue(["short note"]);

    const result = await run("get_shift_notes", { date: "2026-09-18" });

    expect(result.ok && (result.data as { truncated: boolean }).truncated).toBe(false);
  });
});

describe("failure handling", () => {
  it("answers an unknown tool with an error result instead of throwing, without echoing the name", async () => {
    const result = await run("drop_all_tables", {});

    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(result.error).not.toMatch(/drop_all_tables/);
    }
  });

  it("returns a generic error when a service fails, without leaking its message", async () => {
    mockedAnalytics.mockRejectedValue(new Error("connection to db.internal:5432 refused"));

    const result = await run("get_attendance_summary", {});

    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(result.error).not.toMatch(/db\.internal|refused/);
    }
  });
});
