import React from 'react';
import { Menu, Bell, Search, Moon, Sun, Sparkles, ChevronDown, HelpCircle } from 'lucide-react';
import { GlassButton } from '../ui/GlassButton';
import { useTour } from '../../context/TourContext';

interface HeaderProps {
  onMenuClick: () => void;
  onOpenCommand: () => void;
  onOpenTaskInbox: () => void;
  onOpenCopilot: () => void;
  isDark: boolean;
  onToggleTheme: () => void;
  onLogout?: () => void;
}

export const Header: React.FC<HeaderProps> = ({ onMenuClick, onOpenCommand, onOpenTaskInbox, onOpenCopilot, isDark, onToggleTheme, onLogout }) => {
  const [profileOpen, setProfileOpen] = React.useState(false);
  const { start: startTour } = useTour();
  return (
    <header className="sticky top-0 z-30 h-16 glass-panel border-b border-[var(--border)] px-4 sm:px-6 flex items-center">
      <div className="flex items-center justify-between gap-4 w-full">
        {/* Left Section */}
        <div className="flex items-center gap-3">
          <GlassButton variant="ghost" size="sm" onClick={onMenuClick} className="lg:hidden w-9 px-0">
            <Menu className="w-5 h-5" />
          </GlassButton>

          {/* Unified search → opens command palette */}
          <button
            data-tour="search"
            onClick={onOpenCommand}
            className="hidden md:flex items-center gap-2.5 w-72 lg:w-80 h-10 px-3.5 rounded-xl glass-input border text-left text-app-subtle hover:border-[var(--border-strong)] transition-colors focus-ring"
          >
            <Search className="w-4 h-4 flex-shrink-0" />
            <span className="flex-1 text-sm truncate">Search patients, doctors, actions…</span>
            <kbd className="px-1.5 py-0.5 rounded-md border border-[var(--border)] text-[11px] font-medium">⌘K</kbd>
          </button>
        </div>

        {/* Right Section */}
        <div className="flex items-center gap-2 relative">
          {/* AI Copilot */}
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

          <GlassButton data-tour="help" variant="ghost" size="sm" onClick={startTour} className="w-9 px-0" title="Take a guided tour">
            <HelpCircle className="w-4 h-4" />
          </GlassButton>

          <GlassButton variant="ghost" size="sm" onClick={onToggleTheme} className="hidden sm:flex w-9 px-0" title="Toggle theme">
            {isDark ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
          </GlassButton>

          {/* Notifications */}
          <div className="relative" data-tour="notifications">
            <GlassButton variant="ghost" size="sm" onClick={onOpenTaskInbox} className="w-9 px-0">
              <Bell className="w-4 h-4" />
            </GlassButton>
            <span className="absolute -top-0.5 -right-0.5 min-w-[18px] h-[18px] px-1 bg-[color:var(--danger)] rounded-full text-[10px] font-semibold flex items-center justify-center text-white border-2 border-[var(--app-bg)]">
              3
            </span>
          </div>

          <div className="w-px h-6 bg-[var(--border)] mx-1 hidden sm:block" />

          <div className="relative">
            <button
              className="flex items-center gap-2 h-10 pl-1.5 pr-2 sm:pr-3 rounded-xl hover:bg-[var(--surface-2)] transition-colors focus-ring"
              onClick={() => setProfileOpen((prev) => !prev)}
            >
              <img
                src="https://i.pravatar.cc/80?u=admin"
                alt="Admin"
                className="w-8 h-8 rounded-lg object-cover"
              />
              <div className="text-left hidden sm:block leading-tight">
                <p className="text-sm font-semibold text-app">Dr. Admin</p>
                <p className="text-[11px] text-app-subtle">Administrator</p>
              </div>
              <ChevronDown className={`w-4 h-4 text-app-subtle transition-transform ${profileOpen ? 'rotate-180' : ''}`} />
            </button>

            {profileOpen && (
              <div className="absolute right-0 mt-2 w-48 glass-modal border rounded-2xl p-1.5 z-50">
                <button className="w-full text-left text-sm text-app-muted hover:text-app hover:bg-[var(--surface-2)] rounded-lg px-3 py-2 transition-colors">Profile</button>
                <button className="w-full text-left text-sm text-app-muted hover:text-app hover:bg-[var(--surface-2)] rounded-lg px-3 py-2 transition-colors">Preferences</button>
                <button
                  className="w-full text-left text-sm text-red-300 hover:bg-red-500/10 rounded-lg px-3 py-2 transition-colors"
                  onClick={onLogout}
                >
                  Logout
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};
