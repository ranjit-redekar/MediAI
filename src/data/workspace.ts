import type { RoleId } from '../types/access';

/**
 * The tenant a sign-up created, in the same `mediai-` namespace the session
 * uses — so signing out sweeps it along with everything else.
 */
const KEY = 'mediai-workspace';
const TRIAL_DAYS = 14;

export interface Invite {
  email: string;
  roleId: RoleId;
}

export interface Workspace {
  name: string;
  /** Subdomain the tenant would live on: `acme.mediai.app`. */
  slug: string;
  facilityType: string;
  teamSize: string;
  planId: string;
  /** Null once the hospital is on a paid plan. */
  trialEndsAt: string | null;
  adminName: string;
  adminEmail: string;
  invites: Invite[];
  createdAt: string;
}

export const PLANS = [
  { id: 'starter', name: 'Starter', price: '$99', per: '/month', seats: 25, blurb: 'Up to 25 staff, 2 AI agents, core scheduling and records.' },
  { id: 'growth', name: 'Growth', price: '$299', per: '/month', seats: 150, blurb: 'Up to 150 staff, every AI agent, billing, pharmacy and labs.' },
  { id: 'enterprise', name: 'Enterprise', price: 'Custom', per: '', seats: null, blurb: 'Unlimited staff, SSO, audit exports, dedicated onboarding.' },
] as const;

export const FACILITY_TYPES = [
  { value: 'hospital', label: 'Hospital' },
  { value: 'clinic', label: 'Multi-speciality clinic' },
  { value: 'diagnostic', label: 'Diagnostic centre' },
  { value: 'chain', label: 'Hospital group' },
];

export const TEAM_SIZES = [
  { value: '1-25', label: '1–25 staff' },
  { value: '26-150', label: '26–150 staff' },
  { value: '151-500', label: '151–500 staff' },
  { value: '500+', label: '500+ staff' },
];

/** Roles an administrator can invite — patients sign up through the portal. */
export const INVITABLE_ROLES: { value: RoleId; label: string }[] = [
  { value: 'doctor', label: 'Doctor' },
  { value: 'assistant-doctor', label: 'Assistant Doctor' },
  { value: 'nurse', label: 'Nurse' },
  { value: 'pharmacist', label: 'Pharmacist' },
  { value: 'lab-technician', label: 'Lab Technician' },
  { value: 'receptionist', label: 'Receptionist' },
];

/** What a demo sign-in sees until someone registers their own hospital. */
export const DEMO_WORKSPACE: Workspace = {
  name: 'MediAI General Hospital',
  slug: 'mediai-general',
  facilityType: 'hospital',
  teamSize: '26-150',
  planId: 'growth',
  trialEndsAt: null,
  adminName: 'Dr. Admin',
  adminEmail: 'admin@mediai.com',
  invites: [],
  createdAt: '2026-01-05T09:00:00.000Z',
};

export const getPlan = (id: string) => PLANS.find(p => p.id === id) ?? PLANS[1];

export const slugify = (name: string) =>
  name.toLowerCase().trim().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');

export const trialEndDate = (from = new Date()) =>
  new Date(from.getTime() + TRIAL_DAYS * 86_400_000).toISOString();

/** Whole days left, rounded up so the last afternoon still reads "1 day". */
export const trialDaysLeft = (trialEndsAt: string | null, now = new Date()) =>
  trialEndsAt ? Math.max(0, Math.ceil((new Date(trialEndsAt).getTime() - now.getTime()) / 86_400_000)) : null;

export function readWorkspace(): Workspace | null {
  try {
    const raw = localStorage.getItem(KEY);
    // Spread over the demo so a record from an older build still has every field.
    return raw ? { ...DEMO_WORKSPACE, ...(JSON.parse(raw) as Partial<Workspace>) } : null;
  } catch {
    return null;
  }
}

export function writeWorkspace(workspace: Workspace) {
  try { localStorage.setItem(KEY, JSON.stringify(workspace)); } catch { /* storage blocked */ }
}
