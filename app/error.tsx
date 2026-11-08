"use client";

import { AlertTriangleIcon } from "@/components/icons";
import { StatePanel } from "@/components/shared/state-panel";
import { Button } from "@/components/ui/button";
import { touchTargetClass } from "@/lib/utils";

export default function Error({ reset }: { error: Error & { digest?: string }; reset: () => void }) {
  return (
    <StatePanel
      icon={AlertTriangleIcon}
      tone="danger"
      title="Something went wrong"
      description="An unexpected error occurred. You can try again."
    >
      <Button onClick={() => reset()} className={touchTargetClass}>
        Try again
      </Button>
    </StatePanel>
  );
}
