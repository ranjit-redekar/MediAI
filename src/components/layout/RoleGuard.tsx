import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { Lock, ArrowLeft } from 'lucide-react';
import { GlassCard } from '../ui/GlassCard';
import { GlassButton } from '../ui/GlassButton';
import { useSession } from '../../context/SessionContext';
import { cn } from '../../utils/cn';

/**
 * Blocks routes a role has no business opening. Patients are redirected to
 * their portal outright; staff get an explanation rather than a blank page,
 * because silently hiding a module is how people end up filing tickets.
 */
export const RoleGuard: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { role, can } = useSession();
  const { pathname } = useLocation();

  if (role.shell === 'patient') {
    return <Navigate to="/portal" replace />;
  }

  if (can(pathname)) return <>{children}</>;

  return (
    <div className="flex items-center justify-center min-h-[60vh]">
      <GlassCard hover={false} padding="lg" className="max-w-md w-full text-center reveal">
        <div className={cn('w-16 h-16 mx-auto mb-4 rounded-2xl flex items-center justify-center', role.accent.bg)}>
          <Lock className={cn('w-7 h-7', role.accent.text)} />
        </div>
        <h1 className="text-lg font-semibold text-app">Not part of your workspace</h1>
        <p className="text-sm text-app-muted mt-2 leading-relaxed">
          The <span className={cn('font-semibold', role.accent.text)}>{role.name}</span> role doesn't
          include this module. That's deliberate — you only see the screens your job needs.
        </p>
        <p className="text-xs text-app-subtle mt-3">
          Need access? Switch role from the account menu, or ask an administrator.
        </p>
        <GlassButton variant="primary" className="mt-5" onClick={() => window.location.assign(role.home)}>
          <ArrowLeft className="w-4 h-4" /> Back to my workspace
        </GlassButton>
      </GlassCard>
    </div>
  );
};
