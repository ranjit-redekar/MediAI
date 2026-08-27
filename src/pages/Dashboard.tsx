import React from 'react';
import { Users, UserRound, Calendar, CreditCard, Sparkles } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell
} from 'recharts';
import { GlassCard } from '../components/ui/GlassCard';
import { GlassBadge } from '../components/ui/GlassBadge';
import { GlassButton } from '../components/ui/GlassButton';
import { PageHeader } from '../components/ui/PageHeader';
import { StatCard } from '../components/ui/StatCard';
import { AIActionQueue } from '../components/ai/AIActionQueue';
import { ActivityFeed } from '../components/dashboard/ActivityFeed';
import { db } from '../data';
import { useSession } from '../context/SessionContext';
import { cn } from '../utils/cn';

const COLORS = ['#6366f1', '#06b6d4', '#8b5cf6', '#10b981', '#f59e0b'];

/** Shape of a dashboard KPI tile, before role filtering. */
interface StatCardSpec {
  label: string;
  value: number;
  icon: typeof Users;
  gradient: string;
  accent: string;
  prefix?: string;
  change: string;
  trend: 'up' | 'down';
  sparkline: number[];
}
const revenueSpark = db.revenueChartData.map(d => d.revenue);
const apptSpark = db.revenueChartData.map(d => d.appointments);

const statCards: (StatCardSpec & { navId: string })[] = [
  { navId: 'patients', label: 'Total Patients', value: db.dashboardStats.totalPatients, icon: Users, gradient: 'from-blue-500 to-cyan-500', accent: '#22d3ee', change: `+${db.dashboardStats.patientGrowth}%`, trend: 'up' as const, sparkline: [2410, 2520, 2605, 2690, 2780, 2847] },
  { navId: 'doctors', label: 'Total Doctors', value: db.dashboardStats.totalDoctors, icon: UserRound, gradient: 'from-violet-500 to-fuchsia-500', accent: '#c084fc', change: '+3', trend: 'up' as const, sparkline: [42, 43, 45, 46, 47, 48] },
  { navId: 'appointments', label: "Today's Appointments", value: db.dashboardStats.todayAppointments, icon: Calendar, gradient: 'from-emerald-500 to-teal-500', accent: '#34d399', change: `+${db.dashboardStats.appointmentGrowth}%`, trend: 'up' as const, sparkline: apptSpark },
  { navId: 'billing', label: 'Monthly Revenue', value: db.dashboardStats.monthlyRevenue, icon: CreditCard, gradient: 'from-amber-500 to-orange-500', accent: '#fbbf24', prefix: '$', change: `+${db.dashboardStats.revenueGrowth}%`, trend: 'up' as const, sparkline: revenueSpark },
];

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

export const Dashboard: React.FC = () => {
  const navigate = useNavigate();
  const { role, canSeeNav } = useSession();
  const totalPatients = db.patientDemographics.reduce((s, d) => s + d.value, 0);

  // A dashboard should only show numbers the viewer can act on. A nurse has no
  // use for monthly revenue, and a lab tech has none for the doctor roster.
  const visibleStats = statCards.filter(card => canSeeNav(card.navId));
  const showFinance = canSeeNav('billing');
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
        actions={
          <GlassButton variant="primary" onClick={() => navigate('/ai-insights')}>
            <Sparkles className="w-4 h-4" />
            Run AI scan
          </GlassButton>
        }
      />

      {/* KPI strip — scoped to what this role owns */}
      {visibleStats.length > 0 && (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {visibleStats.map((s, i) => (
            <StatCard key={s.label} {...s} index={i} />
          ))}
        </div>
      )}

      {/* Working area: what needs you, beside what just happened */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <div className="lg:col-span-2 min-w-0">
          <AIActionQueue limit={3} />
        </div>
        <div className="min-w-0">
          <ActivityFeed onViewAll={() => navigate('/patients')} />
        </div>
      </div>

      {/* Charts */}
      <div className={cn('grid grid-cols-1 gap-4', showFinance && 'lg:grid-cols-3')}>
        {/* Revenue */}
        {showFinance && (
        <GlassCard className="lg:col-span-2 reveal" style={{ animationDelay: '160ms' }}>
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
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(148,163,184,0.15)" vertical={false} />
                <XAxis dataKey="month" stroke="rgba(148,163,184,0.6)" fontSize={12} tickLine={false} axisLine={false} />
                <YAxis stroke="rgba(148,163,184,0.6)" fontSize={12} tickLine={false} axisLine={false} width={48} />
                <Tooltip content={<ChartTooltip />} />
                <Area type="monotone" dataKey="revenue" stroke="#6366f1" strokeWidth={2.5} fill="url(#rev)" animationDuration={1200} />
                <Area type="monotone" dataKey="appointments" stroke="#06b6d4" strokeWidth={2} fill="url(#appt)" animationDuration={1400} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </GlassCard>
        )}

        {/* Demographics donut */}
        <GlassCard className="reveal" style={{ animationDelay: '200ms' }}>
          <h3 className="text-base font-semibold text-app">Patient Demographics</h3>
          <p className="text-app-subtle text-xs mb-2">By age group</p>
          <div className="h-44 relative">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={db.patientDemographics}
                  cx="50%" cy="50%"
                  innerRadius={52} outerRadius={72}
                  paddingAngle={3} dataKey="value"
                  animationDuration={900}
                  stroke="none"
                >
                  {db.patientDemographics.map((_, i) => (
                    <Cell key={i} fill={COLORS[i % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip content={<ChartTooltip />} />
              </PieChart>
            </ResponsiveContainer>
            <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
              <span className="text-xl font-bold text-app tabular-nums">{totalPatients.toLocaleString()}</span>
              <span className="text-xs text-app-subtle">Total</span>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-2 mt-3">
            {db.patientDemographics.map((item, i) => (
              <div key={item.name} className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: COLORS[i % COLORS.length] }} />
                <span className="text-xs text-app-muted">{item.name}</span>
                <span className="text-xs text-app-subtle ml-auto">{item.value}</span>
              </div>
            ))}
          </div>
        </GlassCard>
      </div>

    </div>
  );
};
