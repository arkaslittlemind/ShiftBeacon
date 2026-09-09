import { beforeEach, describe, expect, it, vi } from "vitest";
import { apiError } from "@/lib/api/response";

vi.mock("@/lib/api/auth", () => ({
  requireApiUser: vi.fn(),
}));

vi.mock("@/lib/services/shift-service", async () => {
  const actual = await vi.importActual<typeof import("@/lib/services/shift-service")>(
    "@/lib/services/shift-service"
  );
  return { ...actual, clockIn: vi.fn() };
});

import { requireApiUser } from "@/lib/api/auth";
import {
  ActiveShiftExistsError,
  OutsidePerimeterError,
  clockIn,
} from "@/lib/services/shift-service";
import type { UserWithOrganization } from "@/lib/services/user-service";
import { POST } from "./route";

const mockedRequireApiUser = vi.mocked(requireApiUser);
const mockedClockIn = vi.mocked(clockIn);

const okUser = { id: "u1", organizationId: "org1" } as unknown as UserWithOrganization;

function buildRequest(body: unknown) {
  return new Request("http://localhost/api/shifts/clock-in", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
}

beforeEach(() => {
  vi.clearAllMocks();
});

describe("POST /api/shifts/clock-in", () => {
  it("returns the auth response directly when not authorized", async () => {
    mockedRequireApiUser.mockResolvedValue({
      ok: false,
      response: apiError(403, "Forbidden"),
    });

    const response = await POST(buildRequest({ latitude: 0, longitude: 0 }));

    expect(response.status).toBe(403);
    expect(mockedClockIn).not.toHaveBeenCalled();
  });

  it("maps ActiveShiftExistsError to 409", async () => {
    mockedRequireApiUser.mockResolvedValue({ ok: true, user: okUser });
    mockedClockIn.mockRejectedValue(new ActiveShiftExistsError());

    const response = await POST(buildRequest({ latitude: 51.5074, longitude: -0.1278 }));

    expect(response.status).toBe(409);
  });

  it("maps OutsidePerimeterError to 422", async () => {
    mockedRequireApiUser.mockResolvedValue({ ok: true, user: okUser });
    mockedClockIn.mockRejectedValue(new OutsidePerimeterError());

    const response = await POST(buildRequest({ latitude: 51.5074, longitude: -0.1278 }));

    expect(response.status).toBe(422);
  });

  it("returns 200 with the shift response on success", async () => {
    mockedRequireApiUser.mockResolvedValue({ ok: true, user: okUser });
    mockedClockIn.mockResolvedValue({
      id: "shift1",
      clockInAt: new Date("2024-01-08T09:00:00Z"),
      clockInLatitude: 51.5074,
      clockInLongitude: -0.1278,
      clockInNote: null,
    } as unknown as Awaited<ReturnType<typeof clockIn>>);

    const response = await POST(buildRequest({ latitude: 51.5074, longitude: -0.1278 }));
    const body = await response.json();

    expect(response.status).toBe(200);
    expect(body.data.id).toBe("shift1");
    expect(body.data.clockOutAt).toBeNull();
  });
});
