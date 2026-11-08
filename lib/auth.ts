import { cache } from "react";
import { redirect } from "next/navigation";
import { auth0 } from "@/lib/auth0";
import { findOrCreateCurrentUser, type UserWithOrganization } from "@/lib/services/user-service";
import { identifySentryUser } from "@/lib/observability/identify";
import type { CurrentUser, Role } from "@/types/user";

export const ROLE_CLAIM = "https://shiftbeacon.app/role";

export function getRoleFromSession(session: {
  user: { [key: string]: unknown };
}): Role {
  return (session.user[ROLE_CLAIM] as Role | undefined) ?? "CARE_WORKER";
}

// cache() dedupes these per request, so a layout and its page calling the
// same lookup only hit Auth0/Prisma once instead of once each.
export const getCurrentUser = cache(async (): Promise<CurrentUser | null> => {
  const session = await auth0.getSession();
  if (!session) {
    return null;
  }

  return {
    role: getRoleFromSession(session),
    name: session.user.name ?? "",
    email: session.user.email ?? "",
  };
});

export const getCurrentDbUser = cache(async (): Promise<UserWithOrganization | null> => {
  const session = await auth0.getSession();
  if (!session) {
    return null;
  }

  const user = await findOrCreateCurrentUser(session.user.sub, {
    name: session.user.name ?? "",
    email: session.user.email ?? "",
    role: getRoleFromSession(session),
  });

  identifySentryUser(user);
  return user;
});

// A page renders in parallel with its layout, so the layout's requireRole
// redirect does not stop the page from running first. Every page and layout
// that reads the database user guards sign-in itself through this.
export async function requireDbUser(returnTo: string): Promise<UserWithOrganization> {
  const user = await getCurrentDbUser();
  if (!user) {
    redirect(`/auth/login?returnTo=${encodeURIComponent(returnTo)}`);
  }
  return user;
}

// The layout's role check only swaps what it renders; the page still runs in
// parallel and its render ships in the same response. So every page checks the
// role itself before any query. `null` means the wrong role: render nothing and
// let the layout show ForbiddenState. The role comes from the session claim via
// requireRole, the same source the layouts and API routes use; the database
// role is set once at sign-up and goes stale when a role changes in Auth0.
export async function requirePageUser(
  role: Role,
  returnTo: string
): Promise<UserWithOrganization | null> {
  const { status } = await requireRole(role, returnTo);
  if (status !== "ok") {
    return null;
  }
  return requireDbUser(returnTo);
}

export async function requireRole(
  role: Role,
  returnTo: string
): Promise<{ status: "ok" | "forbidden"; user: CurrentUser }> {
  const user = await getCurrentUser();
  if (!user) {
    redirect(`/auth/login?returnTo=${encodeURIComponent(returnTo)}`);
  }

  return { status: user.role === role ? "ok" : "forbidden", user };
}
