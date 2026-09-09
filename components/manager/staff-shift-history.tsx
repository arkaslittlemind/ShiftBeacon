import { formatHoursDecimal } from "@/lib/duration";
import { haversineDistanceMeters } from "@/lib/geo";
import type { ShiftResponse } from "@/types/shift";

const dayFormatter = new Intl.DateTimeFormat("en-GB", {
  weekday: "long",
  day: "numeric",
  month: "short",
});

const timeFormatter = new Intl.DateTimeFormat("en-GB", {
  hour: "2-digit",
  minute: "2-digit",
  hour12: false,
});

function formatDistance(meters: number): string {
  return meters >= 1000 ? `${(meters / 1000).toFixed(1)} km` : `${Math.round(meters)} m`;
}

export function StaffShiftHistory({
  history,
  workplaceLatitude,
  workplaceLongitude,
}: {
  history: ShiftResponse[];
  workplaceLatitude: number;
  workplaceLongitude: number;
}) {
  return (
    <div className="rounded-md border-(length:--border-w) border-border bg-card shadow-md">
      <h2 className="border-b-(length:--border-w) border-border px-5 py-4 font-heading text-sm font-bold tracking-wide uppercase">
        Shift history
      </h2>
      {history.length === 0 ? (
        <p className="px-5 py-8 text-center text-sm text-muted-foreground">
          No completed shifts yet.
        </p>
      ) : (
        <ul>
          {history.map((shift) => {
            const clockInAt = new Date(shift.clockInAt);
            const clockOutAt = shift.clockOutAt ? new Date(shift.clockOutAt) : null;
            const hours = clockOutAt
              ? formatHoursDecimal(clockOutAt.getTime() - clockInAt.getTime())
              : null;
            const clockInDistance = haversineDistanceMeters(
              shift.clockInLatitude,
              shift.clockInLongitude,
              workplaceLatitude,
              workplaceLongitude
            );
            const clockOutDistance =
              shift.clockOutLatitude !== null && shift.clockOutLongitude !== null
                ? haversineDistanceMeters(
                    shift.clockOutLatitude,
                    shift.clockOutLongitude,
                    workplaceLatitude,
                    workplaceLongitude
                  )
                : null;

            return (
              <li
                key={shift.id}
                className="flex flex-col gap-2 border-b border-border-soft px-5 py-3.5 last:border-b-0"
              >
                <div className="flex items-center justify-between gap-3">
                  <div>
                    <p className="text-sm font-semibold">{dayFormatter.format(clockInAt)}</p>
                    <p className="text-xs text-muted-foreground">
                      {timeFormatter.format(clockInAt)}
                      {clockOutAt ? ` – ${timeFormatter.format(clockOutAt)}` : ""}
                    </p>
                  </div>
                  {hours && (
                    <p className="shrink-0 font-heading text-sm font-bold text-accent-dark">
                      {hours}
                    </p>
                  )}
                </div>
                <p className="text-xs text-muted-foreground">
                  Clocked in {formatDistance(clockInDistance)} from workplace
                  {clockOutDistance !== null &&
                    ` · clocked out ${formatDistance(clockOutDistance)} from workplace`}
                </p>
                {shift.clockInNote && (
                  <p className="text-xs text-foreground">Clock-in note: {shift.clockInNote}</p>
                )}
                {shift.clockOutNote && (
                  <p className="text-xs text-foreground">Clock-out note: {shift.clockOutNote}</p>
                )}
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
