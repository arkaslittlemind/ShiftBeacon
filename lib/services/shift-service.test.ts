import { beforeEach, describe, expect, it, vi } from "vitest";
import type { Organization, Shift } from "@/lib/generated/prisma/client";

vi.mock("@/lib/prisma", () => ({
  prisma: {
    shift: { findFirst: vi.fn(), create: vi.fn(), update: vi.fn() },
    organization: { findUniqueOrThrow: vi.fn() },
  },
}));

import { prisma } from "@/lib/prisma";
import {
  ActiveShiftExistsError,
  NoActiveShiftError,
  OutsidePerimeterError,
  clockIn,
  clockOut,
} from "./shift-service";

const mockedFindFirst = vi.mocked(prisma.shift.findFirst);
const mockedCreate = vi.mocked(prisma.shift.create);
const mockedUpdate = vi.mocked(prisma.shift.update);
const mockedFindOrg = vi.mocked(prisma.organization.findUniqueOrThrow);

const EARTH_RADIUS_METERS = 6371000;

/** Exact for a pure north/south offset - see lib/geo.test.ts for why. */
function metersNorth(lat: number, lon: number, meters: number) {
  const deltaLat = (meters / EARTH_RADIUS_METERS) * (180 / Math.PI);
  return { lat: lat + deltaLat, lon };
}

const organization = {
  id: "org1",
  name: "Riverside Care Home",
  latitude: 51.5074,
  longitude: -0.1278,
  clockInRadiusMeters: 200,
  createdAt: new Date(),
  updatedAt: new Date(),
} satisfies Organization;

const activeShift = {
  id: "shift1",
  userId: "u1",
  organizationId: "org1",
  clockInAt: new Date(),
  clockInLatitude: organization.latitude,
  clockInLongitude: organization.longitude,
  clockInNote: null,
  clockOutAt: null,
  clockOutLatitude: null,
  clockOutLongitude: null,
  clockOutNote: null,
  createdAt: new Date(),
  updatedAt: new Date(),
} satisfies Shift;

beforeEach(() => {
  vi.clearAllMocks();
});

describe("clockIn", () => {
  it("throws ActiveShiftExistsError when the user already has an active shift", async () => {
    mockedFindFirst.mockResolvedValue(activeShift);
    mockedFindOrg.mockResolvedValue(organization);

    await expect(
      clockIn("u1", "org1", {
        latitude: organization.latitude,
        longitude: organization.longitude,
      })
    ).rejects.toThrow(ActiveShiftExistsError);
    expect(mockedCreate).not.toHaveBeenCalled();
  });

  it("throws OutsidePerimeterError when outside the workplace radius", async () => {
    mockedFindFirst.mockResolvedValue(null);
    mockedFindOrg.mockResolvedValue(organization);
    const outside = metersNorth(
      organization.latitude,
      organization.longitude,
      organization.clockInRadiusMeters + 50
    );

    await expect(
      clockIn("u1", "org1", { latitude: outside.lat, longitude: outside.lon })
    ).rejects.toThrow(OutsidePerimeterError);
    expect(mockedCreate).not.toHaveBeenCalled();
  });

  it("creates a shift when inside the radius with no active shift", async () => {
    mockedFindFirst.mockResolvedValue(null);
    mockedFindOrg.mockResolvedValue(organization);
    mockedCreate.mockResolvedValue(activeShift);
    const inside = metersNorth(
      organization.latitude,
      organization.longitude,
      organization.clockInRadiusMeters - 50
    );

    const result = await clockIn("u1", "org1", {
      latitude: inside.lat,
      longitude: inside.lon,
      note: "Covering handover",
    });

    expect(result).toBe(activeShift);
    expect(mockedCreate).toHaveBeenCalledWith({
      data: expect.objectContaining({
        userId: "u1",
        organizationId: "org1",
        clockInLatitude: inside.lat,
        clockInLongitude: inside.lon,
        clockInNote: "Covering handover",
      }),
    });
  });
});

describe("clockOut", () => {
  it("throws NoActiveShiftError when there is no active shift", async () => {
    mockedFindFirst.mockResolvedValue(null);

    await expect(clockOut("u1", {})).rejects.toThrow(NoActiveShiftError);
    expect(mockedUpdate).not.toHaveBeenCalled();
  });

  it("updates the active shift when clocking out", async () => {
    mockedFindFirst.mockResolvedValue(activeShift);
    mockedUpdate.mockResolvedValue({ ...activeShift, clockOutAt: new Date() });

    const result = await clockOut("u1", { latitude: 1, longitude: 2, note: "Handover done" });

    expect(mockedUpdate).toHaveBeenCalledWith({
      where: { id: activeShift.id },
      data: expect.objectContaining({
        clockOutLatitude: 1,
        clockOutLongitude: 2,
        clockOutNote: "Handover done",
      }),
    });
    expect(result.clockOutAt).not.toBeNull();
  });
});
