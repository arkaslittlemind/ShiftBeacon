import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeftIcon, CalendarIcon, ClockIcon, GraphBarLineIcon } from "@/components/icons";
import { StaffProfileCard } from "@/components/manager/staff-profile-card";
import { StaffShiftHistory } from "@/components/manager/staff-shift-history";
import { StatTile } from "@/components/manager/stat-tile";
import { requirePageUser } from "@/lib/auth";
import { formatHoursDecimal, formatHoursMinutes } from "@/lib/duration";
import { summarizeShiftHistory } from "@/lib/manager/shift-history-summary";
import { STAFF_HISTORY_LIMIT, getShiftHistoryForStaffMember } from "@/lib/services/staff-service";
import { toShiftResponse } from "@/lib/services/shift-service";
import { currentTimeMs } from "@/lib/time";
import { cn, focusRingClass } from "@/lib/utils";
import { ManagerViewTracker } from "@/components/observability/manager-view-tracker";

export default async function StaffDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const user = await requirePageUser("MANAGER", `/manager/staff/${id}`);
  if (!user) return null;
  const organization = user.organization;

  const record = await getShiftHistoryForStaffMember(organization.id, id);
  if (!record) {
    notFound();
  }

  const { staff, activeShift, history } = record;
  const shifts = history.map(toShiftResponse);
  const summary = summarizeShiftHistory(shifts);
  const now = currentTimeMs();

  return (
    <>
      <ManagerViewTracker view="staff_detail" />
      <Link
        href="/manager/dashboard#staff"
        className={cn(
          "mb-4 inline-flex min-h-11 items-center gap-1.5 rounded-lg text-sm text-muted-foreground transition-colors duration-(--dur-fast) ease-[ease] hover:text-foreground md:min-h-9",
          focusRingClass
        )}
      >
        <ArrowLeftIcon aria-hidden className="size-4" />
        Back to dashboard
      </Link>
      <div className="grid gap-6">
        <StaffProfileCard
          name={staff.name}
          email={staff.email}
          role={staff.role}
          joinedAt={staff.createdAt}
          onShiftFor={
            activeShift ? formatHoursMinutes(now - activeShift.clockInAt.getTime()) : null
          }
        />
        <div className="grid grid-cols-2 gap-4 md:grid-cols-3">
          <StatTile
            label="Shifts"
            icon={CalendarIcon}
            value={String(summary.shiftCount)}
            detail={
              shifts.length >= STAFF_HISTORY_LIMIT
                ? `completed, latest ${STAFF_HISTORY_LIMIT}`
                : "completed"
            }
          />
          <StatTile
            label="Hours"
            icon={GraphBarLineIcon}
            value={formatHoursDecimal(summary.totalMs)}
            detail="across those shifts"
          />
          <div className="col-span-2 md:col-span-1">
            <StatTile
              label="Avg shift"
              icon={ClockIcon}
              value={formatHoursMinutes(summary.averageMs)}
              detail="per completed shift"
            />
          </div>
        </div>
        <section className="min-w-0" aria-label="Shift history">
          <StaffShiftHistory history={shifts} workplace={organization} />
        </section>
      </div>
    </>
  );
}
