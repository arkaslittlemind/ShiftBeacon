// Analytics failures are swallowed everywhere so a vendor can never break
// attendance, but a permanently dead pipeline should still be visible in the
// logs. Shared so the server and browser halves report failures identically.
export function warnAnalyticsFailure(action: string, error: unknown): void {
  console.warn(
    `[analytics] ${action} failed:`,
    error instanceof Error ? error.message : error
  );
}
