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
  X,
  Sparkles
} from 'lucide-react';
import { cn } from '../../utils/cn';

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

const navItems = [
  { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard, path: '/' },
  { id: 'patients', label: 'Patients', icon: Users, path: '/patients' },
  { id: 'doctors', label: 'Doctors', icon: UserRound, path: '/doctors' },
  { id: 'appointments', label: 'Appointments', icon: Calendar, path: '/appointments' },
  { id: 'billing', label: 'Billing', icon: CreditCard, path: '/billing' },
  { id: 'pharmacy', label: 'Pharmacy', icon: Pill, path: '/pharmacy' },
  { id: 'laboratory', label: 'Laboratory', icon: FlaskConical, path: '/laboratory' },
  { id: 'reports', label: 'Reports', icon: FileText, path: '/reports' },
  { id: 'ai-insights', label: 'AI Insights', icon: Brain, path: '/ai-insights', isAI: true },
  { id: 'settings', label: 'Settings', icon: Settings, path: '/settings' },
];

export const Sidebar: React.FC<SidebarProps> = ({ isOpen, onClose }) => {
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
          'fixed lg:static inset-y-0 left-0 z-50 w-72',
          'bg-slate-900/80 backdrop-blur-2xl border-r border-white/10',
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
              <div>
                <h1 className="text-xl font-bold gradient-text flex items-center gap-1">
                  MediAI
                  <Sparkles className="w-3.5 h-3.5 text-violet-400" />
                </h1>
                <p className="text-xs text-white/50">AI-Powered Hospital Admin</p>
              </div>
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
        <nav className="flex-1 overflow-y-auto p-4">
          <ul className="space-y-1">
            {navItems.map((item) => (
              <li key={item.id}>
                {item.isAI ? (
                  /* Special AI Insights Link */
                  <NavLink
                    to={item.path}
                    onClick={() => onClose()}
                    className={({ isActive }) =>
                      cn(
                        'flex items-center gap-3 px-4 py-3 rounded-xl',
                        'transition-all duration-300 group relative overflow-hidden',
                        isActive
                          ? 'bg-gradient-to-r from-violet-500/30 to-fuchsia-500/20 text-white border border-violet-500/40'
                          : 'bg-gradient-to-r from-violet-500/10 to-fuchsia-500/5 text-violet-300 hover:from-violet-500/20 hover:to-fuchsia-500/15 border border-violet-500/20'
                      )
                    }
                  >
                    <div className="relative">
                      <item.icon className="w-5 h-5 transition-transform group-hover:scale-110" />
                      <div className="absolute -top-0.5 -right-0.5 w-2 h-2 bg-emerald-500 rounded-full animate-pulse" />
                    </div>
                    <span className="font-semibold">{item.label}</span>
                    <div className="ml-auto flex items-center gap-1.5">
                      <span className="px-2 py-0.5 text-xs bg-violet-500/30 text-violet-300 rounded-full border border-violet-500/30">
                        AI
                      </span>
                      <Sparkles className="w-3.5 h-3.5 text-violet-400 animate-pulse" />
                    </div>
                  </NavLink>
                ) : (
                  <NavLink
                    to={item.path}
                    onClick={() => onClose()}
                    className={({ isActive }) =>
                      cn(
                        'flex items-center gap-3 px-4 py-3 rounded-xl',
                        'transition-all duration-300 group',
                        isActive
                          ? 'bg-gradient-to-r from-primary/20 to-accent/20 text-white border border-primary/30'
                          : 'text-white/70 hover:bg-white/10 hover:text-white'
                      )
                    }
                  >
                    <item.icon className="w-5 h-5 transition-transform group-hover:scale-110" />
                    <span className="font-medium">{item.label}</span>
                  </NavLink>
                )}
              </li>
            ))}
          </ul>

          {/* AI Status Banner */}
          <div className="mt-4 p-3 rounded-xl bg-gradient-to-r from-violet-500/10 to-fuchsia-500/10 border border-violet-500/20">
            <div className="flex items-center gap-2 mb-1.5">
              <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              <span className="text-xs font-medium text-violet-300">AI Engine Active</span>
            </div>
            <p className="text-xs text-white/40 leading-relaxed">
              Monitoring {Math.floor(Math.random() * 10) + 10} patients in real-time
            </p>
          </div>
        </nav>

        {/* User Profile */}
        <div className="p-4 border-t border-white/10">
          <div className="flex items-center gap-3 p-3 rounded-xl bg-white/5">
            <img
              src="https://i.pravatar.cc/150?u=admin"
              alt="Admin"
              className="w-10 h-10 rounded-full border-2 border-primary/30"
            />
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-white truncate">Dr. Admin</p>
              <p className="text-xs text-white/50 truncate">admin@mediai.com</p>
            </div>
          </div>
        </div>
      </aside>
    </>
  );
};
