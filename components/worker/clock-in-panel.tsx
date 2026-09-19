"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { cn, eyebrowClass } from "@/lib/utils";
import { NOTE_MAX_LENGTH } from "@/types/shift";
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
    <div className="rounded-md border-(length:--border-w) border-border bg-card p-6 shadow-md opacity-100 scale-100 transition-[opacity,transform] duration-250 ease-(--ease-out) starting:scale-95 starting:opacity-0">
      <label
        htmlFor="clock-in-note"
        className={cn(eyebrowClass, "mb-2 block")}
      >
        Optional note
      </label>
      <Textarea
        id="clock-in-note"
        value={note}
        onChange={(event) => setNote(event.target.value)}
        maxLength={NOTE_MAX_LENGTH}
        placeholder="e.g. Covering an extra hour for handover..."
        className="mb-4"
      />

      {status === "error" && errorMessage && (
        <p
          role="alert"
          className="mb-3 translate-y-0 text-sm text-destructive opacity-100 transition-[opacity,transform] duration-200 ease-(--ease-out) starting:-translate-y-1 starting:opacity-0"
        >
          {errorMessage}
        </p>
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
