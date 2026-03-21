import React, { useState } from 'react';
import {
  Brain, AlertTriangle, CheckCircle, TrendingUp, Activity, Shield,
  Sparkles, Zap, Eye, ChevronDown, ChevronUp, Users,
  Target, BarChart2, RefreshCw
} from 'lucide-react';
import {
  RadarChart, Radar, PolarGrid, PolarAngleAxis,
  ResponsiveContainer, AreaChart, Area, XAxis, YAxis,
  CartesianGrid, Tooltip, BarChart, Bar, Cell
} from 'recharts';
import { GlassCard } from '../components/ui/GlassCard';
import { GlassBadge } from '../components/ui/GlassBadge';
import { GlassButton } from '../components/ui/GlassButton';
import { db } from '../data';

const riskRadarData = [
  { subject: 'Cardiovascular', A: 80 },
  { subject: 'Diabetes', A: 65 },
  { subject: 'Respiratory', A: 45 },
  { subject: 'Mental Health', A: 55 },
  { subject: 'Oncology', A: 30 },
  { subject: 'Infection', A: 60 },
];

const aiAccuracyData = [
  { month: 'Aug', accuracy: 82, predictions: 45 },
  { month: 'Sep', accuracy: 85, predictions: 62 },
  { month: 'Oct', accuracy: 88, predictions: 78 },
  { month: 'Nov', accuracy: 91, predictions: 95 },
  { month: 'Dec', accuracy: 89, predictions: 110 },
  { month: 'Jan', accuracy: 94, predictions: 128 },
];

export const AIInsights: React.FC = () => {
  const [expandedInsight, setExpandedInsight] = useState<string | null>(null);
  const [activeFilter, setActiveFilter] = useState<string>('all');
  const [isScanning, setIsScanning] = useState(false);

  const criticalCount = db.aiInsights.filter(i => i.severity === 'Critical').length;
  const highCount = db.aiInsights.filter(i => i.severity === 'High').length;
  const mediumCount = db.aiInsights.filter(i => i.severity === 'Medium').length;
  const lowCount = db.aiInsights.filter(i => i.severity === 'Low').length;

  const filteredInsights = activeFilter === 'all'
    ? db.aiInsights
    : db.aiInsights.filter(i => i.severity === activeFilter);

  const getSeverityConfig = (severity: string) => {
    switch (severity) {
      case 'Critical': return {
        icon: <AlertTriangle className="w-5 h-5" />,
        color: 'text-red-400',
        bg: 'bg-red-500/20',
        border: 'border-red-500/30',
        barColor: '#ef4444',
        glowClass: 'shadow-red-500/20'
      };
      case 'High': return {
        icon: <Zap className="w-5 h-5" />,
        color: 'text-amber-400',
        bg: 'bg-amber-500/20',
        border: 'border-amber-500/30',
        barColor: '#f59e0b',
        glowClass: 'shadow-amber-500/20'
      };
      case 'Medium': return {
        icon: <Activity className="w-5 h-5" />,
        color: 'text-cyan-400',
        bg: 'bg-cyan-500/20',
        border: 'border-cyan-500/30',
        barColor: '#06b6d4',
        glowClass: 'shadow-cyan-500/20'
      };
      default: return {
        icon: <Shield className="w-5 h-5" />,
        color: 'text-emerald-400',
        bg: 'bg-emerald-500/20',
        border: 'border-emerald-500/30',
        barColor: '#10b981',
        glowClass: 'shadow-emerald-500/20'
      };
    }
  };

  const triggerScan = () => {
    setIsScanning(true);
    setTimeout(() => setIsScanning(false), 2500);
  };

  return (
    <div className="space-y-8">

      {/* Hero Header */}
      <div className="relative overflow-hidden rounded-3xl p-8 bg-gradient-to-r from-violet-600/30 via-fuchsia-600/20 to-indigo-600/30 border border-violet-500/30">
        <div className="absolute inset-0 bg-gradient-to-br from-violet-500/10 to-transparent" />
        <div className="absolute top-0 right-0 w-96 h-96 bg-violet-500/10 rounded-full blur-3xl" />
        <div className="absolute bottom-0 left-0 w-64 h-64 bg-fuchsia-500/10 rounded-full blur-3xl" />

        {/* Animated particles */}
        <div className="absolute top-6 right-24 w-2 h-2 bg-violet-400 rounded-full animate-bounce" />
        <div className="absolute top-16 right-48 w-1.5 h-1.5 bg-fuchsia-400 rounded-full animate-bounce delay-300" />
        <div className="absolute bottom-8 right-32 w-2 h-2 bg-indigo-400 rounded-full animate-bounce delay-700" />

        <div className="relative flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div>
            <div className="flex items-center gap-3 mb-3">
              <div className="p-3 rounded-2xl bg-gradient-to-br from-violet-500 to-fuchsia-500 shadow-lg shadow-violet-500/30">
                <Brain className="w-8 h-8 text-white" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h1 className="text-3xl font-bold text-white">AI Intelligence Center</h1>
                  <Sparkles className="w-6 h-6 text-violet-400 animate-pulse" />
                </div>
                <p className="text-violet-300/80">Real-time AI-powered clinical analytics & predictions</p>
              </div>
            </div>
            <div className="flex flex-wrap items-center gap-3">
              <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-emerald-500/20 border border-emerald-500/30">
                <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                <span className="text-sm text-emerald-400 font-medium">AI Engine Active</span>
              </div>
              <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-violet-500/20 border border-violet-500/30">
                <Target className="w-3 h-3 text-violet-400" />
                <span className="text-sm text-violet-400">{db.aiInsights.length} Active Predictions</span>
              </div>
              <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-indigo-500/20 border border-indigo-500/30">
                <Users className="w-3 h-3 text-indigo-400" />
                <span className="text-sm text-indigo-400">{db.patients.length} Patients Monitored</span>
              </div>
            </div>
          </div>
          <GlassButton
            variant="primary"
            onClick={triggerScan}
            className={isScanning ? 'opacity-70 cursor-not-allowed' : ''}
          >
            <RefreshCw className={`w-4 h-4 mr-2 ${isScanning ? 'animate-spin' : ''}`} />
            {isScanning ? 'Scanning...' : 'Run AI Scan'}
          </GlassButton>
        </div>
      </div>

      {/* Alert Summary Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: 'Critical', count: criticalCount, severity: 'Critical' },
          { label: 'High Risk', count: highCount, severity: 'High' },
          { label: 'Medium', count: mediumCount, severity: 'Medium' },
          { label: 'Low Risk', count: lowCount, severity: 'Low' },
        ].map(({ label, count, severity }) => {
          const config = getSeverityConfig(severity);
          return (
            <button
              key={severity}
              onClick={() => setActiveFilter(activeFilter === severity ? 'all' : severity)}
              className={`
                relative p-5 rounded-2xl border transition-all duration-300 text-left
                ${activeFilter === severity
                  ? `${config.bg} ${config.border} shadow-lg ${config.glowClass}`
                  : 'bg-white/5 border-white/10 hover:bg-white/10'
                }
              `}
            >
              <div className={`p-2.5 rounded-xl ${config.bg} w-fit mb-3`}>
                <span className={config.color}>{config.icon}</span>
              </div>
              <div className="text-3xl font-bold text-white mb-1">{count}</div>
              <div className={`text-sm font-medium ${config.color}`}>{label}</div>
              {count > 0 && severity === 'Critical' && (
                <div className={`absolute top-3 right-3 w-2.5 h-2.5 rounded-full ${config.bg.replace('/20', '')} animate-pulse`} />
              )}
            </button>
          );
        })}
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

        {/* AI Accuracy Trend */}
        <GlassCard>
          <div className="flex items-center justify-between mb-6">
            <div>
              <h3 className="text-lg font-semibold text-white flex items-center gap-2">
                <BarChart2 className="w-5 h-5 text-violet-400" />
                AI Model Performance
              </h3>
              <p className="text-sm text-white/50">Prediction accuracy over time</p>
            </div>
            <div className="text-right">
              <div className="text-2xl font-bold text-violet-400">94%</div>
              <div className="text-xs text-white/50">Current accuracy</div>
            </div>
          </div>
          <div className="h-56">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={aiAccuracyData}>
                <defs>
                  <linearGradient id="colorAccuracy" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#8b5cf6" stopOpacity={0.4} />
                    <stop offset="95%" stopColor="#8b5cf6" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                <XAxis dataKey="month" stroke="rgba(255,255,255,0.4)" tick={{ fontSize: 12 }} />
                <YAxis stroke="rgba(255,255,255,0.4)" tick={{ fontSize: 12 }} domain={[70, 100]} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: 'rgba(15,23,42,0.95)',
                    border: '1px solid rgba(139,92,246,0.3)',
                    borderRadius: '12px',
                    color: '#fff'
                  }}
                  formatter={(value, name) => [
                    name === 'accuracy' ? `${value}%` : value,
                    name === 'accuracy' ? 'Accuracy' : 'Predictions'
                  ]}
                />
                <Area type="monotone" dataKey="accuracy" stroke="#8b5cf6" strokeWidth={2} fill="url(#colorAccuracy)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </GlassCard>

        {/* Risk Distribution Radar */}
        <GlassCard>
          <div className="flex items-center justify-between mb-6">
            <div>
              <h3 className="text-lg font-semibold text-white flex items-center gap-2">
                <Target className="w-5 h-5 text-fuchsia-400" />
                Risk Distribution by Category
              </h3>
              <p className="text-sm text-white/50">Across all monitored patients</p>
            </div>
          </div>
          <div className="h-56">
            <ResponsiveContainer width="100%" height="100%">
              <RadarChart data={riskRadarData}>
                <PolarGrid stroke="rgba(255,255,255,0.1)" />
                <PolarAngleAxis dataKey="subject" tick={{ fill: 'rgba(255,255,255,0.6)', fontSize: 11 }} />
                <Radar name="Risk" dataKey="A" stroke="#d946ef" fill="#d946ef" fillOpacity={0.2} strokeWidth={2} />
              </RadarChart>
            </ResponsiveContainer>
          </div>
        </GlassCard>
      </div>

      {/* Alert Insights List */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-xl font-semibold text-white">
            {activeFilter === 'all' ? 'All AI Insights' : `${activeFilter} Alerts`}
            <span className="ml-2 text-sm text-white/40">({filteredInsights.length})</span>
          </h3>
          {activeFilter !== 'all' && (
            <button
              onClick={() => setActiveFilter('all')}
              className="text-sm text-white/50 hover:text-white transition-colors"
            >
              Clear filter
            </button>
          )}
        </div>

        <div className="space-y-4">
          {filteredInsights.map((insight) => {
            const patient = db.patients.find(p => p.id === insight.patientId);
            const config = getSeverityConfig(insight.severity);
            const isExpanded = expandedInsight === insight.id;

            return (
              <div
                key={insight.id}
                className={`
                  rounded-2xl border transition-all duration-300 overflow-hidden
                  ${config.bg} ${config.border}
                  ${insight.severity === 'Critical' ? `shadow-lg ${config.glowClass}` : ''}
                `}
              >
                {/* Card Header */}
                <button
                  className="w-full p-5 flex items-start gap-4 text-left"
                  onClick={() => setExpandedInsight(isExpanded ? null : insight.id)}
                >
                  <div className={`p-2.5 rounded-xl bg-black/20 ${config.color} flex-shrink-0`}>
                    {config.icon}
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex flex-wrap items-center gap-2 mb-1">
                      <span className="font-semibold text-white">{insight.type}</span>
                      <GlassBadge
                        variant={insight.severity === 'Critical' ? 'danger' : insight.severity === 'High' ? 'warning' : insight.severity === 'Medium' ? 'info' : 'success'}
                        size="sm"
                      >
                        {insight.severity}
                      </GlassBadge>
                      {insight.severity === 'Critical' && (
                        <span className="px-2 py-0.5 rounded-full text-xs bg-red-500/30 text-red-300 border border-red-500/30 animate-pulse">
                          Urgent Action Needed
                        </span>
                      )}
                    </div>
                    <div className="flex items-center gap-3 text-sm text-white/60">
                      <span>{patient?.name ?? 'Unknown Patient'}</span>
                      <span>•</span>
                      <span>AI Confidence: <span className={`font-medium ${config.color}`}>{insight.confidence}%</span></span>
                      <span>•</span>
                      <span>{new Date(insight.createdAt).toLocaleDateString()}</span>
                    </div>
                  </div>

                  <div className="flex items-center gap-3 flex-shrink-0">
                    {/* Confidence Bar */}
                    <div className="hidden md:block w-24">
                      <div className="h-1.5 bg-white/10 rounded-full overflow-hidden">
                        <div
                          className={`h-full rounded-full transition-all ${
                            insight.confidence >= 80 ? 'bg-violet-500' : 'bg-amber-500'
                          }`}
                          style={{ width: `${insight.confidence}%` }}
                        />
                      </div>
                    </div>
                    {isExpanded
                      ? <ChevronUp className="w-5 h-5 text-white/40" />
                      : <ChevronDown className="w-5 h-5 text-white/40" />
                    }
                  </div>
                </button>

                {/* Expanded Content */}
                {isExpanded && (
                  <div className="px-5 pb-5 border-t border-white/10">
                    <div className="pt-4 grid grid-cols-1 md:grid-cols-2 gap-6">
                      {/* Description */}
                      <div>
                        <p className="text-sm font-medium text-white/50 mb-2 flex items-center gap-1">
                          <Brain className="w-3.5 h-3.5" /> AI Analysis
                        </p>
                        <p className="text-white/80 text-sm leading-relaxed">{insight.description}</p>

                        {patient && (
                          <div className="mt-4 flex items-center gap-3 p-3 rounded-xl bg-white/5">
                            <img src={patient.avatar} alt={patient.name} className="w-10 h-10 rounded-full" />
                            <div>
                              <p className="font-medium text-white text-sm">{patient.name}</p>
                              <p className="text-xs text-white/50">{patient.age} yrs • {patient.status}</p>
                            </div>
                            {patient.aiRiskScore && (
                              <div className="ml-auto text-right">
                                <div className={`text-lg font-bold ${
                                  patient.aiRiskScore >= 70 ? 'text-red-400' :
                                  patient.aiRiskScore >= 40 ? 'text-amber-400' : 'text-emerald-400'
                                }`}>{patient.aiRiskScore}</div>
                                <div className="text-xs text-white/40">risk score</div>
                              </div>
                            )}
                          </div>
                        )}
                      </div>

                      {/* Recommendations */}
                      <div>
                        <p className="text-sm font-medium text-white/50 mb-3 flex items-center gap-1">
                          <CheckCircle className="w-3.5 h-3.5 text-emerald-400" /> AI Recommendations
                        </p>
                        <ul className="space-y-2">
                          {insight.recommendations.map((rec, idx) => (
                            <li key={idx} className="flex items-start gap-2.5 text-sm text-white/80">
                              <div className="w-5 h-5 rounded-full bg-emerald-500/20 flex items-center justify-center flex-shrink-0 mt-0.5">
                                <span className="text-emerald-400 text-xs">{idx + 1}</span>
                              </div>
                              {rec}
                            </li>
                          ))}
                        </ul>
                      </div>
                    </div>

                    <div className="flex gap-3 mt-4 pt-4 border-t border-white/10">
                      <GlassButton variant="primary" size="sm">
                        <Eye className="w-4 h-4 mr-1.5" /> View Patient
                      </GlassButton>
                      <GlassButton variant="ghost" size="sm">
                        <CheckCircle className="w-4 h-4 mr-1.5" /> Mark Reviewed
                      </GlassButton>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
