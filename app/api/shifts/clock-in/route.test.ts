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

// after() defers work past the response; run it inline so the test can assert on it.
vi.mock("next/server", async () => {
  const actual = await vi.importActual<typeof import("next/server")>("next/server");
  return { ...actual, after: (fn: () => unknown) => void fn() };
});

vi.mock("@/lib/observability/events", () => ({ captureServerEvent: vi.fn() }));

import { captureServerEvent } from "@/lib/observability/events";
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

const okUser = {
  id: "u1",
  role: "CARE_WORKER",
  organizationId: "org1",
  name: "Casey Worker",
  email: "casey.worker@example.com",
} as unknown as UserWithOrganization;

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

  it("reports a successful clock-in, flagging the note without its text", async () => {
    mockedRequireApiUser.mockResolvedValue({ ok: true, user: okUser });
    mockedClockIn.mockResolvedValue({
      id: "shift1",
      clockInAt: new Date("2024-01-08T09:00:00Z"),
      clockInLatitude: 51.5074,
      clockInLongitude: -0.1278,
      clockInNote: "covering handover",
    } as unknown as Awaited<ReturnType<typeof clockIn>>);

    await POST(
      buildRequest({
        latitude: 51.5074,
        longitude: -0.1278,
        note: "covering handover",
      })
    );

    expect(captureServerEvent).toHaveBeenCalledWith(okUser, {
      name: "shift_clock_in_succeeded",
      hasNote: true,
    });
  });

  it("reports a perimeter rejection with its reason", async () => {
    mockedRequireApiUser.mockResolvedValue({ ok: true, user: okUser });
    mockedClockIn.mockRejectedValue(new OutsidePerimeterError());

    await POST(buildRequest({ latitude: 51.9, longitude: -0.9 }));

    expect(captureServerEvent).toHaveBeenCalledWith(okUser, {
      name: "shift_clock_in_rejected",
      reason: "outside_perimeter",
    });
  });

  it("reports a duplicate-shift rejection with its reason", async () => {
    mockedRequireApiUser.mockResolvedValue({ ok: true, user: okUser });
    mockedClockIn.mockRejectedValue(new ActiveShiftExistsError());

    await POST(buildRequest({ latitude: 51.5074, longitude: -0.1278 }));

    expect(captureServerEvent).toHaveBeenCalledWith(okUser, {
      name: "shift_clock_in_rejected",
      reason: "active_shift_exists",
    });
  });

  it("never puts a coordinate or note in the event payload", async () => {
    mockedRequireApiUser.mockResolvedValue({ ok: true, user: okUser });
    mockedClockIn.mockRejectedValue(new OutsidePerimeterError());

    await POST(
      buildRequest({ latitude: 51.9, longitude: -0.9, note: "running late" })
    );

    const event = vi.mocked(captureServerEvent).mock.calls.at(-1)?.[1];
    const payload = JSON.stringify(event);
    expect(payload).not.toContain("51.9");
    expect(payload).not.toContain("running late");
  });

  it("reports nothing when the caller is not authorized", async () => {
    mockedRequireApiUser.mockResolvedValue({
      ok: false,
      response: apiError(403, "Forbidden"),
    });

    await POST(buildRequest({ latitude: 0, longitude: 0 }));

    expect(captureServerEvent).not.toHaveBeenCalled();
  });
});
