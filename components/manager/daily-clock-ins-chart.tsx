"use client";

import { Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import type { AnalyticsResponse } from "@/types/analytics";

const weekdayFormatter = new Intl.DateTimeFormat("en-GB", {
  weekday: "short",
  timeZone: "UTC",
});

export function DailyClockInsChart({
  dailyClockIns,
}: {
  dailyClockIns: AnalyticsResponse["dailyClockIns"];
}) {
  const data = dailyClockIns.map((day) => ({
    ...day,
    label: weekdayFormatter.format(new Date(`${day.date}T00:00:00Z`)),
  }));

  const description = `Clock-ins per day: ${data
    .map((day) => `${day.label} ${day.count}`)
    .join(", ")}`;

  return (
    <div className="h-64 w-full" role="img" aria-label={description}>
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={data} margin={{ top: 8, right: 8, left: -16, bottom: 0 }}>
          <CartesianGrid vertical={false} stroke="var(--color-border-soft)" />
          <XAxis
            dataKey="label"
            tickLine={false}
            axisLine={false}
            className="text-xs"
            tick={{ fill: "var(--color-muted-foreground)" }}
          />
          <YAxis
            allowDecimals={false}
            tickLine={false}
            axisLine={false}
            className="text-xs"
            tick={{ fill: "var(--color-muted-foreground)" }}
          />
          <Tooltip
            cursor={{ fill: "var(--color-secondary)" }}
            contentStyle={{
              borderRadius: "var(--radius)",
              borderWidth: "var(--border-w)",
              borderColor: "var(--color-border)",
              background: "var(--color-card)",
            }}
          />
          <Bar dataKey="count" name="Clock-ins" fill="var(--color-primary)" radius={[3, 3, 0, 0]} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
