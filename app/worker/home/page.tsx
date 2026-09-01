import { PageHeader } from "@/components/shell/page-header";
import { PerimeterStatusBanner } from "@/components/worker/perimeter-status-banner";
import { ClockInPanel } from "@/components/worker/clock-in-panel";
import { getCurrentDbUser } from "@/lib/auth";
import { getShiftsForUser } from "@/lib/services/shift-service";

export default async function WorkerHomePage() {
  const user = await getCurrentDbUser();
  const organization = user!.organization;
  const { activeShift } = await getShiftsForUser(user!.id);

  return (
    <>
      <PageHeader
        eyebrow="Worker"
        title="Home"
        description={`${organization.name} · ${organization.clockInRadiusMeters}m clock-in radius`}
      />
      <div className="grid gap-4">
        <PerimeterStatusBanner />
        <ClockInPanel hasActiveShift={activeShift !== null} />
      </div>
    </>
  );
}
