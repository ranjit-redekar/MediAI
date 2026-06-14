// Patient Journey workflow types — orchestrates a visit from scheduling
// through reception, doctor consultation(s), and the pharmacy/medical store.

export type JourneyStage =
  | 'Scheduled'
  | 'Reception'
  | 'Consultation'
  | 'Pharmacy'
  | 'Completed';

export const JOURNEY_STAGES: JourneyStage[] = [
  'Scheduled',
  'Reception',
  'Consultation',
  'Pharmacy',
  'Completed'
];

export interface PrescribedMedicine {
  id: string;
  medicineId: string;
  name: string;
  category: string;
  dosage: string;
  prescribedBy: string;
  aiSuggested: boolean;
  rationale?: string;
  dispensed: boolean;
}

export interface Consultation {
  id: string;
  doctorId: string;
  doctorName: string;
  specialty: string;
  diagnosis: string;
  notes: string;
  completed: boolean;
}

export type PharmacyStatus = 'Awaiting' | 'Dispensing' | 'Fulfilled';

export interface Visit {
  id: string;
  patientId: string;
  patientName: string;
  patientAvatar?: string;
  age: number;
  gender: string;
  reason: string;
  symptoms: string[];
  scheduledTime: string;
  priority: 'Routine' | 'Urgent';
  stage: JourneyStage;
  checkedInAt?: string;
  consultations: Consultation[];
  prescription: PrescribedMedicine[];
  pharmacyStatus: PharmacyStatus;
}

export interface MedicineSuggestion {
  medicineId: string;
  name: string;
  category: string;
  dosage: string;
  rationale: string;
  confidence: number;
}
