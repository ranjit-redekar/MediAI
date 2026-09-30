import React from 'react';
import { NavLink } from 'react-router-dom';
import { Brain, X, Sparkles, ChevronLeft, ChevronRight } from 'lucide-react';
import { cn } from '../../utils/cn';
import { db } from '../../data';
import { useSession } from '../../context/SessionContext';
import { navSections } from '../../data/navigation';
import { todayKey } from '../../utils/date';
import { useAppointments } from '../../context/AppointmentsContext';

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
  isCompact: boolean;
  onToggleCompact: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ isOpen, onClose, isCompact, onToggleCompact }) => {
  const { canSeeNav, workspace } = useSession();
  const today = todayKey();
  const { appointments } = useAppointments();
  const todaysAppointments = appointments.filter(a => a.date === today && a.status === 'Scheduled').length;
  const pendingBills = db.bills.filter(b => b.status !== 'Paid').length;
  const pendingLabs = db.labTests.filter(l => l.status !== 'Completed').length;

  const navBadgeCounts: Record<string, number> = {
    journey: todaysAppointments,
    billing: pendingBills,
    laboratory: pendingLabs,
  };

  const widthClass = isCompact ? 'w-72 lg:w-20' : 'w-72 lg:w-72';

  // Each role sees only the modules its job needs. Sections that end up empty
  // are dropped entirely rather than left as bare headings.
  const visibleSections = navSections
    .map(section => ({ ...section, items: section.items.filter(item => canSeeNav(item.id)) }))
    .filter(section => section.items.length > 0);

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
          // Sticky on desktop so long pages don't scroll the navigation away.
          'fixed lg:sticky lg:top-0 lg:h-screen inset-y-0 left-0 z-50',
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
              </div>
              {!isCompact && (
                <div>
                  <h1 className="text-xl font-bold gradient-text flex items-center gap-1">
                    MediAI
                    <Sparkles className="w-3.5 h-3.5 text-violet-400" />
                  </h1>
                  <p className="text-xs font-medium text-app-muted truncate max-w-[10rem]">{workspace.name}</p>
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
          {visibleSections.map((section) => (
            <div key={section.id}>
              {!isCompact && (
                <p className="px-3 text-[11px] uppercase tracking-wider font-semibold text-app-subtle mb-2">
                  {section.title}
                </p>
              )}
              <ul className="space-y-0.5">
                {section.items.map((item) => (
                  <li key={item.id}>
                    <NavLink
                      to={item.path}
                      onClick={() => onClose()}
                      title={item.label}
                      className={({ isActive }) =>
                        cn(
                          'flex items-center rounded-lg transition-colors text-sm',
                          isCompact ? 'justify-center h-11 w-11 mx-auto' : 'gap-3 px-3 h-10',
                          item.isAI
                            ? isActive
                              ? 'bg-violet-500/15 text-app font-semibold'
                              : 'text-violet-300 hover:bg-violet-500/10 hover:text-violet-200'
                            : isActive
                              ? 'bg-primary/15 text-app font-semibold'
                              : 'text-app-muted hover:bg-[var(--surface-2)] hover:text-app'
                        )
                      }
                    >
                      <item.icon className="w-[18px] h-[18px] flex-shrink-0" />
                      {!isCompact && <span className="flex-1 truncate">{item.label}</span>}
                      {!isCompact && item.isAI && (
                        <span className="px-1.5 py-0.5 text-[10px] font-semibold bg-violet-500/20 text-violet-200 rounded-md flex items-center gap-0.5">
                          AI
                          <Sparkles className="w-2.5 h-2.5" />
                        </span>
                      )}
                      {!isCompact && navBadgeCounts[item.id] > 0 && (
                        <span className="ml-auto px-1.5 min-w-[20px] text-center py-0.5 text-[11px] font-medium rounded-full bg-[var(--surface-3)] text-app-muted">
                          {navBadgeCounts[item.id]}
                        </span>
                      )}
                    </NavLink>
                  </li>
                ))}
              </ul>
            </div>
          ))}

        </nav>

        {/* Collapse toggle — desktop only; on mobile the sidebar is a drawer. */}
        <div className={cn('hidden lg:flex p-3 border-t border-white/10', isCompact ? 'justify-center' : 'justify-end')}>
          <button
            onClick={onToggleCompact}
            className="p-2 rounded-lg text-app-subtle hover:text-app hover:bg-[var(--surface-2)] transition-colors focus-ring"
            title={isCompact ? 'Expand menu' : 'Collapse menu'}
            aria-label={isCompact ? 'Expand menu' : 'Collapse menu'}
          >
            {isCompact ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
          </button>
        </div>
      </aside>
    </>
  );
};
