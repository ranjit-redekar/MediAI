import React from 'react';
import { Skeleton } from './Skeleton';

/**
 * Shown while a code-split route chunk downloads. Mirrors the common page
 * shape (header + stat row + content) so the swap-in doesn't jump.
 */
export const RouteFallback: React.FC = () => (
  <div className="p-6 space-y-6" role="status" aria-label="Loading page">
    <div className="space-y-2.5">
      <Skeleton className="h-7 w-52" />
      <Skeleton className="h-3.5 w-72" />
    </div>
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
      {Array.from({ length: 4 }).map((_, i) => (
        <Skeleton key={i} className="h-28 rounded-2xl" />
      ))}
    </div>
    <Skeleton className="h-72 rounded-2xl" />
  </div>
);
