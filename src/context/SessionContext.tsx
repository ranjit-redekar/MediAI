import React, { createContext, useCallback, useContext, useMemo, useState } from 'react';
import { ACCESS_ROLES, getRole, canAccess } from '../data/accessRoles';
import type { AccessRole, RoleId } from '../types/access';

const STORAGE_KEY = 'mediai-session';
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

interface SessionContextValue {
  role: AccessRole;
  roles: AccessRole[];
  /** The stored sign-in, or null when nobody is signed in on this browser. */
  session: StoredSession | null;
  /** False until someone signs in — a first visit lands on the login screen. */
  isAuthenticated: boolean;
  /** Signs in and persists the session. Username defaults to the role's own. */
  signInAs: (id: RoleId, username?: string) => void;
  signOut: () => void;
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

export const SessionProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [session, setSession] = useState<StoredSession | null>(readStoredSession);

  const signInAs = useCallback((id: RoleId, username?: string) => {
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

  const signOut = useCallback(() => {
    try { localStorage.removeItem(STORAGE_KEY); } catch { /* ignore */ }
    setSession(null);
  }, []);

  // Signed-out consumers still render (the login screen previews a workspace),
  // so `role` stays non-null and falls back to the admin shape.
  const role = getRole(session?.roleId ?? 'admin');

  const value = useMemo<SessionContextValue>(() => ({
    role,
    roles: ACCESS_ROLES,
    session,
    isAuthenticated: session !== null,
    signInAs,
    signOut,
    can: (pathname: string) => canAccess(role, pathname),
    canSeeNav: (navId: string) => role.navIds.includes(navId),
  }), [role, session, signInAs, signOut]);

  return <SessionContext.Provider value={value}>{children}</SessionContext.Provider>;
};

export const useSession = () => {
  const ctx = useContext(SessionContext);
  if (!ctx) throw new Error('useSession must be used within a SessionProvider');
  return ctx;
};
