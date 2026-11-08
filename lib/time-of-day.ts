const timeOfDayFormatter = new Intl.DateTimeFormat("en-GB", {
  hour: "2-digit",
  minute: "2-digit",
  hour12: false,
  timeZone: "UTC",
});

/** "06:58" in UTC, the same clock the app uses for every day key, so the
 * clock-in line, the history list, and the week strip agree. */
export function formatTimeOfDay(date: Date): string {
  return timeOfDayFormatter.format(date);
}
