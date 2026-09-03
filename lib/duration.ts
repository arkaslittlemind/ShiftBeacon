function clampNonNegative(ms: number): number {
  return ms > 0 ? ms : 0;
}

function pad(value: number): string {
  return value.toString().padStart(2, "0");
}

export function formatElapsedClock(ms: number): string {
  const totalSeconds = Math.floor(clampNonNegative(ms) / 1000);
  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;
  return `${pad(hours)}:${pad(minutes)}:${pad(seconds)}`;
}

export function formatHoursDecimal(ms: number): string {
  const hours = clampNonNegative(ms) / 3_600_000;
  return `${hours.toFixed(1)}h`;
}
