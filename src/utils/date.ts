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

/**
 * Mock data is written around a fixed "today", so left alone it drifts into the
 * past: stale visits, expired stock, overdue follow-ups years old. This moves
 * every named date field by the gap between that authored day and the real one,
 * keeping the authored past/future shape intact. Accepts `YYYY-MM-DD` or ISO
 * datetimes (the time part is kept). Deep: nested records are shifted too.
 */
export function shiftDemoDates<T>(data: T, authoredToday: string, fields: readonly string[]): T {
  const offset = Math.round((fromDateKey(todayKey()).getTime() - fromDateKey(authoredToday).getTime()) / 86_400_000);
  if (offset === 0) return data;
  const keys = new Set(fields);
  const walk = (value: unknown): unknown => {
    if (Array.isArray(value)) return value.map(walk);
    if (value === null || typeof value !== 'object') return value;
    return Object.fromEntries(Object.entries(value).map(([k, v]) =>
      [k, keys.has(k) && typeof v === 'string' && /^\d{4}-\d{2}-\d{2}/.test(v)
        ? addDays(v.slice(0, 10), offset) + v.slice(10)
        : walk(v)]));
  };
  return walk(data) as T;
}

/** Short month labels for the last `n` months, oldest first, ending with this month. */
export function recentMonthLabels(n: number): string[] {
  const now = new Date();
  return Array.from({ length: n }, (_, i) =>
    new Date(now.getFullYear(), now.getMonth() - (n - 1 - i), 1).toLocaleString('en-US', { month: 'short' }));
}
