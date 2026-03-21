import React from 'react';
import { Menu, Bell, Search, Moon, Sun, Command as CommandIcon } from 'lucide-react';
import { GlassInput } from '../ui/GlassInput';
import { GlassButton } from '../ui/GlassButton';

interface HeaderProps {
  onMenuClick: () => void;
  onOpenCommand: () => void;
  onOpenTaskInbox: () => void;
}

export const Header: React.FC<HeaderProps> = ({ onMenuClick, onOpenCommand, onOpenTaskInbox }) => {
  const [isDark, setIsDark] = React.useState(true);

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
        <div className="flex items-center gap-3">
          {/* Theme Toggle */}
          <GlassButton
            variant="ghost"
            size="sm"
            onClick={() => setIsDark(!isDark)}
            className="hidden sm:flex"
          >
            {isDark ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
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

          {/* Quick Actions */}
          <GlassButton variant="primary" size="sm" className="hidden sm:flex">
            + New Appointment
          </GlassButton>
        </div>
      </div>
    </header>
  );
};
