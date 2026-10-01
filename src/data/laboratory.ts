import type { LabTest } from '../types';
import { fromDateKey, shiftDemoDates, todayKey } from '../utils/date';
import { CLINICAL_DEMO_TODAY } from './demoToday';
import { seeded } from '../utils/seeded';
import { LAB_CATALOG, resultsFor } from './labCatalog';
import { clockNow, todayAt } from './demoToday';
import { patients } from './patients';
import { doctors } from './doctors';

const authoredLabTests: LabTest[] = [
  {
    id: 'L001',
    patientId: 'P002',
    patientName: 'Michael Chen',
    testName: 'Complete Blood Count (CBC)',
    category: 'Hematology',
    orderedDate: '2024-02-28',
    completedDate: '2024-02-28',
    status: 'Completed',
    doctorId: 'D003',
    doctorName: 'Dr. Robert Taylor',
    results: [
      { parameter: 'WBC', value: '7.5', unit: 'K/uL', referenceRange: '4.5-11.0', status: 'Normal' },
      { parameter: 'RBC', value: '4.8', unit: 'M/uL', referenceRange: '4.5-5.5', status: 'Normal' },
      { parameter: 'Hemoglobin', value: '14.2', unit: 'g/dL', referenceRange: '13.5-17.5', status: 'Normal' },
      { parameter: 'Platelets', value: '250', unit: 'K/uL', referenceRange: '150-400', status: 'Normal' }
    ]
  },
  {
    id: 'L002',
    patientId: 'P005',
    patientName: 'Jennifer Lee',
    testName: 'HbA1c',
    category: 'Biochemistry',
    orderedDate: '2024-02-25',
    completedDate: '2024-02-25',
    status: 'Completed',
    doctorId: 'D002',
    doctorName: 'Dr. Maria Garcia',
    results: [
      { parameter: 'HbA1c', value: '7.8', unit: '%', referenceRange: '< 5.7', status: 'Abnormal' }
    ]
  },
  {
    id: 'L003',
    patientId: 'P004',
    patientName: 'Robert Williams',
    testName: 'Troponin I',
    category: 'Cardiac Markers',
    orderedDate: '2024-03-02',
    completedDate: '2024-03-02',
    status: 'Completed',
    doctorId: 'D003',
    doctorName: 'Dr. Robert Taylor',
    results: [
      { parameter: 'Troponin I', value: '0.02', unit: 'ng/mL', referenceRange: '< 0.04', status: 'Normal' }
    ]
  },
  {
    id: 'L004',
    patientId: 'P003',
    patientName: 'Emily Rodriguez',
    testName: 'Glucose Challenge Test',
    category: 'Biochemistry',
    orderedDate: '2024-03-03',
    status: 'Pending',
    doctorId: 'D005',
    doctorName: 'Dr. Sarah Patel'
  },
  {
    id: 'L005',
    patientId: 'P008',
    patientName: 'Christopher Brown',
    testName: 'Lipid Panel',
    category: 'Biochemistry',
    orderedDate: '2024-03-05',
    completedDate: '2024-03-05',
    status: 'Completed',
    doctorId: 'D002',
    doctorName: 'Dr. Maria Garcia',
    results: [
      { parameter: 'Total Cholesterol', value: '245', unit: 'mg/dL', referenceRange: '< 200', status: 'Abnormal' },
      { parameter: 'LDL', value: '165', unit: 'mg/dL', referenceRange: '< 100', status: 'Abnormal' },
      { parameter: 'HDL', value: '42', unit: 'mg/dL', referenceRange: '> 40', status: 'Normal' },
      { parameter: 'Triglycerides', value: '190', unit: 'mg/dL', referenceRange: '< 150', status: 'Abnormal' }
    ]
  },
  {
    id: 'L006',
    patientId: 'P006',
    patientName: 'David Martinez',
    testName: 'Thyroid Function Panel',
    category: 'Endocrinology',
    orderedDate: '2024-03-04',
    status: 'In Progress',
    doctorId: 'D004',
    doctorName: 'Dr. Lisa Anderson'
  },
  {
    id: 'L007',
    patientId: 'P001',
    patientName: 'Sarah Johnson',
    testName: 'Allergy Panel',
    category: 'Immunology',
    orderedDate: '2024-03-01',
    completedDate: '2024-03-01',
    status: 'Completed',
    doctorId: 'D001',
    doctorName: 'Dr. James Wilson',
    results: [
      { parameter: 'Dust Mites', value: '2.5', unit: 'kU/L', referenceRange: '< 0.35', status: 'Abnormal' },
      { parameter: 'Pollen', value: '1.8', unit: 'kU/L', referenceRange: '< 0.35', status: 'Abnormal' },
      { parameter: 'Pet Dander', value: '0.2', unit: 'kU/L', referenceRange: '< 0.35', status: 'Normal' }
    ]
  }
];

// The authored examples sit in the past; ones still open are re-dated to this
// morning, since a sample doesn't wait days at the bench.
const examples = shiftDemoDates(authoredLabTests, CLINICAL_DEMO_TODAY, ['orderedDate', 'completedDate'])
  .map(t => t.status === 'Completed'
    ? { ...t, priority: 'Routine' as const, orderedAt: fromDateKey(t.orderedDate).getTime() + 9 * 3_600_000 }
    : { ...t, priority: 'Routine' as const, orderedDate: todayKey(), orderedAt: todayAt('07:30') });

// --- A morning at the bench -----------------------------------------------------
// A hospital lab takes a hundred-plus orders a day; the screen has to work at
// that size. Deterministic: same orders every load. Orders run from 06:00 to
// just before the board's clock; older ones are done, newer ones still open.

const NAMES = [
  'Aarav Shah', 'Meera Iyer', 'Rohan Gupta', 'Ananya Rao', 'Vikram Singh', 'Priya Menon', 'Kabir Khan', 'Isha Patel',
  'Arjun Nair', 'Sara Thomas', 'Dev Malhotra', 'Neha Joshi', 'Omar Siddiqui', 'Lakshmi Pillai', 'Rahul Verma', 'Zoya Ali',
  'Karan Mehta', 'Diya Kapoor', 'Nikhil Das', 'Fatima Sheikh', 'Aditya Kulkarni', 'Pooja Reddy', 'Sameer Bhat', 'Tara Bose',
];

function morning(): LabTest[] {
  const today = todayKey();
  const now = clockNow().getTime();
  const start = todayAt('06:00');
  const span = Math.max(60 * 60_000, now - start - 5 * 60_000);
  const COUNT = 110;
  return Array.from({ length: COUNT }, (_, i): LabTest => {
    const k = `lab-${i}`;
    const def = LAB_CATALOG[Math.floor(seeded(k + 't') * LAB_CATALOG.length)];
    const known = seeded(k + 'p') < 0.25 ? patients[Math.floor(seeded(k + 'q') * patients.length)] : null;
    const doctor = doctors[Math.floor(seeded(k + 'd') * doctors.length)];
    const priority = seeded(k + 's') < 0.15 ? 'STAT' : 'Routine';
    const orderedAt = start + Math.floor((i / COUNT) * span);
    const ageMin = (now - orderedAt) / 60_000;
    // Older orders are done; STATs finish faster.
    const doneAfter = priority === 'STAT' ? 50 : 150;
    const status = ageMin > doneAfter + seeded(k + 'w') * 60 ? 'Completed' : ageMin > 20 + seeded(k + 'c') * 40 ? 'In Progress' : 'Pending';
    const results = status === 'Completed'
      ? resultsFor(def, Object.fromEntries(def.params.map(p => {
          const r = seeded(k + p.name);
          const top = p.high >= 999 ? p.low * 2 : p.high;
          // ~80% inside the range, the rest just above it (abnormal, not critical).
          // Never below a critical floor (a "0–140" glucose range still has a 40 call limit).
          const floor = Math.max(p.low, p.critLow ?? -Infinity);
          const v = r < 0.8 ? floor + (top - floor) * seeded(k + p.name + 'v') : top * (1.02 + seeded(k + p.name + 'x') * 0.08);
          return [p.name, Math.round(v * 100) / 100];
        })))
      : undefined;
    return {
      id: `L${String(100 + i)}`,
      patientId: known?.id ?? `P${String(900 + Math.floor(seeded(k + 'n') * NAMES.length))}`,
      patientName: known?.name ?? NAMES[Math.floor(seeded(k + 'n') * NAMES.length)],
      testName: def.name,
      category: def.category,
      orderedDate: today,
      completedDate: status === 'Completed' ? today : undefined,
      status,
      results,
      doctorId: doctor.id,
      doctorName: doctor.name,
      priority,
      orderedAt,
      collectOn: today,
    };
  });
}

// One critical value to call: Robert Williams is on warfarin for AF, and his
// STAT INR came back far above the call limit.
const inrDef = LAB_CATALOG.find(t => t.name === 'INR')!;
const robert: LabTest = {
  id: 'L099', patientId: 'P004', patientName: 'Robert Williams', testName: 'INR', category: inrDef.category,
  orderedDate: todayKey(), completedDate: todayKey(), status: 'Completed', doctorId: 'D003', doctorName: 'Dr. Robert Taylor',
  priority: 'STAT', orderedAt: todayAt('08:40'), collectOn: todayKey(), results: resultsFor(inrDef, { INR: 5.8 }),
};

export const labTests: LabTest[] = [robert, ...morning(), ...examples];
