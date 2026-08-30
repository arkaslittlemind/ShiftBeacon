export type AnalyticsResponse = {
  windowDays: 7;
  averageHoursPerDay: number;
  dailyClockIns: { date: string; count: number }[];
  staffHours: { userId: string; name: string; totalHours: number }[];
};
