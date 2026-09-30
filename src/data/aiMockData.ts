import { patients } from './patients';
import type { AIInsight, DashboardStats } from '../types';
import { recentMonthLabels, shiftDemoDates } from '../utils/date';
import { CLINICAL_DEMO_TODAY } from './demoToday';

const authoredAiInsights: AIInsight[] = [
  {
    id: 'AI001',
    patientId: 'P004',
    type: 'Risk Assessment',
    confidence: 87,
    description: 'High risk of stroke detected based on AFib pattern and age factors',
    recommendations: [
      'Immediate anticoagulation therapy',
      'Cardiology consultation within 48 hours',
      'Continuous cardiac monitoring recommended'
    ],
    createdAt: '2024-03-02T10:30:00Z',
    severity: 'Critical'
  },
  {
    id: 'AI002',
    patientId: 'P002',
    type: 'Anomaly Detection',
    confidence: 92,
    description: 'Blood pressure readings show concerning upward trend over past 3 visits',
    recommendations: [
      'Increase monitoring frequency to twice daily',
      'Consider medication adjustment',
      'Lifestyle modification counseling'
    ],
    createdAt: '2024-02-28T14:15:00Z',
    severity: 'High'
  },
  {
    id: 'AI003',
    patientId: 'P005',
    type: 'Treatment Recommendation',
    confidence: 85,
    description: 'HbA1c levels suggest need for treatment intensification',
    recommendations: [
      'Add GLP-1 agonist to current regimen',
      'Diabetes education program enrollment',
      'Nutritionist consultation'
    ],
    createdAt: '2024-02-25T09:45:00Z',
    severity: 'Medium'
  },
  {
    id: 'AI004',
    patientId: 'P008',
    type: 'Diagnosis Support',
    confidence: 89,
    description: 'Lipid panel indicates high cardiovascular risk',
    recommendations: [
      'High-intensity statin therapy indicated',
      'Lifestyle intervention program',
      '6-week follow-up for lipid recheck'
    ],
    createdAt: '2024-03-05T11:20:00Z',
    severity: 'High'
  },
  {
    id: 'AI005',
    patientId: 'P003',
    type: 'Risk Assessment',
    confidence: 78,
    description: 'Low risk pregnancy progression. All markers within normal range.',
    recommendations: [
      'Continue routine prenatal care',
      'Schedule glucose screening at 24 weeks',
      'Maintain current nutrition plan'
    ],
    createdAt: '2024-03-03T16:00:00Z',
    severity: 'Low'
  },
  {
    id: 'AI006',
    patientId: 'P006',
    type: 'Diagnosis Support',
    confidence: 81,
    description: 'Pattern analysis suggests mechanical rather than inflammatory back pain',
    recommendations: [
      'Physical therapy referral',
      'Core strengthening exercises',
      'Ergonomics assessment'
    ],
    createdAt: '2024-03-04T13:30:00Z',
    severity: 'Medium'
  }
];

export const aiInsights = shiftDemoDates(authoredAiInsights, CLINICAL_DEMO_TODAY, ['createdAt']);

export const dashboardStats: DashboardStats = {
  totalPatients: 2847,
  totalDoctors: 48,
  todayAppointments: 24,
  pendingBills: 18,
  monthlyRevenue: 125840,
  patientGrowth: 12.5,
  appointmentGrowth: 8.3,
  revenueGrowth: 15.2
};

export const revenueChartData = [
  { revenue: 98000, appointments: 420 },
  { revenue: 105000, appointments: 450 },
  { revenue: 112000, appointments: 480 },
  { revenue: 108000, appointments: 465 },
  { revenue: 118000, appointments: 510 },
  { revenue: 125840, appointments: 542 }
].map((d, i, all) => ({ month: recentMonthLabels(all.length)[i], ...d }));

/** Age bands counted from the patient list, so the chart and the roster agree. */
export const patientDemographics = ([
  ['0-18', 0, 18, '#6366f1'], ['19-35', 19, 35, '#06b6d4'], ['36-50', 36, 50, '#8b5cf6'],
  ['51-65', 51, 65, '#10b981'], ['65+', 66, 200, '#f59e0b'],
] as const).map(([name, lo, hi, color]) => ({
  name, color, value: patients.filter(p => p.age >= lo && p.age <= hi).length,
}));

