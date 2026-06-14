import React from 'react';
import { cn } from '../../utils/cn';

interface PageHeaderProps {
  title: string;
  subtitle?: string;
  /** Small label/badge shown above the title (e.g. a section eyebrow). */
  eyebrow?: React.ReactNode;
  /** Right-aligned actions (buttons, badges). */
  actions?: React.ReactNode;
  className?: string;
}

/**
 * Standardized page heading used on every page for consistent typography,
 * spacing, and action alignment.
 */
export const PageHeader: React.FC<PageHeaderProps> = ({ title, subtitle, eyebrow, actions, className }) => (
  <div className={cn('flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between', className)}>
    <div className="min-w-0">
      {eyebrow && <div className="mb-1.5">{eyebrow}</div>}
      <h1 className="text-2xl sm:text-[28px] font-bold text-app tracking-tight leading-tight">{title}</h1>
      {subtitle && <p className="text-app-muted text-sm mt-1">{subtitle}</p>}
    </div>
    {actions && <div className="flex items-center gap-2 flex-shrink-0">{actions}</div>}
  </div>
);
