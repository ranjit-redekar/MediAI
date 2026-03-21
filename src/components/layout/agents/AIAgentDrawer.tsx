import React from 'react';
import { X, Sparkles, ArrowRight } from 'lucide-react';
import { db } from '../../../data';
import type { LucideIcon } from 'lucide-react';
import {
  AlertTriangle,
  HeartPulse,
  LineChart,
  ShieldCheck,
  Clock3
} from 'lucide-react';
import { GlassBadge } from '../../ui/GlassBadge';
import { GlassButton } from '../../ui/GlassButton';
import { useNavigate } from 'react-router-dom';
import { cn } from '../../../utils/cn';

const iconMap: Record<string, LucideIcon> = {
  QuickCheckAgent: AlertTriangle,
  CareGuideAgent: HeartPulse,
  TrendWatchAgent: LineChart,
  RevenueGuardAgent: ShieldCheck,
  ShiftGuideAgent: Clock3
};

interface AIAgentDrawerProps {
  isOpen: boolean;
  onClose: () => void;
}

export const AIAgentDrawer: React.FC<AIAgentDrawerProps> = ({ isOpen, onClose }) => {
  const agents = db.aiAgents;
  const navigate = useNavigate();

  return (
    <>
      <div
        className={cn(
          'fixed inset-0 bg-black/60 backdrop-blur-sm z-40 transition-opacity duration-300',
          isOpen ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'
        )}
        onClick={onClose}
      />
      <aside
        className={cn(
          'fixed inset-y-0 right-0 z-50 w-full sm:w-[420px] bg-slate-950/95 backdrop-blur-2xl border-l border-white/10',
          'transition-transform duration-300 ease-in-out overflow-y-auto',
          isOpen ? 'translate-x-0' : 'translate-x-full'
        )}
      >
        <div className="p-5 border-b border-white/10 flex items-center justify-between">
          <div>
            <p className="text-xs text-white/50 uppercase tracking-wide flex items-center gap-2">
              <Sparkles className="w-3.5 h-3.5 text-violet-300" />
              AI Command Center
            </p>
            <h2 className="text-xl font-semibold text-white mt-1">Operational Agents</h2>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-lg hover:bg-white/10 transition-colors"
          >
            <X className="w-5 h-5 text-white/60" />
          </button>
        </div>

        <div className="p-5 space-y-4">
          {agents.map(agent => {
            const Icon = iconMap[agent.name] ?? Sparkles;
            const leadMetric = agent.metrics[0];
            return (
              <div
                key={agent.id}
                className="p-4 rounded-2xl border border-white/10 bg-white/5 hover:bg-white/10 transition-all cursor-pointer"
                onClick={() => {
                  navigate(`/agents/${agent.id}`);
                  onClose();
                }}
              >
                <div className="flex items-start gap-3">
                  <div className="p-3 rounded-2xl bg-gradient-to-br from-violet-500 to-fuchsia-500 text-white">
                    <Icon className="w-5 h-5" />
                  </div>
                  <div className="flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <h3 className="text-lg font-semibold text-white">{agent.name}</h3>
                      <GlassBadge variant="primary" size="sm">
                        {agent.focus}
                      </GlassBadge>
                    </div>
                    <p className="text-sm text-white/60 mt-1">{agent.description}</p>
                  </div>
                  <ArrowRight className="w-4 h-4 text-white/40" />
                </div>
                {leadMetric && (
                  <div className="mt-4 flex items-center justify-between text-sm text-white/70">
                    <div>
                      <p className="text-xs text-white/40 uppercase tracking-wide">{leadMetric.label}</p>
                      <p className="text-lg font-semibold text-white">{leadMetric.value}</p>
                    </div>
                    <GlassButton variant="ghost" size="sm">
                      Open Agent
                    </GlassButton>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </aside>
    </>
  );
};
