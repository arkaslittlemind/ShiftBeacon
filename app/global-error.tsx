"use client";

import * as Sentry from "@sentry/nextjs";
import { useEffect } from "react";
import { AlertTriangleIcon } from "@/components/icons";
import { StatePanel } from "@/components/shared/state-panel";
import { Button } from "@/components/ui/button";
import { touchTargetClass } from "@/lib/utils";
import "./globals.css";

// Renders in place of the root layout, so the next/font variables and the
// stylesheet import from layout.tsx are gone. The stylesheet is imported here,
// and the body sets a system stack: font-sans and font-heading resolve to the
// missing variables and fall back to whatever the body inherits.
export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    Sentry.captureException(error);
  }, [error]);

  return (
    <html lang="en" className="h-full antialiased">
      <body className="flex min-h-dvh flex-col font-[family-name:system-ui,-apple-system,Segoe_UI,sans-serif]">
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
      </body>
    </html>
  );
}
