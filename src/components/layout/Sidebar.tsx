import React from 'react';
import { NavLink } from 'react-router-dom';
import {
  LayoutDashboard,
  Users,
  UserRound,
  Calendar,
  CreditCard,
  Pill,
  FlaskConical,
  FileText,
  Settings,
  Brain,
  AlertTriangle,
  HeartPulse,
  LineChart,
  ShieldCheck,
  Clock3,
  Shield,
  X,
  Sparkles,
  ChevronLeft,
  ChevronRight
} from 'lucide-react';
import { cn } from '../../utils/cn';
import { db } from '../../data';
import type { LucideIcon } from 'lucide-react';
import type { AIAgent } from '../../types';

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
  isCompact: boolean;
  onToggleCompact: () => void;
  onOpenAgents: () => void;
}

interface NavItem {
  id: string;
  label: string;
  icon: LucideIcon;
  path: string;
  isAI?: boolean;
}

const clinicalNav: NavItem[] = [
  { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard, path: '/' },
  { id: 'patients', label: 'Patients', icon: Users, path: '/patients' },
  { id: 'doctors', label: 'Doctors', icon: UserRound, path: '/doctors' },
  { id: 'appointments', label: "Today's Schedule", icon: Calendar, path: '/appointments' },
  { id: 'ai-insights', label: 'AI Insights', icon: Brain, path: '/ai-insights', isAI: true }
];

const operationalNav: NavItem[] = [
  { id: 'billing', label: 'Billing', icon: CreditCard, path: '/billing' },
  { id: 'pharmacy', label: 'Pharmacy', icon: Pill, path: '/pharmacy' },
  { id: 'laboratory', label: 'Laboratory', icon: FlaskConical, path: '/laboratory' },
  { id: 'roles', label: 'Roles', icon: Shield, path: '/roles' },
  { id: 'reports', label: 'Reports', icon: FileText, path: '/reports' },
  { id: 'settings', label: 'Settings', icon: Settings, path: '/settings' },
];

const navSections = [
  { id: 'clinical', title: 'Clinical Operations', items: clinicalNav },
  { id: 'ops', title: 'Administrative', items: operationalNav }
];

const agentIconMap: Record<string, LucideIcon> = {
  QuickCheckAgent: AlertTriangle,
  CareGuideAgent: HeartPulse,
  TrendWatchAgent: LineChart,
  RevenueGuardAgent: ShieldCheck,
  ShiftGuideAgent: Clock3
};

const agentStatusColor: Record<AIAgent['status'], string> = {
  Online: 'bg-emerald-400',
  Monitoring: 'bg-cyan-400',
  Idle: 'bg-amber-400'
};

const agentStatusText: Record<AIAgent['status'], string> = {
  Online: 'text-emerald-300',
  Monitoring: 'text-cyan-300',
  Idle: 'text-amber-300'
};

export const Sidebar: React.FC<SidebarProps> = ({ isOpen, onClose, isCompact, onToggleCompact, onOpenAgents }) => {
  const today = new Date().toISOString().split('T')[0];
  const todaysAppointments = db.appointments.filter(a => a.date === today && a.status === 'Scheduled').length;
  const pendingBills = db.bills.filter(b => b.status !== 'Paid').length;
  const pendingLabs = db.labTests.filter(l => l.status !== 'Completed').length;
  const agents = db.aiAgents;

  const navBadgeCounts: Record<string, number> = {
    appointments: todaysAppointments,
    billing: pendingBills,
    laboratory: pendingLabs,
    'ai-insights': db.aiInsights.length,
    roles: db.roles.length
  };

  const widthClass = isCompact ? 'w-72 lg:w-20' : 'w-72 lg:w-72';

  return (
    <>
      {/* Mobile Overlay */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40 lg:hidden"
          onClick={onClose}
        />
      )}

      {/* Sidebar */}
      <aside
        className={cn(
          'fixed lg:static inset-y-0 left-0 z-50',
          widthClass,
          'glass-panel backdrop-blur-2xl border-r',
          'transform transition-transform duration-300 ease-in-out',
          'flex flex-col',
          isOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
        )}
      >
        {/* Logo */}
        <div className="p-6 border-b border-white/10">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="relative">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary to-accent flex items-center justify-center">
                  <Brain className="w-6 h-6 text-white" />
                </div>
                <div className="absolute -top-1 -right-1 w-3.5 h-3.5 bg-emerald-500 rounded-full border-2 border-slate-900 animate-pulse" />
              </div>
              {!isCompact && (
                <div>
                  <h1 className="text-xl font-bold gradient-text flex items-center gap-1">
                    MediAI
                    <Sparkles className="w-3.5 h-3.5 text-violet-400" />
                  </h1>
                  <p className="text-xs text-white/50">AI-Powered Hospital Admin</p>
                </div>
              )}
            </div>
            <button
              onClick={onClose}
              className="lg:hidden p-2 hover:bg-white/10 rounded-lg transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 overflow-y-auto p-4 space-y-6">
          <div>
            {!isCompact ? (
              <>
                <div className="flex items-center justify-between px-1 mb-2">
                  <p className="text-xs uppercase tracking-wide text-white/40 flex items-center gap-1">
                    <Sparkles className="w-3.5 h-3.5 text-violet-300" />
                    Agent Micro Board
                  </p>
                  <button
                    onClick={onOpenAgents}
                    className="text-[11px] text-violet-200 hover:text-white transition-colors"
                  >
                    View all
                  </button>
                </div>
                <div className="space-y-2">
                  {agents.map(agent => {
                    const Icon = agentIconMap[agent.name] ?? Sparkles;
                    return (
                      <NavLink
                        key={agent.id}
                        to={`/agents/${agent.id}`}
                        onClick={() => onClose()}
                        className={({ isActive }) =>
                          cn(
                            'flex items-center justify-between rounded-2xl border px-3 py-2.5 transition-all group',
                            isActive
                              ? 'bg-gradient-to-r from-violet-500/20 to-fuchsia-500/10 border-violet-500/40'
                              : 'bg-white/5 border-white/10 hover:bg-white/10'
                          )
                        }
                      >
                        <div className="flex items-center gap-3">
                          <div className="p-2 rounded-xl bg-violet-500/15 text-violet-200">
                            <Icon className="w-4 h-4" />
                          </div>
                          <div>
                            <p className="text-sm font-semibold text-white leading-snug">{agent.name}</p>
                            <p className="text-[11px] text-white/50 truncate max-w-[140px]">{agent.focus}</p>
                          </div>
                        </div>
                        <div className="text-right">
                          <div className={cn('text-xs font-medium', agentStatusText[agent.status])}>
                            {agent.status}
                          </div>
                          <p className="text-[11px] text-white/40">
                            {agent.metrics[0]?.value ?? agent.statusMessage}
                          </p>
                        </div>
                      </NavLink>
                    );
                  })}
                </div>
              </>
            ) : (
              <div className="flex flex-col items-center gap-2 py-2">
                {agents.map(agent => {
                  const Icon = agentIconMap[agent.name] ?? Sparkles;
                  return (
                    <NavLink
                      key={agent.id}
                      to={`/agents/${agent.id}`}
                      onClick={() => onClose()}
                      title={agent.name}
                      className={({ isActive }) =>
                        cn(
                          'relative w-12 h-12 rounded-2xl border flex items-center justify-center transition-all',
                          'bg-white/5 hover:bg-white/10',
                          isActive && 'border-violet-500/40 bg-violet-500/10'
                        )
                      }
                    >
                      <Icon className="w-4 h-4 text-white" />
                      <span
                        className={cn(
                          'absolute -top-1 -right-1 w-2.5 h-2.5 rounded-full border-2 border-slate-900',
                          agentStatusColor[agent.status]
                        )}
                      />
                    </NavLink>
                  );
                })}
              </div>
            )}
          </div>
          {navSections.map((section) => (
            <div key={section.id}>
              {!isCompact && (
                <p className="px-2 text-xs uppercase tracking-wide text-white/40 mb-2">
                  {section.title}
                </p>
              )}
              <ul className="space-y-1">
                {section.items.map((item) => (
                  <li key={item.id}>
                    <NavLink
                      to={item.path}
                      onClick={() => onClose()}
                      title={item.label}
                      className={({ isActive }) =>
                        cn(
                          'flex items-center rounded-xl transition-all duration-300 border',
                          isCompact ? 'justify-center px-3 py-3' : 'gap-3 px-4 py-3',
                          item.isAI
                            ? isActive
                              ? 'bg-gradient-to-r from-violet-500/40 to-fuchsia-500/20 text-white border-violet-500/40'
                              : 'bg-gradient-to-r from-violet-500/10 to-fuchsia-500/5 text-violet-200 border-violet-500/20 hover:from-violet-500/20 hover:to-fuchsia-500/15'
                            : isActive
                              ? 'bg-gradient-to-r from-primary/20 to-accent/20 text-white border-primary/30'
                              : 'text-white/70 border-transparent hover:bg-white/10 hover:text-white'
                        )
                      }
                    >
                      <item.icon className="w-5 h-5" />
                      {!isCompact && <span className="font-medium flex-1">{item.label}</span>}
                      {!isCompact && item.isAI && (
                        <span className="px-2 py-0.5 text-xs bg-violet-500/30 text-violet-100 rounded-full border border-violet-500/30 flex items-center gap-1">
                          AI
                          <Sparkles className="w-3 h-3" />
                        </span>
                      )}
                      {!isCompact && navBadgeCounts[item.id] > 0 && (
                        <span className="ml-auto px-2 py-0.5 text-xs rounded-full bg-white/10 border border-white/20 text-white/80">
                          {navBadgeCounts[item.id]}
                        </span>
                      )}
                    </NavLink>
                  </li>
                ))}
              </ul>
            </div>
          ))}

          {!isCompact && (
            <div className="p-3 rounded-xl bg-gradient-to-r from-violet-500/10 to-fuchsia-500/10 border border-violet-500/20">
              <div className="flex items-center gap-2 mb-1.5">
                <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                <span className="text-xs font-medium text-violet-300">AI Engine Active</span>
              </div>
              <p className="text-xs text-white/40 leading-relaxed">
                Monitoring {Math.floor(Math.random() * 10) + 10} patients in real-time
              </p>
            </div>
          )}
        </nav>

        {/* Bottom Actions */}
        <div className="p-4 border-t border-white/10 space-y-3">
          <button
            onClick={onOpenAgents}
            className={cn(
              'w-full flex items-center gap-2 rounded-xl border border-violet-500/30 bg-gradient-to-r from-violet-500/20 to-fuchsia-500/10 text-white font-medium transition-all',
              isCompact ? 'justify-center px-3 py-2' : 'px-4 py-2.5'
            )}
            title="Open AI Agents"
          >
            <Sparkles className="w-4 h-4" />
            {!isCompact && <span>Open AI Agents</span>}
          </button>

          <button
            onClick={onToggleCompact}
            className={cn(
              'w-full flex items-center gap-2 rounded-xl border border-white/10 bg-white/5 text-white/70 hover:text-white transition-all',
              isCompact ? 'justify-center px-3 py-2' : 'px-4 py-2'
            )}
            title={isCompact ? 'Expand menu' : 'Collapse menu'}
          >
            {isCompact ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
            {!isCompact && <span>{isCompact ? 'Expand Menu' : 'Compact Menu'}</span>}
          </button>

          <div className={cn('flex items-center gap-3 p-3 rounded-xl bg-white/5', isCompact && 'justify-center')}>
            <img
              src="https://i.pravatar.cc/150?u=admin"
              alt="Admin"
              className="w-10 h-10 rounded-full border-2 border-primary/30"
            />
            {!isCompact && (
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-white truncate">Dr. Admin</p>
                <p className="text-xs text-white/50 truncate">admin@mediai.com</p>
              </div>
            )}
          </div>
        </div>
      </aside>
    </>
  );
};
