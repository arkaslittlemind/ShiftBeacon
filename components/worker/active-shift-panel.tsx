"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { formatElapsedClock } from "@/lib/duration";
import { useGeolocation } from "./use-geolocation";
import type { ShiftResponse } from "@/types/shift";

type SubmitStatus = "idle" | "submitting" | "error";

export function ActiveShiftPanel({ shift }: { shift: ShiftResponse }) {
  const router = useRouter();
  const geolocation = useGeolocation();
  const [now, setNow] = useState(() => Date.now());
  const [note, setNote] = useState("");
  const [status, setStatus] = useState<SubmitStatus>("idle");
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  useEffect(() => {
    const intervalId = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(intervalId);
  }, []);

  const elapsedMs = now - new Date(shift.clockInAt).getTime();

  async function handleClockOut() {
    setStatus("submitting");
    setErrorMessage(null);

    const response = await fetch("/api/shifts/clock-out", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        ...(geolocation.coords ?? {}),
        note: note.trim() || undefined,
      }),
    });
    const body = await response.json();

    if (!response.ok) {
      setStatus("error");
      setErrorMessage(body.error.message);
      return;
    }

    router.refresh();
  }

  return (
    <div className="grid gap-4">
      <div className="rounded-md border-(length:--border-w) border-border bg-foreground p-8 text-center text-background shadow-md">
        <p className="mb-1.5 text-xs font-bold tracking-wide text-background/70 uppercase">
          Shift duration
        </p>
        <p className="font-heading text-4xl font-bold tabular-nums">
          {formatElapsedClock(elapsedMs)}
        </p>
        <Button
          type="button"
          variant="destructive"
          size="lg"
          onClick={handleClockOut}
          disabled={status === "submitting"}
          className="mt-5 w-full"
        >
          {status === "submitting" ? "Clocking out..." : "Clock Out"}
        </Button>
      </div>

      <div className="rounded-md border-(length:--border-w) border-border bg-card p-6 shadow-md">
        <label
          htmlFor="clock-out-note"
          className="mb-2 block text-xs font-bold tracking-wide text-muted-foreground uppercase"
        >
          Optional note
        </label>
        <Textarea
          id="clock-out-note"
          value={note}
          onChange={(event) => setNote(event.target.value)}
          placeholder="e.g. Handover notes for the next shift..."
        />
      </div>

      {status === "error" && errorMessage && (
        <p className="text-sm text-destructive">{errorMessage}</p>
      )}
    </div>
  );
}
