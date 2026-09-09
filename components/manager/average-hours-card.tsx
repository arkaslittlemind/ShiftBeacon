import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { eyebrowClass } from "@/lib/utils";

export function AverageHoursCard({
  averageHoursPerDay,
  windowDays,
}: {
  averageHoursPerDay: number;
  windowDays: number;
}) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className={eyebrowClass}>
          Average hours clocked in per day
        </CardTitle>
      </CardHeader>
      <CardContent>
        <p className="font-heading text-3xl font-bold text-accent-dark">
          {averageHoursPerDay.toFixed(1)}h
        </p>
        <p className="mt-1 text-xs text-muted-foreground">Last {windowDays} days</p>
      </CardContent>
    </Card>
  );
}
