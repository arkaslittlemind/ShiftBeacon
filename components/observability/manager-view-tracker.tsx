"use client";

import { useEffect } from "react";
import { captureClientEvent } from "@/lib/observability/client-events";
import type { ManagerView } from "@/lib/observability/client-events";

export function ManagerViewTracker({ view }: { view: ManagerView }) {
  useEffect(() => {
    captureClientEvent({ name: "manager_view_opened", view });
  }, [view]);

  return null;
}
