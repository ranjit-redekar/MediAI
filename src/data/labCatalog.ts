import type { TestResult } from '../types';

/**
 * The tests the lab runs, with what each measures. Ranges are adult reference
 * intervals; `critLow`/`critHigh` are the call-the-doctor limits. Flagging is
 * done here from these numbers, so nobody judges a range by eye at the bench.
 */
export interface LabParameter {
  name: string;
  unit: string;
  low: number;
  /** 999 means no upper limit. */
  high: number;
  critLow?: number;
  critHigh?: number;
}

export interface LabTestDefinition {
  name: string;
  category: string;
  /** Words in an order or AI draft that mean this test. */
  aliases: string[];
  params: LabParameter[];
}

export const LAB_CATALOG: LabTestDefinition[] = [
  { name: 'Complete Blood Count (CBC)', category: 'Hematology', aliases: ['cbc', 'blood count'], params: [
    { name: 'WBC', unit: 'K/uL', low: 4.5, high: 11, critLow: 2, critHigh: 30 },
    { name: 'Hemoglobin', unit: 'g/dL', low: 12, high: 17.5, critLow: 7, critHigh: 20 },
    { name: 'Platelets', unit: 'K/uL', low: 150, high: 400, critLow: 50, critHigh: 1000 },
  ] },
  { name: 'Basic Metabolic Panel', category: 'Biochemistry', aliases: ['metabolic', 'electrolytes', 'bmp', 'kidney function', 'renal'], params: [
    { name: 'Sodium', unit: 'mmol/L', low: 135, high: 145, critLow: 120, critHigh: 160 },
    { name: 'Potassium', unit: 'mmol/L', low: 3.5, high: 5.1, critLow: 2.8, critHigh: 6.2 },
    { name: 'Creatinine', unit: 'mg/dL', low: 0.6, high: 1.3, critHigh: 4 },
    { name: 'Glucose', unit: 'mg/dL', low: 70, high: 140, critLow: 40, critHigh: 500 },
  ] },
  { name: 'HbA1c', category: 'Biochemistry', aliases: ['hba1c', 'a1c'], params: [
    { name: 'HbA1c', unit: '%', low: 4, high: 5.6 },
  ] },
  { name: 'Glucose Challenge Test', category: 'Biochemistry', aliases: ['glucose screening', 'glucose challenge', 'gestational glucose'], params: [
    { name: 'Glucose (1 h)', unit: 'mg/dL', low: 0, high: 140, critLow: 40, critHigh: 500 },
  ] },
  { name: 'Lipid Panel', category: 'Biochemistry', aliases: ['lipid', 'cholesterol'], params: [
    { name: 'Total Cholesterol', unit: 'mg/dL', low: 0, high: 200 },
    { name: 'LDL', unit: 'mg/dL', low: 0, high: 100 },
    { name: 'HDL', unit: 'mg/dL', low: 40, high: 999 },
    { name: 'Triglycerides', unit: 'mg/dL', low: 0, high: 150 },
  ] },
  { name: 'Troponin I', category: 'Cardiac Markers', aliases: ['troponin'], params: [
    { name: 'Troponin I', unit: 'ng/mL', low: 0, high: 0.04, critHigh: 0.4 },
  ] },
  { name: 'INR', category: 'Coagulation', aliases: ['inr', 'coagulation', 'pt/inr'], params: [
    { name: 'INR', unit: '', low: 0.8, high: 1.2, critHigh: 5 },
  ] },
  { name: 'Thyroid Function Panel', category: 'Endocrinology', aliases: ['thyroid', 'tsh'], params: [
    { name: 'TSH', unit: 'mIU/L', low: 0.4, high: 4 },
    { name: 'Free T4', unit: 'ng/dL', low: 0.8, high: 1.8 },
  ] },
  { name: 'Liver Function Tests', category: 'Biochemistry', aliases: ['liver', 'lft'], params: [
    { name: 'ALT', unit: 'U/L', low: 7, high: 56 },
    { name: 'AST', unit: 'U/L', low: 10, high: 40 },
    { name: 'Bilirubin', unit: 'mg/dL', low: 0.1, high: 1.2, critHigh: 15 },
  ] },
  { name: 'C-Reactive Protein', category: 'Immunology', aliases: ['crp', 'c-reactive'], params: [
    { name: 'CRP', unit: 'mg/L', low: 0, high: 10 },
  ] },
];

export const testDefinition = (name: string) => LAB_CATALOG.find(t => t.name === name);

/** The catalogue test an order's wording refers to, if any ("lipid recheck" → Lipid Panel). */
export function matchTest(text: string): LabTestDefinition | undefined {
  const t = text.toLowerCase();
  return LAB_CATALOG.find(d => d.name.toLowerCase() === t || d.aliases.some(a => new RegExp(`\\b${a.replace(/[/]/g, '\\/')}\\b`).test(t)));
}

/** "< 0.04", "> 40", or "3.5–5.1": how the range reads on a report. */
export function rangeLabel(p: LabParameter): string {
  if (p.low === 0) return `< ${p.high}`;
  if (p.high >= 999) return `> ${p.low}`; // no upper limit
  return `${p.low}–${p.high}`;
}

/** Flags one value against its parameter. Critical beats abnormal. */
export function flagValue(p: LabParameter, value: number): TestResult['status'] {
  if ((p.critLow !== undefined && value < p.critLow) || (p.critHigh !== undefined && value > p.critHigh)) return 'Critical';
  if (value < p.low || value > p.high) return 'Abnormal';
  return 'Normal';
}

/** Results for a test from raw entries; blanks and non-numbers are rejected by the caller. */
export function resultsFor(def: LabTestDefinition, values: Record<string, number>): TestResult[] {
  return def.params.map(p => ({
    parameter: p.name,
    value: String(values[p.name]),
    unit: p.unit,
    referenceRange: rangeLabel(p),
    status: flagValue(p, values[p.name]),
  }));
}
