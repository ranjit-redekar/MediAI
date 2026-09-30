import {
  LayoutDashboard, Users, UserRound, Calendar, Route, UserCog, CreditCard,
  Pill, FlaskConical, FileText, Settings, Brain,
} from 'lucide-react';
import type { LucideIcon } from 'lucide-react';

export interface NavItem {
  id: string;
  label: string;
  icon: LucideIcon;
  path: string;
  isAI?: boolean;
}

export const clinicalNav: NavItem[] = [
  { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard, path: '/' },
  { id: 'patients', label: 'Patients', icon: Users, path: '/patients' },
  { id: 'doctors', label: 'Doctors', icon: UserRound, path: '/doctors' },
  // Two screens, two jobs: Today runs the day in the building; Appointments books it.
  { id: 'journey', label: 'Today', icon: Route, path: '/journey' },
  { id: 'appointments', label: 'Appointments', icon: Calendar, path: '/appointments' },
  { id: 'ai-insights', label: 'AI Insights', icon: Brain, path: '/ai-insights', isAI: true },
];

export const operationalNav: NavItem[] = [
  { id: 'staff', label: 'Staff Management', icon: UserCog, path: '/staff' },
  { id: 'billing', label: 'Billing', icon: CreditCard, path: '/billing' },
  { id: 'pharmacy', label: 'Pharmacy', icon: Pill, path: '/pharmacy' },
  { id: 'laboratory', label: 'Laboratory', icon: FlaskConical, path: '/laboratory' },
  { id: 'reports', label: 'Reports', icon: FileText, path: '/reports' },
  { id: 'settings', label: 'Settings', icon: Settings, path: '/settings' },
];

export const navSections = [
  { id: 'clinical', title: 'Clinical Operations', items: clinicalNav },
  { id: 'ops', title: 'Administrative', items: operationalNav },
];

/** Flat lookup used by the login preview and anywhere a nav id needs a label. */
export const NAV_BY_ID: Record<string, NavItem> = Object.fromEntries(
  [...clinicalNav, ...operationalNav].map(item => [item.id, item])
);
