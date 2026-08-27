import React from 'react';
import { Activity, Brain, Calendar, Zap, Shield, Sparkles, ArrowUpRight } from 'lucide-react';
import { GlassCard } from '../ui/GlassCard';
import { db } from '../../data';
import { cn } from '../../utils/cn';

const TYPE_STYLE: Record<string, { ring: string; icon: React.ReactNode }> = {
  ai:          { ring: 'bg-violet-500/15',  icon: <Brain className="w-3.5 h-3.5 text-violet-400" /> },
  appointment: { ring: 'bg-indigo-500/15',  icon: <Calendar className="w-3.5 h-3.5 text-indigo-400" /> },
  lab:         { ring: 'bg-cyan-500/15',    icon: <Zap className="w-3.5 h-3.5 text-cyan-400" /> },
  patient:     { ring: 'bg-emerald-500/15', icon: <Shield className="w-3.5 h-3.5 text-emerald-400" /> },
};

/**
 * Narrow-column activity feed. Rows stay compact so the list is scannable at a
 * third of the dashboard width instead of sprawling across the full row.
 */
export const ActivityFeed: React.FC<{ onViewAll: () => void; limit?: number }> = ({
  onViewAll,
  limit = 6,
}) => (
  <GlassCard hover={false} padding="sm" className="reveal h-full flex flex-col" style={{ animationDelay: '160ms' }}>
    <div className="flex items-center justify-between gap-2 mb-3">
      <div className="flex items-center gap-2 min-w-0">
        <div className="p-1.5 rounded-lg bg-indigo-500/15 flex-shrink-0">
          <Activity className="w-4 h-4 text-indigo-400" />
        </div>
        <h3 className="text-sm font-semibold text-app truncate">Recent Activity</h3>
      </div>
      <span className="flex items-center gap-1 px-2 py-0.5 rounded-full bg-emerald-500/15 flex-shrink-0">
        <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
        <span className="text-[10px] text-emerald-400 font-semibold">Live</span>
      </span>
    </div>

    <div className="space-y-0.5 flex-1">
      {db.recentActivities.slice(0, limit).map((activity, i) => {
        const style = TYPE_STYLE[activity.type] ?? TYPE_STYLE.patient;
        return (
          <div
            key={activity.id}
            className="reveal flex items-start gap-2.5 p-2 rounded-lg hover:bg-[var(--surface-2)] transition-colors"
            style={{ animationDelay: `${180 + i * 50}ms` }}
          >
            <div className={cn('w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0 mt-px', style.ring)}>
              {style.icon}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-xs text-app leading-snug line-clamp-2">{activity.description}</p>
              <p className="text-[11px] text-app-subtle truncate mt-0.5">
                {activity.patient} · {activity.time}
              </p>
            </div>
            {activity.type === 'ai' && (
              <Sparkles className="w-3 h-3 text-violet-400 flex-shrink-0 mt-1.5" />
            )}
          </div>
        );
      })}
    </div>

    <button
      onClick={onViewAll}
      className="w-full mt-2 flex items-center justify-center gap-1.5 text-xs text-app-muted hover:text-app transition-colors py-1.5 focus-ring rounded-lg"
    >
      View all <ArrowUpRight className="w-3 h-3" />
    </button>
  </GlassCard>
);
