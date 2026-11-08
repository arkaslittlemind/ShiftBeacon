const timeOfDayFormatter = new Intl.DateTimeFormat("en-GB", {
  hour: "2-digit",
  minute: "2-digit",
  hour12: false,
  timeZone: "UTC",
});

// UTC, like every other "day" in the app, because the server can't know the
// viewer's timezone.
const weekdayFormatter = new Intl.DateTimeFormat("en-GB", { weekday: "long", timeZone: "UTC" });
const dayMonthFormatter = new Intl.DateTimeFormat("en-GB", {
  day: "numeric",
  month: "long",
  timeZone: "UTC",
});

/** "06:58" in UTC, the same clock the app uses for every day key, so the
 * clock-in line, the history list, and the week strip agree. */
export function formatTimeOfDay(date: Date): string {
  return timeOfDayFormatter.format(date);
}

/** "Tuesday · 7 November" in UTC, the page eyebrow on both home screens. */
export function formatDateEyebrow(date: Date): string {
  return `${weekdayFormatter.format(date)} · ${dayMonthFormatter.format(date)}`;
}
