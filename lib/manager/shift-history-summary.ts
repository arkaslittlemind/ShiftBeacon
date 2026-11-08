import type { ShiftResponse } from "@/types/shift";

export type ShiftHistorySummary = {
  shiftCount: number;
  totalMs: number;
  averageMs: number;
};

/** Completed shifts only; a shift whose end precedes its start counts as zero. */
export function summarizeShiftHistory(history: ShiftResponse[]): ShiftHistorySummary {
  const durations = history.flatMap((shift) =>
    shift.clockOutAt
      ? [Math.max(0, Date.parse(shift.clockOutAt) - Date.parse(shift.clockInAt))]
      : []
  );
  const totalMs = durations.reduce((sum, ms) => sum + ms, 0);

  return {
    shiftCount: durations.length,
    totalMs,
    averageMs: durations.length > 0 ? totalMs / durations.length : 0,
  };
}
