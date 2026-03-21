import React from 'react';
import { Brain, TrendingUp, AlertTriangle, Activity, Sparkles, Zap, Shield } from 'lucide-react';
import { GlassCard } from '../ui/GlassCard';
import { db } from '../../data';

export const AIDashboardWidget: React.FC = () => {
  const criticalAlerts = db.aiInsights.filter(i => i.severity === 'Critical').length;
  const highAlerts = db.aiInsights.filter(i => i.severity === 'High').length;
  const stats = [
    { label: 'AI Predictions', value: db.aiInsights.length, icon: Brain, color: 'text-violet-400', bgColor: 'bg-violet-500/20' },
    { label: 'Critical Alerts', value: criticalAlerts, icon: AlertTriangle, color: 'text-red-400', bgColor: 'bg-red-500/20' },
    { label: 'High Priority', value: highAlerts, icon: Zap, color: 'text-amber-400', bgColor: 'bg-amber-500/20' },
    { label: 'Risk Assessed', value: db.patients.filter(p => p.aiRiskScore).length, icon: Shield, color: 'text-emerald-400', bgColor: 'bg-emerald-500/20' },
  ];

  return (
    <GlassCard className="relative overflow-hidden" glow>
      {/* Animated Background */}
      <div className="absolute inset-0 bg-gradient-to-br from-violet-500/10 via-fuchsia-500/5 to-transparent" />
      <div className="absolute -top-20 -right-20 w-40 h-40 bg-violet-500/20 rounded-full blur-3xl animate-pulse" />
      <div className="absolute -bottom-20 -left-20 w-40 h-40 bg-fuchsia-500/20 rounded-full blur-3xl animate-pulse delay-1000" />
      
      <div className="relative">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <div className="relative">
              <div className="p-3 rounded-2xl bg-gradient-to-br from-violet-500 to-fuchsia-500">
                <Brain className="w-6 h-6 text-white" />
              </div>
              <div className="absolute -top-1 -right-1 w-4 h-4 bg-emerald-500 rounded-full border-2 border-slate-900 animate-pulse" />
            </div>
            <div>
              <h3 className="text-xl font-bold text-white flex items-center gap-2">
                AI Intelligence Hub
                <Sparkles className="w-4 h-4 text-violet-400" />
              </h3>
              <p className="text-sm text-white/60">Live AI monitoring active</p>
            </div>
          </div>
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-emerald-500/20 border border-emerald-500/30">
            <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            <span className="text-sm font-medium text-emerald-400">Live</span>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          {stats.map((stat, index) => (
            <div 
              key={index} 
              className="p-4 rounded-2xl bg-white/5 border border-white/10 hover:bg-white/10 transition-all duration-300 group"
            >
              <div className={`p-2 rounded-xl ${stat.bgColor} w-fit mb-3 group-hover:scale-110 transition-transform`}>
                <stat.icon className={`w-5 h-5 ${stat.color}`} />
              </div>
              <div className="text-2xl font-bold text-white">{stat.value}</div>
              <div className="text-sm text-white/50">{stat.label}</div>
            </div>
          ))}
        </div>

        {/* Recent AI Insights */}
        <div className="space-y-3">
          <h4 className="text-sm font-medium text-white/70 flex items-center gap-2">
            <TrendingUp className="w-4 h-4" />
            Recent AI Insights
          </h4>
          {db.aiInsights.slice(0, 3).map((insight) => (
            <div 
              key={insight.id}
              className="flex items-center gap-3 p-3 rounded-xl bg-white/5 hover:bg-white/10 transition-colors cursor-pointer group"
            >
              <div className={`
                w-10 h-10 rounded-xl flex items-center justify-center
                ${insight.severity === 'Critical' ? 'bg-red-500/20 text-red-400' : ''}
                ${insight.severity === 'High' ? 'bg-amber-500/20 text-amber-400' : ''}
                ${insight.severity === 'Medium' ? 'bg-cyan-500/20 text-cyan-400' : ''}
                ${insight.severity === 'Low' ? 'bg-emerald-500/20 text-emerald-400' : ''}
              `}>
                {insight.severity === 'Critical' && <AlertTriangle className="w-5 h-5" />}
                {insight.severity === 'High' && <Zap className="w-5 h-5" />}
                {insight.severity === 'Medium' && <Activity className="w-5 h-5" />}
                {insight.severity === 'Low' && <Shield className="w-5 h-5" />}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-white truncate">{insight.type}</p>
                <p className="text-xs text-white/50 truncate">{insight.description}</p>
              </div>
              <div className="text-right">
                <div className="text-xs text-white/70">{insight.confidence}%</div>
                <div className="text-xs text-white/40">confidence</div>
              </div>
              <div className={`
                w-2 h-2 rounded-full animate-pulse
                ${insight.severity === 'Critical' ? 'bg-red-500' : ''}
                ${insight.severity === 'High' ? 'bg-amber-500' : ''}
                ${insight.severity === 'Medium' ? 'bg-cyan-500' : ''}
                ${insight.severity === 'Low' ? 'bg-emerald-500' : ''}
              `} />
            </div>
          ))}
        </div>
      </div>
    </GlassCard>
  );
};
