/**
 * The contract between the drafting function and the model: what goes in
 * (a patient summary), what must come out (drafts in a fixed JSON shape), and
 * the check every draft passes before it reaches the database.
 *
 * No imports on purpose, like system-prompt.ts: the Edge Function (Deno) uses
 * it, and tests load it from Node.
 */

/** Patient kinds only; stock drafts come from inventory, not from a patient. */
export const PATIENT_KINDS = [
  'appointment', 'referral', 'lab', 'medication', 'monitoring', 'outreach', 'education',
] as const;
export type PatientKind = (typeof PATIENT_KINDS)[number];

export interface PatientSummary {
  ref: string;
  name: string;
  age?: number;
  gender?: string;
  /** `null`/absent = not recorded, `[]` = none known. */
  allergies?: string[] | null;
  status?: string;
  riskScore?: number | null;
  medications?: string[];
  /** Most recent first. */
  history?: { date: string; diagnosis: string; notes?: string; symptoms?: string[] }[];
  /** The signal that prompted drafting, if any (an AI insight's description). */
  signal?: string;
}

export interface Draft {
  kind: PatientKind;
  label: string;
  detail: string;
  rationale: string;
  source: string;
  confidence: number;
  minutes_saved: number;
}

/** The model must answer with exactly this shape (structured outputs). */
export const DRAFTS_SCHEMA = {
  type: 'object',
  properties: {
    drafts: {
      type: 'array',
      items: {
        type: 'object',
        properties: {
          kind: { type: 'string', enum: [...PATIENT_KINDS] },
          label: { type: 'string', description: 'What will happen, in a few words: "Book cardiology consult".' },
          detail: { type: 'string', description: 'The pre-filled specifics a person would otherwise type.' },
          rationale: { type: 'string', description: 'Why these specifics, citing the patient data used.' },
          source: { type: 'string', description: 'The finding in the record this draft responds to.' },
          confidence: { type: 'integer', description: '0-100.' },
          minutes_saved: { type: 'integer', description: 'Manual minutes this saves if approved.' },
        },
        required: ['kind', 'label', 'detail', 'rationale', 'source', 'confidence', 'minutes_saved'],
        additionalProperties: false,
      },
    },
  },
  required: ['drafts'],
  additionalProperties: false,
} as const;

const MAX_DRAFTS = 6;
const clip = (s: unknown, n: number) => (typeof s === 'string' ? s.trim().slice(0, n) : '');
const clamp = (v: unknown, lo: number, hi: number) =>
  Math.min(hi, Math.max(lo, Math.round(typeof v === 'number' && Number.isFinite(v) ? v : lo)));

/**
 * Keeps only drafts that are well-formed and of a patient kind. The database
 * enforces kinds and lengths too; this drops a bad item instead of failing the
 * whole batch on it.
 */
export function validDrafts(output: unknown): Draft[] {
  const items = (output as { drafts?: unknown })?.drafts;
  if (!Array.isArray(items)) return [];
  return items.flatMap(raw => {
    const d = raw as Record<string, unknown>;
    if (!PATIENT_KINDS.includes(d?.kind as PatientKind)) return [];
    const label = clip(d.label, 200);
    const detail = clip(d.detail, 2000);
    if (!label || !detail) return [];
    return [{
      kind: d.kind as PatientKind,
      label,
      detail,
      rationale: clip(d.rationale, 2000),
      source: clip(d.source, 2000),
      confidence: clamp(d.confidence, 0, 100),
      minutes_saved: clamp(d.minutes_saved, 0, 600),
    }];
  }).slice(0, MAX_DRAFTS);
}

/**
 * The user message. The record goes inside tags as data — the base prompt
 * tells the model that text in records is information, not instructions.
 */
export function patientMessage(p: PatientSummary, today: string): string {
  const allergies = p.allergies == null ? 'NOT RECORDED' : p.allergies.length ? p.allergies.join(', ') : 'none known';
  return [
    `Today is ${today}. Draft the follow-up work for this patient, for staff to approve.`,
    'Return only drafts that the record supports; an empty list is a valid answer.',
    'Never draft a medication the patient is allergic to, and if allergies are not recorded, say so in any medication draft.',
    '',
    '<patient_record>',
    // A note can't close the tag early and have later text read as instructions.
    JSON.stringify({ ...p, allergies }, null, 2).replaceAll('</patient_record>', ''),
    '</patient_record>',
  ].join('\n');
}
