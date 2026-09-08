import { Users } from "lucide-react";
import { PageHeader } from "@/components/shell/page-header";
import { EmptyState } from "@/components/shared/empty-state";
import { StaffTable } from "@/components/manager/staff-table";
import { getCurrentDbUser } from "@/lib/auth";
import { getStaffForOrganization, toStaffMemberResponse } from "@/lib/services/staff-service";
import { currentTimeMs } from "@/lib/time";

export default async function ManagerDashboardPage() {
  const user = await getCurrentDbUser();
  const organization = user!.organization;
  const staff = await getStaffForOrganization(organization.id);

  return (
    <>
      <PageHeader
        eyebrow="Manager"
        title="Dashboard"
        description="Live staff view and attendance analytics"
      />
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
