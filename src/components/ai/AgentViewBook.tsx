import React from 'react';
import { Sparkles, Quote, Workflow, BookOpenCheck, Clock } from 'lucide-react';
import { GlassCard } from '../ui/GlassCard';
import { GlassBadge } from '../ui/GlassBadge';
import { GlassButton } from '../ui/GlassButton';
import type { AIAgent } from '../../types';
import { cn } from '../../utils/cn';

interface AgentViewBookProps {
  agent: AIAgent;
}

export const AgentViewBook: React.FC<AgentViewBookProps> = ({ agent }) => {
  const { viewBook } = agent;

  return (
    <div className="space-y-8">
      {/* Cover */}
      <GlassCard className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-violet-600/30 via-fuchsia-600/20 to-indigo-600/30" />
        <div className="relative grid gap-6 md:grid-cols-2">
          <div className="space-y-4">
            <GlassBadge variant="primary" className="w-fit">
              <Sparkles className="w-3 h-3 mr-1" />
              AI Agent Viewbook
            </GlassBadge>
            <h1 className="text-3xl md:text-4xl font-bold text-white">{agent.name}</h1>
            <p className="text-white/70 text-lg">{viewBook.tagline}</p>
            <div className="p-4 rounded-2xl bg-white/10 border border-white/15">
              <p className="text-xs text-white/50 uppercase tracking-wide mb-1">Mission</p>
              <p className="text-white font-semibold leading-relaxed">{viewBook.mission}</p>
            </div>
          </div>
          <div className="space-y-4">
            <div className="p-4 rounded-2xl bg-white/5 border border-white/10">
              <p className="text-xs text-white/50 uppercase tracking-wide mb-1">Promise</p>
              <p className="text-white/80">{viewBook.promise}</p>
            </div>
            <div className="grid grid-cols-2 gap-3">
              {agent.metrics.slice(0, 2).map((metric) => (
                <div key={metric.label} className="p-4 rounded-2xl bg-white/5 border border-white/10">
                  <p className="text-xs text-white/40 uppercase tracking-wide">{metric.label}</p>
                  <p className="text-2xl font-bold text-white">{metric.value}</p>
                  {metric.helper && (
                    <p className="text-xs text-white/60">{metric.helper}</p>
                  )}
                </div>
              ))}
            </div>
            <GlassButton variant="ghost" className="w-full">
              Download Brand Book
            </GlassButton>
          </div>
        </div>
      </GlassCard>

      {/* Pillars */}
      <div className="space-y-3">
        <h2 className="text-xl font-semibold text-white">Strategic Pillars</h2>
        <div className="grid gap-4 md:grid-cols-3">
          {viewBook.pillars.map((pillar) => (
            <GlassCard key={pillar.title} className="space-y-2 border-white/10 bg-white/5">
              <div className="flex items-center gap-2">
                <BookOpenCheck className="w-4 h-4 text-violet-300" />
                <p className="text-sm font-semibold text-white">{pillar.title}</p>
              </div>
              <p className="text-sm text-white/70 leading-relaxed">{pillar.description}</p>
              {pillar.badge && (
                <GlassBadge variant="info">{pillar.badge}</GlassBadge>
              )}
            </GlassCard>
          ))}
        </div>
      </div>

      {/* Workflows */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-semibold text-white">Signature Workflows</h2>
          <GlassBadge variant="success">{agent.status}</GlassBadge>
        </div>
        <div className="grid gap-4 md:grid-cols-3">
          {viewBook.workflows.map((flow) => (
            <GlassCard key={flow.title} className="space-y-3 border-white/10 bg-white/5">
              <div className="flex items-center gap-2">
                <Workflow className="w-4 h-4 text-emerald-300" />
                <p className="font-semibold text-white">{flow.title}</p>
              </div>
              <p className="text-sm text-white/70">{flow.description}</p>
              <div className="flex items-center justify-between text-xs text-white/60">
                <span>{flow.impact}</span>
                <span className="text-white font-semibold">{flow.metric}</span>
              </div>
            </GlassCard>
          ))}
        </div>
      </div>

      {/* Success stories */}
      <GlassCard className="space-y-4 border-white/10 bg-white/5">
        <div className="flex items-center gap-2">
          <Quote className="w-5 h-5 text-amber-300" />
          <h2 className="text-xl font-semibold text-white">Success Snapshots</h2>
        </div>
        <div className="grid gap-4 md:grid-cols-2">
          {viewBook.successStories.map((story) => (
            <div key={story.title} className="p-4 rounded-2xl bg-white/5 border border-white/10">
              <p className="text-sm text-white/50 uppercase tracking-wide">{story.title}</p>
              <p className="text-3xl font-bold text-white mt-1">{story.result}</p>
              <p className="text-sm text-white/70 mt-2">{story.detail}</p>
            </div>
          ))}
        </div>
      </GlassCard>

      {/* Timeline */}
      <GlassCard className="border-white/10 bg-white/5">
        <div className="flex items-center gap-2 mb-4">
          <Clock className="w-5 h-5 text-cyan-300" />
          <h2 className="text-xl font-semibold text-white">Activation Timeline</h2>
        </div>
        <div className="space-y-4">
          {viewBook.timeline.map((event, index) => (
            <div key={event.phase} className="flex gap-4">
              <div className="flex flex-col items-center">
                <div className={cn(
                  'w-3 h-3 rounded-full',
                  index === 0 ? 'bg-emerald-400' : 'bg-white/40'
                )} />
                {index !== viewBook.timeline.length - 1 && (
                  <div className="w-px flex-1 bg-white/10" />
                )}
              </div>
              <div className="flex-1">
                <p className="text-sm font-semibold text-white">{event.phase}</p>
                <p className="text-sm text-white/70">{event.detail}</p>
                <p className="text-xs text-white/40 mt-1">{event.timestamp}</p>
              </div>
            </div>
          ))}
        </div>
      </GlassCard>
    </div>
  );
};
