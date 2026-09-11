import { beforeEach, describe, expect, it, vi } from "vitest";
import { apiError } from "@/lib/api/response";

vi.mock("@/lib/api/auth", () => ({
  requireApiUser: vi.fn(),
}));

vi.mock("@/lib/services/shift-service", async () => {
  const actual = await vi.importActual<typeof import("@/lib/services/shift-service")>(
    "@/lib/services/shift-service"
  );
  return { ...actual, clockOut: vi.fn() };
});

// after() defers work past the response; run it inline so the test can assert on it.
vi.mock("next/server", async () => {
  const actual = await vi.importActual<typeof import("next/server")>("next/server");
  return { ...actual, after: (fn: () => unknown) => void fn() };
});

vi.mock("@/lib/observability/events", () => ({ captureServerEvent: vi.fn() }));

import { captureServerEvent } from "@/lib/observability/events";
import { requireApiUser } from "@/lib/api/auth";
import { NoActiveShiftError, clockOut } from "@/lib/services/shift-service";
import type { UserWithOrganization } from "@/lib/services/user-service";
import { POST } from "./route";

const mockedRequireApiUser = vi.mocked(requireApiUser);
const mockedClockOut = vi.mocked(clockOut);

const okUser = {
  id: "u1",
  role: "CARE_WORKER",
  organizationId: "org1",
  name: "Casey Worker",
  email: "casey.worker@example.com",
} as unknown as UserWithOrganization;

function buildRequest(body: unknown) {
  return new Request("http://localhost/api/shifts/clock-out", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
}

beforeEach(() => {
  vi.clearAllMocks();
});

describe("POST /api/shifts/clock-out", () => {
  it("returns the auth response directly when not authorized", async () => {
    mockedRequireApiUser.mockResolvedValue({
      ok: false,
      response: apiError(401, "Not authenticated"),
    });

    const response = await POST(buildRequest({}));

    expect(response.status).toBe(401);
    expect(mockedClockOut).not.toHaveBeenCalled();
  });

  it("maps NoActiveShiftError to 409", async () => {
    mockedRequireApiUser.mockResolvedValue({ ok: true, user: okUser });
    mockedClockOut.mockRejectedValue(new NoActiveShiftError());

    const response = await POST(buildRequest({}));

    expect(response.status).toBe(409);
  });

  it("returns 200 with the shift response on success", async () => {
    mockedRequireApiUser.mockResolvedValue({ ok: true, user: okUser });
    mockedClockOut.mockResolvedValue({
      id: "shift1",
      clockInAt: new Date("2024-01-08T09:00:00Z"),
      clockInLatitude: 51.5074,
      clockInLongitude: -0.1278,
      clockInNote: null,
      clockOutAt: new Date("2024-01-08T17:00:00Z"),
      clockOutLatitude: 51.5074,
      clockOutLongitude: -0.1278,
      clockOutNote: "Handover done",
    } as unknown as Awaited<ReturnType<typeof clockOut>>);

    const response = await POST(buildRequest({ note: "Handover done" }));
    const body = await response.json();

    expect(response.status).toBe(200);
    expect(body.data.id).toBe("shift1");
    expect(body.data.clockOutNote).toBe("Handover done");
  });

  it("reports a successful clock-out, flagging the note without its text", async () => {
    mockedRequireApiUser.mockResolvedValue({ ok: true, user: okUser });
    mockedClockOut.mockResolvedValue({
      id: "shift1",
      clockInAt: new Date("2024-01-08T09:00:00Z"),
      clockInLatitude: 51.5074,
      clockInLongitude: -0.1278,
      clockInNote: null,
      clockOutAt: new Date("2024-01-08T17:00:00Z"),
      clockOutLatitude: 51.5074,
      clockOutLongitude: -0.1278,
      clockOutNote: "Handover done",
    } as unknown as Awaited<ReturnType<typeof clockOut>>);

    await POST(buildRequest({ note: "Handover done" }));

    expect(captureServerEvent).toHaveBeenCalledWith(okUser, {
      name: "shift_clock_out_succeeded",
      hasNote: true,
    });

    const payload = JSON.stringify(
      vi.mocked(captureServerEvent).mock.calls.at(-1)?.[1]
    );
    expect(payload).not.toContain("Handover done");
    expect(payload).not.toContain("51.5074");
  });

  it("reports nothing when there was no active shift to close", async () => {
    mockedRequireApiUser.mockResolvedValue({ ok: true, user: okUser });
    mockedClockOut.mockRejectedValue(new NoActiveShiftError());

    await POST(buildRequest({}));

    expect(captureServerEvent).not.toHaveBeenCalled();
  });
});
