/**
 * The day the clinical mock data (patients, bills, labs, AI insights) was written
 * around. Each dataset shifts its dates by the gap between this and the real
 * today, so "yesterday's visit" stays yesterday. Appointments were written
 * around their own day; see appointments.ts.
 */
export const CLINICAL_DEMO_TODAY = '2024-03-06';
