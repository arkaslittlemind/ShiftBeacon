import * as Sentry from "@sentry/nextjs";
import type { ObservabilityActor } from "./actor";

// The internal id is the only identifier allowed to reach Sentry.
export function identifySentryUser(user: ObservabilityActor) {
  Sentry.setUser({ id: user.id });
  Sentry.setTag("role", user.role);
  Sentry.setTag("organizationId", user.organizationId);
}
