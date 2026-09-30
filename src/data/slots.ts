import type { Appointment, Doctor } from '../types';
import { addDays, toDateKey } from '../utils/date';

const DAY_NAMES = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
const SLOT_MINUTES = 30;

const toMinutes = (hhmm: string) => { const [h, m] = hhmm.split(':').map(Number); return h * 60 + m; };
const toClock = (mins: number) => `${String(Math.floor(mins / 60)).padStart(2, '0')}:${String(mins % 60).padStart(2, '0')}`;

/**
 * The doctor's first free 30-minute slot from `now`: on a working day, inside
 * their hours, not already booked, and not in the past.
 * ponytail: fixed 30-min slots, no per-visit-type durations; add those when the
 * booking system knows how long each visit takes.
 */
export function nextFreeSlot(
  doctor: Doctor,
  appointments: Appointment[],
  now: Date = new Date(),
): { date: string; time: string } | null {
  const taken = new Set(
    appointments
      .filter(a => a.doctorId === doctor.id && a.status === 'Scheduled')
      .map(a => `${a.date} ${a.time}`),
  );
  const today = toDateKey(now);
  const nowMinutes = now.getHours() * 60 + now.getMinutes();

  for (let offset = 0; offset < 21; offset++) {
    const date = addDays(today, offset);
    const [y, m, d] = date.split('-').map(Number);
    const hours = doctor.schedule.find(s => s.isAvailable && s.day === DAY_NAMES[new Date(y, m - 1, d).getDay()]);
    if (!hours) continue;
    for (let t = toMinutes(hours.startTime); t + SLOT_MINUTES <= toMinutes(hours.endTime); t += SLOT_MINUTES) {
      if (offset === 0 && t <= nowMinutes) continue;
      if (!taken.has(`${date} ${toClock(t)}`)) return { date, time: toClock(t) };
    }
  }
  return null;
}
