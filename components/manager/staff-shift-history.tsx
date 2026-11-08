import { ClockIcon, FileIcon } from "@/components/icons";
import { LocationLabel } from "@/components/manager/location-label";
import { Dash } from "@/components/shared/dash";
import { EmptyState } from "@/components/shared/empty-state";
import { Card, CardHeader } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { formatHoursMinutes } from "@/lib/duration";
import type { Perimeter } from "@/lib/geo";
import { formatTimeOfDay } from "@/lib/time-of-day";
import { cardTitleClass, cn, monoLabelClass } from "@/lib/utils";
import type { ShiftResponse } from "@/types/shift";

const dayFormatter = new Intl.DateTimeFormat("en-GB", {
  weekday: "short",
  day: "numeric",
  month: "short",
  timeZone: "UTC",
});

function ClockCell({
  at,
  latitude,
  longitude,
  workplace,
}: {
  at: Date;
  latitude: number;
  longitude: number;
  workplace: Perimeter;
}) {
  return (
    <div className="grid gap-0.5">
      <span className="font-mono tabular-nums">{formatTimeOfDay(at)}</span>
      <LocationLabel latitude={latitude} longitude={longitude} workplace={workplace} />
    </div>
  );
}

function NoteLine({ tag, text }: { tag: "IN" | "OUT"; text: string }) {
  return (
    <p className="flex gap-2 text-sm text-foreground">
      <span className={cn("mt-0.5 w-7 shrink-0", monoLabelClass)}>{tag}</span>
      <span className="min-w-0 wrap-break-word">{text}</span>
    </p>
  );
}

export function StaffShiftHistory({
  history,
  workplace,
}: {
  history: ShiftResponse[];
  workplace: Perimeter;
}) {
  return (
    <Card className="gap-0 pb-2">
      <CardHeader className="pb-3">
        <h2 className={cardTitleClass}>
          <ClockIcon aria-hidden className="size-4.5" />
          Shift history
        </h2>
      </CardHeader>
      {history.length === 0 ? (
        <div className="px-4 pb-2">
          <EmptyState
            icon={FileIcon}
            title="No completed shifts yet."
            description="Shifts appear here once this person clocks out."
          />
        </div>
      ) : (
        <Table className="min-w-[44rem]">
          <TableHeader>
            <TableRow>
              <TableHead className={cn("pl-4", monoLabelClass)}>Date</TableHead>
              <TableHead className={monoLabelClass}>Clock in</TableHead>
              <TableHead className={monoLabelClass}>Clock out</TableHead>
              <TableHead className={monoLabelClass}>Duration</TableHead>
              <TableHead className={cn("pr-4", monoLabelClass)}>Notes</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {history.map((shift) => {
              const clockInAt = new Date(shift.clockInAt);
              const clockOutAt = shift.clockOutAt ? new Date(shift.clockOutAt) : null;
              const hasNotes = Boolean(shift.clockInNote || shift.clockOutNote);

              return (
                <TableRow key={shift.id} className="align-top">
                  <TableCell className="py-3.5 pl-4 font-semibold">
                    {dayFormatter.format(clockInAt)}
                  </TableCell>
                  <TableCell className="py-3.5">
                    <ClockCell
                      at={clockInAt}
                      latitude={shift.clockInLatitude}
                      longitude={shift.clockInLongitude}
                      workplace={workplace}
                    />
                  </TableCell>
                  <TableCell className="py-3.5">
                    {clockOutAt &&
                    shift.clockOutLatitude !== null &&
                    shift.clockOutLongitude !== null ? (
                      <ClockCell
                        at={clockOutAt}
                        latitude={shift.clockOutLatitude}
                        longitude={shift.clockOutLongitude}
                        workplace={workplace}
                      />
                    ) : (
                      <Dash />
                    )}
                  </TableCell>
                  <TableCell className="py-3.5 font-mono tabular-nums">
                    {clockOutAt ? (
                      formatHoursMinutes(clockOutAt.getTime() - clockInAt.getTime())
                    ) : (
                      <Dash />
                    )}
                  </TableCell>
                  <TableCell className="py-3.5 pr-4 whitespace-normal">
                    {hasNotes ? (
                      <div className="grid gap-1.5">
                        {shift.clockInNote ? <NoteLine tag="IN" text={shift.clockInNote} /> : null}
                        {shift.clockOutNote ? (
                          <NoteLine tag="OUT" text={shift.clockOutNote} />
                        ) : null}
                      </div>
                    ) : (
                      <Dash />
                    )}
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      )}
    </Card>
  );
}
