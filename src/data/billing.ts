import type { Bill } from '../types';

export const bills: Bill[] = [
  {
    id: 'B001',
    patientId: 'P001',
    patientName: 'Sarah Johnson',
    date: '2024-03-01',
    items: [
      { id: 'I001', description: 'Consultation Fee', quantity: 1, unitPrice: 150, total: 150 },
      { id: 'I002', description: 'Allergy Testing Panel', quantity: 1, unitPrice: 200, total: 200 },
      { id: 'I003', description: 'Prescription - Cetirizine', quantity: 1, unitPrice: 25, total: 25 }
    ],
    subtotal: 375,
    tax: 30,
    discount: 0,
    total: 405,
    status: 'Paid',
    paymentMethod: 'Credit Card'
  },
  {
    id: 'B002',
    patientId: 'P002',
    patientName: 'Michael Chen',
    date: '2024-02-28',
    items: [
      { id: 'I004', description: 'Cardiology Consultation', quantity: 1, unitPrice: 250, total: 250 },
      { id: 'I005', description: 'ECG', quantity: 1, unitPrice: 100, total: 100 },
      { id: 'I006', description: 'Blood Pressure Monitor', quantity: 1, unitPrice: 75, total: 75 }
    ],
    subtotal: 425,
    tax: 34,
    discount: 25,
    total: 434,
    status: 'Paid',
    paymentMethod: 'Insurance'
  },
  {
    id: 'B003',
    patientId: 'P004',
    patientName: 'Robert Williams',
    date: '2024-03-02',
    items: [
      { id: 'I007', description: 'Emergency Room Visit', quantity: 1, unitPrice: 800, total: 800 },
      { id: 'I008', description: 'Cardiac Monitoring', quantity: 1, unitPrice: 400, total: 400 },
      { id: 'I009', description: 'Medications', quantity: 1, unitPrice: 150, total: 150 }
    ],
    subtotal: 1350,
    tax: 108,
    discount: 0,
    total: 1458,
    status: 'Pending',
    paymentMethod: 'Pending'
  },
  {
    id: 'B004',
    patientId: 'P005',
    patientName: 'Jennifer Lee',
    date: '2024-02-25',
    items: [
      { id: 'I010', description: 'Endocrinology Consultation', quantity: 1, unitPrice: 200, total: 200 },
      { id: 'I011', description: 'HbA1c Test', quantity: 1, unitPrice: 50, total: 50 },
      { id: 'I012', description: 'Glucose Meter', quantity: 1, unitPrice: 60, total: 60 }
    ],
    subtotal: 310,
    tax: 24.80,
    discount: 0,
    total: 334.80,
    status: 'Paid',
    paymentMethod: 'Credit Card'
  },
  {
    id: 'B005',
    patientId: 'P003',
    patientName: 'Emily Rodriguez',
    date: '2024-03-03',
    items: [
      { id: 'I013', description: 'OB/GYN Consultation', quantity: 1, unitPrice: 200, total: 200 },
      { id: 'I014', description: 'Ultrasound', quantity: 1, unitPrice: 300, total: 300 },
      { id: 'I015', description: 'Prenatal Vitamins', quantity: 1, unitPrice: 45, total: 45 }
    ],
    subtotal: 545,
    tax: 43.60,
    discount: 0,
    total: 588.60,
    status: 'Paid',
    paymentMethod: 'Insurance'
  },
  {
    id: 'B006',
    patientId: 'P006',
    patientName: 'David Martinez',
    date: '2024-03-04',
    items: [
      { id: 'I016', description: 'Orthopedic Consultation', quantity: 1, unitPrice: 225, total: 225 },
      { id: 'I017', description: 'X-Ray - Lumbar Spine', quantity: 1, unitPrice: 180, total: 180 },
      { id: 'I018', description: 'Physical Therapy Session', quantity: 2, unitPrice: 100, total: 200 }
    ],
    subtotal: 605,
    tax: 48.40,
    discount: 50,
    total: 603.40,
    status: 'Overdue',
    paymentMethod: 'Pending'
  }
];
