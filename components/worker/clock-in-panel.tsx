"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { useGeolocation } from "./use-geolocation";

type SubmitStatus = "idle" | "submitting" | "error";

export function ClockInPanel() {
  const router = useRouter();
  const geolocation = useGeolocation();
  const [note, setNote] = useState("");
  const [status, setStatus] = useState<SubmitStatus>("idle");
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

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

    router.refresh();
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
