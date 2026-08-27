import React, { useEffect, useMemo } from 'react';
import { Sparkles, X, Inbox, CheckCheck, Clock, ShieldCheck } from 'lucide-react';
import { cn } from '../../../utils/cn';
import { useAIActions } from '../../../context/AIActionsContext';
import { useToast } from '../../../context/ToastContext';
import { EmptyState } from '../../ui/EmptyState';
import { GlassButton } from '../../ui/GlassButton';
import { AIActionCard } from '../../ai/AIActionCard';

interface TaskInboxDrawerProps {
  isOpen: boolean;
  onClose: () => void;
}

/**
 * The single place work waits for a human. There is deliberately no separate
 * "alerts" list — an alert with nothing to do about it is not worth a queue,
 * so every item here is a drafted action you can approve, edit, or reject.
 */
export const TaskInboxDrawer: React.FC<TaskInboxDrawerProps> = ({ isOpen, onClose }) => {
  const { pending, batchApprovable, approveMany, resetAll, minutesSaved } = useAIActions();
  const { toast } = useToast();

  useEffect(() => {
    if (!isOpen) return;
    const onKeyDown = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose(); };
    document.addEventListener('keydown', onKeyDown);
    return () => document.removeEventListener('keydown', onKeyDown);
  }, [isOpen, onClose]);

  // Group by patient so a reviewer sees one person at a time, not a flat list.
  const byPatient = useMemo(() => {
    const map = new Map<string, { name: string; items: typeof pending }>();
    for (const action of pending) {
      const entry = map.get(action.patientId) ?? { name: action.patientName, items: [] };
      entry.items.push(action);
      map.set(action.patientId, entry);
    }
    return [...map.entries()];
  }, [pending]);

  const clinicianCount = pending.length - batchApprovable.length;

  const approveAll = () => {
    const ids = batchApprovable.map(a => a.id);
    if (ids.length === 0) return;
    const saved = batchApprovable.reduce((sum, a) => sum + a.minutesSaved, 0);
    approveMany(ids);
    toast(`${ids.length} action${ids.length === 1 ? '' : 's'} approved`, {
      description: `Roughly ${saved} minutes of manual work avoided.`,
      variant: 'ai',
      action: { label: 'Undo all', onClick: resetAll },
    });
  };

  return (
    <>
      <div
        className={cn(
          'fixed inset-0 bg-black/60 backdrop-blur-sm z-40 transition-opacity duration-300',
          isOpen ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'
        )}
        onClick={onClose}
        aria-hidden="true"
      />
      <aside
        role="dialog"
        aria-modal="true"
        aria-label="Approval queue"
        className={cn(
          'fixed inset-y-0 right-0 z-50 w-full sm:w-[420px] glass-panel backdrop-blur-2xl border-l',
          'transition-transform duration-300 ease-in-out flex flex-col',
          isOpen ? 'translate-x-0' : 'translate-x-full'
        )}
      >
        <div className="p-5 border-b border-[var(--border)] flex-shrink-0">
          <div className="flex items-start justify-between gap-3">
            <div className="min-w-0">
              <p className="text-xs text-app-subtle uppercase tracking-wide flex items-center gap-2">
                <Sparkles className="w-3.5 h-3.5 text-violet-400" />
                Approval Queue
              </p>
              <h2 className="text-xl font-semibold text-app mt-1">
                {pending.length > 0 ? `${pending.length} waiting on you` : 'All clear'}
              </h2>
              <p className="text-xs text-app-subtle mt-1 flex items-center gap-1.5">
                <Clock className="w-3 h-3" />
                {minutesSaved} min of manual work avoided today
              </p>
            </div>
            <button
              onClick={onClose}
              aria-label="Close approval queue"
              className="p-2 rounded-lg text-app-subtle hover:text-app hover:bg-[var(--surface-2)] transition-colors focus-ring flex-shrink-0"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {batchApprovable.length > 0 && (
            <GlassButton variant="primary" size="sm" className="w-full mt-4" onClick={approveAll}>
              <CheckCheck className="w-4 h-4" />
              Approve {batchApprovable.length} administrative action{batchApprovable.length === 1 ? '' : 's'}
            </GlassButton>
          )}

          {clinicianCount > 0 && (
            <p className="text-[11px] text-amber-300/90 mt-2.5 flex items-start gap-1.5">
              <ShieldCheck className="w-3 h-3 flex-shrink-0 mt-px" />
              {clinicianCount} clinical action{clinicianCount === 1 ? '' : 's'} excluded — each needs a prescriber's sign-off.
            </p>
          )}
        </div>

        <div className="flex-1 overflow-y-auto p-5">
          {pending.length === 0 ? (
            <EmptyState
              icon={Inbox}
              title="Inbox zero"
              description="Everything the AI drafted has been actioned. New work lands here the moment an agent finds something."
              action={{ label: 'Replay demo queue', onClick: resetAll }}
            />
          ) : (
            <div className="space-y-5">
              {byPatient.map(([patientId, group]) => (
                <div key={patientId}>
                  <p className="text-[11px] uppercase tracking-wider font-semibold text-app-subtle mb-2 px-1">
                    {group.name}
                    <span className="ml-1.5 text-app-subtle/70">· {group.items.length} action{group.items.length === 1 ? '' : 's'}</span>
                  </p>
                  <div className="space-y-2">
                    {group.items.map((action, i) => (
                      <AIActionCard key={action.id} action={action} index={i} />
                    ))}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </aside>
    </>
  );
};
