import { beforeEach, describe, expect, it, vi } from "vitest";
import type { SessionData } from "@auth0/nextjs-auth0/types";

vi.mock("@/lib/auth0", () => ({
  auth0: { getSession: vi.fn() },
}));

vi.mock("@/lib/services/user-service", () => ({
  findOrCreateCurrentUser: vi.fn(),
}));

vi.mock("@/lib/observability/identify", () => ({ identifySentryUser: vi.fn() }));

// The real redirect throws to halt rendering, and requireRole's callers rely on that.
vi.mock("next/navigation", () => ({
  redirect: vi.fn((url: string) => {
    throw new Error(`NEXT_REDIRECT:${url}`);
  }),
}));

import { auth0 } from "@/lib/auth0";
import { redirect } from "next/navigation";
import { ROLE_CLAIM, getRoleFromSession, requireRole } from "./auth";

const mockedGetSession = vi.mocked(auth0.getSession);
const mockedRedirect = vi.mocked(redirect);

function buildSession(user: Record<string, unknown> = {}): SessionData {
  return {
    user: { sub: "auth0|user-1", name: "Morgan Manager", email: "morgan@example.com", ...user },
    tokenSet: { accessToken: "token", expiresAt: 0 },
    internal: { sid: "sid-1", createdAt: 0 },
  };
}

beforeEach(() => {
  vi.clearAllMocks();
});

describe("getRoleFromSession", () => {
  it("returns the role from the Auth0 claim", () => {
    expect(getRoleFromSession(buildSession({ [ROLE_CLAIM]: "MANAGER" }))).toBe("MANAGER");
  });

  it("defaults to CARE_WORKER when the claim is missing", () => {
    expect(getRoleFromSession(buildSession())).toBe("CARE_WORKER");
  });
});

describe("requireRole", () => {
  it("redirects to login with the encoded return path when there is no session", async () => {
    mockedGetSession.mockResolvedValue(null);

    await expect(requireRole("MANAGER", "/manager/dashboard")).rejects.toThrow(
      "NEXT_REDIRECT:/auth/login?returnTo=%2Fmanager%2Fdashboard"
    );
    expect(mockedRedirect).toHaveBeenCalledOnce();
  });

  it("returns ok when the session role matches", async () => {
    mockedGetSession.mockResolvedValue(buildSession({ [ROLE_CLAIM]: "MANAGER" }));

    const result = await requireRole("MANAGER", "/manager/dashboard");

    expect(result.status).toBe("ok");
    expect(result.user.role).toBe("MANAGER");
    expect(mockedRedirect).not.toHaveBeenCalled();
  });

  it("returns forbidden when the session role does not match", async () => {
    mockedGetSession.mockResolvedValue(buildSession({ [ROLE_CLAIM]: "CARE_WORKER" }));

    const result = await requireRole("MANAGER", "/manager/dashboard");

    expect(result.status).toBe("forbidden");
    expect(mockedRedirect).not.toHaveBeenCalled();
  });

  it("treats a session with no role claim as CARE_WORKER", async () => {
    mockedGetSession.mockResolvedValue(buildSession());

    expect((await requireRole("CARE_WORKER", "/worker/home")).status).toBe("ok");
    expect((await requireRole("MANAGER", "/manager/dashboard")).status).toBe("forbidden");
  });
});
