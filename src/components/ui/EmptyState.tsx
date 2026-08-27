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
  /** Tighter padding for use inside a card rather than as a whole page. */
  compact?: boolean;
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
  compact = false,
  className,
}) => (
  <div className={cn('flex flex-col items-center justify-center text-center px-6', compact ? 'py-8' : 'py-16', className)}>
    <div className={cn('relative', compact ? 'mb-3' : 'mb-5')}>
      <div className="absolute inset-0 rounded-2xl bg-primary/20 blur-2xl" aria-hidden="true" />
      <div className={cn(
        'relative rounded-2xl bg-[var(--surface-2)] border border-[var(--border)] flex items-center justify-center',
        compact ? 'w-12 h-12' : 'w-16 h-16'
      )}>
        <Icon className={cn('text-app-subtle', compact ? 'w-5 h-5' : 'w-7 h-7')} />
      </div>
    </div>

    <h3 className={cn('font-semibold text-app', compact ? 'text-sm' : 'text-base')}>{title}</h3>
    {description && (
      <p className={cn('text-app-muted mt-1.5 max-w-sm leading-relaxed', compact ? 'text-xs' : 'text-sm')}>{description}</p>
    )}

    {(action || secondaryAction) && (
      <div className={cn('flex flex-wrap items-center justify-center gap-2', compact ? 'mt-3.5' : 'mt-5')}>
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
