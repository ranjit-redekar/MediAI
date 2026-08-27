import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Brain, Lock, Mail, Sparkles, Moon, Sun, Stethoscope, UserRound,
  HeartPulse, Pill, FlaskConical, ClipboardList, Shield, User, ArrowRight,
} from 'lucide-react';
import type { LucideIcon } from 'lucide-react';
import { GlassCard } from '../components/ui/GlassCard';
import { GlassButton } from '../components/ui/GlassButton';
import { GlassInput } from '../components/ui/GlassInput';
import { useTheme } from '../context/ThemeContext';
import { useSession } from '../context/SessionContext';
import { cn } from '../utils/cn';
import type { RoleId } from '../types/access';

const ROLE_ICONS: Record<RoleId, LucideIcon> = {
  admin: Shield,
  doctor: Stethoscope,
  'assistant-doctor': UserRound,
  nurse: HeartPulse,
  pharmacist: Pill,
  'lab-technician': FlaskConical,
  receptionist: ClipboardList,
  patient: User,
};

export const Login: React.FC = () => {
  const navigate = useNavigate();
  const { isDark, toggleTheme } = useTheme();
  const { role, roles, signInAs } = useSession();
  const [selected, setSelected] = useState<RoleId>(role.id);
  const [loading, setLoading] = useState(false);

  const active = roles.find(r => r.id === selected) ?? roles[0];
  const staffRoles = roles.filter(r => r.shell === 'admin');
  const patientRole = roles.find(r => r.id === 'patient');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    window.setTimeout(() => {
      signInAs(selected);
      navigate(active.home);
    }, 600);
  };

  return (
    <div className="relative min-h-screen flex items-center justify-center p-4" style={{ background: 'var(--app-bg)' }}>
      <GlassButton
        type="button"
        variant="ghost"
        size="sm"
        onClick={toggleTheme}
        className="absolute top-6 right-6"
        aria-label={isDark ? 'Switch to light theme' : 'Switch to dark theme'}
      >
        {isDark ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
        <span className="hidden sm:inline">{isDark ? 'Light mode' : 'Dark mode'}</span>
      </GlassButton>

      <div className="max-w-5xl w-full grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Role picker — the app looks different for each of these */}
        <GlassCard hover={false}>
          <div className="flex items-center gap-3 mb-5">
            <div className="p-3 rounded-2xl bg-gradient-to-br from-primary to-accent">
              <Brain className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-app flex items-center gap-2">
                MediAI <Sparkles className="w-4 h-4 text-violet-400" />
              </h1>
              <p className="text-app-muted text-sm">AI-powered hospital suite</p>
            </div>
          </div>

          <p className="text-xs uppercase tracking-wider font-semibold text-app-subtle mb-2.5">
            Sign in as
          </p>

          <div className="grid grid-cols-2 gap-2">
            {staffRoles.map(r => {
              const Icon = ROLE_ICONS[r.id];
              const isActive = selected === r.id;
              return (
                <button
                  key={r.id}
                  type="button"
                  onClick={() => setSelected(r.id)}
                  aria-pressed={isActive}
                  className={cn(
                    'flex items-center gap-2.5 p-3 rounded-xl border text-left transition-all focus-ring',
                    isActive
                      ? cn('border-transparent ring-2', r.accent.bg, r.accent.ring)
                      : 'bg-[var(--surface-2)] border-[var(--border)] hover:border-[var(--border-strong)]'
                  )}
                >
                  <Icon className={cn('w-4 h-4 flex-shrink-0', isActive ? r.accent.text : 'text-app-subtle')} />
                  <span className={cn('text-sm font-medium truncate', isActive ? 'text-app' : 'text-app-muted')}>
                    {r.name}
                  </span>
                </button>
              );
            })}
          </div>

          {patientRole && (
            <>
              <p className="text-xs uppercase tracking-wider font-semibold text-app-subtle mt-5 mb-2.5">
                Or as a patient
              </p>
              <button
                type="button"
                onClick={() => setSelected('patient')}
                aria-pressed={selected === 'patient'}
                className={cn(
                  'w-full flex items-center gap-2.5 p-3 rounded-xl border text-left transition-all focus-ring',
                  selected === 'patient'
                    ? cn('border-transparent ring-2', patientRole.accent.bg, patientRole.accent.ring)
                    : 'bg-[var(--surface-2)] border-[var(--border)] hover:border-[var(--border-strong)]'
                )}
              >
                <User className={cn('w-4 h-4 flex-shrink-0', selected === 'patient' ? patientRole.accent.text : 'text-app-subtle')} />
                <span className={cn('text-sm font-medium', selected === 'patient' ? 'text-app' : 'text-app-muted')}>
                  Patient portal
                </span>
              </button>
            </>
          )}

          <div className="mt-5 pt-5 border-t border-[var(--border)]">
            <p className="text-sm text-app-muted leading-relaxed">
              <span className={cn('font-semibold', active.accent.text)}>{active.name}</span> — {active.persona}
            </p>
          </div>
        </GlassCard>

        {/* Credentials */}
        <GlassCard hover={false}>
          <h2 className="text-xl font-semibold text-app mb-2">Welcome back</h2>
          <p className="text-app-subtle text-sm mb-6">
            Continuing as <span className={cn('font-medium', active.accent.text)}>{active.demoUser.name}</span>
          </p>

          <form className="space-y-4" onSubmit={handleSubmit}>
            <GlassInput
              label="Email"
              type="email"
              value={active.demoUser.email}
              readOnly
              icon={<Mail className="w-4 h-4" />}
            />
            <GlassInput
              label="Password"
              type="password"
              defaultValue="demo-password"
              icon={<Lock className="w-4 h-4" />}
            />

            <GlassButton type="submit" variant="primary" size="lg" className="w-full" disabled={loading}>
              {loading ? 'Signing in…' : <>Continue to {active.shell === 'patient' ? 'portal' : 'workspace'} <ArrowRight className="w-4 h-4" /></>}
            </GlassButton>
          </form>

          <button
            onClick={() => navigate('/forgot-password')}
            className="w-full text-center text-sm text-app-muted hover:text-app transition-colors mt-4 focus-ring rounded"
          >
            Forgot your password?
          </button>

          <p className="text-xs text-app-subtle text-center mt-6 leading-relaxed">
            UI preview — no real authentication. Pick any role to see how the app
            adapts to that person's job.
          </p>
        </GlassCard>
      </div>
    </div>
  );
};
