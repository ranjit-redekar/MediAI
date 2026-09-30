import React from 'react';
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer
} from 'recharts';
import { GlassCard } from '../components/ui/GlassCard';
import { GlassBadge } from '../components/ui/GlassBadge';
import { PageHeader } from '../components/ui/PageHeader';
import { AIActionQueue } from '../components/ai/AIActionQueue';
import { TodaySchedule } from '../components/dashboard/TodaySchedule';
import { db } from '../data';
import { useSession } from '../context/SessionContext';
import { cn } from '../utils/cn';

const ChartTooltip = ({ active, payload, label }: { active?: boolean; payload?: { value: number; name: string; color: string }[]; label?: string }) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="glass-modal border rounded-xl px-3 py-2 shadow-lifted text-xs">
      {label && <p className="text-app-subtle mb-1">{label}</p>}
      {payload.map((p, i) => (
        <p key={i} className="font-semibold text-app flex items-center gap-1.5">
          <span className="w-2 h-2 rounded-full" style={{ background: p.color }} />
          {p.name === 'revenue' ? `$${p.value.toLocaleString()}` : p.value.toLocaleString()}
        </p>
      ))}
    </div>
  );
};

/**
 * Opens on the work waiting for this role — drafts to approve, then the day's
 * list. No KPI tiles: a headcount or a growth sparkline is something to read,
 * not something to do, and it asked every role to scroll past it first.
 */
export const Dashboard: React.FC = () => {
  const { role, canSeeNav } = useSession();

  const showFinance = canSeeNav('billing');
  // Roles that run a clinic day get their list; pharmacy and lab do not.
  const showSchedule = canSeeNav('appointments');
  const firstName = role.demoUser.name.replace(/^Dr\.\s+/, '').split(' ')[0];

  return (
    <div className="space-y-5">
      <PageHeader
        title={`Good to see you, ${firstName}`}
        subtitle={role.persona}
        eyebrow={
          <span className={cn('inline-flex items-center px-2 py-0.5 rounded-md text-[11px] font-semibold', role.accent.bg, role.accent.text)}>
            {role.name}
          </span>
        }
      />

      {showSchedule ? (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          <div className="min-w-0">
            <AIActionQueue limit={3} />
          </div>
          <div className="min-w-0">
            <TodaySchedule />
          </div>
        </div>
      ) : (
        <div className="max-w-3xl">
          <AIActionQueue limit={5} />
        </div>
      )}

      {/* Revenue — finance-facing roles only */}
      {showFinance && (
      <div>
        <GlassCard hover={false} className="reveal" style={{ animationDelay: '160ms' }}>
          <div className="flex items-start justify-between mb-4">
            <div>
              <h3 className="text-base font-semibold text-app">Revenue Overview</h3>
              <p className="text-app-subtle text-xs">Revenue &amp; appointment volume</p>
            </div>
            <GlassBadge variant="info" size="sm">6 months</GlassBadge>
          </div>
          <div className="h-56">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={db.revenueChartData} margin={{ top: 4, right: 4, left: -8, bottom: 0 }}>
                <defs>
                  <linearGradient id="rev" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#6366f1" stopOpacity={0.35} />
                    <stop offset="95%" stopColor="#6366f1" stopOpacity={0} />
                  </linearGradient>
                  <linearGradient id="appt" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#06b6d4" stopOpacity={0.2} />
                    <stop offset="95%" stopColor="#06b6d4" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid yAxisId="revenue" strokeDasharray="3 3" stroke="rgba(148,163,184,0.15)" vertical={false} />
                <XAxis dataKey="month" stroke="rgba(148,163,184,0.6)" fontSize={12} tickLine={false} axisLine={false} />
                {/* Revenue (~$100k) and visits (~500) need their own scales, or visits flatline at zero. */}
                <YAxis yAxisId="revenue" stroke="rgba(148,163,184,0.6)" fontSize={12} tickLine={false} axisLine={false} width={48} tickFormatter={v => `$${Math.round(v / 1000)}k`} />
                <YAxis yAxisId="appointments" orientation="right" stroke="rgba(148,163,184,0.6)" fontSize={12} tickLine={false} axisLine={false} width={36} />
                <Tooltip content={<ChartTooltip />} />
                <Area yAxisId="revenue" type="monotone" dataKey="revenue" stroke="#6366f1" strokeWidth={2.5} fill="url(#rev)" animationDuration={1200} />
                <Area yAxisId="appointments" type="monotone" dataKey="appointments" stroke="#06b6d4" strokeWidth={2} fill="url(#appt)" animationDuration={1400} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </GlassCard>

      </div>
      )}
    </div>
  );
};
