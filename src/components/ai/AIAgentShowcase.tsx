import React from 'react';
import type { LucideIcon } from 'lucide-react';
import {
  AlertTriangle,
  HeartPulse,
  LineChart,
  ShieldCheck,
  Clock3,
  Sparkles
} from 'lucide-react';
import { GlassCard } from '../ui/GlassCard';
import { GlassBadge } from '../ui/GlassBadge';
import { GlassButton } from '../ui/GlassButton';
import { db } from '../../data';
import type { AIAgent } from '../../types';
import { cn } from '../../utils/cn';

type ShowcaseVariant = 'compact' | 'detailed';

const iconMap: Record<string, LucideIcon> = {
  QuickCheckAgent: AlertTriangle,
  CareGuideAgent: HeartPulse,
  TrendWatchAgent: LineChart,
  RevenueGuardAgent: ShieldCheck,
  ShiftGuideAgent: Clock3
};

const statusVariantMap: Record<AIAgent['status'], 'success' | 'info' | 'warning'> = {
  Online: 'success',
  Monitoring: 'info',
  Idle: 'warning'
};

const statusPulseMap: Record<AIAgent['status'], string> = {
  Online: 'bg-emerald-400',
  Monitoring: 'bg-cyan-400',
  Idle: 'bg-amber-400'
};

interface AIAgentShowcaseProps {
  variant?: ShowcaseVariant;
}

const AgentMetrics: React.FC<{ metrics: AIAgent['metrics']; compact?: boolean }> = ({ metrics, compact }) => (
  <div className={cn('flex flex-wrap gap-3', compact ? 'mt-4' : 'mt-2')}> 
    {metrics.map((metric) => (
      <div
        key={`${metric.label}-${metric.value}`}
        className={cn(
          'px-3 py-2 rounded-xl border border-white/10 bg-white/5 text-left',
          'min-w-[120px]'
        )}
      >
        <p className="text-xs text-white/50">{metric.label}</p>
        <p className="text-sm font-semibold text-white">{metric.value}</p>
        {metric.helper && (
          <p className={cn('text-xs font-medium', metric.trend === 'down' ? 'text-emerald-300' : metric.trend === 'up' ? 'text-amber-300' : 'text-white/50')}>
            {metric.helper}
          </p>
        )}
      </div>
    ))}
  </div>
);

const AgentHighlights: React.FC<{ highlights: string[] }> = ({ highlights }) => (
  <ul className="space-y-1 text-sm text-white/70">
    {highlights.map((message, index) => (
      <li key={`${message}-${index}`} className="flex items-start gap-2">
        <span className="mt-1 h-1.5 w-1.5 rounded-full bg-white/40" />
        <span className="flex-1">{message}</span>
      </li>
    ))}
  </ul>
);

export const AIAgentShowcase: React.FC<AIAgentShowcaseProps> = ({ variant = 'compact' }) => {
  const agents = db.aiAgents;

  if (variant === 'compact') {
    return (
      <GlassCard className="space-y-6" glow>
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <p className="text-sm text-white/60 flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-violet-300" />
              AI Agent Lineup
            </p>
            <h3 className="text-xl font-semibold text-white">Operational AI Agents</h3>
          </div>
          <GlassBadge variant="primary">Live mock data</GlassBadge>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {agents.map((agent) => {
            const Icon = iconMap[agent.name] ?? Sparkles;
            return (
              <div
                key={agent.id}
                className="p-4 rounded-2xl border border-white/10 bg-white/5 backdrop-blur group hover:bg-white/10 transition-colors"
              >
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <div className="p-2 rounded-xl bg-violet-500/20 text-violet-200">
                      <Icon className="w-5 h-5" />
                    </div>
                    <div>
                      <p className="text-sm text-white/60">{agent.focus}</p>
                      <h4 className="text-lg font-semibold text-white">{agent.name}</h4>
                    </div>
                  </div>
                  <GlassBadge variant={statusVariantMap[agent.status]} size="sm">
                    {agent.status}
                  </GlassBadge>
                </div>
                <p className="mt-3 text-sm text-white/70 line-clamp-2">{agent.description}</p>
                <AgentMetrics metrics={agent.metrics.slice(0, 2)} compact />
                <div className="mt-4 flex items-center justify-between text-xs text-white/50">
                  <span>{agent.statusMessage}</span>
                  <span>{agent.lastUpdated}</span>
                </div>
              </div>
            );
          })}
        </div>
      </GlassCard>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <p className="text-sm text-white/60">AI Agent Playbooks</p>
          <h3 className="text-2xl font-semibold text-white">Agent operating snapshot</h3>
        </div>
        <GlassBadge variant="info">Mock data for UI demo</GlassBadge>
      </div>
      {agents.map((agent) => {
        const Icon = iconMap[agent.name] ?? Sparkles;
        return (
          <GlassCard key={agent.id} className="space-y-4 border border-white/10 bg-white/5">
            <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
              <div className="flex items-center gap-3">
                <div className="relative">
                  <div className="p-3 rounded-2xl bg-gradient-to-br from-violet-500 to-fuchsia-500">
                    <Icon className="w-6 h-6 text-white" />
                  </div>
                  <span
                    className={cn(
                      'absolute -bottom-1 -right-1 w-4 h-4 rounded-full border-2 border-slate-900 animate-pulse',
                      statusPulseMap[agent.status]
                    )}
                  />
                </div>
                <div>
                  <h4 className="text-xl font-semibold text-white">{agent.name}</h4>
                  <p className="text-sm text-white/60">{agent.focus}</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <GlassBadge variant={statusVariantMap[agent.status]}>{agent.statusMessage}</GlassBadge>
                <span className="text-xs text-white/50">Updated {agent.lastUpdated}</span>
              </div>
            </div>
            <p className="text-sm text-white/70">{agent.description}</p>
            <AgentMetrics metrics={agent.metrics} />
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <p className="text-xs uppercase tracking-wide text-white/40 mb-2">Recent highlights</p>
                <AgentHighlights highlights={agent.highlights} />
              </div>
              <div className="flex flex-col justify-between gap-3 rounded-2xl border border-white/10 bg-white/5 p-4">
                <p className="text-sm text-white/60">Next best action</p>
                <p className="text-lg font-semibold text-white">{agent.primaryAction}</p>
                <GlassButton variant="ghost" size="sm">
                  Open playbook
                </GlassButton>
              </div>
            </div>
          </GlassCard>
        );
      })}
    </div>
  );
};
