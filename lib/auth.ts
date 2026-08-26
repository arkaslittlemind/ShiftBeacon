import { redirect } from "next/navigation";
import type { Role } from "@/types/user";

/**
 * TEMPORARY mock identity. Feature 3 (Auth0) replaces this with a real
 * session lookup behind the same two function signatures, so nothing that
 * calls getCurrentUser()/requireRole() needs to change when it lands.
 * Flip MOCK_ROLE (or set the MOCK_ROLE env var) to preview the other area.
 */
const MOCK_ROLE: Role = (process.env.MOCK_ROLE as Role | undefined) ?? "CARE_WORKER";

export function getCurrentUser(): { role: Role } {
  return { role: MOCK_ROLE };
}

export function requireRole(role: Role): { role: Role } {
  const user = getCurrentUser();
  if (user.role !== role) {
    redirect("/");
  }
  return user;
}
