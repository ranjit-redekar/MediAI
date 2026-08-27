import React, { useEffect, useRef, useState } from 'react';
import { Menu, Bell, Search, Moon, Sun, Sparkles, ChevronDown, HelpCircle, User, SlidersHorizontal, LogOut } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { GlassButton } from '../ui/GlassButton';
import { useTour } from '../../context/TourContext';
import { useSession } from '../../context/SessionContext';
import { cn } from '../../utils/cn';

interface HeaderProps {
  onMenuClick: () => void;
  onOpenCommand: () => void;
  onOpenTaskInbox: () => void;
  onOpenCopilot: () => void;
  isDark: boolean;
  onToggleTheme: () => void;
  onLogout?: () => void;
  /** Count shown on the notification bell. */
  taskCount?: number;
}

export const Header: React.FC<HeaderProps> = ({
  onMenuClick, onOpenCommand, onOpenTaskInbox, onOpenCopilot,
  isDark, onToggleTheme, onLogout, taskCount = 0,
}) => {
  const [profileOpen, setProfileOpen] = useState(false);
  const profileRef = useRef<HTMLDivElement>(null);
  const { start: startTour } = useTour();
  const { role } = useSession();
  const navigate = useNavigate();

  // Close the profile menu on outside click or Escape.
  useEffect(() => {
    if (!profileOpen) return;
    const onPointerDown = (event: MouseEvent) => {
      if (!profileRef.current?.contains(event.target as Node)) setProfileOpen(false);
    };
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setProfileOpen(false);
    };
    document.addEventListener('mousedown', onPointerDown);
    document.addEventListener('keydown', onKeyDown);
    return () => {
      document.removeEventListener('mousedown', onPointerDown);
      document.removeEventListener('keydown', onKeyDown);
    };
  }, [profileOpen]);

  const goTo = (path: string) => {
    setProfileOpen(false);
    navigate(path);
  };

  return (
    <header className="sticky top-0 z-30 h-16 glass-panel border-b border-[var(--border)] px-4 sm:px-6 flex items-center">
      <div className="flex items-center justify-between gap-3 w-full">
        {/* Left Section */}
        <div className="flex items-center gap-2 min-w-0">
          <GlassButton variant="ghost" size="sm" onClick={onMenuClick} className="lg:hidden w-9 px-0" aria-label="Open navigation menu">
            <Menu className="w-5 h-5" />
          </GlassButton>

          {/* Unified search → opens command palette */}
          <button
            data-tour="search"
            onClick={onOpenCommand}
            aria-label="Search patients, doctors and actions"
            className="hidden md:flex items-center gap-2.5 w-72 lg:w-80 h-10 px-3.5 rounded-xl glass-input border text-left text-app-subtle hover:border-[var(--border-strong)] transition-colors focus-ring"
          >
            <Search className="w-4 h-4 flex-shrink-0" />
            <span className="flex-1 text-sm truncate">Search patients, doctors, actions…</span>
            <kbd className="px-1.5 py-0.5 rounded-md border border-[var(--border)] text-[11px] font-medium">⌘K</kbd>
          </button>

          {/* Compact search affordance for small screens */}
          <GlassButton
            variant="ghost"
            size="sm"
            onClick={onOpenCommand}
            className="md:hidden w-9 px-0"
            aria-label="Search"
          >
            <Search className="w-5 h-5" />
          </GlassButton>
        </div>

        {/* Right Section */}
        <div className="flex items-center gap-1 sm:gap-2">
          <GlassButton
            data-tour="copilot"
            variant="ghost"
            size="sm"
            onClick={onOpenCopilot}
            className="text-violet-300 hover:text-violet-200 hover:bg-violet-500/10"
            title="Open AI Copilot"
          >
            <Sparkles className="w-4 h-4" />
            <span className="hidden sm:inline">Copilot</span>
          </GlassButton>

          <GlassButton data-tour="help" variant="ghost" size="sm" onClick={startTour} className="hidden sm:flex w-9 px-0" title="Take a guided tour" aria-label="Take a guided tour">
            <HelpCircle className="w-4 h-4" />
          </GlassButton>

          <GlassButton
            variant="ghost"
            size="sm"
            onClick={onToggleTheme}
            className="hidden sm:flex w-9 px-0"
            title={isDark ? 'Switch to light theme' : 'Switch to dark theme'}
            aria-label={isDark ? 'Switch to light theme' : 'Switch to dark theme'}
          >
            {isDark ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
          </GlassButton>

          {/* Notifications */}
          <div className="relative" data-tour="notifications">
            <GlassButton
              variant="ghost"
              size="sm"
              onClick={onOpenTaskInbox}
              className="w-9 px-0"
              aria-label={taskCount > 0 ? `Task inbox, ${taskCount} pending` : 'Task inbox'}
            >
              <Bell className="w-4 h-4" />
            </GlassButton>
            {taskCount > 0 && (
              <span className="absolute -top-0.5 -right-0.5 min-w-[18px] h-[18px] px-1 bg-[color:var(--danger)] rounded-full text-[10px] font-semibold flex items-center justify-center text-white border-2 border-[var(--app-bg)] pointer-events-none">
                {taskCount > 9 ? '9+' : taskCount}
              </span>
            )}
          </div>

          <div className="w-px h-6 bg-[var(--border)] mx-1 hidden sm:block" />

          <div className="relative" ref={profileRef}>
            <button
              className="flex items-center gap-2 h-10 pl-1.5 pr-2 sm:pr-3 rounded-xl hover:bg-[var(--surface-2)] transition-colors focus-ring"
              onClick={() => setProfileOpen(prev => !prev)}
              aria-haspopup="menu"
              aria-expanded={profileOpen}
              aria-label="Account menu"
            >
              <img
                src={role.demoUser.avatar}
                alt=""
                className="w-8 h-8 rounded-lg object-cover"
              />
              <div className="text-left hidden sm:block leading-tight">
                <p className="text-sm font-semibold text-app">{role.demoUser.name}</p>
                <p className={cn('text-[11px] font-medium', role.accent.text)}>{role.name}</p>
              </div>
              <ChevronDown className={`w-4 h-4 text-app-subtle transition-transform ${profileOpen ? 'rotate-180' : ''}`} />
            </button>

            {profileOpen && (
              <div role="menu" className="reveal-pop absolute right-0 mt-2 w-56 glass-modal border rounded-2xl p-1.5 z-50 shadow-lifted">
                <div className="px-3 py-2 border-b border-[var(--border)] mb-1.5">
                  <p className="text-sm font-semibold text-app truncate">{role.demoUser.name}</p>
                  <p className="text-xs text-app-subtle truncate">{role.demoUser.email}</p>
                </div>

                <button role="menuitem" onClick={() => goTo('/settings')} className="w-full flex items-center gap-2.5 text-left text-sm text-app-muted hover:text-app hover:bg-[var(--surface-2)] rounded-lg px-3 py-2 transition-colors focus-ring">
                  <User className="w-4 h-4" /> Profile
                </button>
                <button role="menuitem" onClick={() => goTo('/settings')} className="w-full flex items-center gap-2.5 text-left text-sm text-app-muted hover:text-app hover:bg-[var(--surface-2)] rounded-lg px-3 py-2 transition-colors focus-ring">
                  <SlidersHorizontal className="w-4 h-4" /> Preferences
                </button>
                <button role="menuitem" onClick={() => { setProfileOpen(false); onToggleTheme(); }} className="sm:hidden w-full flex items-center gap-2.5 text-left text-sm text-app-muted hover:text-app hover:bg-[var(--surface-2)] rounded-lg px-3 py-2 transition-colors focus-ring">
                  {isDark ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
                  {isDark ? 'Light theme' : 'Dark theme'}
                </button>

                <div className="h-px bg-[var(--border)] my-1.5" />

                <button
                  role="menuitem"
                  className="w-full flex items-center gap-2.5 text-left text-sm text-red-300 hover:bg-red-500/10 rounded-lg px-3 py-2 transition-colors focus-ring"
                  onClick={onLogout}
                >
                  <LogOut className="w-4 h-4" /> Logout
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};
