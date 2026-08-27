import React from 'react';
import { cn } from '../../utils/cn';

/** Single shimmering placeholder block. Sizes come from Tailwind classes. */
export const Skeleton: React.FC<{ className?: string; style?: React.CSSProperties }> = ({ className, style }) => (
  <div className={cn('skeleton', className)} style={style} aria-hidden="true" />
);

/** Card-shaped placeholder used while a list/grid section is "loading". */
export const SkeletonCard: React.FC<{ className?: string }> = ({ className }) => (
  <div className={cn('glass-card border rounded-2xl p-5 space-y-3', className)} aria-hidden="true">
    <div className="flex items-center gap-3">
      <Skeleton className="w-11 h-11 rounded-xl" />
      <div className="flex-1 space-y-2">
        <Skeleton className="h-3 w-2/3" />
        <Skeleton className="h-3 w-1/3" />
      </div>
    </div>
    <Skeleton className="h-2.5 w-full" />
    <Skeleton className="h-2.5 w-4/5" />
  </div>
);

/** Placeholder rows for a table body. */
export const SkeletonRows: React.FC<{ rows?: number; cols?: number }> = ({ rows = 5, cols = 5 }) => (
  <>
    {Array.from({ length: rows }).map((_, r) => (
      <tr key={r}>
        {Array.from({ length: cols }).map((_, c) => (
          <td key={c} className="px-6 py-4">
            <Skeleton className="h-3" style={{ width: `${55 + ((r + c) % 4) * 10}%` }} />
          </td>
        ))}
      </tr>
    ))}
  </>
);
