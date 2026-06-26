import React from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import {
  ArrowLeft,
  Sparkles,
  Brain,
  Clock,
  ChevronRight,
  Activity,
  Users,
  Calendar,
  UserRound,
  Pill,
  FlaskConical,
  CreditCard
} from 'lucide-react';
import type { LucideIcon } from 'lucide-react';
import { GlassCard } from '../../components/ui/GlassCard';
import { GlassBadge } from '../../components/ui/GlassBadge';
import { GlassButton } from '../../components/ui/GlassButton';
import { db } from '../../data';
import type { RoleDefinition } from '../../types';

const screenIconMap: Record<string, LucideIcon> = {
  Calendar,
  Users,
  Brain,
  UserRound,
  Activity,
  Pill,
  FlaskConical,
  CreditCard
};

const focusColorMap: Record<RoleDefinition['focusAreas'][number]['status'], string> = {
  Healthy: 'bg-emerald-500/10 border-emerald-500/20 text-emerald-200',
  Watch: 'bg-amber-500/10 border-amber-500/20 text-amber-200',
  Critical: 'bg-red-500/10 border-red-500/20 text-red-200'
};

const priorityColorMap = {
  Low: 'bg-white/5 border-white/10 text-white/70',
  Medium: 'bg-cyan-500/10 border-cyan-500/20 text-cyan-200',
  High: 'bg-amber-500/10 border-amber-500/20 text-amber-200',
  Critical: 'bg-red-500/10 border-red-500/20 text-red-200'
} as const;

const severityBadgeMap = {
  info: 'bg-cyan-500/10 border-cyan-500/20 text-cyan-200',
  warning: 'bg-amber-500/10 border-amber-500/20 text-amber-200',
  critical: 'bg-red-500/10 border-red-500/20 text-red-200'
} as const;

export const RoleDetail: React.FC = () => {
  const { roleId } = useParams<{ roleId: string }>();
  const navigate = useNavigate();
  const role = db.roles.find((entry) => entry.id === roleId);

  if (!role) {
    return (
      <GlassCard className="bg-red-500/10 border-red-500/20 text-white space-y-4">
        <p className="text-lg font-semibold">Role not found</p>
        <p className="text-sm text-white/70">
          The requested workspace does not exist. Head back and pick another persona.
        </p>
        <GlassButton variant="primary" onClick={() => navigate('/roles')}>
          Back to roles
        </GlassButton>
      </GlassCard>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
        <button
          onClick={() => navigate('/roles')}
          className="inline-flex items-center gap-2 text-white/70 hover:text-white transition-colors text-sm"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to roles
        </button>
        <GlassBadge variant="primary">
          <Sparkles className="w-4 h-4 mr-1" />
          AI-ready workspace
        </GlassBadge>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <GlassCard className="lg:col-span-2 bg-white/5 border-white/10">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
            <div>
              <p className="text-sm uppercase tracking-wide text-white/40">{role.persona}</p>
              <h1 className="text-2xl sm:text-[28px] font-bold text-app tracking-tight mt-1">{role.name}</h1>
              <p className="text-white/70 mt-2">{role.summary}</p>
              <div className="flex flex-wrap gap-2 mt-4">
                <GlassBadge variant="info">{role.shift}</GlassBadge>
                <GlassBadge variant="success">{role.status}</GlassBadge>
              </div>
            </div>
            <GlassButton
              variant="primary"
              onClick={() => navigate(role.screens[0]?.route ?? '/')}
            >
              Launch {role.screens[0]?.title ?? 'workspace'}
            </GlassButton>
          </div>
        </GlassCard>

        <GlassCard className="bg-gradient-to-br from-primary/20 to-accent/10 border-transparent">
          <div className="flex items-start gap-3">
            <Brain className="w-10 h-10 text-primary-light" />
            <div>
              <p className="text-sm uppercase tracking-wide text-white/60">AI Copilot</p>
              <p className="text-white mt-2">{role.aiCopilot}</p>
              <p className="text-xs text-white/40 mt-3 flex items-center gap-2">
                <Clock className="w-4 h-4" />
                Refreshed every 15 minutes
              </p>
            </div>
          </div>
        </GlassCard>
      </div>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-4">
        {role.metrics.map((metric) => (
          <GlassCard key={metric.label} className="bg-white/5 border-white/10">
            <p className="text-xs uppercase tracking-wide text-white/40">{metric.label}</p>
            <p className="text-2xl font-semibold text-white mt-2">{metric.value}</p>
            {metric.change && (
              <p
                className={`text-sm ${
                  metric.trend === 'down' ? 'text-emerald-300' : 'text-amber-300'
                }`}
              >
                {metric.change}
              </p>
            )}
            {metric.helper && <p className="text-xs text-white/40 mt-2">{metric.helper}</p>}
          </GlassCard>
        ))}
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <GlassCard className="bg-white/5 border-white/10">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-white">Focus Areas</h2>
            <GlassBadge variant="default">{role.focusAreas.length} tracked</GlassBadge>
          </div>
          <div className="space-y-4">
            {role.focusAreas.map((focus) => (
              <div
                key={focus.title}
                className="rounded-2xl border border-white/10 bg-white/5 p-4"
              >
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
                  <p className="text-white font-medium">{focus.title}</p>
                  <span className={`px-3 py-1 rounded-full text-xs font-semibold border ${focusColorMap[focus.status]}`}>
                    {focus.status}
                  </span>
                </div>
                <p className="text-white/70 text-sm mt-2">{focus.description}</p>
                {focus.indicator && (
                  <p className="text-xs text-white/50 mt-1">Indicator: {focus.indicator}</p>
                )}
              </div>
            ))}
          </div>
        </GlassCard>

        <GlassCard className="bg-white/5 border-white/10">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-white">Quick Actions</h2>
            <GlassBadge variant="default">{role.actions.length} shortcuts</GlassBadge>
          </div>
          <div className="space-y-3">
            {role.actions.map((action) => (
              <GlassButton
                key={action.label}
                variant={action.emphasis === 'primary' ? 'primary' : 'ghost'}
                className="w-full flex items-center justify-between"
                onClick={() => navigate(action.route)}
              >
                <span className="text-left">
                  <span className="block font-semibold">{action.label}</span>
                  <span className="block text-xs font-normal opacity-80">{action.description}</span>
                </span>
                <ChevronRight className="w-4 h-4 opacity-60" />
              </GlassButton>
            ))}
          </div>
        </GlassCard>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <GlassCard className="bg-white/5 border-white/10">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-white">Workflows</h2>
            <GlassBadge variant="info">SLA tracker</GlassBadge>
          </div>
          <div className="space-y-4">
            {role.workflows.map((flow) => (
              <div key={flow.title} className="rounded-2xl border border-white/10 bg-white/5 p-4">
                <p className="text-white font-medium">{flow.title}</p>
                <p className="text-white/70 text-sm mt-1">{flow.description}</p>
                <div className="flex flex-wrap items-center gap-3 text-xs text-white/50 mt-2">
                  <span className="inline-flex items-center gap-1">
                    <Clock className="w-3 h-3" />
                    {flow.sla}
                  </span>
                  <span>Updated: {flow.lastUpdated}</span>
                </div>
              </div>
            ))}
          </div>
        </GlassCard>

        <GlassCard className="bg-white/5 border-white/10">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-white">Live Queue</h2>
            <GlassBadge variant="warning">{role.queue.length} items</GlassBadge>
          </div>
          <div className="space-y-3">
            {role.queue.map((ticket) => (
              <div key={ticket.id} className="rounded-2xl border border-white/10 bg-white/5 p-4">
                <div className="flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between">
                  <p className="text-white font-semibold">{ticket.title}</p>
                  <span className={`px-3 py-1 rounded-full text-xs border ${priorityColorMap[ticket.priority]}`}>
                    {ticket.priority}
                  </span>
                </div>
                <p className="text-sm text-white/60 mt-1">{ticket.meta}</p>
                <p className="text-xs text-primary-light mt-2">ETA {ticket.eta}</p>
              </div>
            ))}
          </div>
        </GlassCard>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <GlassCard className="bg-white/5 border-white/10">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-white">Alerts</h2>
            <GlassBadge variant="danger">AI + Ops</GlassBadge>
          </div>
          <div className="space-y-3">
            {role.alerts.map((alert) => (
              <div key={alert.title} className="rounded-2xl border border-white/10 bg-white/5 p-4 space-y-2">
                <div className="flex flex-wrap items-center gap-2">
                  <span className={`px-3 py-1 rounded-full text-xs border ${severityBadgeMap[alert.severity]}`}>
                    {alert.severity.toUpperCase()}
                  </span>
                  <span className="text-xs text-white/50">{alert.timestamp}</span>
                </div>
                <p className="text-white font-medium">{alert.title}</p>
                <p className="text-sm text-white/70">{alert.detail}</p>
                {alert.route && (
                  <button
                    onClick={() => navigate(alert.route!)}
                    className="text-xs text-primary-light hover:text-white transition-colors"
                  >
                    Jump to module →
                  </button>
                )}
              </div>
            ))}
          </div>
        </GlassCard>

        <GlassCard className="bg-white/5 border-white/10">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-white">Screens & Modules</h2>
            <GlassBadge variant="default">{role.screens.length} linked</GlassBadge>
          </div>
          <div className="space-y-3">
            {role.screens.map((screen) => {
              const Icon = screenIconMap[screen.icon] ?? Activity;
              return (
                <div key={screen.title} className="rounded-2xl border border-white/10 bg-white/5 p-4 flex items-center gap-3">
                  <div className="w-12 h-12 rounded-2xl bg-white/10 flex items-center justify-center border border-white/10">
                    <Icon className="w-5 h-5 text-white" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-white font-semibold">{screen.title}</p>
                    <p className="text-sm text-white/60">{screen.description}</p>
                  </div>
                  <GlassBadge variant="info">{screen.badge}</GlassBadge>
                </div>
              );
            })}
          </div>
        </GlassCard>
      </div>

      <GlassCard className="bg-white/5 border-white/10">
        <h2 className="text-lg font-semibold text-white mb-4">Handoff Notes</h2>
        <ul className="space-y-2 list-disc list-inside text-white/70">
          {role.handoffNotes.map((note) => (
            <li key={note}>{note}</li>
          ))}
        </ul>
      </GlassCard>
    </div>
  );
};
