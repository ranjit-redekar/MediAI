import type { LabTest } from '../types';

export const labTests: LabTest[] = [
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
