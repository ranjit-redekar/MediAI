import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Sparkles, CheckCheck, ArrowUpRight, Inbox, Clock } from 'lucide-react';
import { GlassCard } from '../ui/GlassCard';
import { GlassButton } from '../ui/GlassButton';
import { EmptyState } from '../ui/EmptyState';
import { AIActionCard } from './AIActionCard';
import { useAIActions } from '../../context/AIActionsContext';
import { useToast } from '../../context/ToastContext';

/**
 * Dashboard-sized slice of the AI action queue. The point is that the day's
 * work can be cleared from here without navigating into another module.
 */
export const AIActionQueue: React.FC<{ limit?: number }> = ({ limit = 4 }) => {
  const { pending, batchApprovable, approveMany, minutesSaved, resetAll } = useAIActions();
  const { toast } = useToast();
  const navigate = useNavigate();

  const visible = pending.slice(0, limit);

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
    <GlassCard hover={false} className="relative overflow-hidden reveal" style={{ animationDelay: '120ms' }}>
      <div className="absolute inset-0 bg-gradient-to-br from-violet-500/[0.07] to-transparent pointer-events-none" />

      <div className="relative">
        <div className="flex flex-wrap items-start justify-between gap-3 mb-5">
          <div className="flex items-center gap-2.5 min-w-0">
            <div className="p-2 rounded-xl bg-violet-500/15 flex-shrink-0">
              <Sparkles className="w-5 h-5 text-violet-400" />
            </div>
            <div className="min-w-0">
              <h3 className="text-base font-semibold text-app">Ready for your approval</h3>
              <p className="text-xs text-app-subtle">
                {pending.length > 0
                  ? `${pending.length} action${pending.length === 1 ? '' : 's'} drafted · ${minutesSaved} min saved so far`
                  : `Queue clear · ${minutesSaved} min saved today`}
              </p>
            </div>
          </div>

          {batchApprovable.length > 0 && (
            <GlassButton variant="primary" size="sm" onClick={approveAll}>
              <CheckCheck className="w-3.5 h-3.5" />
              Approve {batchApprovable.length}
            </GlassButton>
          )}
        </div>

        {visible.length === 0 ? (
          <EmptyState
            icon={Inbox}
            title="Nothing waiting on you"
            description="The AI has drafted and cleared everything it found. New work appears here automatically."
            action={{ label: 'Replay demo queue', onClick: resetAll }}
          />
        ) : (
          <>
            <div className="space-y-2">
              {visible.map((action, i) => (
                <AIActionCard key={action.id} action={action} index={i} />
              ))}
            </div>

            <div className="flex items-center justify-between gap-3 mt-4 pt-3 border-t border-[var(--border)]">
              <p className="text-xs text-app-subtle flex items-center gap-1.5">
                <Clock className="w-3 h-3" />
                ~{pending.reduce((s, a) => s + a.minutesSaved, 0)} min of manual work still queued
              </p>
              <button
                onClick={() => navigate('/ai-insights')}
                className="text-sm text-app-muted hover:text-app transition-colors flex items-center gap-1.5 focus-ring rounded"
              >
                Review all {pending.length} <ArrowUpRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </>
        )}
      </div>
    </GlassCard>
  );
};
