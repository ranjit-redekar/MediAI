import React from 'react';
import { Search } from 'lucide-react';
import { cn } from '../../utils/cn';

interface SearchInputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  /** Constrain width on larger screens. Defaults to full width of its container. */
  width?: 'full' | 'md' | 'lg';
}

const widthClass: Record<NonNullable<SearchInputProps['width']>, string> = {
  full: 'w-full',
  md: 'w-full sm:max-w-xs',
  lg: 'w-full sm:max-w-md',
};

/**
 * The single standardized search field used across the app, so every search
 * looks and behaves identically (height, icon, focus ring).
 */
export const SearchInput: React.FC<SearchInputProps> = ({ width = 'full', className, ...props }) => (
  <div className={cn('relative', widthClass[width])}>
    <Search className="w-4 h-4 text-app-subtle absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
    <input
      type="search"
      className={cn(
        'w-full h-11 rounded-xl glass-input border pl-10 pr-4 text-sm text-app',
        'outline-none transition-all duration-200 focus-ring focus:border-[var(--border-strong)]',
        className
      )}
      {...props}
    />
  </div>
);
