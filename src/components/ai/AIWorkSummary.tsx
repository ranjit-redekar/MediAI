import React from 'react';
import { Sparkles, CheckCheck, Clock, ShieldCheck, RotateCcw } from 'lucide-react';
import { GlassButton } from '../ui/GlassButton';
import { useAIActions } from '../../context/AIActionsContext';
import { useToast } from '../../context/ToastContext';

/**
 * Headline strip for the AI action queue: how much work is already drafted, how
 * much has been cleared, and one control to approve everything that is safe to
 * approve in bulk. Clinical steps are deliberately excluded from that button.
 */
export const AIWorkSummary: React.FC = () => {
  const { pending, approved, batchApprovable, minutesSaved, approveMany, resetAll } = useAIActions();
  const { toast } = useToast();

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
    <div className="reveal rounded-2xl border border-violet-500/25 bg-gradient-to-r from-violet-500/[0.10] to-fuchsia-500/[0.05] p-5">
      <div className="flex flex-col lg:flex-row lg:items-center gap-5">
        <div className="flex items-start gap-3 flex-1 min-w-0">
          <div className="w-10 h-10 rounded-xl bg-violet-500/15 flex items-center justify-center flex-shrink-0">
            <Sparkles className="w-5 h-5 text-violet-400" />
          </div>
          <div className="min-w-0">
            <h3 className="text-base font-semibold text-app">
              {pending.length > 0
                ? `${pending.length} action${pending.length === 1 ? '' : 's'} drafted and waiting on you`
                : 'Everything drafted has been handled'}
            </h3>
            <p className="text-sm text-app-muted mt-0.5 leading-relaxed">
              {pending.length > 0
                ? 'The AI has already filled in the clinician, slot, and details for each one. Approve to apply, or edit first.'
                : 'New drafts appear here the moment an agent detects something worth acting on.'}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-5 lg:gap-6 flex-shrink-0">
          <div>
            <p className="text-2xl font-bold text-app tabular-nums leading-none">{approved.length}</p>
            <p className="text-[11px] text-app-subtle mt-1 flex items-center gap-1">
              <CheckCheck className="w-3 h-3" /> approved
            </p>
          </div>
          <div>
            <p className="text-2xl font-bold text-emerald-400 tabular-nums leading-none">{minutesSaved}<span className="text-sm font-medium"> min</span></p>
            <p className="text-[11px] text-app-subtle mt-1 flex items-center gap-1">
              <Clock className="w-3 h-3" /> work avoided
            </p>
          </div>

          <div className="flex items-center gap-2">
            {approved.length > 0 && (
              <GlassButton variant="ghost" size="sm" onClick={resetAll} title="Reset the demo queue">
                <RotateCcw className="w-3.5 h-3.5" />
              </GlassButton>
            )}
            <GlassButton
              variant="primary"
              onClick={approveAll}
              disabled={batchApprovable.length === 0}
            >
              <CheckCheck className="w-4 h-4" />
              Approve {batchApprovable.length} safe
            </GlassButton>
          </div>
        </div>
      </div>

      {clinicianCount > 0 && (
        <p className="text-xs text-amber-300/90 mt-4 pt-3 border-t border-violet-500/20 flex items-center gap-1.5">
          <ShieldCheck className="w-3.5 h-3.5 flex-shrink-0" />
          {clinicianCount} clinical action{clinicianCount === 1 ? ' is' : 's are'} held back from bulk approval and need a prescriber to review each one.
        </p>
      )}
    </div>
  );
};
