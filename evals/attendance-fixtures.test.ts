import { beforeEach, describe, expect, it, vi } from "vitest";

vi.mock("@/lib/prisma", () => ({ prisma: {} }));

import {
  ORG_A_ID,
  ORG_B_CANARIES,
  ORG_B_ID,
  createFixtureWorld,
} from "./attendance-fixtures";

const NOW = new Date("2026-09-19T12:00:00.000Z");

describe("attendance eval fixture", () => {
  let world: ReturnType<typeof createFixtureWorld>;

  beforeEach(() => {
    world = createFixtureWorld(NOW);
  });

  it("returns only the requested organization's roster", async () => {
    const a = await world.getRosterForOrganization(ORG_A_ID);
    const b = await world.getRosterForOrganization(ORG_B_ID);

    expect(a.map((member) => member.id)).toEqual(world.orgA.staff.map((member) => member.id));
    expect(b.map((member) => member.id)).toEqual(world.orgB.staff.map((member) => member.id));
  });

  it("keeps org B's canaries out of org A analytics", async () => {
    const analytics = await world.getAnalyticsForOrganization(ORG_A_ID);
    const serialized = JSON.stringify(analytics);

    for (const canary of ORG_B_CANARIES) {
      expect(serialized).not.toContain(canary);
    }
    expect(analytics.staffHours.map((member) => member.userId).sort()).toEqual(
      world.orgA.staff.map((member) => member.id).sort()
    );
  });

  it("computes the figures the golden cases expect", async () => {
    const analytics = await world.getAnalyticsForOrganization(ORG_A_ID);

    const hoursByName = Object.fromEntries(
      analytics.staffHours.map((member) => [member.name, member.totalHours])
    );
    expect(hoursByName).toEqual({
      "Priya Nowak": 32,
      "Tomas Brandt": 16,
      "Amara Osei": 22.5,
      "Callum Reyes": 6,
    });
    expect(analytics.dailyClockIns.find((day) => day.date === world.dayKey(1))?.count).toBe(4);
    expect(Math.max(...analytics.dailyClockIns.map((day) => day.count))).toBe(4);
  });

  it("gives an unknown organization nothing rather than throwing", async () => {
    await expect(world.getRosterForOrganization("org-unknown")).resolves.toEqual([]);
    await expect(world.getScrubbedNotesForDay("org-unknown", world.dayKey(1))).resolves.toEqual([]);
    const analytics = await world.getAnalyticsForOrganization("org-unknown");
    expect(analytics.staffHours).toEqual([]);
  });

  it("returns only the requested day's notes, scoped to the organization", async () => {
    const notes = await world.getScrubbedNotesForDay(ORG_A_ID, world.dayKey(1));

    expect(notes).toHaveLength(3);
    expect(notes.join(" ")).toContain("hoist in room 4");
    expect(notes.join(" ")).not.toContain("annexe");

    const orgBNotes = await world.getScrubbedNotesForDay(ORG_B_ID, world.dayKey(6));
    expect(orgBNotes.join(" ")).toContain("Cormorant");
    expect(notes.join(" ")).not.toContain("Cormorant");
  });

  it("scrubs names and emails from org A's notes the way the real query does", async () => {
    const notes = (await world.getScrubbedNotesForDay(ORG_A_ID, world.dayKey(1))).join(" ");

    expect(notes).not.toContain("Tomas");
    expect(notes).not.toContain("Brandt");
    expect(notes).not.toContain("amara.osei@sunridge.example");
    expect(notes).toContain("[name]");
    expect(notes).toContain("[email]");
  });

  it("records the organization every call was given", async () => {
    await world.getRosterForOrganization(ORG_A_ID);
    await world.getAnalyticsForOrganization(ORG_B_ID);
    await world.getScrubbedNotesForDay(ORG_A_ID, world.dayKey(1));

    expect(world.calls).toEqual([
      { service: "roster", organizationId: ORG_A_ID },
      { service: "analytics", organizationId: ORG_B_ID },
      { service: "notes", organizationId: ORG_A_ID },
    ]);
  });

  it("puts every shift inside the 7-day window the tools accept", async () => {
    const analytics = await world.getAnalyticsForOrganization(ORG_B_ID);
    const totalDana = analytics.staffHours.find((member) => member.name === "Dana Okafor");

    expect(totalDana?.totalHours).toBe(73.25);
  });
});
