import { doctors } from './doctors';
import { patients } from './patients';
import { aiInsights } from './aiMockData';
import type { AIAction, AIActionKind } from '../types/aiActions';

/**
 * Turns a free-text AI recommendation into a concrete, pre-filled action.
 *
 * In the real product this is the model's structured tool-call output. Here the
 * same shape is derived from the mock data so the UI can be built and reviewed
 * against realistic values before the backend exists.
 */

const SPECIALTY_HINTS: { pattern: RegExp; specialty: string }[] = [
  { pattern: /cardio|cardiac|heart|statin|lipid|afib|anticoagul/, specialty: 'Cardiology' },
  { pattern: /neuro|stroke|nihss/,                                specialty: 'Neurology' },
  { pattern: /diabet|hba1c|glucose|glp-1|insulin|endocrin/,       specialty: 'Endocrinology' },
  { pattern: /pregnan|prenatal|obstetric|glucose screening/,      specialty: 'Obstetrics' },
  { pattern: /physical therapy|ergonom|core strength|back pain/,  specialty: 'Orthopedics' },
  { pattern: /pediatric|child/,                                   specialty: 'Pediatrics' },
];

/** Best available clinician for a recommendation, falling back sensibly. */
function findDoctorFor(text: string) {
  const lower = text.toLowerCase();
  const hint = SPECIALTY_HINTS.find(h => h.pattern.test(lower));

  if (hint) {
    const match =
      doctors.find(d => d.specialty.toLowerCase().includes(hint.specialty.toLowerCase()) && d.status === 'Available') ??
      doctors.find(d => d.specialty.toLowerCase().includes(hint.specialty.toLowerCase()));
    if (match) return { doctor: match, matchedSpecialty: hint.specialty };
  }

  const available = doctors.find(d => d.status === 'Available') ?? doctors[0];
  return { doctor: available, matchedSpecialty: available?.specialty ?? 'General Medicine' };
}

const DAY_NAMES = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

/**
 * Next working slot for a doctor at least `withinHours` from now, honouring the
 * days they actually work. Returns a display string and the reason it was picked.
 */
function nextSlot(doctorId: string, withinHours: number, seed: number) {
  const doctor = doctors.find(d => d.id === doctorId);
  const workingDays = new Set(
    (doctor?.schedule ?? []).filter(s => s.isAvailable).map(s => s.day)
  );

  const candidate = new Date();
  candidate.setHours(candidate.getHours() + withinHours);

  // Walk forward to the first day this clinician actually works.
  for (let i = 0; i < 14; i++) {
    if (workingDays.size === 0 || workingDays.has(DAY_NAMES[candidate.getDay()])) break;
    candidate.setDate(candidate.getDate() + 1);
  }

  const daySchedule = (doctor?.schedule ?? []).find(s => s.day === DAY_NAMES[candidate.getDay()]);
  const startHour = Number(daySchedule?.startTime?.split(':')[0] ?? 9);
  // Spread drafted slots across the morning so they don't all collide.
  const hour = startHour + (seed % 5);
  const minute = seed % 2 === 0 ? '00' : '30';

  const dateLabel = candidate.toLocaleDateString(undefined, {
    weekday: 'short', day: 'numeric', month: 'short',
  });

  return {
    display: `${dateLabel}, ${String(hour).padStart(2, '0')}:${minute}`,
    dayName: DAY_NAMES[candidate.getDay()],
  };
}

interface Intent {
  kind: AIActionKind;
  label: string;
  minutesSaved: number;
  requiresClinician: boolean;
}

/** Maps recommendation phrasing to the kind of work it actually creates. */
function classify(recommendation: string): Intent {
  const t = recommendation.toLowerCase();

  if (/therapy|statin|agonist|anticoagul|medication|regimen|dose|antibiotic/.test(t)) {
    return { kind: 'medication', label: 'Draft medication order', minutesSaved: 8, requiresClinician: true };
  }
  if (/consult|referral|refer |cardiology|nutritionist|specialist|physical therapy/.test(t)) {
    return { kind: 'referral', label: 'Book specialist consult', minutesSaved: 12, requiresClinician: false };
  }
  if (/lab|panel|recheck|screening|hba1c|lipid|glucose screening|culture/.test(t)) {
    return { kind: 'lab', label: 'Order lab panel', minutesSaved: 6, requiresClinician: false };
  }
  if (/monitor|monitoring|twice daily|continuous|frequency|telemetry/.test(t)) {
    return { kind: 'monitoring', label: 'Raise monitoring level', minutesSaved: 5, requiresClinician: true };
  }
  if (/education|counseling|program|enrollment|nutrition|lifestyle|ergonom/.test(t)) {
    return { kind: 'education', label: 'Enrol in care program', minutesSaved: 10, requiresClinician: false };
  }
  if (/follow-up|follow up|week|routine|prenatal|maintain/.test(t)) {
    return { kind: 'appointment', label: 'Schedule follow-up', minutesSaved: 7, requiresClinician: false };
  }
  return { kind: 'outreach', label: 'Send patient outreach', minutesSaved: 4, requiresClinician: false };
}

/** Urgency window in hours implied by the recommendation and severity. */
function urgencyHours(recommendation: string, severity: string): number {
  const t = recommendation.toLowerCase();
  if (/immediate|stat|within 48 hours|urgent/.test(t)) return 24;
  if (severity === 'Critical') return 24;
  if (/6-week|6 week/.test(t)) return 24 * 42;
  if (/24 weeks/.test(t)) return 24 * 30;
  if (severity === 'High') return 48;
  return 24 * 7;
}

function buildDetail(
  intent: Intent,
  recommendation: string,
  doctorName: string,
  matchedSpecialty: string,
  slot: string
): string {
  switch (intent.kind) {
    case 'referral':
      return `${doctorName} · ${matchedSpecialty} · ${slot}`;
    case 'appointment':
      return `${doctorName} · ${slot} · 30 min`;
    case 'lab':
      return `${recommendation.replace(/^(order|schedule)\s+/i, '')} · collected ${slot}`;
    case 'medication':
      return `${recommendation} · pending clinician sign-off`;
    case 'monitoring':
      return `${recommendation} · nursing station notified`;
    case 'education':
      return `${recommendation} · next intake ${slot}`;
    default:
      return `${recommendation} · SMS + email`;
  }
}

function buildRationale(
  intent: Intent,
  severity: string,
  confidence: number,
  matchedSpecialty: string,
  dayName: string
): string {
  const base = `Drafted from a ${severity.toLowerCase()}-severity signal at ${confidence}% confidence.`;
  switch (intent.kind) {
    case 'referral':
      return `${base} Matched to ${matchedSpecialty} because the finding is specialty-specific; picked the earliest ${dayName} slot where that clinician is rostered and free.`;
    case 'appointment':
      return `${base} Chose the soonest slot inside the recommended window that fits the clinician's existing rota.`;
    case 'lab':
      return `${base} Panel and collection window follow the standing protocol for this finding.`;
    case 'medication':
      return `${base} Medication changes are never applied automatically — this is a draft for a prescriber to review, adjust, and sign.`;
    case 'monitoring':
      return `${base} Raising observation frequency is reversible and low-risk, but still routed to a clinician because it changes the care plan.`;
    case 'education':
      return `${base} Programme selected by matching the diagnosis to the hospital's enrolment catalogue.`;
    default:
      return `${base} Outreach uses the patient's preferred contact channel on file.`;
  }
}

/** All actions the AI has drafted across every open insight. */
export function buildAIActions(): AIAction[] {
  const actions: AIAction[] = [];

  aiInsights.forEach((insight, insightIndex) => {
    const patient = patients.find(p => p.id === insight.patientId);
    if (!patient) return;

    insight.recommendations.forEach((recommendation, recIndex) => {
      const intent = classify(recommendation);
      const { doctor, matchedSpecialty } = findDoctorFor(`${recommendation} ${insight.description}`);
      const hours = urgencyHours(recommendation, insight.severity);
      const slot = nextSlot(doctor?.id ?? 'D001', hours, insightIndex * 3 + recIndex);

      actions.push({
        id: `${insight.id}-A${recIndex + 1}`,
        insightId: insight.id,
        patientId: patient.id,
        patientName: patient.name,
        kind: intent.kind,
        label: intent.label,
        detail: buildDetail(intent, recommendation, doctor?.name ?? 'Care team', matchedSpecialty, slot.display),
        rationale: buildRationale(intent, insight.severity, insight.confidence, matchedSpecialty, slot.dayName),
        source: recommendation,
        confidence: insight.confidence,
        minutesSaved: intent.minutesSaved,
        requiresClinician: intent.requiresClinician,
      });
    });
  });

  return actions;
}
