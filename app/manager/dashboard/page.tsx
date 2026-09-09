import { Users } from "lucide-react";
import { PageHeader } from "@/components/shell/page-header";
import { EmptyState } from "@/components/shared/empty-state";
import { StaffTable } from "@/components/manager/staff-table";
import { AverageHoursCard } from "@/components/manager/average-hours-card";
import { DailyClockInsChart } from "@/components/manager/daily-clock-ins-chart";
import { StaffHoursChart } from "@/components/manager/staff-hours-chart";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { getCurrentDbUser } from "@/lib/auth";
import { eyebrowClass } from "@/lib/utils";
import { getStaffForOrganization, toStaffMemberResponse } from "@/lib/services/staff-service";
import { getAnalyticsForOrganization } from "@/lib/services/analytics-service";
import { currentTimeMs } from "@/lib/time";

export default async function ManagerDashboardPage() {
  const user = await getCurrentDbUser();
  const organization = user!.organization;
  const [staff, analytics] = await Promise.all([
    getStaffForOrganization(organization.id),
    getAnalyticsForOrganization(organization.id),
  ]);

  return (
    <>
      <PageHeader
        eyebrow="Manager"
        title="Dashboard"
        description="Live staff view and attendance analytics"
      />
      <div className="mb-6 max-w-xs">
        <AverageHoursCard
          averageHoursPerDay={analytics.averageHoursPerDay}
          windowDays={analytics.windowDays}
        />
      </div>
      <div className="mb-6 grid gap-4 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className={eyebrowClass}>
              Clock-ins per day
            </CardTitle>
          </CardHeader>
          <CardContent>
            <DailyClockInsChart dailyClockIns={analytics.dailyClockIns} />
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle className={eyebrowClass}>
              Hours per staff member
            </CardTitle>
          </CardHeader>
          <CardContent>
            <StaffHoursChart staffHours={analytics.staffHours} />
          </CardContent>
        </Card>
      </div>
      {staff.length === 0 ? (
        <EmptyState
          icon={Users}
          title="No staff yet"
          description="Staff will appear here once they sign in to your organization."
        />
      ) : (
        <StaffTable
          staff={staff.map(toStaffMemberResponse)}
          workplaceLatitude={organization.latitude}
          workplaceLongitude={organization.longitude}
          now={currentTimeMs()}
        />
      )}
    </>
  );
}
