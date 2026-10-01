export type AIActionKind =
  | 'appointment'
  | 'referral'
  | 'lab'
  | 'medication'
  | 'monitoring'
  | 'outreach'
  | 'education'
  | 'stock';

export type AIActionStatus = 'pending' | 'approved' | 'dismissed';

/**
 * A concrete, executable step the AI has already drafted — not advice to read.
 * Every field the hospital would otherwise type by hand is pre-filled, so the
 * human's only job is to approve, adjust, or reject.
 */
export interface AIAction {
  id: string;
  insightId: string;
  /** Empty for work that isn't about a patient, such as pharmacy stock. */
  patientId: string;
  /** Who or what the work is for — a patient's name, or "Pharmacy stock". */
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
  /** For bookings and referrals: the slot to put on the calendar when approved. */
  booking?: { doctorId: string; doctorName: string; specialty: string; date: string; time: string };
  /** For lab drafts: the order to place when approved. */
  labOrder?: { testName: string; collectOn: string; doctorId: string; doctorName: string };
}
