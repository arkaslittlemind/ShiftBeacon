import { beforeEach, describe, expect, it, vi } from "vitest";
import { apiError } from "@/lib/api/response";

vi.mock("@/lib/api/auth", () => ({
  requireApiUser: vi.fn(),
}));

vi.mock("@/lib/services/staff-service", async () => {
  const actual = await vi.importActual<typeof import("@/lib/services/staff-service")>(
    "@/lib/services/staff-service"
  );
  return { ...actual, getStaffForOrganization: vi.fn() };
});

import { requireApiUser } from "@/lib/api/auth";
import { getStaffForOrganization } from "@/lib/services/staff-service";
import type { UserWithOrganization } from "@/lib/services/user-service";
import { GET } from "./route";

const mockedRequireApiUser = vi.mocked(requireApiUser);
const mockedGetStaff = vi.mocked(getStaffForOrganization);

const managerUser = {
  id: "manager1",
  organizationId: "org1",
} as unknown as UserWithOrganization;

beforeEach(() => {
  vi.clearAllMocks();
});

describe("GET /api/manager/staff", () => {
  it("requests the MANAGER role", async () => {
    mockedRequireApiUser.mockResolvedValue({ ok: true, user: managerUser });
    mockedGetStaff.mockResolvedValue([]);

    await GET();

    expect(mockedRequireApiUser).toHaveBeenCalledWith({ role: "MANAGER" });
  });

  it("returns the auth response directly when not authorized", async () => {
    mockedRequireApiUser.mockResolvedValue({
      ok: false,
      response: apiError(403, "Forbidden"),
    });

    const response = await GET();

    expect(response.status).toBe(403);
    expect(mockedGetStaff).not.toHaveBeenCalled();
  });

  it("scopes the staff query to the authenticated user's organization", async () => {
    mockedRequireApiUser.mockResolvedValue({ ok: true, user: managerUser });
    mockedGetStaff.mockResolvedValue([]);

    await GET();

    expect(mockedGetStaff).toHaveBeenCalledWith("org1");
  });
});
