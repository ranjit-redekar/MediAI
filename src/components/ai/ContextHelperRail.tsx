import React from 'react';
import { GlassCard } from '../ui/GlassCard';
import { GlassBadge } from '../ui/GlassBadge';
import { GlassButton } from '../ui/GlassButton';
import type { AIAgent } from '../../types';
import { Sparkles, Activity, ExternalLink } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

interface InsightCard {
  title: string;
  description: string;
  tag?: string;
}

interface ContextHelperRailProps {
  agent: AIAgent;
  title: string;
  insights: InsightCard[];
  ctaLabel?: string;
}

export const ContextHelperRail: React.FC<ContextHelperRailProps> = ({
  agent,
  title,
  insights,
  ctaLabel = 'Open Agent'
}) => {
  const navigate = useNavigate();
  return (
    <aside className="lg:sticky lg:top-24 space-y-4 w-full lg:w-80">
      <GlassCard className="space-y-3 border-white/10 bg-white/5">
        <div className="flex items-center gap-2 text-white/70 text-sm">
          <Sparkles className="w-4 h-4 text-violet-300" />
          {title}
        </div>
        <div>
          <p className="text-lg font-semibold text-white">{agent.name}</p>
          <p className="text-sm text-white/50">{agent.focus}</p>
        </div>
        <div className="flex items-center gap-2 text-xs text-white/50">
          <GlassBadge variant="primary" size="sm">{agent.status}</GlassBadge>
          <span>{agent.statusMessage}</span>
        </div>
        <GlassButton
          variant="ghost"
          size="sm"
          className="w-full"
          onClick={() => navigate(`/agents/${agent.id}`)}
        >
          <ExternalLink className="w-3 h-3 mr-1" />
          {ctaLabel}
        </GlassButton>
      </GlassCard>

      {insights.map((insight, idx) => (
        <GlassCard key={`${insight.title}-${idx}`} className="space-y-2 border-white/10 bg-white/5">
          <div className="flex items-center justify-between">
            <p className="text-sm font-semibold text-white">{insight.title}</p>
            {insight.tag && <GlassBadge size="sm">{insight.tag}</GlassBadge>}
          </div>
          <p className="text-sm text-white/60">{insight.description}</p>
        </GlassCard>
      ))}

      <GlassCard className="space-y-3 border-white/10 bg-gradient-to-br from-violet-500/10 to-fuchsia-500/10">
        <div className="flex items-center gap-2 text-white/70">
          <Activity className="w-4 h-4" />
          Quick Metrics
        </div>
        <div className="grid grid-cols-2 gap-3">
          {agent.metrics.slice(0, 2).map((metric) => (
            <div key={metric.label}>
              <p className="text-xs text-white/50 uppercase tracking-wide">{metric.label}</p>
              <p className="text-lg font-semibold text-white">{metric.value}</p>
            </div>
          ))}
        </div>
      </GlassCard>
    </aside>
  );
};
