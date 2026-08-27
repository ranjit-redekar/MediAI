import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Compass, ArrowLeft, LayoutDashboard, Command } from 'lucide-react';
import { GlassCard } from '../components/ui/GlassCard';
import { GlassButton } from '../components/ui/GlassButton';

const suggestions = [
  { label: 'Dashboard', path: '/' },
  { label: 'Patients', path: '/patients' },
  { label: "Today's Schedule", path: '/appointments' },
  { label: 'AI Insights', path: '/ai-insights' },
];

export const NotFound: React.FC = () => {
  const navigate = useNavigate();

  return (
    <div className="flex items-center justify-center min-h-[60vh]">
      <GlassCard hover={false} padding="lg" className="max-w-lg w-full text-center reveal">
        <div className="relative mx-auto mb-6 w-20 h-20">
          <div className="absolute inset-0 rounded-2xl bg-primary/25 blur-2xl" aria-hidden="true" />
          <div className="relative w-20 h-20 rounded-2xl bg-gradient-to-br from-primary to-accent flex items-center justify-center">
            <Compass className="w-9 h-9 text-white" />
          </div>
        </div>

        <p className="text-sm font-semibold tracking-widest text-app-subtle uppercase">Error 404</p>
        <h1 className="text-2xl font-bold text-app mt-1.5">This page doesn't exist</h1>
        <p className="text-app-muted text-sm mt-2 leading-relaxed">
          The link may be outdated, or the record was removed. Try one of the
          workspaces below, or press <kbd className="px-1.5 py-0.5 rounded-md border border-[var(--border)] text-[11px] font-medium">⌘K</kbd> to search everything.
        </p>

        <div className="flex flex-wrap items-center justify-center gap-2 mt-6">
          {suggestions.map(s => (
            <button
              key={s.path}
              onClick={() => navigate(s.path)}
              className="h-9 px-3.5 rounded-lg border border-[var(--border)] bg-[var(--surface-2)] text-xs font-semibold text-app-muted hover:text-app hover:border-[var(--border-strong)] transition-colors focus-ring"
            >
              {s.label}
            </button>
          ))}
        </div>

        <div className="flex flex-wrap items-center justify-center gap-2 mt-6 pt-6 border-t border-[var(--border)]">
          <GlassButton variant="ghost" onClick={() => navigate(-1)}>
            <ArrowLeft className="w-4 h-4" />
            Go back
          </GlassButton>
          <GlassButton variant="primary" onClick={() => navigate('/')}>
            <LayoutDashboard className="w-4 h-4" />
            Back to dashboard
          </GlassButton>
        </div>

        <p className="mt-4 text-xs text-app-subtle flex items-center justify-center gap-1.5">
          <Command className="w-3 h-3" />
          Tip: the command palette jumps to any patient, doctor, or module
        </p>
      </GlassCard>
    </div>
  );
};
