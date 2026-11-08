"use client";

import { AlertCircleIcon } from "@/components/icons";
import { StatePanel } from "@/components/shared/state-panel";
import { Button } from "@/components/ui/button";
import { touchTargetClass } from "@/lib/utils";

export default function OfflinePage() {
  return (
    <StatePanel
      icon={AlertCircleIcon}
      title="You're offline"
      description="ShiftBeacon needs a connection to verify your location and clock in or out. Reconnect and try again."
    >
      <Button onClick={() => window.location.reload()} className={touchTargetClass}>
        Try again
      </Button>
    </StatePanel>
  );
}
