import type { Medicine, StockStatus } from '../types';
import { addDays, fromDateKey, todayKey } from '../utils/date';

/** Expiry dates are authored relative to today so the demo never drifts into all-expired stock. */
const inDays = (days: number) => addDays(todayKey(), days);

/** Below this many units a medicine is low and gets a reorder draft. */
export const LOW_STOCK_UNITS = 50;
/** The healthy shelf level a reorder tops back up to. */
export const TARGET_STOCK_UNITS = 200;

/** Whole days until a `YYYY-MM-DD` expiry; zero or less means expired. */
export const daysUntilExpiry = (m: Medicine): number =>
  Math.round((fromDateKey(m.expiryDate).getTime() - fromDateKey(todayKey()).getTime()) / 86_400_000);

/**
 * Derived, never stored: a stored status goes stale the day a batch expires.
 * Expired outranks everything — expired stock on the shelf is a dispensing risk,
 * not inventory.
 */
export function stockStatus(m: Medicine): StockStatus {
  if (m.stock > 0 && daysUntilExpiry(m) <= 0) return 'Expired';
  if (m.stock === 0) return 'Out of Stock';
  if (m.stock < LOW_STOCK_UNITS) return 'Low Stock';
  return 'In Stock';
}

export const medicines: Medicine[] = [
  {
    id: 'M001',
    name: 'Amoxicillin 500mg',
    category: 'Antibiotics',
    stock: 500,
    unitPrice: 12.50,
    expiryDate: inDays(420),
    manufacturer: 'Pfizer',
    description: 'Broad-spectrum antibiotic for bacterial infections'
  },
  {
    id: 'M002',
    name: 'Metformin 1000mg',
    category: 'Antidiabetic',
    stock: 350,
    unitPrice: 18.75,
    expiryDate: inDays(300),
    manufacturer: 'Teva',
    description: 'First-line medication for type 2 diabetes'
  },
  {
    id: 'M003',
    name: 'Lisinopril 10mg',
    category: 'Antihypertensive',
    stock: 45,
    unitPrice: 22.00,
    expiryDate: inDays(240),
    manufacturer: 'Aurobindo',
    description: 'ACE inhibitor for hypertension'
  },
  {
    id: 'M004',
    name: 'Atorvastatin 20mg',
    category: 'Statins',
    stock: 280,
    unitPrice: 35.50,
    expiryDate: inDays(380),
    manufacturer: 'Mylan',
    description: 'HMG-CoA reductase inhibitor for cholesterol'
  },
  {
    id: 'M005',
    name: 'Albuterol Inhaler',
    category: 'Respiratory',
    stock: 0,
    unitPrice: 65.00,
    expiryDate: inDays(180),
    manufacturer: 'GlaxoSmithKline',
    description: 'Bronchodilator for asthma and COPD'
  },
  {
    id: 'M006',
    name: 'Omeprazole 20mg',
    category: 'Gastrointestinal',
    stock: 420,
    unitPrice: 15.25,
    expiryDate: inDays(45),
    manufacturer: 'Dr. Reddy\'s',
    description: 'Proton pump inhibitor for GERD'
  },
  {
    id: 'M007',
    name: 'Warfarin 5mg',
    category: 'Anticoagulant',
    stock: 25,
    unitPrice: 28.00,
    expiryDate: inDays(70),
    manufacturer: 'Bristol-Myers Squibb',
    description: 'Blood thinner for AFib and clot prevention'
  },
  {
    id: 'M008',
    name: 'Levothyroxine 50mcg',
    category: 'Hormone',
    stock: 380,
    unitPrice: 14.50,
    expiryDate: inDays(510),
    manufacturer: 'AbbVie',
    description: 'Thyroid hormone replacement'
  },
  {
    id: 'M009',
    name: 'Prenatal Vitamins',
    category: 'Supplements',
    stock: 150,
    unitPrice: 32.00,
    expiryDate: inDays(-12),
    manufacturer: 'Nature Made',
    description: 'Complete prenatal multivitamin'
  },
  {
    id: 'M010',
    name: 'Cetirizine 10mg',
    category: 'Antihistamine',
    stock: 600,
    unitPrice: 8.99,
    expiryDate: inDays(600),
    manufacturer: 'Johnson & Johnson',
    description: 'Non-drowsy antihistamine for allergies'
  }
];
