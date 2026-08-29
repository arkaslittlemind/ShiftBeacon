import { redirect } from "next/navigation";
import { auth0 } from "@/lib/auth0";
import type { CurrentUser, Role } from "@/types/user";

const ROLE_CLAIM = "https://shiftbeacon.app/role";

export async function getCurrentUser(): Promise<CurrentUser | null> {
  const session = await auth0.getSession();
  if (!session) {
    return null;
  }

  const role = (session.user[ROLE_CLAIM] as Role | undefined) ?? "CARE_WORKER";

  return {
    role,
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
