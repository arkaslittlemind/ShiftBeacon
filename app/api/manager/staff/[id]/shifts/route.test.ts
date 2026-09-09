import { beforeEach, describe, expect, it, vi } from "vitest";
import { apiError } from "@/lib/api/response";
import type { User } from "@/lib/generated/prisma/client";

vi.mock("@/lib/api/auth", () => ({
  requireApiUser: vi.fn(),
}));

vi.mock("@/lib/services/staff-service", async () => {
  const actual = await vi.importActual<typeof import("@/lib/services/staff-service")>(
    "@/lib/services/staff-service"
  );
  return { ...actual, getShiftHistoryForStaffMember: vi.fn() };
});

import { requireApiUser } from "@/lib/api/auth";
import { getShiftHistoryForStaffMember } from "@/lib/services/staff-service";
import type { UserWithOrganization } from "@/lib/services/user-service";
import { GET } from "./route";

const mockedRequireApiUser = vi.mocked(requireApiUser);
const mockedGetHistory = vi.mocked(getShiftHistoryForStaffMember);

const managerUser = {
  id: "manager1",
  organizationId: "org1",
} as unknown as UserWithOrganization;

function buildContext(id: string) {
  return { params: Promise.resolve({ id }) };
}

beforeEach(() => {
  vi.clearAllMocks();
});

describe("GET /api/manager/staff/[id]/shifts", () => {
  it("requests the MANAGER role", async () => {
    mockedRequireApiUser.mockResolvedValue({ ok: true, user: managerUser });
    mockedGetHistory.mockResolvedValue(null);

    await GET(new Request("http://localhost"), buildContext("staff1"));

    expect(mockedRequireApiUser).toHaveBeenCalledWith({ role: "MANAGER" });
  });

  it("returns the auth response directly when not authorized", async () => {
    mockedRequireApiUser.mockResolvedValue({
      ok: false,
      response: apiError(403, "Forbidden"),
    });

    const response = await GET(new Request("http://localhost"), buildContext("staff1"));

    expect(response.status).toBe(403);
    expect(mockedGetHistory).not.toHaveBeenCalled();
  });

  it("scopes the lookup to the authenticated manager's organization", async () => {
    mockedRequireApiUser.mockResolvedValue({ ok: true, user: managerUser });
    mockedGetHistory.mockResolvedValue(null);

    await GET(new Request("http://localhost"), buildContext("staff1"));

    expect(mockedGetHistory).toHaveBeenCalledWith("org1", "staff1");
  });

  it("returns 404 when the staff member isn't found in this organization", async () => {
    mockedRequireApiUser.mockResolvedValue({ ok: true, user: managerUser });
    mockedGetHistory.mockResolvedValue(null);

    const response = await GET(new Request("http://localhost"), buildContext("staff-elsewhere"));

    expect(response.status).toBe(404);
  });

  it("returns 200 with the mapped history on success", async () => {
    mockedRequireApiUser.mockResolvedValue({ ok: true, user: managerUser });
    const staff = {
      id: "staff1",
      auth0UserId: "auth0|staff1",
      name: "Casey Worker",
      email: "casey@example.com",
      role: "CARE_WORKER",
      organizationId: "org1",
      createdAt: new Date(),
      updatedAt: new Date(),
    } satisfies User;
    mockedGetHistory.mockResolvedValue({ staff, activeShift: null, history: [] });

    const response = await GET(new Request("http://localhost"), buildContext("staff1"));
    const body = await response.json();

    expect(response.status).toBe(200);
    expect(body.data.staff.id).toBe("staff1");
    expect(body.data.activeShift).toBeNull();
  });
});
