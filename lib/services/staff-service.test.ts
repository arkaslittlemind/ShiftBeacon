import { beforeEach, describe, expect, it, vi } from "vitest";
import type { Shift, User } from "@/lib/generated/prisma/client";

vi.mock("@/lib/prisma", () => ({
  prisma: {
    user: { findFirst: vi.fn(), findMany: vi.fn() },
    shift: { findFirst: vi.fn(), findMany: vi.fn() },
  },
}));

import { prisma } from "@/lib/prisma";
import { getShiftHistoryForStaffMember } from "./staff-service";

const mockedUserFindFirst = vi.mocked(prisma.user.findFirst);
const mockedShiftFindFirst = vi.mocked(prisma.shift.findFirst);
const mockedShiftFindMany = vi.mocked(prisma.shift.findMany);

const staffMember = {
  id: "staff1",
  auth0UserId: "auth0|staff1",
  name: "Casey Worker",
  email: "casey@example.com",
  role: "CARE_WORKER",
  organizationId: "org1",
  createdAt: new Date(),
  updatedAt: new Date(),
} satisfies User;

const completedShift = {
  id: "shift1",
  userId: "staff1",
  organizationId: "org1",
  clockInAt: new Date("2024-01-08T09:00:00Z"),
  clockInLatitude: 51.5074,
  clockInLongitude: -0.1278,
  clockInNote: null,
  clockOutAt: new Date("2024-01-08T17:00:00Z"),
  clockOutLatitude: 51.5074,
  clockOutLongitude: -0.1278,
  clockOutNote: null,
  createdAt: new Date(),
  updatedAt: new Date(),
} satisfies Shift;

beforeEach(() => {
  vi.clearAllMocks();
});

describe("getShiftHistoryForStaffMember", () => {
  it("returns null when the staff id belongs to a different organization", async () => {
    // The query filters by { id, organizationId } together, so a staff id
    // that exists in a different org (or not at all) looks identical here.
    mockedUserFindFirst.mockResolvedValue(null);

    const result = await getShiftHistoryForStaffMember("org1", "staff-in-other-org");

    expect(result).toBeNull();
    expect(mockedUserFindFirst).toHaveBeenCalledWith({
      where: { id: "staff-in-other-org", organizationId: "org1" },
    });
    expect(mockedShiftFindFirst).not.toHaveBeenCalled();
    expect(mockedShiftFindMany).not.toHaveBeenCalled();
  });

  it("returns the full record for a same-organization staff id", async () => {
    mockedUserFindFirst.mockResolvedValue(staffMember);
    mockedShiftFindFirst.mockResolvedValue(null);
    mockedShiftFindMany.mockResolvedValue([completedShift]);

    const result = await getShiftHistoryForStaffMember("org1", "staff1");

    expect(result).toEqual({
      staff: staffMember,
      activeShift: null,
      history: [completedShift],
    });
  });
});
