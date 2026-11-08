import { GraphBarLineIcon } from "@/components/icons";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { staffHoursBars } from "@/lib/manager/dashboard-summary";
import { cardTitleClass, monoLabelClass } from "@/lib/utils";
import type { AnalyticsResponse } from "@/types/analytics";

export function StaffHoursChart({
  staffHours,
}: {
  staffHours: AnalyticsResponse["staffHours"];
}) {
  const bars = staffHoursBars(staffHours);

  return (
    <Card className="h-full">
      <CardHeader className="flex items-center justify-between gap-2">
        <CardTitle className={cardTitleClass}>
          <GraphBarLineIcon aria-hidden className="size-4.5" />
          Hours per staff
        </CardTitle>
        <span className={monoLabelClass}>Last 7 days</span>
      </CardHeader>
      <CardContent>
        {bars.length === 0 ? (
          <p className="text-sm text-muted-foreground">No staff yet.</p>
        ) : (
          <ul className="grid gap-3" aria-label="Total hours per staff member over the last 7 days">
            {bars.map((bar) => (
              <li
                key={bar.userId}
                className="grid grid-cols-[minmax(0,7rem)_minmax(0,1fr)_3.5rem] items-center gap-3 text-sm"
              >
                <span className="truncate text-foreground" title={bar.name}>
                  {bar.name}
                </span>
                <svg
                  aria-hidden
                  viewBox="0 0 100 8"
                  preserveAspectRatio="none"
                  className="h-2 w-full overflow-hidden rounded-full bg-chart-grid"
                >
                  <rect width={bar.fraction * 100} height="8" className="fill-chart-1" />
                </svg>
                <span className="text-right font-mono text-xs text-muted-foreground tabular-nums">
                  {bar.totalHours.toFixed(1)}h
                </span>
              </li>
            ))}
          </ul>
        )}
      </CardContent>
    </Card>
  );
}
