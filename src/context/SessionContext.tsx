import React, { createContext, useCallback, useContext, useMemo, useState } from 'react';
import { ACCESS_ROLES, getRole, canAccess } from '../data/accessRoles';
import type { AccessRole, RoleId } from '../types/access';

const STORAGE_KEY = 'mediai-role';

interface SessionContextValue {
  role: AccessRole;
  roles: AccessRole[];
  /** Switches the active role and persists it across reloads. */
  signInAs: (id: RoleId) => void;
  signOut: () => void;
  /** True when the signed-in role may open this path. */
  can: (pathname: string) => boolean;
  /** True when this role may see a given sidebar entry. */
  canSeeNav: (navId: string) => boolean;
}

const SessionContext = createContext<SessionContextValue | undefined>(undefined);

function readStoredRole(): RoleId {
  if (typeof window === 'undefined') return 'admin';
  try {
    const saved = localStorage.getItem(STORAGE_KEY) as RoleId | null;
    return saved && ACCESS_ROLES.some(r => r.id === saved) ? saved : 'admin';
  } catch {
    return 'admin';
  }
}

export const SessionProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [roleId, setRoleId] = useState<RoleId>(readStoredRole);

  const signInAs = useCallback((id: RoleId) => {
    setRoleId(id);
    try { localStorage.setItem(STORAGE_KEY, id); } catch { /* ignore */ }
  }, []);

  const signOut = useCallback(() => {
    try { localStorage.removeItem(STORAGE_KEY); } catch { /* ignore */ }
    setRoleId('admin');
  }, []);

  const role = getRole(roleId);

  const value = useMemo<SessionContextValue>(() => ({
    role,
    roles: ACCESS_ROLES,
    signInAs,
    signOut,
    can: (pathname: string) => canAccess(role, pathname),
    canSeeNav: (navId: string) => role.navIds.includes(navId),
  }), [role, signInAs, signOut]);

  return <SessionContext.Provider value={value}>{children}</SessionContext.Provider>;
};

export const useSession = () => {
  const ctx = useContext(SessionContext);
  if (!ctx) throw new Error('useSession must be used within a SessionProvider');
  return ctx;
};
