import React, { useState } from 'react';
import {
  CalendarPlus, FlaskConical, Pill, Stethoscope, Activity, Send, GraduationCap,
  Check, X, Pencil, Info, Undo2, ShieldCheck, Clock,
} from 'lucide-react';
import type { LucideIcon } from 'lucide-react';
import { GlassButton } from '../ui/GlassButton';
import { GlassInput } from '../ui/GlassInput';
import { useAIActions } from '../../context/AIActionsContext';
import { useToast } from '../../context/ToastContext';
import { cn } from '../../utils/cn';
import type { AIAction, AIActionKind } from '../../types/aiActions';

const KIND_META: Record<AIActionKind, { icon: LucideIcon; tint: string; ring: string; verb: string }> = {
  appointment: { icon: CalendarPlus,  tint: 'text-indigo-400',  ring: 'bg-indigo-500/15',  verb: 'Booked' },
  referral:    { icon: Stethoscope,   tint: 'text-cyan-400',    ring: 'bg-cyan-500/15',    verb: 'Referred' },
  lab:         { icon: FlaskConical,  tint: 'text-violet-400',  ring: 'bg-violet-500/15',  verb: 'Ordered' },
  medication:  { icon: Pill,          tint: 'text-amber-400',   ring: 'bg-amber-500/15',   verb: 'Sent to prescriber' },
  monitoring:  { icon: Activity,      tint: 'text-rose-400',    ring: 'bg-rose-500/15',    verb: 'Escalated' },
  outreach:    { icon: Send,          tint: 'text-emerald-400', ring: 'bg-emerald-500/15', verb: 'Sent' },
  education:   { icon: GraduationCap, tint: 'text-teal-400',    ring: 'bg-teal-500/15',    verb: 'Enrolled' },
};

/**
 * One AI-drafted step, presented as work that is already done pending approval
 * — not as advice the user has to go and act on somewhere else.
 */
export const AIActionCard: React.FC<{ action: AIAction; index?: number }> = ({ action, index = 0 }) => {
  const { statusOf, approve, dismiss, reset, amend } = useAIActions();
  const { toast } = useToast();
  const [showWhy, setShowWhy] = useState(false);
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState(action.detail);

  const status = statusOf(action.id);
  const { icon: Icon, tint, ring, verb } = KIND_META[action.kind];

  const handleApprove = () => {
    approve(action.id);
    toast(`${verb}: ${action.label}`, {
      description: `${action.patientName} · ${action.detail}`,
      variant: 'ai',
      action: { label: 'Undo', onClick: () => reset(action.id) },
    });
  };

  const handleDismiss = () => {
    dismiss(action.id);
    toast('Draft dismissed', {
      description: `${action.label} for ${action.patientName} was not actioned.`,
      variant: 'warning',
      action: { label: 'Undo', onClick: () => reset(action.id) },
    });
  };

  const saveEdit = () => {
    amend(action.id, draft.trim() || action.detail);
    setEditing(false);
    toast('Draft updated', { description: 'Your changes replaced the AI’s suggestion.', variant: 'info' });
  };

  if (status === 'dismissed') {
    return (
      <div
        className="reveal flex items-center gap-3 p-3.5 rounded-xl border border-[var(--border)] bg-[var(--surface-2)] opacity-70"
        style={{ animationDelay: `${index * 50}ms` }}
      >
        <X className="w-4 h-4 text-app-subtle flex-shrink-0" />
        <p className="text-sm text-app-subtle flex-1 min-w-0 truncate line-through">{action.label}</p>
        <button
          onClick={() => reset(action.id)}
          className="text-xs font-semibold text-app-muted hover:text-app transition-colors focus-ring rounded inline-flex items-center gap-1"
        >
          <Undo2 className="w-3 h-3" /> Restore
        </button>
      </div>
    );
  }

  if (status === 'approved') {
    return (
      <div
        className="reveal flex items-center gap-3 p-3.5 rounded-xl border border-emerald-500/25 bg-emerald-500/[0.07]"
        style={{ animationDelay: `${index * 50}ms` }}
      >
        <div className="w-7 h-7 rounded-lg bg-emerald-500/15 flex items-center justify-center flex-shrink-0">
          <Check className="w-4 h-4 text-emerald-400" />
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-sm font-medium text-app truncate">{verb} — {action.label}</p>
          <p className="text-xs text-app-subtle truncate">{action.detail}</p>
        </div>
        <button
          onClick={() => reset(action.id)}
          className="text-xs font-semibold text-app-muted hover:text-app transition-colors focus-ring rounded inline-flex items-center gap-1 flex-shrink-0"
        >
          <Undo2 className="w-3 h-3" /> Undo
        </button>
      </div>
    );
  }

  return (
    <div
      className="reveal rounded-xl border border-[var(--border)] bg-[var(--surface-1)] overflow-hidden"
      style={{ animationDelay: `${index * 50}ms` }}
    >
      <div className="p-3.5 flex items-start gap-3">
        <div className={cn('w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0', ring)}>
          <Icon className={cn('w-4 h-4', tint)} />
        </div>

        <div className="flex-1 min-w-0">
          <div className="flex flex-wrap items-center gap-2">
            <p className="text-sm font-semibold text-app">{action.label}</p>
            {action.requiresClinician && (
              <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded-md text-[10px] font-semibold bg-amber-500/15 text-amber-300">
                <ShieldCheck className="w-2.5 h-2.5" /> Clinician sign-off
              </span>
            )}
            <span className="inline-flex items-center gap-1 text-[10px] text-app-subtle">
              <Clock className="w-2.5 h-2.5" /> saves ~{action.minutesSaved} min
            </span>
          </div>

          {editing ? (
            <div className="mt-2 flex flex-col sm:flex-row gap-2">
              <GlassInput
                value={draft}
                onChange={e => setDraft(e.target.value)}
                aria-label={`Edit details for ${action.label}`}
                className="h-9 text-xs"
              />
              <div className="flex gap-2 flex-shrink-0">
                <GlassButton size="sm" variant="primary" onClick={saveEdit}>Save</GlassButton>
                <GlassButton size="sm" variant="ghost" onClick={() => { setDraft(action.detail); setEditing(false); }}>
                  Cancel
                </GlassButton>
              </div>
            </div>
          ) : (
            <p className="text-xs text-app-muted mt-1 leading-relaxed">{action.detail}</p>
          )}

          <button
            onClick={() => setShowWhy(v => !v)}
            aria-expanded={showWhy}
            className="mt-2 inline-flex items-center gap-1 text-[11px] font-semibold text-app-subtle hover:text-app transition-colors focus-ring rounded"
          >
            <Info className="w-3 h-3" />
            {showWhy ? 'Hide reasoning' : 'Why this?'}
          </button>

          {showWhy && (
            <div className="mt-2 p-2.5 rounded-lg bg-[var(--surface-2)] border border-[var(--border)]">
              <p className="text-[11px] text-app-muted leading-relaxed">{action.rationale}</p>
              <p className="text-[11px] text-app-subtle mt-1.5 italic">Source signal: “{action.source}”</p>
            </div>
          )}
        </div>

        {!editing && (
          <div className="flex items-center gap-1 flex-shrink-0">
            <button
              onClick={() => setEditing(true)}
              aria-label={`Edit ${action.label}`}
              className="p-1.5 rounded-lg text-app-subtle hover:text-app hover:bg-[var(--surface-2)] transition-colors focus-ring"
            >
              <Pencil className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={handleDismiss}
              aria-label={`Dismiss ${action.label}`}
              className="p-1.5 rounded-lg text-app-subtle hover:text-red-400 hover:bg-red-500/10 transition-colors focus-ring"
            >
              <X className="w-3.5 h-3.5" />
            </button>
            <GlassButton size="sm" variant="primary" onClick={handleApprove} className="ml-1">
              <Check className="w-3.5 h-3.5" /> Approve
            </GlassButton>
          </div>
        )}
      </div>
    </div>
  );
};
