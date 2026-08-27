import React from 'react';
import { ArrowDown, ArrowUp, ChevronsUpDown } from 'lucide-react';
import { cn } from '../../utils/cn';

export type SortDirection = 'asc' | 'desc';

interface SortableHeaderProps {
  label: string;
  /** Column key this header sorts by. */
  columnKey: string;
  activeKey: string | null;
  direction: SortDirection;
  onSort: (key: string) => void;
  align?: 'left' | 'right' | 'center';
  className?: string;
}

/** Clickable table header that shows and toggles the current sort. */
export const SortableHeader: React.FC<SortableHeaderProps> = ({
  label, columnKey, activeKey, direction, onSort, align = 'left', className,
}) => {
  const active = activeKey === columnKey;
  const Icon = !active ? ChevronsUpDown : direction === 'asc' ? ArrowUp : ArrowDown;

  return (
    <th
      scope="col"
      aria-sort={active ? (direction === 'asc' ? 'ascending' : 'descending') : 'none'}
      className={cn('px-6 py-3.5', align === 'right' && 'text-right', align === 'center' && 'text-center', className)}
    >
      <button
        onClick={() => onSort(columnKey)}
        className={cn(
          'inline-flex items-center gap-1.5 text-sm font-semibold transition-colors focus-ring rounded',
          align === 'right' && 'flex-row-reverse',
          active ? 'text-app' : 'text-app-muted hover:text-app'
        )}
      >
        {label}
        <Icon className={cn('w-3.5 h-3.5', active ? 'opacity-100' : 'opacity-40')} />
      </button>
    </th>
  );
};

/** Plain, non-sortable header cell — same typography as SortableHeader. */
export const TableHeader: React.FC<{
  children: React.ReactNode;
  align?: 'left' | 'right' | 'center';
  className?: string;
}> = ({ children, align = 'left', className }) => (
  <th
    scope="col"
    className={cn(
      'px-6 py-3.5 text-sm font-semibold text-app-muted',
      align === 'right' && 'text-right',
      align === 'center' && 'text-center',
      align === 'left' && 'text-left',
      className
    )}
  >
    {children}
  </th>
);

/**
 * Hook holding sort key + direction. Clicking the active column flips the
 * direction; clicking a new column sorts it ascending.
 */
export function useSort<T>(initialKey: string | null = null, initialDirection: SortDirection = 'asc') {
  const [sortKey, setSortKey] = React.useState<string | null>(initialKey);
  const [direction, setDirection] = React.useState<SortDirection>(initialDirection);

  const onSort = React.useCallback((key: string) => {
    setSortKey(prev => {
      if (prev === key) {
        setDirection(d => (d === 'asc' ? 'desc' : 'asc'));
        return prev;
      }
      setDirection('asc');
      return key;
    });
  }, []);

  const sortRows = React.useCallback(
    (rows: T[], accessors: Record<string, (row: T) => string | number>) => {
      if (!sortKey || !accessors[sortKey]) return rows;
      const get = accessors[sortKey];
      return [...rows].sort((a, b) => {
        const av = get(a);
        const bv = get(b);
        const result =
          typeof av === 'number' && typeof bv === 'number'
            ? av - bv
            : String(av).localeCompare(String(bv));
        return direction === 'asc' ? result : -result;
      });
    },
    [sortKey, direction]
  );

  return { sortKey, direction, onSort, sortRows };
}
