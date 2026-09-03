import { formatHoursDecimal } from "@/lib/duration";
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

export function ShiftHistoryCard({ history }: { history: ShiftResponse[] }) {
  return (
    <div className="rounded-md border-(length:--border-w) border-border bg-card shadow-md">
      <h2 className="border-b-(length:--border-w) border-border px-5 py-4 font-heading text-sm font-bold tracking-wide uppercase">
        Recent shifts
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

            return (
              <li
                key={shift.id}
                className="flex items-center justify-between gap-3 border-b border-border-soft px-5 py-3.5 last:border-b-0"
              >
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
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
