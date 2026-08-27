export type AIActionKind =
  | 'appointment'
  | 'referral'
  | 'lab'
  | 'medication'
  | 'monitoring'
  | 'outreach'
  | 'education';

export type AIActionStatus = 'pending' | 'approved' | 'dismissed';

/**
 * A concrete, executable step the AI has already drafted — not advice to read.
 * Every field the hospital would otherwise type by hand is pre-filled, so the
 * human's only job is to approve, adjust, or reject.
 */
export interface AIAction {
  id: string;
  insightId: string;
  patientId: string;
  patientName: string;
  kind: AIActionKind;
  /** What will happen, in plain words: "Book cardiology consult". */
  label: string;
  /** The pre-filled specifics: who, when, what dose, which panel. */
  detail: string;
  /** Why the AI chose these specifics — shown on demand, never hidden. */
  rationale: string;
  /** The original free-text recommendation this was derived from. */
  source: string;
  confidence: number;
  /** Manual minutes this saves if approved — drives the "work avoided" tally. */
  minutesSaved: number;
  /**
   * Clinical decisions (medication, therapy) always need a clinician's sign-off
   * and are excluded from batch approval. Administrative steps do not.
   */
  requiresClinician: boolean;
}
