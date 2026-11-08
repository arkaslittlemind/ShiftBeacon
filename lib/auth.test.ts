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
import { findOrCreateCurrentUser } from "@/lib/services/user-service";
import {
  ROLE_CLAIM,
  getRoleFromSession,
  requireDbUser,
  requirePageUser,
  requireRole,
} from "./auth";

const mockedGetSession = vi.mocked(auth0.getSession);
const mockedFindOrCreate = vi.mocked(findOrCreateCurrentUser);
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

describe("requireDbUser", () => {
  it("redirects to login with the encoded return path when there is no session", async () => {
    mockedGetSession.mockResolvedValue(null);

    await expect(requireDbUser("/manager/staff/abc")).rejects.toThrow(
      "NEXT_REDIRECT:/auth/login?returnTo=%2Fmanager%2Fstaff%2Fabc"
    );
    expect(mockedFindOrCreate).not.toHaveBeenCalled();
  });

  it("returns the database user with its organization when signed in", async () => {
    const dbUser = { id: "user-1", role: "MANAGER", organization: { id: "org-1" } };
    mockedGetSession.mockResolvedValue(buildSession({ [ROLE_CLAIM]: "MANAGER" }));
    mockedFindOrCreate.mockResolvedValue(dbUser as never);

    await expect(requireDbUser("/manager/dashboard")).resolves.toBe(dbUser);
    expect(mockedRedirect).not.toHaveBeenCalled();
  });
});

describe("requirePageUser", () => {
  it("returns the user when their role matches", async () => {
    const dbUser = { id: "user-1", role: "MANAGER", organization: { id: "org-1" } };
    mockedGetSession.mockResolvedValue(buildSession({ [ROLE_CLAIM]: "MANAGER" }));
    mockedFindOrCreate.mockResolvedValue(dbUser as never);

    await expect(requirePageUser("MANAGER", "/manager/dashboard")).resolves.toBe(dbUser);
  });

  it("returns null for the wrong role, so the page renders and queries nothing", async () => {
    const dbUser = { id: "user-2", role: "CARE_WORKER", organization: { id: "org-1" } };
    mockedGetSession.mockResolvedValue(buildSession());
    mockedFindOrCreate.mockResolvedValue(dbUser as never);

    await expect(requirePageUser("MANAGER", "/manager/dashboard")).resolves.toBeNull();
    expect(mockedRedirect).not.toHaveBeenCalled();
  });

  // The database role is written once at sign-up and never synced, so after a
  // role change in Auth0 the two disagree. The session claim is what the
  // layouts and API routes authorize on, so the page guard must agree with it.
  it("follows the session role when the database role is stale after a demotion", async () => {
    const staleManager = { id: "user-3", role: "MANAGER", organization: { id: "org-1" } };
    mockedGetSession.mockResolvedValue(buildSession({ [ROLE_CLAIM]: "CARE_WORKER" }));
    mockedFindOrCreate.mockResolvedValue(staleManager as never);

    await expect(requirePageUser("MANAGER", "/manager/dashboard")).resolves.toBeNull();
  });

  it("follows the session role when the database role is stale after a promotion", async () => {
    const staleWorker = { id: "user-4", role: "CARE_WORKER", organization: { id: "org-1" } };
    mockedGetSession.mockResolvedValue(buildSession({ [ROLE_CLAIM]: "MANAGER" }));
    mockedFindOrCreate.mockResolvedValue(staleWorker as never);

    await expect(requirePageUser("MANAGER", "/manager/dashboard")).resolves.toBe(staleWorker);
  });

  it("redirects to login when signed out", async () => {
    mockedGetSession.mockResolvedValue(null);

    await expect(requirePageUser("CARE_WORKER", "/worker/home")).rejects.toThrow(
      "NEXT_REDIRECT:/auth/login?returnTo=%2Fworker%2Fhome"
    );
  });
});
