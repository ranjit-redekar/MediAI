import { medicines } from './pharmacy';
import type { MedicineSuggestion, Visit } from '../types/journey';

// --- AI medicine recommendation engine -------------------------------------
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
    keywords: ['infection', 'bacterial', 'fever', 'throat', 'sinus', 'wound'],
    category: 'Antibiotics',
    dosage: '1 tablet, twice daily for 7 days',
    rationale: 'Bacterial infection indicators — broad-spectrum antibiotic cover.',
    confidence: 88
  },
  {
    keywords: ['allergy', 'allergic', 'sneezing', 'congestion', 'itchy', 'rhinitis', 'rash'],
    category: 'Antihistamine',
    dosage: '1 tablet once daily',
    rationale: 'Allergic / histamine-mediated symptoms respond to antihistamines.',
    confidence: 92
  },
  {
    keywords: ['hypertension', 'blood pressure', 'bp', 'cardiac', 'chest'],
    category: 'Antihypertensive',
    dosage: '1 tablet once daily, morning',
    rationale: 'Elevated blood pressure — ACE inhibitor for first-line control.',
    confidence: 85
  },
  {
    keywords: ['diabetes', 'glucose', 'sugar', 'hyperglycemia', 'a1c'],
    category: 'Antidiabetic',
    dosage: '1 tablet with meals, twice daily',
    rationale: 'Glycaemic control indicated by glucose-related history.',
    confidence: 87
  },
  {
    keywords: ['cholesterol', 'lipid', 'ldl', 'statin'],
    category: 'Statins',
    dosage: '1 tablet at night',
    rationale: 'Lipid management — statin therapy to lower LDL.',
    confidence: 80
  },
  {
    keywords: ['asthma', 'wheeze', 'breath', 'respiratory', 'cough', 'copd'],
    category: 'Respiratory',
    dosage: '2 puffs as needed, up to 4x daily',
    rationale: 'Airway / bronchospasm symptoms — bronchodilator relief.',
    confidence: 84
  },
  {
    keywords: ['acid', 'reflux', 'gastritis', 'stomach', 'nausea', 'heartburn', 'gastro'],
    category: 'Gastrointestinal',
    dosage: '1 capsule before breakfast',
    rationale: 'Acid-related GI symptoms — proton-pump inhibitor.',
    confidence: 83
  },
  {
    keywords: ['thyroid', 'hypothyroid', 'tsh', 'fatigue'],
    category: 'Hormone',
    dosage: '1 tablet daily on empty stomach',
    rationale: 'Thyroid hormone replacement based on TSH history.',
    confidence: 78
  },
  {
    keywords: ['pregnancy', 'prenatal', 'antenatal', 'expecting'],
    category: 'Supplements',
    dosage: '1 tablet daily',
    rationale: 'Antenatal support — prenatal micronutrients.',
    confidence: 90
  },
  {
    keywords: ['clot', 'thrombosis', 'stroke', 'anticoagulant', 'afib', 'fibrillation'],
    category: 'Anticoagulant',
    dosage: '1 tablet daily, monitor INR',
    rationale: 'Thromboembolic risk — anticoagulation with INR monitoring.',
    confidence: 76
  }
];

export function recommendMedicines(diagnosis: string, symptoms: string[]): MedicineSuggestion[] {
  const haystack = `${diagnosis} ${symptoms.join(' ')}`.toLowerCase();
  const suggestions: MedicineSuggestion[] = [];
  const usedCategories = new Set<string>();

  for (const rule of RULES) {
    if (usedCategories.has(rule.category)) continue;
    const matched = rule.keywords.some(k => haystack.includes(k));
    if (!matched) continue;
    const med = medicines.find(m => m.category === rule.category && (m.stock ?? 0) > 0);
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

// --- Seed visits across the pipeline ---------------------------------------

export const initialVisits: Visit[] = [
  {
    id: 'V001',
    patientId: 'P001',
    patientName: 'Sarah Johnson',
    patientAvatar: 'https://i.pravatar.cc/150?u=sarah',
    age: 34,
    gender: 'Female',
    reason: 'Seasonal allergy flare-up',
    symptoms: ['Sneezing', 'Nasal congestion', 'Itchy eyes'],
    scheduledTime: '09:00 AM',
    priority: 'Routine',
    stage: 'Scheduled',
    consultations: [],
    prescription: [],
    pharmacyStatus: 'Awaiting'
  },
  {
    id: 'V002',
    patientId: 'P003',
    patientName: 'Robert Williams',
    patientAvatar: 'https://i.pravatar.cc/150?u=robert',
    age: 58,
    gender: 'Male',
    reason: 'Chest tightness and high BP',
    symptoms: ['Chest discomfort', 'High blood pressure', 'Shortness of breath'],
    scheduledTime: '09:30 AM',
    priority: 'Urgent',
    stage: 'Reception',
    checkedInAt: '09:24 AM',
    consultations: [],
    prescription: [],
    pharmacyStatus: 'Awaiting'
  },
  {
    id: 'V003',
    patientId: 'P002',
    patientName: 'Michael Chen',
    patientAvatar: 'https://i.pravatar.cc/150?u=michael',
    age: 45,
    gender: 'Male',
    reason: 'Diabetes follow-up',
    symptoms: ['Elevated glucose', 'Fatigue'],
    scheduledTime: '10:00 AM',
    priority: 'Routine',
    stage: 'Consultation',
    checkedInAt: '09:52 AM',
    consultations: [
      {
        id: 'C-V003-1',
        doctorId: 'D002',
        doctorName: 'Dr. Emily Carter',
        specialty: 'Endocrinology',
        diagnosis: 'Type 2 Diabetes — sub-optimal control',
        notes: 'Reviewing glucose logs. Considering dose adjustment.',
        completed: false
      }
    ],
    prescription: [],
    pharmacyStatus: 'Awaiting'
  },
  {
    id: 'V004',
    patientId: 'P005',
    patientName: 'Jennifer Lee',
    patientAvatar: 'https://i.pravatar.cc/150?u=jennifer',
    age: 29,
    gender: 'Female',
    reason: 'Acid reflux',
    symptoms: ['Heartburn', 'Nausea'],
    scheduledTime: '10:15 AM',
    priority: 'Routine',
    stage: 'Pharmacy',
    checkedInAt: '10:08 AM',
    consultations: [
      {
        id: 'C-V004-1',
        doctorId: 'D001',
        doctorName: 'Dr. James Wilson',
        specialty: 'General Medicine',
        diagnosis: 'Gastro-oesophageal reflux',
        notes: 'Advise dietary changes; start PPI.',
        completed: true
      }
    ],
    prescription: [
      {
        id: 'RX-V004-1',
        medicineId: 'M006',
        name: 'Omeprazole 20mg',
        category: 'Gastrointestinal',
        dosage: '1 capsule before breakfast',
        prescribedBy: 'Dr. James Wilson',
        aiSuggested: true,
        rationale: 'Acid-related GI symptoms — proton-pump inhibitor.',
        dispensed: false
      }
    ],
    pharmacyStatus: 'Awaiting'
  }
];
