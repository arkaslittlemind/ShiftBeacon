import { redirect } from "next/navigation";
import { auth0 } from "@/lib/auth0";
import type { CurrentUser, Role } from "@/types/user";

export const ROLE_CLAIM = "https://shiftbeacon.app/role";

export function getRoleFromSession(session: {
  user: { [key: string]: unknown };
}): Role {
  return (session.user[ROLE_CLAIM] as Role | undefined) ?? "CARE_WORKER";
}

export async function getCurrentUser(): Promise<CurrentUser | null> {
  const session = await auth0.getSession();
  if (!session) {
    return null;
  }

  return {
    role: getRoleFromSession(session),
    name: session.user.name ?? "",
    email: session.user.email ?? "",
  };
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
