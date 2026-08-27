import React from 'react';
import type { LucideIcon } from 'lucide-react';
import { SearchX } from 'lucide-react';
import { GlassButton } from './GlassButton';
import { cn } from '../../utils/cn';

interface EmptyStateProps {
  icon?: LucideIcon;
  title: string;
  description?: string;
  /** Primary call to action, e.g. "Clear filters". */
  action?: { label: string; onClick: () => void; icon?: LucideIcon };
  /** Secondary, lower-emphasis action. */
  secondaryAction?: { label: string; onClick: () => void };
  className?: string;
}

/**
 * Shown whenever a list, table, or grid has nothing to render — a filtered-out
 * search, an empty module, or a cleared queue. Always give the user a way out.
 */
export const EmptyState: React.FC<EmptyStateProps> = ({
  icon: Icon = SearchX,
  title,
  description,
  action,
  secondaryAction,
  className,
}) => (
  <div className={cn('flex flex-col items-center justify-center text-center px-6 py-16', className)}>
    <div className="relative mb-5">
      <div className="absolute inset-0 rounded-2xl bg-primary/20 blur-2xl" aria-hidden="true" />
      <div className="relative w-16 h-16 rounded-2xl bg-[var(--surface-2)] border border-[var(--border)] flex items-center justify-center">
        <Icon className="w-7 h-7 text-app-subtle" />
      </div>
    </div>

    <h3 className="text-base font-semibold text-app">{title}</h3>
    {description && (
      <p className="text-sm text-app-muted mt-1.5 max-w-sm leading-relaxed">{description}</p>
    )}

    {(action || secondaryAction) && (
      <div className="flex flex-wrap items-center justify-center gap-2 mt-5">
        {action && (
          <GlassButton variant="primary" size="sm" onClick={action.onClick}>
            {action.icon && <action.icon className="w-4 h-4" />}
            {action.label}
          </GlassButton>
        )}
        {secondaryAction && (
          <GlassButton variant="ghost" size="sm" onClick={secondaryAction.onClick}>
            {secondaryAction.label}
          </GlassButton>
        )}
      </div>
    )}
  </div>
);
