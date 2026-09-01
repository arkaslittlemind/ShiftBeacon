"use client";

import { useState } from "react";
import { CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { useGeolocation } from "./use-geolocation";

type SubmitStatus = "idle" | "submitting" | "error";

export function ClockInPanel({ hasActiveShift }: { hasActiveShift: boolean }) {
  const geolocation = useGeolocation();
  const [note, setNote] = useState("");
  const [status, setStatus] = useState<SubmitStatus>("idle");
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [clockedIn, setClockedIn] = useState(hasActiveShift);

  if (clockedIn) {
    return (
      <div className="rounded-md border-(length:--border-w) border-border bg-card p-6 text-center shadow-md">
        <CheckCircle2 className="mx-auto mb-2 size-8 text-primary" />
        <p className="font-heading text-base font-bold">You&apos;re clocked in</p>
        <p className="mt-1 text-sm text-muted-foreground">
          Shift duration and clock-out will be available in a later update.
        </p>
      </div>
    );
  }

  async function handleClockIn() {
    if (!geolocation.coords) {
      setStatus("error");
      setErrorMessage("We need your location before you can clock in.");
      return;
    }

    setStatus("submitting");
    setErrorMessage(null);

    const response = await fetch("/api/shifts/clock-in", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        latitude: geolocation.coords.latitude,
        longitude: geolocation.coords.longitude,
        note: note.trim() || undefined,
      }),
    });
    const body = await response.json();

    if (!response.ok) {
      setStatus("error");
      setErrorMessage(body.error.message);
      return;
    }

    setStatus("idle");
    setClockedIn(true);
  }

  return (
    <div className="rounded-md border-(length:--border-w) border-border bg-card p-6 shadow-md">
      <label
        htmlFor="clock-in-note"
        className="mb-2 block text-xs font-bold tracking-wide text-muted-foreground uppercase"
      >
        Optional note
      </label>
      <Textarea
        id="clock-in-note"
        value={note}
        onChange={(event) => setNote(event.target.value)}
        placeholder="e.g. Covering an extra hour for handover..."
        className="mb-4"
      />

      {status === "error" && errorMessage && (
        <p className="mb-3 text-sm text-destructive">{errorMessage}</p>
      )}

      <Button
        type="button"
        onClick={handleClockIn}
        disabled={status === "submitting" || geolocation.status !== "granted"}
        className="w-full"
        size="lg"
      >
        {status === "submitting" ? "Clocking in..." : "Clock In"}
      </Button>
    </div>
  );
}
