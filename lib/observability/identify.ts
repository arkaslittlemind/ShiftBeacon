import * as Sentry from "@sentry/nextjs";
import type { Role } from "@/types/user";

// Deliberately narrow: the internal id is the only identifier allowed to reach
// Sentry. auth0UserId, name, and email must never be passed, so this takes the
// fields it needs rather than the whole user record.
export function identifySentryUser(user: {
  id: string;
  role: Role;
  organizationId: string;
}) {
  Sentry.setUser({ id: user.id });
  Sentry.setTag("role", user.role);
  Sentry.setTag("organizationId", user.organizationId);
}
