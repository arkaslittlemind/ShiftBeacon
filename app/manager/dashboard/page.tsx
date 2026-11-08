import { Suspense } from "react";
import { CalendarIcon, ClockIcon, GraphBarLineIcon, UserIcon } from "@/components/icons";
import { EmptyState } from "@/components/shared/empty-state";
import { StaffTable } from "@/components/manager/staff-table";
import { StatTile } from "@/components/manager/stat-tile";
import { WelcomeBanner } from "@/components/manager/welcome-banner";
import { DailyClockInsChart } from "@/components/manager/daily-clock-ins-chart";
import { StaffHoursChart } from "@/components/manager/staff-hours-chart";
import { requirePageUser } from "@/lib/auth";
import { firstName } from "@/lib/names";
import { getStaffForOrganization, toStaffMemberResponse } from "@/lib/services/staff-service";
import { getAnalyticsForOrganization } from "@/lib/services/analytics-service";
import { summarizeDashboard } from "@/lib/manager/dashboard-summary";
import { currentTimeMs } from "@/lib/time";
import { formatDateEyebrow } from "@/lib/time-of-day";
import { AskCard } from "@/components/manager/ask-card";
import { buildStarterQuestions } from "@/lib/ai/starter-questions";
import { ManagerViewTracker } from "@/components/observability/manager-view-tracker";
import {
  HandoverDigestCardSkeleton,
  HandoverDigestSection,
} from "@/components/manager/handover-digest-card";

export default async function ManagerDashboardPage() {
  const user = await requirePageUser("MANAGER", "/manager/dashboard");
  if (!user) return null;
  const organization = user.organization;
  const [staffRows, analytics] = await Promise.all([
    getStaffForOrganization(organization.id),
    getAnalyticsForOrganization(organization.id),
  ]);
  const staff = staffRows.map(toStaffMemberResponse);
  const summary = summarizeDashboard(staff, analytics);
  const now = currentTimeMs();

  return (
    <>
      <ManagerViewTracker view="dashboard" />
      <WelcomeBanner
        eyebrow={formatDateEyebrow(new Date(now))}
        firstName={firstName(user.name)}
        statusLine={summary.statusLine}
        onShift={summary.onShift}
      />
      <div className="grid items-start gap-6 xl:grid-cols-[minmax(0,1fr)_minmax(0,22.5rem)]">
        <div className="grid min-w-0 gap-6">
          <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
            <StatTile
              label="On shift"
              icon={UserIcon}
              value={String(summary.onShift)}
              detail={`of ${summary.total} staff`}
            />
            <StatTile
              label="Clock-ins today"
              icon={ClockIcon}
              value={String(summary.clockInsToday)}
              detail={`${summary.clockInsYesterday} yesterday`}
            />
            <StatTile
              label="Avg hours"
              icon={GraphBarLineIcon}
              value={`${summary.averageHoursPerDay.toFixed(1)}h`}
              detail={`per day, ${analytics.windowDays}-day avg`}
            />
            <StatTile
              label="Hours logged"
              icon={CalendarIcon}
              value={`${summary.hoursLogged.toFixed(1)}h`}
              detail={`last ${analytics.windowDays} days`}
            />
          </div>

          <section id="staff" aria-label="Staff" tabIndex={-1} className="min-w-0 scroll-mt-6 outline-none">
            {staff.length === 0 ? (
              <EmptyState
                icon={UserIcon}
                title="No staff yet"
                description="Staff will appear here once they sign in to your organization."
              />
            ) : (
              <StaffTable
                staff={staff}
                onShift={summary.onShift}
                workplace={organization}
                now={now}
              />
            )}
          </section>

          <div className="grid gap-6 lg:grid-cols-2">
            <DailyClockInsChart dailyClockIns={analytics.dailyClockIns} />
            <StaffHoursChart staffHours={analytics.staffHours} />
          </div>
        </div>

        <div className="grid min-w-0 gap-6">
          {/* tabIndex -1 lets the banner's anchor links move focus here, not
              just scroll. The anchor sits outside Suspense so "Read handover" works while
              the digest is still loading. Suspense keeps a slow or unreachable
              vendor from delaying the rest of the page. */}
          <section
            id="handover"
            aria-label="Handover digest"
            tabIndex={-1}
            className="scroll-mt-6 outline-none"
          >
            <Suspense fallback={<HandoverDigestCardSkeleton />}>
              <HandoverDigestSection organizationId={organization.id} />
            </Suspense>
          </section>
          <AskCard starterQuestions={buildStarterQuestions(new Date(now))} />
        </div>
      </div>
    </>
  );
}
