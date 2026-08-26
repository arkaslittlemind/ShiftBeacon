"use client";

import { AlertTriangle } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function Error({ reset }: { error: Error & { digest?: string }; reset: () => void }) {
  return (
    <div className="flex min-h-[50vh] flex-col items-center justify-center gap-4 px-6 text-center">
      <div className="flex size-12 items-center justify-center border-2 border-border bg-danger-soft text-destructive">
        <AlertTriangle className="size-6" />
      </div>
      <div>
        <h1 className="mb-1.5 text-xl font-bold">Something went wrong</h1>
        <p className="max-w-[46ch] text-sm text-muted-foreground">
          An unexpected error occurred. You can try again.
        </p>
      </div>
      <Button onClick={() => reset()}>Try again</Button>
    </div>
  );
}
