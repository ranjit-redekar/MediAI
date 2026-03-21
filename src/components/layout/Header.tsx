import React from 'react';
import { Menu, Bell, Search, Moon, Sun, Command as CommandIcon, ChevronDown } from 'lucide-react';
import { GlassInput } from '../ui/GlassInput';
import { GlassButton } from '../ui/GlassButton';

interface HeaderProps {
  onMenuClick: () => void;
  onOpenCommand: () => void;
  onOpenTaskInbox: () => void;
  theme: 'dark' | 'light';
  onToggleTheme: () => void;
  onLogout?: () => void;
}

export const Header: React.FC<HeaderProps> = ({ onMenuClick, onOpenCommand, onOpenTaskInbox, theme, onToggleTheme, onLogout }) => {
  const [profileOpen, setProfileOpen] = React.useState(false);
  return (
    <header className="sticky top-0 z-30 glass-card rounded-none border-b border-white/10 px-6 py-4">
      <div className="flex items-center justify-between gap-4">
        {/* Left Section */}
        <div className="flex items-center gap-4">
          <GlassButton
            variant="ghost"
            size="sm"
            onClick={onMenuClick}
            className="lg:hidden"
          >
            <Menu className="w-5 h-5" />
          </GlassButton>

          <div className="hidden md:block w-80">
            <GlassInput
              placeholder="Search patients, doctors, appointments..."
              icon={<Search className="w-4 h-4" />}
            />
          </div>
          <GlassButton
            variant="ghost"
            size="sm"
            className="hidden md:flex items-center gap-2 text-white/70"
            onClick={onOpenCommand}
          >
            <CommandIcon className="w-4 h-4" />
            Quick Command
            <span className="px-1.5 py-0.5 rounded-md border border-white/20 text-xs">⌘K</span>
          </GlassButton>
        </div>

        {/* Right Section */}
        <div className="flex items-center gap-3 relative">
          {/* Theme Toggle */}
          <GlassButton
            variant="ghost"
            size="sm"
            onClick={onToggleTheme}
            className="hidden sm:flex"
            title="Toggle theme"
          >
            {theme === 'dark' ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
          </GlassButton>

          {/* Notifications */}
          <div className="relative">
            <GlassButton variant="ghost" size="sm" onClick={onOpenTaskInbox}>
              <Bell className="w-4 h-4" />
            </GlassButton>
            <span className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 rounded-full text-xs flex items-center justify-center font-medium">
              3
            </span>
          </div>

          <div className="relative">
            <button
              className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-white/5 border border-white/10 text-sm text-white/80 hover:bg-white/10 transition-colors"
              onClick={() => setProfileOpen((prev) => !prev)}
            >
              <img
                src="https://i.pravatar.cc/80?u=admin"
                alt="Admin"
                className="w-8 h-8 rounded-full border border-white/10"
              />
              <div className="text-left hidden sm:block">
                <p className="text-xs text-white/40">Admin</p>
                <p className="text-sm font-semibold text-white">Dr. Admin</p>
              </div>
              <ChevronDown className={`w-4 h-4 text-white/50 transition-transform ${profileOpen ? 'rotate-180' : ''}`} />
            </button>

            {profileOpen && (
              <div className="absolute right-0 mt-2 w-48 glass-card bg-white/10 border border-white/15 rounded-2xl p-3 space-y-2">
                <button className="w-full text-left text-sm text-white/80 hover:text-white">Profile</button>
                <button className="w-full text-left text-sm text-white/80 hover:text-white">Preferences</button>
                <button
                  className="w-full text-left text-sm text-red-300 hover:text-red-200"
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
