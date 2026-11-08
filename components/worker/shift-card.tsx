"use client";

import { useEffect, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import {
  BuildingApartmentTwoIcon,
  MapPinIcon,
  PauseCircleIcon,
  PlayCircleIcon,
  ShieldCheckIcon,
} from "@/components/icons";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { formatElapsedClock } from "@/lib/duration";
import { formatDistance } from "@/lib/geo";
import { cn } from "@/lib/utils";
import { NOTE_MAX_LENGTH } from "@/types/shift";
import {
  PerimeterStatusBanner,
  toPerimeterView,
  type PerimeterView,
  type WorkplacePerimeter,
} from "./perimeter-status-banner";
import { useGeolocation } from "./use-geolocation";

/** The active shift as the card shows it. Labels are formatted on the server
 * so the clocked-in time matches the history list and hydrates cleanly. */
export type ActiveShiftView = {
  clockInAt: string;
  clockInTimeLabel: string;
  clockInDistanceMeters: number;
};

type SubmitStatus = "idle" | "submitting" | "error";

const NOTE_ID = "shift-note";
const NOTE_HINT_ID = "shift-note-hint";
const GENERIC_ERROR = "Couldn't reach ShiftBeacon. Check your connection and try again.";

export function ShiftCard({
  workplace,
  activeShift,
}: {
  workplace: WorkplacePerimeter;
  activeShift: ActiveShiftView | null;
}) {
  const router = useRouter();
  const geolocation = useGeolocation();
  const [note, setNote] = useState("");
  const [status, setStatus] = useState<SubmitStatus>("idle");
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isRefreshing, startRefresh] = useTransition();

  const onShift = activeShift !== null;
  const perimeter = toPerimeterView(geolocation, workplace);
  const busy = status === "submitting" || isRefreshing;

  async function submit() {
    if (!onShift && !geolocation.coords) {
      setStatus("error");
      setErrorMessage("We need your location before you can clock in.");
      return;
    }

    setStatus("submitting");
    setErrorMessage(null);

    try {
      const response = await fetch(onShift ? "/api/shifts/clock-out" : "/api/shifts/clock-in", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...(geolocation.coords ?? {}),
          note: note.trim() || undefined,
        }),
      });
      if (!response.ok) {
        const body: { error?: { message?: string } } = await response.json().catch(() => ({}));
        setStatus("error");
        setErrorMessage(body.error?.message ?? GENERIC_ERROR);
        return;
      }
    } catch {
      setStatus("error");
      setErrorMessage(GENERIC_ERROR);
      return;
    }

    // The card stays mounted across the refresh, so clear what belonged to
    // the finished action; otherwise a clock-in note would reappear as the
    // handover note.
    setNote("");
    setStatus("idle");
    startRefresh(() => router.refresh());
  }

  return (
    <section
      aria-labelledby="shift-card-title"
      className="overflow-hidden rounded-[20px] border border-border-soft bg-card shadow-sm"
    >
      <WorkplaceRow workplace={workplace} onShift={onShift} />

      <div className="grid justify-items-center gap-5 px-5 py-6 text-center sm:px-6">
        {activeShift ? (
          <ActiveShiftSummary shift={activeShift} />
        ) : (
          <>
            <PerimeterIllustration view={perimeter} />
            <PerimeterStatusBanner view={perimeter} workplace={workplace} />
          </>
        )}

        <div className="grid w-full max-w-115 gap-1.5 text-left">
          <label htmlFor={NOTE_ID} className="text-sm font-medium text-foreground">
            {onShift ? "Handover note" : "Clock-in note"}{" "}
            <span className="font-normal text-faint">(optional)</span>
          </label>
          <Textarea
            id={NOTE_ID}
            aria-describedby={NOTE_HINT_ID}
            value={note}
            onChange={(event) => setNote(event.target.value)}
            maxLength={NOTE_MAX_LENGTH}
            placeholder="Anything the next shift should know?"
          />
          <p id={NOTE_HINT_ID} className="text-xs text-muted-foreground">
            Don&apos;t include residents&apos; names. Notes go into the handover summary.
          </p>
        </div>

        {status === "error" && errorMessage && (
          <p
            role="alert"
            className="w-full max-w-115 translate-y-0 text-left text-sm text-danger opacity-100 transition-[opacity,translate] duration-(--dur-base) ease-(--ease-out) starting:-translate-y-1 starting:opacity-0"
          >
            {errorMessage}
          </p>
        )}

        <ShiftActionButton
          onShift={onShift}
          canClockIn={perimeter.kind === "inside"}
          busy={busy}
          onClick={submit}
        />
      </div>

      <p className="flex items-center justify-center gap-2 border-t border-border-soft bg-surface-alt px-5 py-4 text-left text-xs text-muted-foreground">
        <ShieldCheckIcon className="size-4 shrink-0 text-faint" aria-hidden />
        Your location is checked only while this page is open, and saved only when you
        clock in or out. Nothing is tracked in the background.
      </p>
    </section>
  );
}

function WorkplaceRow({ workplace, onShift }: { workplace: WorkplacePerimeter; onShift: boolean }) {
  return (
    <div className="flex items-center gap-3 border-b border-border-soft p-5">
      <span className="grid size-11 shrink-0 place-items-center rounded-lg bg-ocean-soft text-ocean">
        <BuildingApartmentTwoIcon className="size-5" aria-hidden />
      </span>
      <div className="min-w-0 text-left">
        <h2 id="shift-card-title" className="font-semibold text-foreground">
          {workplace.name}
        </h2>
        <p className="text-sm text-faint">Clock-in radius {workplace.clockInRadiusMeters} m</p>
      </div>
      {onShift ? (
        <Badge variant="success" className="ml-auto shrink-0">
          <span className="size-1.5 rounded-full bg-current" aria-hidden />
          On shift
        </Badge>
      ) : (
        <Badge className="ml-auto shrink-0">Not clocked in</Badge>
      )}
    </div>
  );
}

/** Schematic, not a map: the dot shows inside or outside, never a bearing. */
function PerimeterIllustration({ view }: { view: PerimeterView }) {
  const dot = view.kind === "inside" || view.kind === "outside" ? view.kind : null;

  return (
    <div
      aria-hidden="true"
      className="relative grid size-50 place-items-center rounded-full border-[1.5px] border-dashed border-ocean-tint bg-[radial-gradient(circle,var(--color-ocean-soft)_0_64%,transparent_65%)]"
    >
      <span className="absolute inset-[22%] rounded-full border border-ocean-tint" />
      <span className="grid size-10 place-items-center rounded-full border border-border-soft bg-card text-ocean shadow-sm">
        <BuildingApartmentTwoIcon className="size-5" />
      </span>
      {dot && (
        <span
          className={cn(
            "absolute size-4 rounded-full border-[3px] border-card opacity-100 transition-opacity duration-(--dur-base) starting:opacity-0",
            dot === "inside"
              ? "top-[34%] left-[60%] bg-ocean shadow-[0_0_0_6px_color-mix(in_srgb,var(--color-ocean)_18%,transparent)]"
              : "top-[12%] left-[calc(100%+12px)] bg-danger shadow-[0_0_0_6px_color-mix(in_srgb,var(--color-danger)_16%,transparent)]"
          )}
        />
      )}
    </div>
  );
}

function ActiveShiftSummary({ shift }: { shift: ActiveShiftView }) {
  return (
    <div className="translate-y-0 py-2 opacity-100 transition-[opacity,translate] duration-(--dur-base) ease-(--ease-out) starting:translate-y-1 starting:opacity-0">
      <ShiftTimer clockInAt={shift.clockInAt} />
      <p className="mt-2 text-sm text-muted-foreground">
        Clocked in at <span className="font-mono tabular-nums">{shift.clockInTimeLabel}</span>
        {" · "}inside, {formatDistance(shift.clockInDistanceMeters)}
      </p>
    </div>
  );
}

function ShiftTimer({ clockInAt }: { clockInAt: string }) {
  const [now, setNow] = useState(() => Date.now());

  useEffect(() => {
    const intervalId = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(intervalId);
  }, []);

  return (
    <p className="font-mono text-[3.4rem] leading-none font-medium tracking-[-0.03em] text-foreground tabular-nums">
      {formatElapsedClock(now - new Date(clockInAt).getTime())}
    </p>
  );
}

function actionLabel(onShift: boolean, canClockIn: boolean, busy: boolean): string {
  if (onShift) return busy ? "Clocking out..." : "Clock out";
  if (busy) return "Clocking in...";
  return canClockIn ? "Clock in" : "Clock in unavailable";
}

/** One button element for both modes, so clocking in reads as this control
 * changing state rather than one control being swapped for another. */
function ShiftActionButton({
  onShift,
  canClockIn,
  busy,
  onClick,
}: {
  onShift: boolean;
  canClockIn: boolean;
  busy: boolean;
  onClick: () => void;
}) {
  const label = actionLabel(onShift, canClockIn, busy);
  const unavailable = !onShift && !canClockIn && !busy;
  const Icon = onShift ? PauseCircleIcon : canClockIn ? PlayCircleIcon : MapPinIcon;

  return (
    <Button
      type="button"
      variant={onShift ? "default" : "ocean"}
      size="lg"
      onClick={onClick}
      disabled={busy || unavailable}
      aria-busy={busy || undefined}
      className={cn(
        "h-16 w-full max-w-115 rounded-[14px] text-lg disabled:opacity-100",
        // Only the unavailable state greys out; while busy the button keeps
        // its colour so the blue-to-ink change reads as one transition.
        unavailable && "disabled:border-border-soft disabled:bg-surface-alt disabled:text-faint disabled:shadow-none"
      )}
    >
      <span
        key={label}
        className="inline-flex items-center gap-3 opacity-100 blur-none transition-[opacity,filter] duration-(--dur-base) ease-(--ease-out) starting:opacity-0 starting:blur-[2px] motion-reduce:starting:blur-none"
      >
        <Icon className="size-6" aria-hidden />
        {label}
      </span>
    </Button>
  );
}
