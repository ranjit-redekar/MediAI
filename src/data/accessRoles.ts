import type { AccessRole, RoleId } from '../types/access';
import type { AIAction } from '../types/aiActions';
import { avatarFor } from '../utils/avatar';

/**
 * Every nav id the admin sidebar knows about. Roles opt in to a subset — the
 * goal is that nobody is asked to scan past thirteen items to reach the four
 * that belong to their job.
 */
export const ALL_NAV_IDS = [
  'dashboard', 'patients', 'doctors', 'appointments', 'journey', 'ai-insights',
  'staff', 'billing', 'pharmacy', 'laboratory', 'reports', 'settings',
] as const;

export const ACCESS_ROLES: AccessRole[] = [
  {
    id: 'admin',
    name: 'Administrator',
    persona: 'Runs the hospital — sees every module and every queue.',
    shell: 'admin',
    home: '/',
    navIds: [...ALL_NAV_IDS],
    routes: ['/'],
    // Sees clinical drafts but cannot sign them — running the hospital is not prescribing.
    actionKinds: ['appointment', 'referral', 'lab', 'outreach', 'education'],
    accent: { text: 'text-indigo-300', bg: 'bg-indigo-500/15', ring: 'ring-indigo-500/40' },
    credentials: { username: 'admin@mediai.com', password: 'Admin@123' },
    demoUser: { name: 'Dr. Admin', email: 'admin@mediai.com', avatar: avatarFor('Dr. Admin') },
  },
  {
    id: 'doctor',
    name: 'Doctor',
    persona: 'Attending physician — rounds, consults, and prescribing authority.',
    shell: 'admin',
    home: '/',
    navIds: ['dashboard', 'patients', 'appointments', 'journey', 'ai-insights', 'laboratory', 'settings'],
    routes: ['/', '/patients', '/appointments', '/journey', '/ai-insights', '/laboratory', '/settings'],
    // The only role that may sign off medication drafts.
    actionKinds: ['appointment', 'referral', 'lab', 'medication', 'monitoring', 'outreach', 'education'],
    accent: { text: 'text-sky-300', bg: 'bg-sky-500/15', ring: 'ring-sky-500/40' },
    doctorId: 'D002',
    credentials: { username: 'doctor@mediai.com', password: 'Doctor@123' },
    demoUser: { name: 'Dr. Maria Garcia', email: 'm.garcia@hospital.com', avatar: avatarFor('Dr. Maria Garcia', 'Female') },
  },
  {
    id: 'assistant-doctor',
    name: 'Assistant Doctor',
    persona: 'Resident — full clinical view, but prescribing goes to a supervising doctor.',
    shell: 'admin',
    home: '/',
    navIds: ['dashboard', 'patients', 'appointments', 'journey', 'ai-insights', 'laboratory', 'settings'],
    routes: ['/', '/patients', '/appointments', '/journey', '/ai-insights', '/laboratory', '/settings'],
    // Deliberately excludes 'medication' — drafts route to the attending instead.
    actionKinds: ['appointment', 'referral', 'lab', 'monitoring', 'outreach', 'education'],
    accent: { text: 'text-cyan-300', bg: 'bg-cyan-500/15', ring: 'ring-cyan-500/40' },
    doctorId: 'D001',
    credentials: { username: 'assistant@mediai.com', password: 'Assist@123' },
    demoUser: { name: 'Dr. Arjun Mehta', email: 'a.mehta@hospital.com', avatar: avatarFor('Dr. Arjun Mehta', 'Male') },
  },
  {
    id: 'nurse',
    name: 'Nurse',
    persona: 'Ward nursing — observations, care plans, and patient prep.',
    shell: 'admin',
    home: '/',
    navIds: ['dashboard', 'patients', 'appointments', 'journey', 'laboratory', 'settings'],
    routes: ['/', '/patients', '/appointments', '/journey', '/laboratory', '/settings'],
    // Monitoring changes are a clinician decision; nurses see them, the ward doctor signs.
    actionKinds: ['outreach', 'education', 'appointment'],
    accent: { text: 'text-rose-300', bg: 'bg-rose-500/15', ring: 'ring-rose-500/40' },
    credentials: { username: 'nurse@mediai.com', password: 'Nurse@123' },
    demoUser: { name: 'Priya Nair', email: 'p.nair@hospital.com', avatar: avatarFor('Priya Nair', 'Female') },
  },
  {
    id: 'pharmacist',
    name: 'Pharmacist',
    persona: 'Dispensing and stock — reviews medication orders and supply risk.',
    shell: 'admin',
    home: '/pharmacy',
    // Today is where prescriptions reach the store, so dispensing happens there.
    navIds: ['dashboard', 'journey', 'pharmacy', 'patients', 'settings'],
    routes: ['/', '/journey', '/pharmacy', '/patients', '/settings'],
    // Stock work only: pharmacists dispense what a prescriber signed; they never sign the order itself.
    actionKinds: ['stock'],
    accent: { text: 'text-violet-300', bg: 'bg-violet-500/15', ring: 'ring-violet-500/40' },
    credentials: { username: 'pharmacist@mediai.com', password: 'Pharma@123' },
    demoUser: { name: 'Sanjay Rao', email: 's.rao@hospital.com', avatar: avatarFor('Sanjay Rao', 'Male') },
  },
  {
    id: 'lab-technician',
    name: 'Lab Technician',
    persona: 'Runs the lab queue — collections, processing, and result release.',
    shell: 'admin',
    home: '/laboratory',
    navIds: ['dashboard', 'laboratory', 'patients', 'settings'],
    routes: ['/', '/laboratory', '/patients', '/settings'],
    actionKinds: ['lab'],
    accent: { text: 'text-teal-300', bg: 'bg-teal-500/15', ring: 'ring-teal-500/40' },
    credentials: { username: 'lab@mediai.com', password: 'Lab@123' },
    demoUser: { name: 'Kavita Iyer', email: 'k.iyer@hospital.com', avatar: avatarFor('Kavita Iyer', 'Female') },
  },
  {
    id: 'receptionist',
    name: 'Receptionist',
    persona: 'Front desk — arrivals, bookings, and payment collection.',
    shell: 'admin',
    home: '/appointments',
    // Reception checks patients in, so the Today board is theirs too.
    navIds: ['dashboard', 'journey', 'appointments', 'patients', 'billing', 'settings'],
    routes: ['/', '/journey', '/appointments', '/patients', '/billing', '/settings'],
    actionKinds: ['appointment', 'referral', 'outreach'],
    accent: { text: 'text-amber-300', bg: 'bg-amber-500/15', ring: 'ring-amber-500/40' },
    credentials: { username: 'reception@mediai.com', password: 'Front@123' },
    demoUser: { name: 'Neha Kulkarni', email: 'n.kulkarni@hospital.com', avatar: avatarFor('Neha Kulkarni', 'Female') },
  },
  {
    id: 'patient',
    name: 'Patient',
    persona: 'Sees only their own care — visits, results, prescriptions, and bills.',
    shell: 'patient',
    home: '/portal',
    navIds: [],
    routes: ['/portal'],
    actionKinds: [],
    accent: { text: 'text-emerald-300', bg: 'bg-emerald-500/15', ring: 'ring-emerald-500/40' },
    credentials: { username: 'patient@mediai.com', password: 'Patient@123' },
    demoUser: { name: 'Sarah Johnson', email: 'sarah.j@email.com', avatar: avatarFor('Sarah Johnson', 'Female') },
  },
];

/** Roles with clinical authority to sign medication and monitoring drafts. */
const CLINICAL_SIGNERS = new Set<RoleId>(['doctor', 'assistant-doctor']);

/**
 * Whether this role may approve this draft. The clinician check backstops the
 * role table: a clinical draft never becomes actionable for a non-clinician,
 * even if someone later adds its kind to their role.
 */
export const ownsAction = (role: AccessRole, action: AIAction): boolean =>
  role.actionKinds.includes(action.kind) && (!action.requiresClinician || CLINICAL_SIGNERS.has(role.id));

export const getRole = (id: RoleId): AccessRole =>
  ACCESS_ROLES.find(r => r.id === id) ?? ACCESS_ROLES[0];

/** Staff roles only — used by the login picker's primary group. */
export const STAFF_ROLES = ACCESS_ROLES.filter(r => r.shell === 'admin');

/**
 * True when a role may open a path. Longest-prefix match so `/patients/P001`
 * is allowed by `/patients` but `/patientsX` is not.
 */
export function canAccess(role: AccessRole, pathname: string): boolean {
  if (role.routes.includes('/') && role.id === 'admin') return true;
  return role.routes.some(route => {
    if (route === '/') return pathname === '/';
    return pathname === route || pathname.startsWith(`${route}/`);
  });
}
