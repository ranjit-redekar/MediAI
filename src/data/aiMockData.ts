import type { AIInsight, DashboardStats } from '../types';

export const aiInsights: AIInsight[] = [
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
  { month: 'Jan', revenue: 98000, appointments: 420 },
  { month: 'Feb', revenue: 105000, appointments: 450 },
  { month: 'Mar', revenue: 112000, appointments: 480 },
  { month: 'Apr', revenue: 108000, appointments: 465 },
  { month: 'May', revenue: 118000, appointments: 510 },
  { month: 'Jun', revenue: 125840, appointments: 542 }
];

export const patientDemographics = [
  { name: '0-18', value: 320, color: '#6366f1' },
  { name: '19-35', value: 680, color: '#06b6d4' },
  { name: '36-50', value: 850, color: '#8b5cf6' },
  { name: '51-65', value: 620, color: '#10b981' },
  { name: '65+', value: 377, color: '#f59e0b' }
];

export const departmentDistribution = [
  { name: 'General Medicine', value: 35 },
  { name: 'Cardiology', value: 18 },
  { name: 'Orthopedics', value: 15 },
  { name: 'Pediatrics', value: 12 },
  { name: 'OB/GYN', value: 10 },
  { name: 'Others', value: 10 }
];

export const recentActivities = [
  { id: 1, type: 'appointment', description: 'New appointment scheduled', patient: 'Sarah Johnson', time: '10 minutes ago' },
  { id: 2, type: 'lab', description: 'Lab results completed', patient: 'Michael Chen', time: '25 minutes ago' },
  { id: 3, type: 'billing', description: 'Payment received', patient: 'Emily Rodriguez', time: '1 hour ago' },
  { id: 4, type: 'ai', description: 'AI alert: High risk patient', patient: 'Robert Williams', time: '1 hour ago' },
  { id: 5, type: 'appointment', description: 'Appointment completed', patient: 'Amanda Thompson', time: '2 hours ago' }
];
