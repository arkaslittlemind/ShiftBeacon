import { notFound } from "next/navigation";
import { Badge } from "@/components/ui/badge";
import { PageHeader } from "@/components/shell/page-header";
import { StaffShiftHistory } from "@/components/manager/staff-shift-history";
import { getCurrentDbUser } from "@/lib/auth";
import { getShiftHistoryForStaffMember } from "@/lib/services/staff-service";
import { toShiftResponse } from "@/lib/services/shift-service";

export default async function StaffDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const user = await getCurrentDbUser();
  const organization = user!.organization;

  const record = await getShiftHistoryForStaffMember(organization.id, id);
  if (!record) {
    notFound();
  }

  const { staff, activeShift, history } = record;

  return (
    <>
      <PageHeader
        eyebrow={staff.role === "MANAGER" ? "Manager" : "Care worker"}
        title={staff.name}
        description="Shift history and current status"
      />
      <div className="mb-5 flex items-center gap-2">
        <Badge variant={activeShift ? "default" : "secondary"}>
          {activeShift ? "Clocked in" : "Clocked out"}
        </Badge>
      </div>
      <StaffShiftHistory
        history={history.map(toShiftResponse)}
        workplaceLatitude={organization.latitude}
        workplaceLongitude={organization.longitude}
      />
    </>
  );
}
