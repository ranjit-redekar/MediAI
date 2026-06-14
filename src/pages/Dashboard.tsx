import React from 'react';
import {
  Users, UserRound, Calendar, CreditCard, Activity, Brain,
  AlertCircle, Sparkles, Zap, Shield, ChevronRight, ArrowUpRight
} from 'lucide-react';
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
import { AIDashboardWidget } from '../components/ai/AIDashboardWidget';
import { AIAgentShowcase } from '../components/ai/AIAgentShowcase';
import { db } from '../data';

const COLORS = ['#6366f1', '#06b6d4', '#8b5cf6', '#10b981', '#f59e0b'];
const revenueSpark = db.revenueChartData.map(d => d.revenue);
const apptSpark = db.revenueChartData.map(d => d.appointments);

const statCards = [
  { label: 'Total Patients', value: db.dashboardStats.totalPatients, icon: Users, gradient: 'from-blue-500 to-cyan-500', accent: '#22d3ee', change: `+${db.dashboardStats.patientGrowth}%`, trend: 'up' as const, sparkline: [2410, 2520, 2605, 2690, 2780, 2847] },
  { label: 'Total Doctors', value: db.dashboardStats.totalDoctors, icon: UserRound, gradient: 'from-violet-500 to-fuchsia-500', accent: '#c084fc', change: '+3', trend: 'up' as const, sparkline: [42, 43, 45, 46, 47, 48] },
  { label: "Today's Appointments", value: db.dashboardStats.todayAppointments, icon: Calendar, gradient: 'from-emerald-500 to-teal-500', accent: '#34d399', change: `+${db.dashboardStats.appointmentGrowth}%`, trend: 'up' as const, sparkline: apptSpark },
  { label: 'Monthly Revenue', value: db.dashboardStats.monthlyRevenue, icon: CreditCard, gradient: 'from-amber-500 to-orange-500', accent: '#fbbf24', prefix: '$', change: `+${db.dashboardStats.revenueGrowth}%`, trend: 'up' as const, sparkline: revenueSpark },
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
  const criticalAlerts = db.aiInsights.filter(i => i.severity === 'Critical' || i.severity === 'High');
  const totalPatients = db.patientDemographics.reduce((s, d) => s + d.value, 0);

  return (
    <div className="space-y-6">
      <PageHeader
        title="Dashboard"
        subtitle="Welcome back, Dr. Admin — here's what's happening today."
        actions={
          <>
            <GlassBadge variant="primary" size="md">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 mr-1.5 animate-pulse" />
              AI Engine Live
            </GlassBadge>
            <GlassButton variant="primary" onClick={() => navigate('/ai-insights')}>
              <Sparkles className="w-4 h-4" />
              Run AI Scan
            </GlassButton>
          </>
        }
      />

      {/* KPI cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        {statCards.map((s, i) => (
          <StatCard key={s.label} {...s} index={i} />
        ))}
      </div>

      {/* AI Intelligence Hub */}
      <div className="reveal" style={{ animationDelay: '120ms' }}>
        <AIDashboardWidget />
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        {/* Revenue */}
        <GlassCard className="lg:col-span-2 reveal" style={{ animationDelay: '160ms' }}>
          <div className="flex items-start justify-between mb-6">
            <div>
              <h3 className="text-lg font-semibold text-app">Revenue Overview</h3>
              <p className="text-app-subtle text-sm">Monthly revenue & appointment volume</p>
            </div>
            <GlassBadge variant="info">Last 6 Months</GlassBadge>
          </div>
          <div className="h-72">
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

        {/* Demographics donut */}
        <GlassCard className="reveal" style={{ animationDelay: '200ms' }}>
          <h3 className="text-lg font-semibold text-app mb-1">Patient Demographics</h3>
          <p className="text-app-subtle text-sm mb-2">By age group</p>
          <div className="h-52 relative">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={db.patientDemographics}
                  cx="50%" cy="50%"
                  innerRadius={62} outerRadius={84}
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
              <span className="text-2xl font-bold text-app tabular-nums">{totalPatients.toLocaleString()}</span>
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

      {/* AI Agents */}
      <div className="reveal" style={{ animationDelay: '120ms' }}>
        <AIAgentShowcase />
      </div>

      {/* Alerts + Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        {/* Critical alerts */}
        <GlassCard className="relative overflow-hidden reveal" style={{ animationDelay: '120ms' }}>
          <div className="absolute inset-0 bg-gradient-to-br from-red-500/[0.06] to-transparent pointer-events-none" />
          <div className="relative">
            <div className="flex items-center justify-between mb-5">
              <div className="flex items-center gap-2.5">
                <div className="p-2 rounded-xl bg-red-500/15">
                  <Brain className="w-5 h-5 text-red-400" />
                </div>
                <div>
                  <h3 className="text-base font-semibold text-app flex items-center gap-1.5">
                    AI Critical Alerts <Sparkles className="w-3.5 h-3.5 text-red-400" />
                  </h3>
                  <p className="text-xs text-app-subtle">Requires immediate attention</p>
                </div>
              </div>
              <GlassBadge variant="danger">{criticalAlerts.length} Active</GlassBadge>
            </div>
            <div className="space-y-2.5">
              {criticalAlerts.slice(0, 3).map((alert, i) => (
                <button
                  key={alert.id}
                  onClick={() => navigate('/ai-insights')}
                  className="reveal w-full text-left flex items-start gap-3 p-3.5 rounded-xl bg-red-500/[0.07] border border-red-500/15 hover:bg-red-500/[0.12] transition-colors group"
                  style={{ animationDelay: `${160 + i * 70}ms` }}
                >
                  <div className="p-1.5 rounded-lg bg-red-500/15 mt-0.5">
                    <AlertCircle className="w-4 h-4 text-red-400" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-0.5">
                      <p className="text-sm font-medium text-app truncate">{alert.type}</p>
                      <GlassBadge variant={alert.severity === 'Critical' ? 'danger' : 'warning'} size="sm">{alert.severity}</GlassBadge>
                    </div>
                    <p className="text-xs text-app-muted truncate">{alert.description}</p>
                    <div className="flex items-center gap-2 mt-1.5 text-xs">
                      <span className="text-app-subtle">{db.patients.find(p => p.id === alert.patientId)?.name}</span>
                      <span className="text-app-subtle">·</span>
                      <span className="text-violet-400 font-medium">{alert.confidence}% confident</span>
                    </div>
                  </div>
                  <ChevronRight className="w-4 h-4 text-app-subtle group-hover:translate-x-0.5 transition-transform mt-1" />
                </button>
              ))}
            </div>
          </div>
        </GlassCard>

        {/* Recent activity */}
        <GlassCard className="reveal" style={{ animationDelay: '160ms' }}>
          <div className="flex items-center justify-between mb-5">
            <div className="flex items-center gap-2.5">
              <div className="p-2 rounded-xl bg-indigo-500/15">
                <Activity className="w-5 h-5 text-indigo-400" />
              </div>
              <div>
                <h3 className="text-base font-semibold text-app">Recent Activity</h3>
                <p className="text-xs text-app-subtle">Live hospital feed</p>
              </div>
            </div>
            <span className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-500/15 border border-emerald-500/25">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
              <span className="text-xs text-emerald-400 font-medium">Live</span>
            </span>
          </div>
          <div className="space-y-1">
            {db.recentActivities.map((activity, i) => (
              <div
                key={activity.id}
                className="reveal flex items-start gap-3 p-2.5 rounded-xl hover:bg-[var(--surface-2)] transition-colors"
                style={{ animationDelay: `${180 + i * 60}ms` }}
              >
                <div className={`w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0 ${
                  activity.type === 'ai' ? 'bg-violet-500/15' :
                  activity.type === 'appointment' ? 'bg-indigo-500/15' :
                  activity.type === 'lab' ? 'bg-cyan-500/15' : 'bg-emerald-500/15'}`}>
                  {activity.type === 'ai' && <Brain className="w-4 h-4 text-violet-400" />}
                  {activity.type === 'appointment' && <Calendar className="w-4 h-4 text-indigo-400" />}
                  {activity.type === 'lab' && <Zap className="w-4 h-4 text-cyan-400" />}
                  {activity.type === 'patient' && <Shield className="w-4 h-4 text-emerald-400" />}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm text-app leading-snug">{activity.description}</p>
                  <p className="text-sm text-app-muted">{activity.patient}</p>
                  <p className="text-xs text-app-subtle mt-0.5">{activity.time}</p>
                </div>
                {activity.type === 'ai' && (
                  <span className="text-[10px] px-2 py-0.5 rounded-full bg-violet-500/15 text-violet-300 font-medium flex items-center gap-1 flex-shrink-0">
                    <Sparkles className="w-2.5 h-2.5" /> AI
                  </span>
                )}
              </div>
            ))}
          </div>
          <button onClick={() => navigate('/patients')} className="w-full mt-3 flex items-center justify-center gap-1.5 text-sm text-app-muted hover:text-app transition-colors py-2">
            View all activity <ArrowUpRight className="w-3.5 h-3.5" />
          </button>
        </GlassCard>
      </div>
    </div>
  );
};
