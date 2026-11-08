import { PageHeader } from "@/components/shell/page-header";
import { PerimeterStatusBanner } from "@/components/worker/perimeter-status-banner";
import { ClockInPanel } from "@/components/worker/clock-in-panel";
import { ActiveShiftPanel } from "@/components/worker/active-shift-panel";
import { ShiftHistoryCard } from "@/components/worker/shift-history-card";
import { requirePageUser } from "@/lib/auth";
import { getShiftsForUser, toShiftResponse } from "@/lib/services/shift-service";

export default async function WorkerHomePage() {
  const user = await requirePageUser("CARE_WORKER", "/worker/home");
  if (!user) return null;
  const organization = user.organization;
  const { activeShift, history } = await getShiftsForUser(user.id);

  return (
    <>
      <PageHeader
        eyebrow="Worker"
        title="Home"
        description={`${organization.name} · ${organization.clockInRadiusMeters}m clock-in radius`}
      />
      <div className="grid gap-4">
        <PerimeterStatusBanner />
        {activeShift ? (
          <ActiveShiftPanel shift={toShiftResponse(activeShift)} />
        ) : (
          <ClockInPanel />
        )}
        <ShiftHistoryCard history={history.map(toShiftResponse)} />
      </div>
    </>
  );
}
