import { medicines, stockStatus } from './pharmacy';
import { appointments } from './appointments';
import type { Appointment } from '../types';
import { patients } from './patients';
import { todayKey } from '../utils/date';
import { todayAt } from './demoToday';
import type { MedicineSuggestion, Visit } from '../types/journey';

// --- AI medicine recommendation engine -------------------------------------
// Keywords are diagnoses and named conditions, never symptoms or screenings:
// suggestions now draft automatically when a consult opens, and a presenting
// complaint ("fatigue workup", "glucose screening") is not a reason to suggest a
// drug. A symptom-only visit gets no suggestion until the doctor enters a diagnosis.
// Maps condition / symptom keywords to medicine categories in our inventory,
// with a default dosage and a human-readable rationale. This is intentionally
// rule-based mock "intelligence" — swap for a real model call when the
// backend lands. The shape of recommendMedicines() stays the same.

interface Rule {
  keywords: string[];
  category: string;
  dosage: string;
  rationale: string;
  confidence: number;
}

const RULES: Rule[] = [
  {
    keywords: ['bacterial infection', 'sinusitis', 'cellulitis', 'uti', 'strep throat'],
    category: 'Antibiotics',
    dosage: '1 tablet, twice daily for 7 days',
    rationale: 'Bacterial infection indicators — broad-spectrum antibiotic cover.',
    confidence: 88
  },
  {
    keywords: ['seasonal allergies', 'allergic rhinitis', 'hay fever', 'urticaria'],
    category: 'Antihistamine',
    dosage: '1 tablet once daily',
    rationale: 'Allergic / histamine-mediated symptoms respond to antihistamines.',
    confidence: 92
  },
  {
    keywords: ['hypertension', 'high blood pressure'],
    category: 'Antihypertensive',
    dosage: '1 tablet once daily, morning',
    rationale: 'Elevated blood pressure — ACE inhibitor for first-line control.',
    confidence: 85
  },
  {
    keywords: ['type 2 diabetes', 'diabetes management', 'hyperglycemia'],
    category: 'Antidiabetic',
    dosage: '1 tablet with meals, twice daily',
    rationale: 'Glycaemic control indicated by glucose-related history.',
    confidence: 87
  },
  {
    keywords: ['hyperlipidemia', 'hypercholesterolemia', 'high cholesterol'],
    category: 'Statins',
    dosage: '1 tablet at night',
    rationale: 'Lipid management — statin therapy to lower LDL.',
    confidence: 80
  },
  {
    keywords: ['asthma', 'copd', 'bronchospasm'],
    category: 'Respiratory',
    dosage: '2 puffs as needed, up to 4x daily',
    rationale: 'Airway / bronchospasm symptoms — bronchodilator relief.',
    confidence: 84
  },
  {
    keywords: ['acid reflux', 'gerd', 'gastritis', 'gastro-oesophageal reflux'],
    category: 'Gastrointestinal',
    dosage: '1 capsule before breakfast',
    rationale: 'Acid-related GI symptoms — proton-pump inhibitor.',
    confidence: 83
  },
  {
    keywords: ['hypothyroidism', 'hypothyroid'],
    category: 'Hormone',
    dosage: '1 tablet daily on empty stomach',
    rationale: 'Thyroid hormone replacement based on TSH history.',
    confidence: 78
  },
  {
    keywords: ['prenatal check', 'antenatal', 'pregnancy'],
    category: 'Supplements',
    dosage: '1 tablet daily',
    rationale: 'Antenatal support — prenatal micronutrients.',
    confidence: 90
  },
  {
    keywords: ['atrial fibrillation', 'afib', 'deep vein thrombosis', 'dvt'],
    category: 'Anticoagulant',
    dosage: '1 tablet daily, monitor INR',
    rationale: 'Thromboembolic risk — anticoagulation with INR monitoring.',
    confidence: 76
  }
];

/** Allergy names that cover a whole drug class, so "Penicillin" also blocks Amoxicillin. */
const ALLERGY_CLASSES: Record<string, RegExp> = {
  penicillin: /cillin/i,
  sulfonamides: /sulfa/i,
  nsaids: /ibuprofen|naproxen|diclofenac|aspirin/i,
};

/** The recorded allergy this medicine would trigger, if any. */
export function allergyConflict(medicineName: string, allergies: string[] = []): string | undefined {
  const name = medicineName.toLowerCase();
  return allergies.find(a => name.includes(a.toLowerCase()) || ALLERGY_CLASSES[a.toLowerCase()]?.test(name));
}

export function recommendMedicines(diagnosis: string, symptoms: string[], allergies: string[] = []): MedicineSuggestion[] {
  const haystack = `${diagnosis} ${symptoms.join(' ')}`.toLowerCase();
  const suggestions: MedicineSuggestion[] = [];
  const usedCategories = new Set<string>();

  for (const rule of RULES) {
    if (usedCategories.has(rule.category)) continue;
    // Whole words/phrases only: "bp" must not match inside another word.
    const matched = rule.keywords.some(k => new RegExp(`\\b${k.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}\\b`).test(haystack));
    if (!matched) continue;
    // Never suggest a batch that can't be dispensed: out of stock or expired.
    // …and never one the patient is allergic to.
    const med = medicines.find(m =>
      m.category === rule.category &&
      (stockStatus(m) === 'In Stock' || stockStatus(m) === 'Low Stock') &&
      !allergyConflict(m.name, allergies));
    if (!med) continue;
    usedCategories.add(rule.category);
    suggestions.push({
      medicineId: med.id,
      name: med.name,
      category: med.category,
      dosage: rule.dosage,
      rationale: rule.rationale,
      confidence: rule.confidence
    });
  }

  return suggestions.sort((a, b) => b.confidence - a.confidence);
}

// --- Today's visits, derived from the appointment book ----------------------

/** `14:05` → `02:05 PM`, the format the journey board shows. */
const toClock = (hhmm: string) => {
  const [h, m] = hhmm.split(':').map(Number);
  return `${String(((h + 11) % 12) + 1).padStart(2, '0')}:${String(m).padStart(2, '0')} ${h < 12 ? 'AM' : 'PM'}`;
};

/**
 * The journey board is today's in-person appointments, not a second dataset —
 * so a patient has the same time, doctor, and age here as on every other screen.
 * Video and phone visits never pass through reception, so they are left out.
 *
 * The demo places the day mid-morning: finished consults are done (the latest
 * is still waiting at the store), the next booked patient has checked in, and
 * the rest are still to arrive.
 */
const isTodayInPerson = (a: Appointment, today: string) =>
  a.date === today && a.type === 'In-Person' && (a.status === 'Completed' || a.status === 'Scheduled');

/** One appointment as a journey visit at the given stage. */
function toVisit(a: Appointment, stage: Visit['stage'], prescription: Visit['prescription'] = []): Visit | null {
  const patient = patients.find(p => p.id === a.patientId);
  if (!patient) return null;
  const seen = stage === 'Pharmacy' || stage === 'Completed';
  return {
    id: `V-${a.id}`,
    patientId: patient.id,
    patientName: patient.name,
    patientAvatar: patient.avatar,
    age: patient.age,
    gender: patient.gender,
    reason: a.notes ?? a.specialty,
    symptoms: [],
    scheduledTime: toClock(a.time),
    priority: patient.status === 'Critical' || /urgent/i.test(a.notes ?? '') ? 'Urgent' : 'Routine',
    stage,
    checkedInAt: stage === 'Scheduled' ? undefined : toClock(a.time),
    scheduledAt: todayAt(a.time),
    arrivedAt: stage === 'Scheduled' ? undefined : todayAt(a.time),
    bookedDoctor: { id: a.doctorId, name: a.doctorName, specialty: a.specialty },
    consultations: seen
      ? [{ id: `C-${a.id}`, doctorId: a.doctorId, doctorName: a.doctorName, specialty: a.specialty, diagnosis: a.notes ?? '', notes: a.notes ?? '', completed: true }]
      : [],
    prescription,
    pharmacyStatus: stage === 'Completed' ? 'Fulfilled' : 'Awaiting',
  };
}

function buildTodayVisits(): Visit[] {
  const today = todayKey();
  const booked = appointments
    .filter(a => isTodayInPerson(a, today))
    .sort((a, b) => a.time.localeCompare(b.time));
  // The visit's own reason drives everything here. The patient's latest record
  // may be about something else entirely (an allergy flare vs. a fatigue workup).
  const suggestionFor = (a: Appointment) =>
    recommendMedicines(a.notes ?? '', [], patients.find(p => p.id === a.patientId)?.allergies).slice(0, 1);
  // The latest finished consult that produced a prescription is the one at the store.
  const atStoreAppt = booked.filter(a => a.status === 'Completed' && suggestionFor(a).length > 0).at(-1);
  const firstWaiting = booked.find(a => a.status === 'Scheduled');

  return booked.flatMap(a => {
    const atStore = a === atStoreAppt;
    const stage: Visit['stage'] = atStore ? 'Pharmacy' : a.status === 'Completed' ? 'Completed' : a === firstWaiting ? 'Reception' : 'Scheduled';
    const rx = atStore
      ? suggestionFor(a).map(s => ({
          id: `RX-${a.id}`, medicineId: s.medicineId, name: s.name, category: s.category,
          dosage: s.dosage, prescribedBy: a.doctorName, aiSuggested: false, dispensed: false,
        }))
      : [];
    const visit = toVisit(a, stage, rx);
    return visit ? [visit] : [];
  });
}

/**
 * The board follows the live appointment book: a visit booked for today (by
 * hand or by approving an AI draft) joins as Scheduled, and one whose booking
 * was removed drops off unless it's already under way. Progress through the
 * stages lives in `stored`; the book decides who is on the board at all.
 */
export function mergeWithBook(stored: Visit[], book: Appointment[]): Visit[] {
  const today = todayKey();
  const booked = book.filter(a => isTodayInPerson(a, today));
  const bookedIds = new Set(booked.map(a => `V-${a.id}`));
  const storedIds = new Set(stored.map(v => v.id));
  const fromBook = (id: string) => id.startsWith('V-A');
  const kept = stored.filter(v => !fromBook(v.id) || bookedIds.has(v.id) || v.stage !== 'Scheduled');
  const added = booked
    .filter(a => !storedIds.has(`V-${a.id}`))
    .map(a => toVisit(a, 'Scheduled'))
    .filter((v): v is Visit => v !== null);
  return [...kept, ...added];
}

export const initialVisits: Visit[] = buildTodayVisits();
