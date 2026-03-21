import React from 'react';
import {
  Users,
  UserRound,
  Calendar,
  CreditCard,
  TrendingUp,
  TrendingDown,
  Activity,
  Brain,
  AlertCircle,
  Sparkles,
  Zap,
  Shield,
  ChevronRight
} from 'lucide-react';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell
} from 'recharts';
import { GlassCard } from '../components/ui/GlassCard';
import { GlassBadge } from '../components/ui/GlassBadge';
import { AIDashboardWidget } from '../components/ai/AIDashboardWidget';
import { AIAgentShowcase } from '../components/ai/AIAgentShowcase';
import { db } from '../data';

const stats = [
  {
    title: 'Total Patients',
    value: db.dashboardStats.totalPatients.toLocaleString(),
    icon: Users,
    change: `+${db.dashboardStats.patientGrowth}%`,
    trend: 'up',
    color: 'from-blue-500 to-cyan-500'
  },
  {
    title: 'Total Doctors',
    value: db.dashboardStats.totalDoctors.toString(),
    icon: UserRound,
    change: '+3',
    trend: 'up',
    color: 'from-purple-500 to-pink-500'
  },
  {
    title: "Today's Appointments",
    value: db.dashboardStats.todayAppointments.toString(),
    icon: Calendar,
    change: `+${db.dashboardStats.appointmentGrowth}%`,
    trend: 'up',
    color: 'from-emerald-500 to-teal-500'
  },
  {
    title: 'Monthly Revenue',
    value: `$${db.dashboardStats.monthlyRevenue.toLocaleString()}`,
    icon: CreditCard,
    change: `+${db.dashboardStats.revenueGrowth}%`,
    trend: 'up',
    color: 'from-amber-500 to-orange-500'
  }
];

const COLORS = ['#6366f1', '#06b6d4', '#8b5cf6', '#10b981', '#f59e0b'];

export const Dashboard: React.FC = () => {
  const criticalAlerts = db.aiInsights.filter(i => i.severity === 'Critical' || i.severity === 'High');

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-white">Dashboard</h1>
          <p className="text-white/60 mt-1">Welcome back! Here's what's happening today.</p>
        </div>
        <div className="flex items-center gap-2">
          <GlassBadge variant="primary" size="md">
            <Brain className="w-3 h-3 mr-1" />
            AI Powered
          </GlassBadge>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, index) => (
          <GlassCard key={stat.title} className="animate-slide-up" style={{ animationDelay: `${index * 100}ms` }}>
            <div className="flex items-start justify-between">
              <div>
                <p className="text-white/60 text-sm">{stat.title}</p>
                <h3 className="text-2xl font-bold text-white mt-1">{stat.value}</h3>
                <div className="flex items-center gap-1 mt-2">
                  {stat.trend === 'up' ? (
                    <TrendingUp className="w-4 h-4 text-emerald-400" />
                  ) : (
                    <TrendingDown className="w-4 h-4 text-red-400" />
                  )}
                  <span className={stat.trend === 'up' ? 'text-emerald-400' : 'text-red-400'}>
                    {stat.change}
                  </span>
                  <span className="text-white/40 text-sm">vs last month</span>
                </div>
              </div>
              <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${stat.color} flex items-center justify-center`}>
                <stat.icon className="w-6 h-6 text-white" />
              </div>
            </div>
          </GlassCard>
        ))}
      </div>

      {/* AI Intelligence Hub Widget */}
      <AIDashboardWidget />

      {/* AI Agents Overview */}
      <AIAgentShowcase />

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Revenue Chart */}
        <GlassCard className="lg:col-span-2">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h3 className="text-lg font-semibold text-white">Revenue Overview</h3>
              <p className="text-white/50 text-sm">Monthly revenue and appointments</p>
            </div>
            <GlassBadge variant="info">Last 6 Months</GlassBadge>
          </div>
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={db.revenueChartData}>
                <defs>
                  <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#6366f1" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#6366f1" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
                <XAxis dataKey="month" stroke="rgba(255,255,255,0.5)" />
                <YAxis stroke="rgba(255,255,255,0.5)" />
                <Tooltip
                  contentStyle={{
                    backgroundColor: 'rgba(15, 23, 42, 0.9)',
                    border: '1px solid rgba(255,255,255,0.2)',
                    borderRadius: '12px'
                  }}
                />
                <Area
                  type="monotone"
                  dataKey="revenue"
                  stroke="#6366f1"
                  fillOpacity={1}
                  fill="url(#colorRevenue)"
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </GlassCard>

        {/* Patient Demographics */}
        <GlassCard>
          <h3 className="text-lg font-semibold text-white mb-6">Patient Demographics</h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={db.patientDemographics}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={80}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {db.patientDemographics.map((_, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{
                    backgroundColor: 'rgba(15, 23, 42, 0.9)',
                    border: '1px solid rgba(255,255,255,0.2)',
                    borderRadius: '12px'
                  }}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div className="grid grid-cols-2 gap-2 mt-4">
            {db.patientDemographics.map((item, index) => (
              <div key={item.name} className="flex items-center gap-2">
                <div
                  className="w-3 h-3 rounded-full"
                  style={{ backgroundColor: COLORS[index % COLORS.length] }}
                />
                <span className="text-sm text-white/70">{item.name}</span>
              </div>
            ))}
          </div>
        </GlassCard>
      </div>

      {/* AI Alerts & Recent Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* AI Critical Alerts */}
        <GlassCard className="relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-red-500/5 to-transparent" />
          <div className="relative">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-2">
                <div className="p-2 rounded-xl bg-red-500/20">
                  <Brain className="w-5 h-5 text-red-400" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-white flex items-center gap-2">
                    AI Critical Alerts
                    <Sparkles className="w-4 h-4 text-red-400" />
                  </h3>
                  <p className="text-xs text-white/40">Requires immediate attention</p>
                </div>
              </div>
              <GlassBadge variant="danger">
                {criticalAlerts.length} Active
              </GlassBadge>
            </div>
            <div className="space-y-3">
              {criticalAlerts.slice(0, 3).map((alert) => (
                <div
                  key={alert.id}
                  className="flex items-start gap-3 p-4 rounded-2xl bg-red-500/10 border border-red-500/20 hover:bg-red-500/15 transition-colors cursor-pointer group"
                >
                  <div className="p-2 rounded-lg bg-red-500/20">
                    <AlertCircle className="w-4 h-4 text-red-400" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <p className="text-sm font-medium text-white truncate">{alert.type}</p>
                      <GlassBadge variant={alert.severity === 'Critical' ? 'danger' : 'warning'} size="sm">
                        {alert.severity}
                      </GlassBadge>
                    </div>
                    <p className="text-xs text-white/60 truncate">{alert.description}</p>
                    <div className="flex items-center gap-3 mt-2">
                      <span className="text-xs text-white/40">
                        {db.patients.find(p => p.id === alert.patientId)?.name}
                      </span>
                      <span className="text-xs text-white/40">•</span>
                      <span className="text-xs text-violet-400">AI: {alert.confidence}% confident</span>
                    </div>
                  </div>
                  <ChevronRight className="w-4 h-4 text-white/30 group-hover:text-white/60 transition-colors flex-shrink-0 mt-1" />
                </div>
              ))}
            </div>
          </div>
        </GlassCard>

        {/* Recent Activity */}
        <GlassCard>
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-2">
              <div className="p-2 rounded-xl bg-indigo-500/20">
                <Activity className="w-5 h-5 text-indigo-400" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-white">Recent Activity</h3>
                <p className="text-xs text-white/40">Live hospital feed</p>
              </div>
            </div>
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-emerald-500/20 border border-emerald-500/30">
              <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
              <span className="text-xs text-emerald-400">Live</span>
            </div>
          </div>
          <div className="space-y-4">
            {db.recentActivities.map((activity) => (
              <div key={activity.id} className="flex items-start gap-3 group">
                <div className={`
                  w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0
                  ${activity.type === 'ai' ? 'bg-violet-500/20' :
                    activity.type === 'appointment' ? 'bg-indigo-500/20' :
                    activity.type === 'lab' ? 'bg-cyan-500/20' : 'bg-emerald-500/20'}
                `}>
                  {activity.type === 'ai' && <Brain className="w-4 h-4 text-violet-400" />}
                  {activity.type === 'appointment' && <Calendar className="w-4 h-4 text-indigo-400" />}
                  {activity.type === 'lab' && <Zap className="w-4 h-4 text-cyan-400" />}
                  {activity.type === 'patient' && <Shield className="w-4 h-4 text-emerald-400" />}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm text-white">{activity.description}</p>
                  <p className="text-sm text-white/60">{activity.patient}</p>
                  <p className="text-xs text-white/40 mt-0.5">{activity.time}</p>
                </div>
                {activity.type === 'ai' && (
                  <span className="text-xs px-2 py-0.5 rounded-full bg-violet-500/20 text-violet-400 border border-violet-500/30 flex-shrink-0">
                    AI
                  </span>
                )}
              </div>
            ))}
          </div>
        </GlassCard>
      </div>
    </div>
  );
};
