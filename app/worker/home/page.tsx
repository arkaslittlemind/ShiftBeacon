import { PageHeader } from "@/components/shell/page-header";
import { ShiftCard, type ActiveShiftView } from "@/components/worker/shift-card";
import { ShiftHistoryCard } from "@/components/worker/shift-history-card";
import { ThisWeekCard } from "@/components/worker/this-week-card";
import { requirePageUser } from "@/lib/auth";
import { perimeterCheck } from "@/lib/geo";
import { firstName } from "@/lib/names";
import { getShiftsForUser, toShiftResponse } from "@/lib/services/shift-service";
import { formatTimeOfDay } from "@/lib/time-of-day";
import { summarizeWeek } from "@/lib/worker/week-summary";

// UTC, like every other "day" in the app, because the server can't know the
// worker's timezone.
const weekdayFormatter = new Intl.DateTimeFormat("en-GB", { weekday: "long", timeZone: "UTC" });
const dayMonthFormatter = new Intl.DateTimeFormat("en-GB", {
  day: "numeric",
  month: "long",
  timeZone: "UTC",
});

function greetingTitle(name: string, onShift: boolean): string {
  if (onShift) return "You're on shift";
  const first = firstName(name);
  return first ? `Hello, ${first}` : "Hello";
}

export default async function WorkerHomePage() {
  const user = await requirePageUser("CARE_WORKER", "/worker/home");
  if (!user) return null;
  const { name, latitude, longitude, clockInRadiusMeters } = user.organization;
  const workplace = { name, latitude, longitude, clockInRadiusMeters };
  const { activeShift, history } = await getShiftsForUser(user.id);
  const now = new Date();

  const activeShiftView: ActiveShiftView | null = activeShift && {
    clockInAt: activeShift.clockInAt.toISOString(),
    clockInTimeLabel: formatTimeOfDay(activeShift.clockInAt),
    clockInDistanceMeters: perimeterCheck(
      { latitude: activeShift.clockInLatitude, longitude: activeShift.clockInLongitude },
      workplace
    ).distanceMeters,
  };

  return (
    <>
      <PageHeader
        eyebrow={`${weekdayFormatter.format(now)} · ${dayMonthFormatter.format(now)}`}
        title={greetingTitle(user.name, activeShift !== null)}
      />
      <div className="grid items-start gap-6 min-[860px]:grid-cols-[minmax(0,1fr)_minmax(0,22.5rem)]">
        <ShiftCard workplace={workplace} activeShift={activeShiftView} />
        <div className="grid min-w-0 gap-4">
          <ThisWeekCard summary={summarizeWeek(history, activeShift, now)} />
          <ShiftHistoryCard history={history.map(toShiftResponse)} />
        </div>
      </div>
    </>
  );
}
