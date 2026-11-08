"use client";

import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  LabelList,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  type TooltipContentProps,
  type TooltipValueType as ValueType,
} from "recharts";
import { CalendarIcon } from "@/components/icons";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { cardTitleClass, monoLabelClass } from "@/lib/utils";
import type { AnalyticsResponse } from "@/types/analytics";

const weekdayFormatter = new Intl.DateTimeFormat("en-GB", {
  weekday: "short",
  timeZone: "UTC",
});

// SVG presentation attributes, not CSS: Recharts draws ticks and labels as
// <text>, which Tailwind's font utilities can't reach through its props.
const MONO_TICK = {
  fill: "var(--faint)",
  fontSize: 11,
  fontFamily: "var(--font-jetbrains), ui-monospace, monospace",
};

function ChartTooltip({ active, payload, label }: TooltipContentProps<ValueType, string | number>) {
  if (!active || !payload?.length) return null;
  const count = Number(payload[0].value);
  return (
    <div className="rounded-lg border border-border-soft bg-card px-3 py-2 text-xs shadow-md">
      <p className="font-semibold text-foreground">{label}</p>
      <p className="font-mono text-muted-foreground tabular-nums">
        {count} {count === 1 ? "clock-in" : "clock-ins"}
      </p>
    </div>
  );
}

export function DailyClockInsChart({
  dailyClockIns,
}: {
  dailyClockIns: AnalyticsResponse["dailyClockIns"];
}) {
  const data = dailyClockIns.map((day) => ({
    ...day,
    label: weekdayFormatter.format(new Date(`${day.date}T00:00:00Z`)),
  }));
  const todayIndex = data.length - 1;

  const description = `Clock-ins per day: ${data
    .map((day) => `${day.label} ${day.count}`)
    .join(", ")}`;

  return (
    <Card className="h-full">
      <CardHeader className="flex items-center justify-between gap-2">
        <CardTitle className={cardTitleClass}>
          <CalendarIcon aria-hidden className="size-4.5" />
          Daily clock-ins
        </CardTitle>
        <span className={monoLabelClass}>Last 7 days</span>
      </CardHeader>
      <CardContent>
        <div className="h-56 w-full" role="img" aria-label={description}>
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={data} margin={{ top: 20, right: 4, left: 4, bottom: 0 }}>
              <CartesianGrid vertical={false} stroke="var(--chart-grid)" />
              <XAxis dataKey="label" tickLine={false} axisLine={false} tick={MONO_TICK} />
              <Tooltip content={ChartTooltip} cursor={{ fill: "var(--surface-alt)" }} />
              <Bar dataKey="count" name="Clock-ins" radius={[4, 4, 0, 0]} isAnimationActive={false}>
                {data.map((day, index) => (
                  <Cell
                    key={day.date}
                    fill={index === todayIndex ? "var(--chart-1)" : "var(--chart-3)"}
                  />
                ))}
                <LabelList dataKey="count" position="top" {...MONO_TICK} />
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
}
