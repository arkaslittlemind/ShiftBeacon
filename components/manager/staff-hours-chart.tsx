"use client";

import { Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import type { AnalyticsResponse } from "@/types/analytics";

export function StaffHoursChart({
  staffHours,
}: {
  staffHours: AnalyticsResponse["staffHours"];
}) {
  return (
    <div className="h-64 w-full">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={staffHours} margin={{ top: 8, right: 8, left: -16, bottom: 0 }}>
          <CartesianGrid vertical={false} stroke="var(--color-border-soft)" />
          <XAxis
            dataKey="name"
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
            formatter={(value) => [`${Number(value).toFixed(1)}h`, "Hours"]}
            contentStyle={{
              borderRadius: 6,
              borderWidth: 2,
              borderColor: "var(--color-border)",
              background: "var(--color-card)",
            }}
          />
          <Bar
            dataKey="totalHours"
            name="Hours"
            fill="var(--color-accent-dark)"
            radius={[3, 3, 0, 0]}
          />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
