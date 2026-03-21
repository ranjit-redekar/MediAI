import React from 'react';
import { Menu, Bell, Search, Moon, Sun } from 'lucide-react';
import { GlassInput } from '../ui/GlassInput';
import { GlassButton } from '../ui/GlassButton';

interface HeaderProps {
  onMenuClick: () => void;
}

export const Header: React.FC<HeaderProps> = ({ onMenuClick }) => {
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
            <GlassButton variant="ghost" size="sm">
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
