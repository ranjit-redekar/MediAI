import { isDemo } from '../lib/supabase';

/**
 * The day the clinical mock data (patients, bills, labs, AI insights) was written
 * around. Each dataset shifts its dates by the gap between this and the real
 * today, so "yesterday's visit" stays yesterday. Appointments were written
 * around their own day; see appointments.ts.
 */
export const CLINICAL_DEMO_TODAY = '2024-03-06';

/**
 * "Now" for time-of-day displays (waiting, late). The demo's day is authored
 * as mid-morning, so the demo clock reads 10:15 whatever the real time is —
 * late enough that the board shows someone waiting and someone late. With a
 * backend it is the real clock.
 */
export function clockNow(): Date {
  if (!isDemo) return new Date();
  const d = new Date();
  d.setHours(10, 15, 0, 0);
  return d;
}

/** Epoch ms for today at `HH:MM`. */
export function todayAt(hhmm: string): number {
  const [h, m] = hhmm.split(':').map(Number);
  const d = new Date();
  d.setHours(h, m, 0, 0);
  return d.getTime();
}
