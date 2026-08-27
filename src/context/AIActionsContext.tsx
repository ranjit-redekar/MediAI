import React, { createContext, useCallback, useContext, useMemo, useState } from 'react';
import { buildAIActions } from '../data/aiActions';
import type { AIAction, AIActionStatus } from '../types/aiActions';

interface AIActionsContextValue {
  actions: AIAction[];
  statusOf: (id: string) => AIActionStatus;
  pending: AIAction[];
  approved: AIAction[];
  /** Pending actions safe to approve in bulk (no clinician sign-off needed). */
  batchApprovable: AIAction[];
  /** Manual minutes avoided by everything approved so far. */
  minutesSaved: number;
  approve: (id: string) => void;
  approveMany: (ids: string[]) => void;
  dismiss: (id: string) => void;
  reset: (id: string) => void;
  resetAll: () => void;
  /** Replaces the pre-filled specifics when a human edits a draft. */
  amend: (id: string, detail: string) => void;
}

const AIActionsContext = createContext<AIActionsContextValue | undefined>(undefined);

export const AIActionsProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [actions, setActions] = useState<AIAction[]>(buildAIActions);
  const [statuses, setStatuses] = useState<Record<string, AIActionStatus>>({});

  const statusOf = useCallback(
    (id: string) => statuses[id] ?? 'pending',
    [statuses]
  );

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
    const pending = actions.filter(a => (statuses[a.id] ?? 'pending') === 'pending');
    const approved = actions.filter(a => statuses[a.id] === 'approved');
    return {
      actions,
      statusOf,
      pending,
      approved,
      batchApprovable: pending.filter(a => !a.requiresClinician),
      minutesSaved: approved.reduce((sum, a) => sum + a.minutesSaved, 0),
      approve,
      approveMany,
      dismiss,
      reset,
      resetAll,
      amend,
    };
  }, [actions, statuses, statusOf, approve, approveMany, dismiss, reset, resetAll, amend]);

  return <AIActionsContext.Provider value={value}>{children}</AIActionsContext.Provider>;
};

export const useAIActions = () => {
  const ctx = useContext(AIActionsContext);
  if (!ctx) throw new Error('useAIActions must be used within an AIActionsProvider');
  return ctx;
};
