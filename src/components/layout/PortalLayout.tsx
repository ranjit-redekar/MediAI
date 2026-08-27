import React, { useState } from 'react';
import { Outlet, useNavigate } from 'react-router-dom';
import { Brain, Sparkles, LogOut, Moon, Sun, ChevronDown } from 'lucide-react';
import { GlassButton } from '../ui/GlassButton';
import { useSession } from '../../context/SessionContext';
import { useTheme } from '../../context/ThemeContext';
import { cn } from '../../utils/cn';

/**
 * The patient-facing shell. Deliberately not the admin layout: no sidebar, no
 * command palette, no agent drawer, no copilot. A patient should see their own
 * care and nothing else — an admin console with most items removed still reads
 * like an admin console.
 */
export const PortalLayout: React.FC = () => {
  const { role, roles, signInAs } = useSession();
  const { isDark, toggleTheme } = useTheme();
  const navigate = useNavigate();
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <div className="min-h-screen flex flex-col" style={{ background: 'var(--app-bg)' }}>
      <a href="#portal-content" className="skip-link">Skip to main content</a>

      <header className="sticky top-0 z-30 h-16 glass-panel border-b border-[var(--border)] px-4 sm:px-6 flex items-center">
        <div className="flex items-center justify-between gap-4 w-full max-w-4xl mx-auto">
          <button
            onClick={() => navigate('/portal')}
            className="flex items-center gap-2.5 focus-ring rounded-lg"
            aria-label="MediAI patient portal home"
          >
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-primary to-accent flex items-center justify-center">
              <Brain className="w-5 h-5 text-white" />
            </div>
            <div className="text-left leading-tight">
              <p className="font-bold text-app flex items-center gap-1">
                MediAI <Sparkles className="w-3 h-3 text-violet-400" />
              </p>
              <p className="text-[11px] text-app-subtle">Patient portal</p>
            </div>
          </button>

          <div className="flex items-center gap-2">
            <GlassButton
              variant="ghost"
              size="sm"
              onClick={toggleTheme}
              className="w-9 px-0"
              aria-label={isDark ? 'Switch to light theme' : 'Switch to dark theme'}
            >
              {isDark ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
            </GlassButton>

            <div className="relative">
              <button
                onClick={() => setMenuOpen(v => !v)}
                aria-haspopup="menu"
                aria-expanded={menuOpen}
                className="flex items-center gap-2 h-10 pl-1.5 pr-2 rounded-xl hover:bg-[var(--surface-2)] transition-colors focus-ring"
              >
                <img src={role.demoUser.avatar} alt="" className="w-8 h-8 rounded-lg object-cover" />
                <span className="text-sm font-semibold text-app hidden sm:block">{role.demoUser.name}</span>
                <ChevronDown className={cn('w-4 h-4 text-app-subtle transition-transform', menuOpen && 'rotate-180')} />
              </button>

              {menuOpen && (
                <div role="menu" className="reveal-pop absolute right-0 mt-2 w-56 glass-modal border rounded-2xl p-1.5 z-50 shadow-lifted">
                  <div className="px-3 py-2 border-b border-[var(--border)] mb-1.5">
                    <p className="text-sm font-semibold text-app truncate">{role.demoUser.name}</p>
                    <p className="text-xs text-app-subtle truncate">{role.demoUser.email}</p>
                  </div>
                  <p className="px-3 pb-1.5 text-[10px] uppercase tracking-wider font-semibold text-app-subtle">
                    Switch demo role
                  </p>
                  <div className="grid grid-cols-2 gap-1 px-1.5 pb-1.5">
                    {roles.filter(r => r.id !== 'patient').slice(0, 6).map(r => (
                      <button
                        key={r.id}
                        onClick={() => { setMenuOpen(false); signInAs(r.id); navigate(r.home); }}
                        className="text-left text-[11px] font-medium rounded-lg px-2 py-1.5 text-app-muted hover:text-app hover:bg-[var(--surface-2)] transition-colors focus-ring truncate"
                      >
                        {r.name}
                      </button>
                    ))}
                  </div>
                  <div className="h-px bg-[var(--border)] my-1.5" />
                  <button
                    role="menuitem"
                    onClick={() => window.location.assign('/login')}
                    className="w-full flex items-center gap-2.5 text-left text-sm text-red-300 hover:bg-red-500/10 rounded-lg px-3 py-2 transition-colors focus-ring"
                  >
                    <LogOut className="w-4 h-4" /> Sign out
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </header>

      <main id="portal-content" tabIndex={-1} className="flex-1 p-4 sm:p-6 focus:outline-none">
        <div className="max-w-4xl mx-auto animate-fade-in">
          <Outlet />
        </div>
      </main>

      <footer className="py-6 text-center text-xs text-app-subtle">
        MediAI patient portal · UI preview with sample data
      </footer>
    </div>
  );
};
