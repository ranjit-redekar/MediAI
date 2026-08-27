import React, { createContext, useCallback, useContext, useMemo, useState } from 'react';
import { buildAIActions } from '../data/aiActions';
import { useSession } from './SessionContext';
import type { AIAction, AIActionStatus } from '../types/aiActions';

interface AIActionsContextValue {
  /** Every drafted action in the hospital, regardless of role. */
  allActions: AIAction[];
  statusOf: (id: string) => AIActionStatus;
  /** Pending actions this role is responsible for. */
  pending: AIAction[];
  approved: AIAction[];
  /** Pending actions belonging to other roles — shown as context, never actionable. */
  pendingElsewhere: AIAction[];
  /** Pending actions safe to approve in bulk (no clinician sign-off needed). */
  batchApprovable: AIAction[];
  /** Manual minutes avoided by everything this role has approved. */
  minutesSaved: number;
  /** False when the signed-in role may not action this kind of work. */
  canAction: (action: AIAction) => boolean;
  approve: (id: string) => void;
  approveMany: (ids: string[]) => void;
  dismiss: (id: string) => void;
  reset: (id: string) => void;
  resetAll: () => void;
  amend: (id: string, detail: string) => void;
}

const AIActionsContext = createContext<AIActionsContextValue | undefined>(undefined);

export const AIActionsProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [actions, setActions] = useState<AIAction[]>(buildAIActions);
  const [statuses, setStatuses] = useState<Record<string, AIActionStatus>>({});
  const { role } = useSession();

  const statusOf = useCallback((id: string) => statuses[id] ?? 'pending', [statuses]);

  const setStatus = useCallback((id: string, status: AIActionStatus) => {
    setStatuses(prev => ({ ...prev, [id]: status }));
  }, []);

  const approve = useCallback((id: string) => setStatus(id, 'approved'), [setStatus]);
  const dismiss = useCallback((id: string) => setStatus(id, 'dismissed'), [setStatus]);

  const reset = useCallback((id: string) => {
    setStatuses(prev => {
      const next = { ...prev };
      delete next[id];
      return next;
    });
  }, []);

  const approveMany = useCallback((ids: string[]) => {
    setStatuses(prev => {
      const next = { ...prev };
      for (const id of ids) next[id] = 'approved';
      return next;
    });
  }, []);

  const resetAll = useCallback(() => setStatuses({}), []);

  const amend = useCallback((id: string, detail: string) => {
    setActions(prev => prev.map(a => (a.id === id ? { ...a, detail } : a)));
  }, []);

  const value = useMemo<AIActionsContextValue>(() => {
    const kinds = new Set(role.actionKinds);
    const mine = (a: AIAction) => kinds.has(a.kind);

    const allPending = actions.filter(a => (statuses[a.id] ?? 'pending') === 'pending');
    const pending = allPending.filter(mine);
    const approved = actions.filter(a => statuses[a.id] === 'approved' && mine(a));

    return {
      allActions: actions,
      statusOf,
      pending,
      approved,
      pendingElsewhere: allPending.filter(a => !mine(a)),
      batchApprovable: pending.filter(a => !a.requiresClinician),
      minutesSaved: approved.reduce((sum, a) => sum + a.minutesSaved, 0),
      canAction: mine,
      approve,
      approveMany,
      dismiss,
      reset,
      resetAll,
      amend,
    };
  }, [actions, statuses, statusOf, role, approve, approveMany, dismiss, reset, resetAll, amend]);

  return <AIActionsContext.Provider value={value}>{children}</AIActionsContext.Provider>;
};

export const useAIActions = () => {
  const ctx = useContext(AIActionsContext);
  if (!ctx) throw new Error('useAIActions must be used within an AIActionsProvider');
  return ctx;
};
