import { toUtcDateKey } from "@/lib/services/analytics-service";

const DAY_MS = 24 * 60 * 60 * 1000;

// The engine is not told today's date, so the notes tool can only be pointed at
// a day by naming it. Yesterday is built on the server from the same UTC day key
// the analytics use, so the card and the charts agree on the boundary.
export function buildStarterQuestions(now: Date): string[] {
  const yesterday = toUtcDateKey(new Date(now.getTime() - DAY_MS));

  return [
    "Who worked the most hours in the last 7 days, and how many?",
    "Which day in the last 7 had the most clock-ins, and how many clock-ins was that?",
    "What was the average number of hours worked per day over the last 7 days?",
    `What did staff write in their shift notes on ${yesterday}?`,
  ];
}
