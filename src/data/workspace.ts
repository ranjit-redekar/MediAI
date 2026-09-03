/**
 * The tenant a sign-up created, in the same `mediai-` namespace the session
 * uses — so signing out sweeps it along with everything else.
 */
const KEY = 'mediai-workspace';

export interface Workspace {
  name: string;
  /** Subdomain the tenant would live on: `acme.mediai.app`. */
  slug: string;
  facilityType: string;
  teamSize: string;
  planId: string;
  adminName: string;
  adminEmail: string;
  createdAt: string;
}

export const slugify = (name: string) =>
  name.toLowerCase().trim().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');

export function readWorkspace(): Workspace | null {
  try {
    const raw = localStorage.getItem(KEY);
    return raw ? (JSON.parse(raw) as Workspace) : null;
  } catch {
    return null;
  }
}

export function saveWorkspace(workspace: Workspace) {
  try { localStorage.setItem(KEY, JSON.stringify(workspace)); } catch { /* storage blocked */ }
}
