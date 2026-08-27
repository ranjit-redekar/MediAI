/**
 * Local calendar-day helpers.
 *
 * `Date.toISOString()` formats in UTC, so for anyone east of Greenwich it can
 * report yesterday's date for most of the working day — which silently breaks
 * every "is this appointment today?" comparison. These helpers format against
 * the viewer's own calendar instead.
 */

/** `YYYY-MM-DD` for a date, in the viewer's local timezone. */
export function toDateKey(date: Date = new Date()): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

/** Today as `YYYY-MM-DD`, local. */
export const todayKey = (): string => toDateKey();

/** Parses a `YYYY-MM-DD` key into a local midnight Date (never UTC midnight). */
export function fromDateKey(key: string): Date {
  const [year, month, day] = key.split('-').map(Number);
  return new Date(year, (month ?? 1) - 1, day ?? 1);
}

/** `YYYY-MM-DD` for today shifted by a number of days. */
export function addDays(key: string, days: number): string {
  const date = fromDateKey(key);
  date.setDate(date.getDate() + days);
  return toDateKey(date);
}
