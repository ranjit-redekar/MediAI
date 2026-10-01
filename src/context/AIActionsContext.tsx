import React, { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from 'react';
import { buildAIActions } from '../data/aiActions';
import { ownsAction } from '../data/accessRoles';
import { useSession } from './SessionContext';
import { useAppointments } from './AppointmentsContext';
import { useLab } from './LabContext';
import { useToast } from './ToastContext';
import { supabase } from '../lib/supabase';
import type { AIAction, AIActionStatus } from '../types/aiActions';
import type { Patient } from '../types';

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
  resetMany: (ids: string[]) => void;
  /** Demo only; does nothing against a real backend. */
  resetAll: () => void;
  amend: (id: string, detail: string) => void;
  /**
   * Production only: asks the drafting function for this patient's follow-up
   * work and reloads the queue. Resolves to an error message, or null.
   */
  draftFor: (patient: Patient, signal?: string) => Promise<string | null>;
}

const AIActionsContext = createContext<AIActionsContextValue | undefined>(undefined);

interface ActionRow {
  id: string; patient_ref: string; patient_name: string; kind: AIAction['kind']; label: string;
  detail: string; rationale: string; source: string; confidence: number; minutes_saved: number;
  requires_clinician: boolean; booking: AIAction['booking'] | null; status: AIActionStatus;
}
const toAction = (r: ActionRow): AIAction => ({
  id: r.id, insightId: '', patientId: r.patient_ref, patientName: r.patient_name, kind: r.kind,
  label: r.label, detail: r.detail, rationale: r.rationale, source: r.source, confidence: r.confidence,
  minutesSaved: r.minutes_saved, requiresClinician: r.requires_clinician, booking: r.booking ?? undefined,
});

export const AIActionsProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // Demo: drafts built from mock data, decisions in memory. Production: drafts
  // come from `ai_actions` and every decision goes through decide_action(),
  // where the database — not this file — enforces who may sign what.
  const [actions, setActions] = useState<AIAction[]>(() => (supabase ? [] : buildAIActions()));
  const [statuses, setStatuses] = useState<Record<string, AIActionStatus>>({});
  const { role, workspaceId } = useSession();
  const { toast } = useToast();

  const load = useCallback(() => {
    if (!supabase || !workspaceId) return;
    supabase.from('ai_actions').select('*').eq('workspace_id', workspaceId).order('created_at')
      .then(({ data, error }) => {
        if (error) { toast('Couldn’t load drafts', { description: error.message, variant: 'warning' }); return; }
        const rows = data as ActionRow[];
        setActions(rows.map(toAction));
        setStatuses(Object.fromEntries(rows.filter(r => r.status !== 'pending').map(r => [r.id, r.status])));
      });
  }, [workspaceId, toast]);

  useEffect(load, [load]);

  /** Saves a decision; if the server refuses, reload its truth and say why. */
  const persist = useCallback((ids: string[], decision: AIActionStatus, detailOf?: (id: string) => string) => {
    if (!supabase) return;
    for (const id of ids) {
      supabase.rpc('decide_action', { action_id: id, decision, final_detail: detailOf?.(id) ?? null })
        .then(({ error }) => {
          if (!error) return;
          toast('Not saved', { description: error.message, variant: 'warning' });
          load();
        });
    }
  }, [toast, load]);
  const detailOf = useCallback((id: string) => actions.find(a => a.id === id)?.detail ?? '', [actions]);
  const { addAppointment, removeAppointment } = useAppointments();
  const { addOrder, cancelOrder } = useLab();
  // Approval is the work, not a checkmark: a booking draft becomes a real
  // appointment on the calendar, and undo takes it back off.
  const booked = useRef(new Map<string, string>()); // action id → appointment id
  const ordered = useRef(new Map<string, string>()); // action id → lab order id

  const statusOf = useCallback((id: string) => statuses[id] ?? 'pending', [statuses]);

  const setStatus = useCallback((id: string, status: AIActionStatus) => {
    setStatuses(prev => ({ ...prev, [id]: status }));
  }, []);

  const carryOut = useCallback((ids: string[]) => {
    for (const id of ids) {
      const a = actions.find(x => x.id === id);
      if (a?.labOrder && !ordered.current.has(id)) {
        ordered.current.set(id, addOrder({ patientId: a.patientId, patientName: a.patientName, ...a.labOrder }).id);
      }
      if (!a?.booking || booked.current.has(id)) continue;
      const appt = addAppointment({
        patientId: a.patientId, patientName: a.patientName,
        doctorId: a.booking.doctorId, doctorName: a.booking.doctorName, specialty: a.booking.specialty,
        date: a.booking.date, time: a.booking.time, status: 'Scheduled', type: 'In-Person',
        notes: `${a.label} — booked from AI draft`,
      });
      booked.current.set(id, appt.id);
    }
  }, [actions, addAppointment, addOrder]);

  const undoBookings = useCallback((ids: string[]) => {
    for (const id of ids) {
      const apptId = booked.current.get(id);
      if (apptId) removeAppointment(apptId);
      booked.current.delete(id);
      const orderId = ordered.current.get(id);
      if (orderId) cancelOrder(orderId);
      ordered.current.delete(id);
    }
  }, [removeAppointment, cancelOrder]);

  const approve = useCallback((id: string) => {
    carryOut([id]);
    setStatus(id, 'approved');
    persist([id], 'approved', detailOf);
  }, [carryOut, setStatus, persist, detailOf]);
  const dismiss = useCallback((id: string) => {
    setStatus(id, 'dismissed');
    persist([id], 'dismissed');
  }, [setStatus, persist]);

  const reset = useCallback((id: string) => {
    undoBookings([id]);
    persist([id], 'pending');
    setStatuses(prev => {
      const next = { ...prev };
      delete next[id];
      return next;
    });
  }, [undoBookings, persist]);

  const approveMany = useCallback((ids: string[]) => {
    carryOut(ids);
    persist(ids, 'approved', detailOf);
    setStatuses(prev => {
      const next = { ...prev };
      for (const id of ids) next[id] = 'approved';
      return next;
    });
  }, [carryOut, persist, detailOf]);

  /** Undo exactly these decisions — what a batch's "Undo all" means. */
  const resetMany = useCallback((ids: string[]) => {
    undoBookings(ids);
    persist(ids, 'pending');
    setStatuses(prev => {
      const next = { ...prev };
      for (const id of ids) delete next[id];
      return next;
    });
  }, [undoBookings, persist]);

  /** Demo only: replay the mock queue. A real hospital's history isn't wiped from a button. */
  const resetAll = useCallback(() => {
    if (supabase) return;
    undoBookings([...booked.current.keys()]);
    setStatuses({});
  }, [undoBookings]);

  const amend = useCallback((id: string, detail: string) => {
    setActions(prev => prev.map(a => (a.id === id ? { ...a, detail } : a)));
  }, []);

  const draftFor = useCallback(async (patient: Patient, signal?: string) => {
    if (!supabase || !workspaceId) return 'Drafting needs the live service.';
    // ponytail: the summary travels from the browser until patients live in the database.
    const history = (patient.medicalHistory ?? []).slice(0, 5).map(r => ({
      date: r.date, diagnosis: r.diagnosis, notes: r.notes, symptoms: r.symptoms,
    }));
    const { error } = await supabase.functions.invoke('draft-actions', {
      body: {
        workspaceId,
        patient: {
          ref: patient.id, name: patient.name, age: patient.age, gender: patient.gender,
          allergies: patient.allergies ?? null, status: patient.status, riskScore: patient.aiRiskScore ?? null,
          medications: [...new Set((patient.medicalHistory ?? []).flatMap(r => r.medications))],
          history, signal,
        },
      },
    });
    if (error) {
      // The function answers with {error}; surface its message, not the transport's.
      const body = await (error as { context?: Response }).context?.json?.().catch(() => null);
      return body?.error ?? error.message;
    }
    load();
    return null;
  }, [workspaceId, load]);

  const value = useMemo<AIActionsContextValue>(() => {
    const mine = (a: AIAction) => ownsAction(role, a);

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
      resetMany,
      resetAll,
      amend,
      draftFor,
    };
  }, [actions, statuses, statusOf, role, approve, approveMany, dismiss, reset, resetMany, resetAll, amend, draftFor]);

  return <AIActionsContext.Provider value={value}>{children}</AIActionsContext.Provider>;
};

export const useAIActions = () => {
  const ctx = useContext(AIActionsContext);
  if (!ctx) throw new Error('useAIActions must be used within an AIActionsProvider');
  return ctx;
};
