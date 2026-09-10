"use client";

import { WifiOff } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function OfflinePage() {
  return (
    <div className="flex min-h-full flex-col items-center justify-center gap-4 px-6 text-center">
      <div className="flex size-12 items-center justify-center border-2 border-border bg-secondary text-foreground">
        <WifiOff className="size-6" />
      </div>
      <div>
        <h1 className="mb-1.5 text-xl font-bold">You&apos;re offline</h1>
        <p className="max-w-[46ch] text-sm text-muted-foreground">
          ShiftBeacon needs a connection to verify your location and clock in
          or out. Reconnect and try again.
        </p>
      </div>
      <Button onClick={() => window.location.reload()}>Try again</Button>
    </div>
  );
}
