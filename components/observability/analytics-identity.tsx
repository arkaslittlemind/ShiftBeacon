"use client";

import { useEffect } from "react";
import { identifyBrowserUser } from "@/lib/observability/analytics-browser";
import type { ObservabilityActor } from "@/lib/observability/actor";

// Props are three scalars, never a user object: handing a client component the
// Prisma User would serialize name, email, and auth0UserId into the RSC payload
// even if the component ignored them.
export function AnalyticsIdentity({ id, role, organizationId }: ObservabilityActor) {
  useEffect(() => {
    identifyBrowserUser({ id, role, organizationId });
  }, [id, role, organizationId]);

  return null;
}
