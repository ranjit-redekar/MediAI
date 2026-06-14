import React from 'react';
import { ArrowLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { GlassCard } from './GlassCard';
import { cn } from '../../utils/cn';

interface FormPageLayoutProps {
  title: string;
  subtitle?: string;
  backLabel: string;
  backTo: string;
  icon?: React.ReactNode;
  children: React.ReactNode;
}

/**
 * Full-page shell for add/edit forms. Gives a back link, a clear page heading,
 * and a roomy card for the form — ideal when forms have many fields/sections.
 */
export const FormPageLayout: React.FC<FormPageLayoutProps> = ({
  title, subtitle, backLabel, backTo, icon, children
}) => {
  const navigate = useNavigate();
  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <button
        onClick={() => navigate(backTo)}
        className="flex items-center gap-2 text-sm text-white/60 hover:text-white transition-colors"
      >
        <ArrowLeft className="w-4 h-4" />
        {backLabel}
      </button>

      <div className="flex items-center gap-3">
        {icon && (
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-primary to-accent flex items-center justify-center flex-shrink-0">
            {icon}
          </div>
        )}
        <div>
          <h1 className="text-2xl font-bold text-white">{title}</h1>
          {subtitle && <p className="text-white/60 text-sm mt-0.5">{subtitle}</p>}
        </div>
      </div>

      <GlassCard hover={false} padding="lg">
        {children}
      </GlassCard>
    </div>
  );
};

/** Optional grouping of fields with a small section heading inside a form. */
export const FormSection: React.FC<{ title: string; description?: string; children: React.ReactNode; className?: string }> = ({
  title, description, children, className
}) => (
  <div className={cn('space-y-4', className)}>
    <div className="border-b border-white/10 pb-2">
      <h3 className="text-sm font-semibold text-white uppercase tracking-wide">{title}</h3>
      {description && <p className="text-xs text-white/40 mt-0.5">{description}</p>}
    </div>
    {children}
  </div>
);
