import type { AIActionKind } from './aiActions';

export type RoleId =
  | 'admin'
  | 'doctor'
  | 'assistant-doctor'
  | 'nurse'
  | 'pharmacist'
  | 'lab-technician'
  | 'receptionist'
  | 'patient';

/** Which app shell a role gets. Patients never see the admin chrome. */
export type ShellKind = 'admin' | 'patient';

export interface AccessRole {
  id: RoleId;
  name: string;
  /** One line describing what this person actually does all day. */
  persona: string;
  shell: ShellKind;
  /** Where this role lands after signing in. */
  home: string;
  /**
   * Sidebar entries this role sees, by nav id. Order follows the sidebar's own
   * ordering, not this list.
   */
  navIds: string[];
  /**
   * Route prefixes this role may open. Anything else renders a "not available
   * for your role" screen instead of a broken page.
   */
  routes: string[];
  /**
   * Kinds of AI-drafted action that land in this role's approval queue. This is
   * the point of the whole model: a pharmacist opens the app to three
   * medication drafts, not twenty-one items belonging to other people.
   */
  actionKinds: AIActionKind[];
  /** Tailwind classes for the role chip. */
  accent: { text: string; bg: string; ring: string };
  /**
   * Sign-in credentials for this role. Demo values only — there is no auth
   * behind them; the login screen matches against these strings so each role
   * has its own way in.
   */
  /**
   * Doctor this role's schedule belongs to. Set for clinicians so the dashboard
   * shows their own list; omitted for desk roles, which see the whole day.
   */
  doctorId?: string;
  credentials: { username: string; password: string };
  demoUser: { name: string; email: string; avatar: string };
}
