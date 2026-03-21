import type { Medicine } from '../types';

export const medicines: Medicine[] = [
  {
    id: 'M001',
    name: 'Amoxicillin 500mg',
    category: 'Antibiotics',
    stock: 500,
    unitPrice: 12.50,
    expiryDate: '2025-12-31',
    manufacturer: 'Pfizer',
    description: 'Broad-spectrum antibiotic for bacterial infections',
    status: 'In Stock'
  },
  {
    id: 'M002',
    name: 'Metformin 1000mg',
    category: 'Antidiabetic',
    stock: 350,
    unitPrice: 18.75,
    expiryDate: '2025-10-15',
    manufacturer: 'Teva',
    description: 'First-line medication for type 2 diabetes',
    status: 'In Stock'
  },
  {
    id: 'M003',
    name: 'Lisinopril 10mg',
    category: 'Antihypertensive',
    stock: 45,
    unitPrice: 22.00,
    expiryDate: '2025-08-20',
    manufacturer: 'Aurobindo',
    description: 'ACE inhibitor for hypertension',
    status: 'Low Stock'
  },
  {
    id: 'M004',
    name: 'Atorvastatin 20mg',
    category: 'Statins',
    stock: 280,
    unitPrice: 35.50,
    expiryDate: '2025-11-30',
    manufacturer: 'Mylan',
    description: 'HMG-CoA reductase inhibitor for cholesterol',
    status: 'In Stock'
  },
  {
    id: 'M005',
    name: 'Albuterol Inhaler',
    category: 'Respiratory',
    stock: 0,
    unitPrice: 65.00,
    expiryDate: '2025-06-15',
    manufacturer: 'GlaxoSmithKline',
    description: 'Bronchodilator for asthma and COPD',
    status: 'Out of Stock'
  },
  {
    id: 'M006',
    name: 'Omeprazole 20mg',
    category: 'Gastrointestinal',
    stock: 420,
    unitPrice: 15.25,
    expiryDate: '2025-09-10',
    manufacturer: 'Dr. Reddy\'s',
    description: 'Proton pump inhibitor for GERD',
    status: 'In Stock'
  },
  {
    id: 'M007',
    name: 'Warfarin 5mg',
    category: 'Anticoagulant',
    stock: 25,
    unitPrice: 28.00,
    expiryDate: '2025-07-25',
    manufacturer: 'Bristol-Myers Squibb',
    description: 'Blood thinner for AFib and clot prevention',
    status: 'Low Stock'
  },
  {
    id: 'M008',
    name: 'Levothyroxine 50mcg',
    category: 'Hormone',
    stock: 380,
    unitPrice: 14.50,
    expiryDate: '2025-12-01',
    manufacturer: 'AbbVie',
    description: 'Thyroid hormone replacement',
    status: 'In Stock'
  },
  {
    id: 'M009',
    name: 'Prenatal Vitamins',
    category: 'Supplements',
    stock: 150,
    unitPrice: 32.00,
    expiryDate: '2025-05-20',
    manufacturer: 'Nature Made',
    description: 'Complete prenatal multivitamin',
    status: 'In Stock'
  },
  {
    id: 'M010',
    name: 'Cetirizine 10mg',
    category: 'Antihistamine',
    stock: 600,
    unitPrice: 8.99,
    expiryDate: '2026-01-15',
    manufacturer: 'Johnson & Johnson',
    description: 'Non-drowsy antihistamine for allergies',
    status: 'In Stock'
  }
];
