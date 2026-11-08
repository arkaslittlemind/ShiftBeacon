import { cn, monoLabelClass } from "@/lib/utils";
import type { WeekDay, WeekSummary } from "@/lib/worker/week-summary";

function dayLabel(day: WeekDay): string {
  const prefix = day.isToday ? `Today, ${day.weekday}` : day.weekday;
  if (!day.worked) return `${prefix}, off`;
  if (day.hours === 0) return `${prefix}, on shift now`;
  return `${prefix}, ${day.hours.toFixed(1)} hours`;
}

export function ThisWeekCard({ summary }: { summary: WeekSummary }) {
  return (
    <section
      aria-labelledby="this-week-title"
      className="rounded-[20px] border border-border-soft bg-card p-5 shadow-sm"
    >
      <h2 id="this-week-title" className={monoLabelClass}>
        This week
      </h2>
      <p className="mt-1.5 flex items-baseline gap-2">
        <span className="font-mono text-2xl font-semibold tracking-[-0.02em] text-foreground tabular-nums">
          {summary.totalHours.toFixed(1)}h
        </span>
        <span className="text-sm text-faint">
          over {summary.shiftCount} {summary.shiftCount === 1 ? "shift" : "shifts"}
        </span>
      </p>
      <ol className="mt-3 grid grid-cols-7 gap-1.5">
        {summary.days.map((day) => (
          <li key={day.dateKey} className="grid justify-items-center gap-1">
            <span className="sr-only">{dayLabel(day)}</span>
            <span
              aria-hidden
              className={cn(
                "h-9 w-full rounded-lg",
                day.isToday && day.worked
                  ? "bg-chart-1"
                  : day.worked
                    ? "bg-chart-2"
                    : "bg-surface-alt",
                day.isToday && !day.worked && "ring-1 ring-ocean-tint ring-inset"
              )}
            />
            <span aria-hidden className="font-mono text-xs text-faint">
              {day.weekday.charAt(0)}
            </span>
          </li>
        ))}
      </ol>
    </section>
  );
}
