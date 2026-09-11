import type { Role } from "@/types/user";

// The only user fields any observability vendor may receive. Call sites pass
// the full user record, so this is what keeps name, email, and auth0UserId
// from travelling with it. Single-sourced deliberately: Sentry and PostHog
// must not drift apart on what counts as safe to send.
export type ObservabilityActor = {
  id: string;
  role: Role;
  organizationId: string;
};
