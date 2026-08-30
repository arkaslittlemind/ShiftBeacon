import { NextResponse } from "next/server";
import { auth0 } from "@/lib/auth0";
import { getRoleFromSession } from "@/lib/auth";
import { apiError } from "@/lib/api/response";
import {
  findOrCreateCurrentUser,
  OrgNotConfiguredError,
  type UserWithOrganization,
} from "@/lib/services/user-service";
import type { Role } from "@/types/user";

type RequireApiUserResult =
  | { ok: true; user: UserWithOrganization }
  | { ok: false; response: NextResponse };

export async function requireApiUser(options?: {
  role?: Role;
}): Promise<RequireApiUserResult> {
  const session = await auth0.getSession();
  if (!session) {
    return { ok: false, response: apiError(401, "Not authenticated") };
  }

  const role = getRoleFromSession(session);
  if (options?.role && role !== options.role) {
    return { ok: false, response: apiError(403, "Forbidden") };
  }

  try {
    const user = await findOrCreateCurrentUser(session.user.sub, {
      name: session.user.name ?? "",
      email: session.user.email ?? "",
      role,
    });
    return { ok: true, user };
  } catch (error) {
    if (error instanceof OrgNotConfiguredError) {
      return { ok: false, response: apiError(500, error.message) };
    }
    throw error;
  }
}
