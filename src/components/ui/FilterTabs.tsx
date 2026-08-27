import React from 'react';
import { cn } from '../../utils/cn';

export interface FilterTab {
  label: string;
  value: string;
  count?: number;
}

interface FilterTabsProps {
  tabs: FilterTab[];
  value: string;
  onChange: (value: string) => void;
  /** Accessible name for the group, e.g. "Filter invoices by status". */
  label: string;
  className?: string;
}

/**
 * The standard segmented filter row used on every list page, so status filters
 * look and behave identically across Billing, Pharmacy, Laboratory and Reports.
 */
export const FilterTabs: React.FC<FilterTabsProps> = ({ tabs, value, onChange, label, className }) => (
  <div role="tablist" aria-label={label} className={cn('flex flex-wrap gap-2', className)}>
    {tabs.map(tab => {
      const active = value === tab.value;
      return (
        <button
          key={tab.value}
          role="tab"
          aria-selected={active}
          onClick={() => onChange(tab.value)}
          className={cn(
            'h-9 px-3.5 rounded-lg border text-xs font-semibold inline-flex items-center gap-2 transition-all focus-ring',
            active
              ? 'bg-primary/15 border-primary/40 text-app'
              : 'bg-[var(--surface-2)] border-[var(--border)] text-app-muted hover:text-app hover:border-[var(--border-strong)]'
          )}
        >
          <span>{tab.label}</span>
          {tab.count !== undefined && (
            <span
              className={cn(
                'text-[11px] px-1.5 rounded-full tabular-nums',
                active ? 'bg-primary/20 text-app' : 'bg-[var(--surface-3)] text-app-subtle'
              )}
            >
              {tab.count}
            </span>
          )}
        </button>
      );
    })}
  </div>
);
