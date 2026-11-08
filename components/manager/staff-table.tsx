import Link from "next/link";
import { UserIcon } from "@/components/icons";
import { LocationLabel } from "@/components/manager/location-label";
import { Avatar } from "@/components/shared/avatar";
import { Dash } from "@/components/shared/dash";
import { Badge } from "@/components/ui/badge";
import { Card, CardHeader, CardTitle } from "@/components/ui/card";
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
import { sortStaffForTable } from "@/lib/manager/dashboard-summary";
import { getInitials } from "@/lib/names";
import { formatTimeOfDay } from "@/lib/time-of-day";
import { cardTitleClass, cn, monoLabelClass } from "@/lib/utils";
import type { StaffMemberResponse } from "@/types/staff";
import type { Role } from "@/types/user";

const ROLE_LABELS: Record<Role, string> = {
  CARE_WORKER: "Care worker",
  MANAGER: "Manager",
};

export function StaffTable({
  staff,
  onShift,
  workplace,
  now,
}: {
  staff: StaffMemberResponse[];
  onShift: number;
  workplace: Perimeter;
  now: number;
}) {
  return (
    <Card className="gap-0 pb-2">
      <CardHeader className="flex flex-wrap items-center gap-x-3 gap-y-2 pb-3">
        <CardTitle className={cn("mr-auto", cardTitleClass)}>
          <UserIcon aria-hidden className="size-4.5" />
          Staff
        </CardTitle>
        <Badge variant="success" dot pulse>
          {onShift} on shift
        </Badge>
        <span className={monoLabelClass}>Updated {formatTimeOfDay(new Date(now))}</span>
      </CardHeader>
      <Table className="min-w-[38rem]">
        <TableHeader>
          <TableRow>
            <TableHead className={cn("pl-4", monoLabelClass)}>Staff member</TableHead>
            <TableHead className={monoLabelClass}>Clocked in</TableHead>
            <TableHead className={monoLabelClass}>Duration</TableHead>
            <TableHead className={monoLabelClass}>Location</TableHead>
            <TableHead className={cn("pr-4", monoLabelClass)}>Status</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {sortStaffForTable(staff).map((member) => {
            const shift = member.activeShift;
            const clockInAt = shift ? new Date(shift.clockInAt) : null;

            return (
              <TableRow key={member.id} className="relative hover:bg-surface-alt">
                <TableCell className="py-3 pl-4">
                  <div className="flex items-center gap-3">
                    <Avatar initials={getInitials(member.name)} />
                    <div className="min-w-0">
                      {/* The link's ::after covers the whole row, so the row is
                          one click target and one tab stop with no nested
                          interactive elements. */}
                      <Link
                        href={`/manager/staff/${member.id}`}
                        className="block truncate font-semibold text-foreground outline-none after:absolute after:inset-0 after:rounded-md focus-visible:after:ring-3 focus-visible:after:ring-ring/50 focus-visible:after:ring-inset"
                      >
                        {member.name}
                      </Link>
                      <span className="block text-xs text-muted-foreground">
                        {ROLE_LABELS[member.role]}
                      </span>
                    </div>
                  </div>
                </TableCell>
                <TableCell className="font-mono tabular-nums">
                  {clockInAt ? formatTimeOfDay(clockInAt) : <Dash />}
                </TableCell>
                <TableCell className="font-mono tabular-nums">
                  {clockInAt ? formatHoursMinutes(now - clockInAt.getTime()) : <Dash />}
                </TableCell>
                <TableCell>
                  {shift ? (
                    <LocationLabel
                      latitude={shift.clockInLatitude}
                      longitude={shift.clockInLongitude}
                      workplace={workplace}
                    />
                  ) : (
                    <Dash />
                  )}
                </TableCell>
                <TableCell className="pr-4">
                  {shift ? (
                    <Badge variant="success" dot>
                      On shift
                    </Badge>
                  ) : (
                    <Badge variant="neutral">Off shift</Badge>
                  )}
                </TableCell>
              </TableRow>
            );
          })}
        </TableBody>
      </Table>
    </Card>
  );
}
