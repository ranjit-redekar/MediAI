import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { ACCESS_ROLES, getRole, canAccess } from '../data/accessRoles';
import { DEMO_WORKSPACE, readWorkspace, trialEndDate, writeWorkspace } from '../data/workspace';
import type { Invite, Workspace } from '../data/workspace';
import { isDemo, supabase } from '../lib/supabase';
import type { AccessRole, RoleId } from '../types/access';

const STORAGE_KEY = 'mediai-session';
/** Namespace for every key this app writes, so sign-out can sweep them. */
const APP_KEY_PREFIX = 'mediai-';
/** A device preference, not a user detail — deliberately survives sign-out. */
const THEME_KEY = 'mediai-theme';
/** Pre-session builds stored a bare role id here; it is not a sign-in record. */
const LEGACY_ROLE_KEY = 'mediai-role';

/** What gets persisted so a reload doesn't ask you to sign in again. */
export interface StoredSession {
  roleId: RoleId;
  /** The username actually submitted — the picker is only a shortcut. */
  username: string;
  /** ISO timestamp, so the account menu can show when this session started. */
  signedInAt: string;
}

export interface SignUpInput {
  workspaceName: string;
  slug: string;
  facilityType: string;
  teamSize: string;
  planId: string;
  fullName: string;
  email: string;
  password: string;
  invites: Invite[];
}

type WorkspaceFields = Partial<Pick<Workspace, 'name' | 'facilityType' | 'teamSize' | 'planId'>>;

/** A signed-in production user and the hospital they belong to. */
interface Member {
  userId: string;
  email: string;
  roleId: RoleId;
  fullName: string;
  workspaceId: string;
  workspace: Workspace;
  signedInAt: string;
}

interface SessionContextValue {
  /** True when no backend is configured — mock data and the role picker. */
  isDemo: boolean;
  /** True while a production session is being restored; guards wait on it. */
  isLoading: boolean;
  role: AccessRole;
  roles: AccessRole[];
  /** The stored sign-in, or null when nobody is signed in on this browser. */
  session: StoredSession | null;
  /** False until someone signs in — a first visit lands on the login screen. */
  isAuthenticated: boolean;
  /** Signs in and persists the session. Username defaults to the role's own. */
  signInAs: (id: RoleId, username?: string) => void;
  signOut: () => void;
  /** The hospital this browser is signed in to — the demo one until someone registers. */
  workspace: Workspace;
  /** Production sign-in. Demo sign-in stays on `signInAs`. */
  signIn: (email: string, password: string) => Promise<{ error: string } | { role: AccessRole }>;
  /** Creates the hospital, its admin and the first invites. */
  signUp: (input: SignUpInput) => Promise<{ error?: string; needsConfirmation?: boolean }>;
  /** Each resolves to an error message, or null on success. */
  updateWorkspace: (fields: WorkspaceFields) => Promise<string | null>;
  addInvite: (invite: Invite) => Promise<string | null>;
  revokeInvite: (email: string) => Promise<string | null>;
  /** True when the signed-in role may open this path. */
  can: (pathname: string) => boolean;
  /** True when this role may see a given sidebar entry. */
  canSeeNav: (navId: string) => boolean;
}

const SessionContext = createContext<SessionContextValue | undefined>(undefined);

/**
 * Null means "nobody has signed in on this browser yet", which is different
 * from "signed in as admin" — without that distinction a first visit would
 * drop straight into the dashboard instead of the login screen.
 */
function readStoredSession(): StoredSession | null {
  if (typeof window === 'undefined') return null;
  try {
    // A leftover role id from an older build is not proof of a sign-in, so
    // clear it and let the login screen do its job once.
    localStorage.removeItem(LEGACY_ROLE_KEY);

    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;

    const parsed = JSON.parse(raw) as Partial<StoredSession>;
    const role = ACCESS_ROLES.find(r => r.id === parsed.roleId);
    if (!role) return null;

    return {
      roleId: role.id,
      username: parsed.username || role.credentials.username,
      signedInAt: parsed.signedInAt || new Date().toISOString(),
    };
  } catch {
    // Corrupt JSON or storage blocked entirely — treat as signed out.
    return null;
  }
}

/** Initials on a coloured tile — no third-party avatar service sees a real user's email. */
function initialsAvatar(name: string) {
  const initials = name.split(/\s+/).filter(Boolean).slice(0, 2).map(w => w[0]!.toUpperCase()).join('') || '?';
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="96" height="96"><rect width="96" height="96" fill="#6366f1"/><text x="50%" y="50%" dy=".35em" text-anchor="middle" font-family="system-ui,sans-serif" font-size="38" font-weight="600" fill="#fff">${initials}</text></svg>`;
  return `data:image/svg+xml,${encodeURIComponent(svg)}`;
}

interface WorkspaceRow {
  id: string; name: string; slug: string; facility_type: string; team_size: string;
  plan_id: string; trial_ends_at: string | null; created_at: string;
}

async function loadMember(userId: string, email: string): Promise<Member | null> {
  const client = supabase!;
  // ponytail: first membership only — add a workspace switcher when one person works for two hospitals.
  const { data, error } = await client
    .from('workspace_members')
    .select('role, full_name, workspace:workspaces(id, name, slug, facility_type, team_size, plan_id, trial_ends_at, created_at)')
    .eq('user_id', userId)
    .limit(1)
    .maybeSingle();
  if (error) throw error;
  const ws = data?.workspace as unknown as WorkspaceRow | null;
  if (!data || !ws) return null;

  const roleId = data.role as RoleId;
  // Row-level security returns no invites to non-admins, which is the right answer.
  const invites = await client.from('invites').select('email, role').eq('workspace_id', ws.id);
  if (invites.error) throw invites.error;

  const fullName = (data.full_name as string) || email;
  return {
    userId,
    email,
    roleId,
    fullName,
    workspaceId: ws.id,
    signedInAt: new Date().toISOString(),
    workspace: {
      name: ws.name,
      slug: ws.slug,
      facilityType: ws.facility_type,
      teamSize: ws.team_size,
      planId: ws.plan_id,
      trialEndsAt: ws.trial_ends_at,
      adminName: roleId === 'admin' ? fullName : '',
      adminEmail: roleId === 'admin' ? email : '',
      invites: (invites.data ?? []).map(i => ({ email: i.email as string, roleId: i.role as RoleId })),
      createdAt: ws.created_at,
    },
  };
}

export const SessionProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [session, setSession] = useState<StoredSession | null>(readStoredSession);
  const [demoWorkspace, setDemoWorkspace] = useState<Workspace>(() => readWorkspace() ?? DEMO_WORKSPACE);

  // Production only. `undefined` = still restoring the stored Supabase session.
  const [authUser, setAuthUser] = useState<{ id: string; email: string } | null | undefined>(isDemo ? null : undefined);
  const [loaded, setLoaded] = useState<{ userId: string; member: Member | null } | null>(null);

  useEffect(() => {
    if (!supabase) return;
    // Fires INITIAL_SESSION on subscribe, then on every sign-in, sign-out and token refresh.
    const { data } = supabase.auth.onAuthStateChange((_event, s) => {
      const next = s ? { id: s.user.id, email: s.user.email ?? '' } : null;
      // A token refresh is the same person — keep the object so nothing refetches.
      setAuthUser(prev => (prev?.id === next?.id && prev !== undefined ? prev : next));
    });
    return () => data.subscription.unsubscribe();
  }, []);

  useEffect(() => {
    if (!authUser || loaded?.userId === authUser.id) return;
    let cancelled = false;
    loadMember(authUser.id, authUser.email)
      .catch(err => { console.error('Could not load workspace membership', err); return null; })
      .then(member => { if (!cancelled) setLoaded({ userId: authUser.id, member }); });
    return () => { cancelled = true; };
  }, [authUser, loaded]);

  const member = authUser && loaded?.userId === authUser.id ? loaded.member : null;
  const isLoading = !isDemo && (authUser === undefined || (authUser !== null && loaded?.userId !== authUser.id));

  const workspace = isDemo ? demoWorkspace : member?.workspace ?? DEMO_WORKSPACE;

  const saveDemoWorkspace = useCallback((next: Workspace) => {
    setDemoWorkspace(next);
    writeWorkspace(next);
  }, []);

  /** Applies a successful production write to what's on screen without refetching. */
  const patchMember = useCallback((fn: (ws: Workspace) => Workspace) => {
    setLoaded(prev => (prev?.member ? { ...prev, member: { ...prev.member, workspace: fn(prev.member.workspace) } } : prev));
  }, []);


  const signInAs = useCallback((id: RoleId, username?: string) => {
    // Picking a role is a demo shortcut — in production identity comes from Supabase only.
    if (!isDemo) return;
    const role = ACCESS_ROLES.find(r => r.id === id);
    if (!role) return;

    const next: StoredSession = {
      roleId: role.id,
      username: username?.trim() || role.credentials.username,
      signedInAt: new Date().toISOString(),
    };
    setSession(next);
    try { localStorage.setItem(STORAGE_KEY, JSON.stringify(next)); } catch { /* ignore */ }
  }, []);

  /**
   * Clears everything the previous person did, not just the session record.
   *
   * The data providers (patients, appointments, AI actions, staff, journey)
   * hold their mutations in React state above the router and never unmount, so
   * dropping the storage key alone would leave the next person looking at the
   * last person's approved actions and edited records. A full document load is
   * the one thing that resets all of it — and it keeps working when another
   * provider is added later, which a hand-written list of resets would not.
   */
  const signOut = useCallback(async () => {
    // Revokes the refresh token server-side; Supabase clears its own stored session.
    if (supabase) await supabase.auth.signOut().catch(() => undefined);

    try {
      // Every key this app owns, except the device-level theme preference.
      Object.keys(localStorage)
        .filter(key => key.startsWith(APP_KEY_PREFIX) && key !== THEME_KEY)
        .forEach(key => localStorage.removeItem(key));
    } catch { /* storage blocked — the reload below still clears memory */ }

    setSession(null);

    if (typeof window !== 'undefined') {
      // BASE_URL carries the GitHub Pages sub-path and always ends in a slash.
      window.location.assign(`${import.meta.env.BASE_URL}login`);
    }
  }, []);

  // Signed-out consumers still render (the login screen previews a workspace),
  // so `role` stays non-null and falls back to the admin shape.
  const activeSession = useMemo<StoredSession | null>(() => {
    if (isDemo) return session;
    return member ? { roleId: member.roleId, username: member.email, signedInAt: member.signedInAt } : null;
  }, [session, member]);

  const baseRole = getRole(activeSession?.roleId ?? 'admin');

  // Screens greet `role.demoUser`. In production that is the real person; in the
  // demo, whoever registered the hospital replaces the admin persona.
  const role = useMemo<AccessRole>(() => {
    if (member) {
      return { ...baseRole, demoUser: { name: member.fullName, email: member.email, avatar: initialsAvatar(member.fullName) } };
    }
    const isOwner = isDemo && baseRole.id === 'admin'
      && session?.username.toLowerCase() === demoWorkspace.adminEmail.toLowerCase();
    return isOwner
      ? { ...baseRole, demoUser: { ...baseRole.demoUser, name: demoWorkspace.adminName, email: demoWorkspace.adminEmail } }
      : baseRole;
  }, [baseRole, member, session, demoWorkspace]);

  const signIn = useCallback(async (email: string, password: string) => {
    if (!supabase) return { error: 'Sign-in is not configured.' };
    const { data, error } = await supabase.auth.signInWithPassword({ email: email.trim(), password });
    if (error) return { error: error.message };

    const found = await loadMember(data.user.id, data.user.email ?? email.trim()).catch(() => null);
    if (!found) {
      await supabase.auth.signOut();
      return { error: 'This account isn’t part of a hospital workspace yet.' };
    }
    setLoaded({ userId: found.userId, member: found });
    return { role: getRole(found.roleId) };
  }, []);

  const signUp = useCallback(async (input: SignUpInput) => {
    if (!supabase) {
      saveDemoWorkspace({
        name: input.workspaceName,
        slug: input.slug,
        facilityType: input.facilityType,
        teamSize: input.teamSize,
        planId: input.planId,
        trialEndsAt: trialEndDate(),
        adminName: input.fullName,
        adminEmail: input.email,
        invites: input.invites,
        createdAt: new Date().toISOString(),
      });
      signInAs('admin', input.email);
      return {};
    }

    // The database trigger turns this metadata into the workspace, the admin
    // membership and the invites in one transaction (see supabase/migrations).
    const { data, error } = await supabase.auth.signUp({
      email: input.email,
      password: input.password,
      options: {
        emailRedirectTo: `${window.location.origin}${import.meta.env.BASE_URL}`,
        data: {
          full_name: input.fullName,
          workspace_name: input.workspaceName,
          workspace_slug: input.slug,
          facility_type: input.facilityType,
          team_size: input.teamSize,
          plan_id: input.planId,
          invites: input.invites.map(i => ({ email: i.email, role: i.roleId })),
        },
      },
    });
    if (error) return { error: error.message };
    return { needsConfirmation: !data.session };
  }, [saveDemoWorkspace, signInAs]);

  const updateWorkspace = useCallback(async (fields: WorkspaceFields) => {
    if (!supabase) {
      saveDemoWorkspace({ ...demoWorkspace, ...fields });
      return null;
    }
    if (!member) return 'You’re signed out.';
    // The database only lets clients edit descriptive columns; the plan moves with billing.
    if (fields.planId !== undefined) return 'Plan changes go through billing, which isn’t connected yet.';

    const { error } = await supabase
      .from('workspaces')
      .update({ name: fields.name, facility_type: fields.facilityType, team_size: fields.teamSize })
      .eq('id', member.workspaceId);
    if (error) return error.message;
    patchMember(ws => ({ ...ws, ...fields }));
    return null;
  }, [demoWorkspace, member, saveDemoWorkspace, patchMember]);

  const addInvite = useCallback(async (invite: Invite) => {
    const email = invite.email.trim().toLowerCase();
    if (workspace.invites.some(i => i.email === email)) return `${email} already has a pending invite.`;

    if (!supabase) {
      saveDemoWorkspace({ ...demoWorkspace, invites: [...demoWorkspace.invites, { ...invite, email }] });
      return null;
    }
    if (!member) return 'You’re signed out.';
    const { error } = await supabase
      .from('invites')
      .insert({ workspace_id: member.workspaceId, email, role: invite.roleId });
    if (error) return error.code === '23505' ? `${email} already has a pending invite.` : error.message;
    patchMember(ws => ({ ...ws, invites: [...ws.invites, { ...invite, email }] }));
    return null;
  }, [workspace, demoWorkspace, member, saveDemoWorkspace, patchMember]);

  const revokeInvite = useCallback(async (email: string) => {
    if (!supabase) {
      saveDemoWorkspace({ ...demoWorkspace, invites: demoWorkspace.invites.filter(i => i.email !== email) });
      return null;
    }
    if (!member) return 'You’re signed out.';
    const { error } = await supabase
      .from('invites')
      .delete()
      .eq('workspace_id', member.workspaceId)
      .eq('email', email);
    if (error) return error.message;
    patchMember(ws => ({ ...ws, invites: ws.invites.filter(i => i.email !== email) }));
    return null;
  }, [demoWorkspace, member, saveDemoWorkspace, patchMember]);

  const value = useMemo<SessionContextValue>(() => ({
    isDemo,
    isLoading,
    role,
    roles: ACCESS_ROLES,
    session: activeSession,
    isAuthenticated: activeSession !== null,
    signInAs,
    signOut: () => { void signOut(); },
    workspace,
    signIn,
    signUp,
    updateWorkspace,
    addInvite,
    revokeInvite,
    can: (pathname: string) => canAccess(role, pathname),
    canSeeNav: (navId: string) => role.navIds.includes(navId),
  }), [isLoading, role, activeSession, signInAs, signOut, workspace, signIn, signUp, updateWorkspace, addInvite, revokeInvite]);

  return <SessionContext.Provider value={value}>{children}</SessionContext.Provider>;
};

export const useSession = () => {
  const ctx = useContext(SessionContext);
  if (!ctx) throw new Error('useSession must be used within a SessionProvider');
  return ctx;
};
