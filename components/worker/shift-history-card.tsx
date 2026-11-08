import { CalendarIcon, FileIcon } from "@/components/icons";
import { EmptyState } from "@/components/shared/empty-state";
import { formatHoursMinutes } from "@/lib/duration";
import { formatTimeOfDay } from "@/lib/time-of-day";
import type { ShiftResponse } from "@/types/shift";

const dayNumberFormatter = new Intl.DateTimeFormat("en-GB", { day: "numeric", timeZone: "UTC" });
const shortWeekdayFormatter = new Intl.DateTimeFormat("en-GB", { weekday: "short", timeZone: "UTC" });
const fullDateFormatter = new Intl.DateTimeFormat("en-GB", {
  weekday: "long",
  day: "numeric",
  month: "long",
  timeZone: "UTC",
});

export function ShiftHistoryCard({ history }: { history: ShiftResponse[] }) {
  return (
    <section
      aria-labelledby="recent-shifts-title"
      className="rounded-[20px] border border-border-soft bg-card p-5 shadow-sm"
    >
      <h2
        id="recent-shifts-title"
        className="mb-2 flex items-center gap-2 font-semibold text-foreground"
      >
        <CalendarIcon className="size-5 text-muted-foreground" aria-hidden />
        Recent shifts
      </h2>
      {history.length === 0 ? (
        <EmptyState
          icon={CalendarIcon}
          title="No completed shifts yet"
          description="Your shifts appear here once you clock out."
        />
      ) : (
        <ul>
          {history.map((shift) => (
            <HistoryRow key={shift.id} shift={shift} />
          ))}
        </ul>
      )}
    </section>
  );
}

function HistoryRow({ shift }: { shift: ShiftResponse }) {
  const clockInAt = new Date(shift.clockInAt);
  const clockOutAt = shift.clockOutAt ? new Date(shift.clockOutAt) : null;
  const note = shift.clockOutNote || shift.clockInNote;

  return (
    <li className="grid grid-cols-[2.875rem_minmax(0,1fr)_auto] items-center gap-3 border-b border-border-soft py-3 last:border-b-0 last:pb-0">
      <div className="rounded-md bg-surface-alt py-1 text-center">
        <span className="sr-only">{fullDateFormatter.format(clockInAt)}</span>
        <span aria-hidden className="block text-lg leading-tight font-semibold text-foreground">
          {dayNumberFormatter.format(clockInAt)}
        </span>
        <span aria-hidden className="font-mono text-xs text-faint uppercase">
          {shortWeekdayFormatter.format(clockInAt)}
        </span>
      </div>
      <div className="min-w-0">
        <p className="font-mono text-sm text-foreground tabular-nums">
          {formatTimeOfDay(clockInAt)}
          {clockOutAt && ` - ${formatTimeOfDay(clockOutAt)}`}
        </p>
        {note ? (
          <p className="mt-0.5 flex items-start gap-1 text-xs text-faint">
            <FileIcon className="mt-px size-3.5 shrink-0" aria-hidden />
            <span className="line-clamp-2 wrap-break-word">{note}</span>
          </p>
        ) : (
          <p className="mt-0.5 text-xs text-faint">No note</p>
        )}
      </div>
      {clockOutAt && (
        <p className="font-mono text-sm font-medium text-foreground tabular-nums">
          {formatHoursMinutes(clockOutAt.getTime() - clockInAt.getTime())}
        </p>
      )}
    </li>
  );
}
