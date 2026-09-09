import Link from "next/link";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { formatHoursDecimal } from "@/lib/duration";
import { haversineDistanceMeters } from "@/lib/geo";
import type { StaffMemberResponse } from "@/types/staff";

const timeFormatter = new Intl.DateTimeFormat("en-GB", {
  hour: "2-digit",
  minute: "2-digit",
  hour12: false,
});

function formatDistance(meters: number): string {
  return meters >= 1000 ? `${(meters / 1000).toFixed(1)} km` : `${Math.round(meters)} m`;
}

export function StaffTable({
  staff,
  workplaceLatitude,
  workplaceLongitude,
  now,
}: {
  staff: StaffMemberResponse[];
  workplaceLatitude: number;
  workplaceLongitude: number;
  now: number;
}) {
  return (
    <div className="rounded-md border-(length:--border-w) border-border bg-card shadow-md">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Name</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Clock-in</TableHead>
            <TableHead>Duration</TableHead>
            <TableHead>Distance from workplace</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {staff.map((member) => {
            const shift = member.activeShift;
            const clockInAt = shift ? new Date(shift.clockInAt) : null;
            const distanceMeters = shift
              ? haversineDistanceMeters(
                  shift.clockInLatitude,
                  shift.clockInLongitude,
                  workplaceLatitude,
                  workplaceLongitude
                )
              : null;

            return (
              <TableRow key={member.id}>
                <TableCell>
                  <Link
                    href={`/manager/staff/${member.id}`}
                    className="rounded-sm font-semibold underline-offset-2 outline-none hover:underline focus-visible:ring-3 focus-visible:ring-ring/50"
                  >
                    {member.name}
                  </Link>
                </TableCell>
                <TableCell>
                  <Badge variant={member.status === "CLOCKED_IN" ? "default" : "secondary"}>
                    {member.status === "CLOCKED_IN" ? "Clocked in" : "Clocked out"}
                  </Badge>
                </TableCell>
                <TableCell>{clockInAt ? timeFormatter.format(clockInAt) : "—"}</TableCell>
                <TableCell>
                  {clockInAt ? formatHoursDecimal(now - clockInAt.getTime()) : "—"}
                </TableCell>
                <TableCell>
                  {distanceMeters !== null ? formatDistance(distanceMeters) : "—"}
                </TableCell>
              </TableRow>
            );
          })}
        </TableBody>
      </Table>
    </div>
  );
}
