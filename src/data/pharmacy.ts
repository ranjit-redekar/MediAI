import type { Medicine, StockStatus } from '../types';
import { addDays, fromDateKey, todayKey } from '../utils/date';
import { seeded } from '../utils/seeded';

/** Expiry dates are authored relative to today so the demo never drifts into all-expired stock. */
const inDays = (days: number) => addDays(todayKey(), days);

/** Default reorder level for items that don't set their own. */
export const LOW_STOCK_UNITS = 50;
/** The healthy shelf level a reorder tops back up to, as a multiple of the reorder level. */
const TARGET_MULTIPLE = 4;

export const reorderLevelOf = (m: Medicine) => m.reorderLevel ?? LOW_STOCK_UNITS;
/** How many units a full shelf holds for this item. */
export const targetStockOf = (m: Medicine) => reorderLevelOf(m) * TARGET_MULTIPLE;

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
  if (m.stock < reorderLevelOf(m)) return 'Low Stock';
  return 'In Stock';
}

const handwritten: Medicine[] = [
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

// --- A formulary-sized catalogue ----------------------------------------------
// A hospital pharmacy carries hundreds of lines, and the screen has to work at
// that size. Generated deterministically (same list every load), mostly healthy
// stock with a realistic few low, out or expired, so the pharmacist's queue has
// a day's work in it, not hundreds of drafts.

const FORMULARY: [name: string, category: string, strengths: string[], reorder: number][] = [
  ['Azithromycin', 'Antibiotics', ['250mg', '500mg'], 40], ['Ciprofloxacin', 'Antibiotics', ['250mg', '500mg'], 40],
  ['Doxycycline', 'Antibiotics', ['100mg'], 40], ['Cephalexin', 'Antibiotics', ['250mg', '500mg'], 40],
  ['Clindamycin', 'Antibiotics', ['150mg', '300mg'], 30], ['Nitrofurantoin', 'Antibiotics', ['100mg'], 30],
  ['Ceftriaxone Injection', 'Antibiotics', ['1g', '2g'], 30], ['Metronidazole', 'Antibiotics', ['200mg', '400mg'], 40],
  ['Gliclazide', 'Antidiabetic', ['40mg', '80mg'], 60], ['Sitagliptin', 'Antidiabetic', ['50mg', '100mg'], 40],
  ['Insulin Glargine', 'Antidiabetic', ['100 units/ml'], 20], ['Insulin Aspart', 'Antidiabetic', ['100 units/ml'], 20],
  ['Empagliflozin', 'Antidiabetic', ['10mg', '25mg'], 40], ['Glimepiride', 'Antidiabetic', ['1mg', '2mg', '4mg'], 40],
  ['Amlodipine', 'Antihypertensive', ['5mg', '10mg'], 80], ['Losartan', 'Antihypertensive', ['25mg', '50mg', '100mg'], 80],
  ['Telmisartan', 'Antihypertensive', ['40mg', '80mg'], 60], ['Enalapril', 'Antihypertensive', ['5mg', '10mg'], 40],
  ['Hydrochlorothiazide', 'Antihypertensive', ['12.5mg', '25mg'], 40], ['Metoprolol', 'Antihypertensive', ['25mg', '50mg'], 60],
  ['Bisoprolol', 'Antihypertensive', ['2.5mg', '5mg'], 40], ['Rosuvastatin', 'Statins', ['5mg', '10mg', '20mg'], 60],
  ['Simvastatin', 'Statins', ['20mg', '40mg'], 40], ['Salbutamol Nebules', 'Respiratory', ['2.5mg'], 40],
  ['Budesonide Inhaler', 'Respiratory', ['200mcg'], 30], ['Montelukast', 'Respiratory', ['10mg'], 40],
  ['Ipratropium Inhaler', 'Respiratory', ['20mcg'], 20], ['Pantoprazole', 'Gastrointestinal', ['20mg', '40mg'], 60],
  ['Ranitidine', 'Gastrointestinal', ['150mg'], 40], ['Ondansetron', 'Gastrointestinal', ['4mg', '8mg'], 40],
  ['Domperidone', 'Gastrointestinal', ['10mg'], 40], ['Lactulose Syrup', 'Gastrointestinal', ['200ml'], 20],
  ['Levothyroxine', 'Hormone', ['25mcg', '100mcg'], 40], ['Prednisolone', 'Hormone', ['5mg', '10mg'], 40],
  ['Heparin Injection', 'Anticoagulant', ['5000 IU'], 30], ['Enoxaparin Injection', 'Anticoagulant', ['40mg', '60mg'], 30],
  ['Apixaban', 'Anticoagulant', ['2.5mg', '5mg'], 40], ['Clopidogrel', 'Anticoagulant', ['75mg'], 60],
  ['Loratadine', 'Antihistamine', ['10mg'], 40], ['Fexofenadine', 'Antihistamine', ['120mg', '180mg'], 40],
  ['Paracetamol', 'Analgesic', ['500mg', '650mg'], 150], ['Ibuprofen', 'Analgesic', ['200mg', '400mg'], 100],
  ['Diclofenac', 'Analgesic', ['50mg'], 60], ['Tramadol', 'Analgesic', ['50mg'], 30],
  ['Morphine Injection', 'Analgesic', ['10mg/ml'], 10], ['Sertraline', 'Psychiatric', ['50mg', '100mg'], 40],
  ['Escitalopram', 'Psychiatric', ['10mg'], 40], ['Quetiapine', 'Psychiatric', ['25mg', '100mg'], 30],
  ['Levetiracetam', 'Neurology', ['500mg'], 40], ['Gabapentin', 'Neurology', ['300mg'], 40],
  ['Folic Acid', 'Supplements', ['5mg'], 60], ['Ferrous Sulfate', 'Supplements', ['200mg'], 60],
  ['Calcium + Vitamin D3', 'Supplements', ['500mg'], 60], ['Vitamin B12 Injection', 'Supplements', ['1000mcg'], 20],
  ['Normal Saline', 'IV Fluids', ['500ml', '1000ml'], 80], ['Ringer Lactate', 'IV Fluids', ['500ml'], 60],
  ['Dextrose 5%', 'IV Fluids', ['500ml'], 60], ['Lidocaine Injection', 'Anaesthetic', ['1%', '2%'], 20],
  ['Hydrocortisone Cream', 'Dermatology', ['1%'], 20], ['Mupirocin Ointment', 'Dermatology', ['2%'], 20],
];
const MAKERS = ['Cipla', 'Sun Pharma', 'Pfizer', 'Teva', 'Mylan', "Dr. Reddy's", 'Lupin', 'Zydus', 'Abbott', 'GSK'];

const unit = seeded;

const generated: Medicine[] = FORMULARY.flatMap(([name, category, strengths, reorder]) =>
  strengths.flatMap(strength => MAKERS.slice(0, 1 + Math.floor(unit(name + strength) * 3)).map(maker => {
    const key = `${name}|${strength}|${maker}`;
    const r = unit(key);
    // ~3% out, ~5% low, ~1.5% expired on the shelf; the rest healthy.
    const stock = r < 0.03 ? 0 : r < 0.08 ? Math.max(1, Math.floor(reorder * unit(key + 's'))) : reorder + Math.floor(unit(key + 'q') * reorder * 5);
    const expiry = r > 0.985 ? -Math.ceil(unit(key + 'x') * 30) : 60 + Math.floor(unit(key + 'e') * 900);
    return {
      id: '',
      name: `${name} ${strength}`,
      category,
      stock,
      unitPrice: Math.round((2 + unit(key + 'p') * 60) * 100) / 100,
      expiryDate: inDays(expiry),
      manufacturer: maker,
      description: `${name} ${strength} — ${category.toLowerCase()}`,
      reorderLevel: reorder,
    };
  })),
).map((m, i) => ({ ...m, id: `M${String(i + 11).padStart(3, '0')}` }));

export const medicines: Medicine[] = [...handwritten, ...generated];
