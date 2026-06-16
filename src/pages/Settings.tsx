import React, { useState } from 'react';
import { User, Bell, Shield, Palette, Save, Check, Sun, Moon, LogOut } from 'lucide-react';
import { GlassCard } from '../components/ui/GlassCard';
import { GlassInput } from '../components/ui/GlassInput';
import { GlassButton } from '../components/ui/GlassButton';
import { useTheme } from '../context/ThemeContext';
import { cn } from '../utils/cn';

export const Settings: React.FC = () => {
  const [activeTab, setActiveTab] = useState('profile');
  const { theme, themes, setTheme } = useTheme();

  const tabs = [
    { id: 'profile', label: 'Profile', icon: User },
    { id: 'notifications', label: 'Notifications', icon: Bell },
    { id: 'security', label: 'Security', icon: Shield },
    { id: 'appearance', label: 'Appearance', icon: Palette },
  ];

  return (
    <div className="space-y-6">
      <div className="space-y-1">
        <h1 className="text-2xl sm:text-[28px] font-bold text-app tracking-tight">Settings</h1>
        <p className="text-white/60">Manage your account preferences</p>
      </div>
      <GlassCard className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-3">
          <img
            src="https://i.pravatar.cc/150?u=admin"
            alt="Profile"
            className="w-14 h-14 rounded-2xl border-2 border-white/10"
          />
          <div>
            <p className="text-lg font-semibold text-white">Dr. Admin</p>
            <p className="text-sm text-white/60">Administrator · admin@mediai.com</p>
          </div>
        </div>
        <div className="flex flex-wrap gap-2">
          <GlassButton variant="ghost" className="flex items-center gap-2 px-4">
            <User className="w-4 h-4" />
            View profile
          </GlassButton>
          <GlassButton
            variant="ghost"
            className="flex items-center gap-2 px-4 text-red-200 border border-red-500/30"
            onClick={() => window.location.assign('/login')}
          >
            <LogOut className="w-4 h-4" />
            Logout
          </GlassButton>
        </div>
      </GlassCard>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {[
          { label: 'Account Role', value: 'Administrator', icon: User },
          { label: 'Notifications', value: 'Enabled', icon: Bell },
          { label: 'Security Score', value: 'Strong', icon: Shield }
        ].map((item, i) => (
          <GlassCard key={item.label} hover={false} className="reveal hover-lift flex items-center gap-3" style={{ animationDelay: `${i * 70}ms` }}>
            <div className="p-3 rounded-2xl bg-white/10">
              <item.icon className="w-5 h-5 text-white/70" />
            </div>
            <div>
              <p className="text-xs text-white/50">{item.label}</p>
              <p className="text-lg font-semibold text-white">{item.value}</p>
            </div>
          </GlassCard>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Sidebar */}
        <GlassCard className="lg:h-fit">
          <nav className="space-y-1">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-300 ${
                  activeTab === tab.id
                    ? 'bg-gradient-to-r from-primary/20 to-accent/20 text-white border border-primary/30'
                    : 'text-white/70 hover:bg-white/10 hover:text-white'
                }`}
              >
                <tab.icon className="w-5 h-5" />
                <span className="font-medium">{tab.label}</span>
              </button>
            ))}
          </nav>
        </GlassCard>

        {/* Content */}
        <div key={activeTab} className="lg:col-span-3 reveal">
          {activeTab === 'profile' && (
            <GlassCard>
              <h2 className="text-xl font-semibold text-white mb-6">Profile Settings</h2>
              <div className="space-y-6">
                <div className="flex items-center gap-6">
                  <img
                    src="https://i.pravatar.cc/150?u=admin"
                    alt="Profile"
                    className="w-24 h-24 rounded-2xl border-4 border-white/10"
                  />
                  <div>
                    <GlassButton variant="primary" size="sm">Change Avatar</GlassButton>
                    <p className="text-sm text-white/50 mt-2">JPG, PNG or GIF. Max size 2MB.</p>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <GlassInput label="Full Name" defaultValue="Dr. Admin" />
                  <GlassInput label="Email" defaultValue="admin@mediai.com" />
                  <GlassInput label="Phone" defaultValue="+1 (555) 000-0000" />
                  <GlassInput label="Department" defaultValue="Administration" />
                </div>

                <div className="flex justify-end">
                  <GlassButton variant="primary">
                    <Save className="w-4 h-4 mr-2" />
                    Save Changes
                  </GlassButton>
                </div>
              </div>
            </GlassCard>
          )}

          {activeTab === 'notifications' && (
            <GlassCard>
              <h2 className="text-xl font-semibold text-white mb-6">Notification Preferences</h2>
              <div className="space-y-4">
                {[
                  { label: 'Email Notifications', desc: 'Receive email updates about appointments' },
                  { label: 'AI Alerts', desc: 'Get notified about critical AI predictions' },
                  { label: 'Lab Results', desc: 'Notification when lab results are ready' },
                  { label: 'Billing Updates', desc: 'Payment and invoice notifications' },
                ].map((item) => (
                  <div key={item.label} className="flex items-center justify-between p-4 rounded-xl bg-white/5">
                    <div>
                      <p className="font-medium text-white">{item.label}</p>
                      <p className="text-sm text-white/50">{item.desc}</p>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input type="checkbox" className="sr-only peer" defaultChecked />
                      <div className="w-11 h-6 bg-white/10 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary"></div>
                    </label>
                  </div>
                ))}
              </div>
            </GlassCard>
          )}

          {activeTab === 'security' && (
            <GlassCard>
              <h2 className="text-xl font-semibold text-white mb-6">Security Settings</h2>
              <div className="space-y-6">
                <GlassInput label="Current Password" type="password" />
                <GlassInput label="New Password" type="password" />
                <GlassInput label="Confirm New Password" type="password" />
                <div className="flex justify-end">
                  <GlassButton variant="primary">Update Password</GlassButton>
                </div>
              </div>
            </GlassCard>
          )}

          {activeTab === 'appearance' && (
            <GlassCard>
              <h2 className="text-xl font-semibold text-app mb-1">Appearance</h2>
              <p className="text-sm text-app-subtle mb-6">Choose a theme — it applies instantly across the app.</p>

              <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                {themes.map((t) => {
                  const active = theme === t.id;
                  return (
                    <button
                      key={t.id}
                      onClick={() => setTheme(t.id)}
                      className={cn(
                        'relative rounded-2xl border p-3 text-left transition-all hover-lift',
                        active ? 'border-[color:var(--primary)] ring-2 ring-[color:var(--ring)]' : 'border-[var(--border)] hover:border-[var(--border-strong)]'
                      )}
                    >
                      {/* Theme preview swatch */}
                      <div className="rounded-xl overflow-hidden border border-[var(--border)] h-20 flex" style={{ background: t.swatch[0] }}>
                        <div className="w-1/3 h-full" style={{ background: 'rgba(255,255,255,0.04)' }} />
                        <div className="flex-1 p-2 flex flex-col justify-between">
                          <div className="h-2 w-10 rounded-full" style={{ background: t.swatch[1] }} />
                          <div className="flex gap-1.5">
                            <div className="h-5 w-5 rounded-md" style={{ background: t.swatch[1] }} />
                            <div className="h-5 w-5 rounded-md" style={{ background: t.swatch[2] }} />
                            <div className="h-5 flex-1 rounded-md" style={{ background: 'rgba(255,255,255,0.06)' }} />
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center justify-between mt-2.5">
                        <span className="text-sm font-medium text-app flex items-center gap-1.5">
                          {t.isDark ? <Moon className="w-3.5 h-3.5 text-app-subtle" /> : <Sun className="w-3.5 h-3.5 text-app-subtle" />}
                          {t.name}
                        </span>
                        {active && (
                          <span className="w-5 h-5 rounded-full bg-[color:var(--primary)] flex items-center justify-center">
                            <Check className="w-3 h-3 text-white" />
                          </span>
                        )}
                      </div>
                    </button>
                  );
                })}
              </div>

              <div className="mt-6 flex items-center justify-between p-4 rounded-xl bg-[var(--surface-2)] border border-[var(--border)]">
                <div>
                  <p className="font-medium text-app">Reduced motion</p>
                  <p className="text-sm text-app-subtle">Honors your system setting automatically</p>
                </div>
                <span className="text-xs text-app-subtle px-2.5 py-1 rounded-full bg-[var(--surface-3)]">System</span>
              </div>
            </GlassCard>
          )}
        </div>
      </div>
    </div>
  );
};
