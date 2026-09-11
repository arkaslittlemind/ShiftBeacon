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
