import React from 'react';
import { cn } from '../../utils/cn';

interface GlassButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'default' | 'primary' | 'ghost' | 'danger' | 'outline';
  size?: 'sm' | 'md' | 'lg';
  children: React.ReactNode;
  className?: string;
}

/**
 * Single source of truth for buttons.
 * Convention: `primary` is the ONLY gradient variant (one per view, max).
 * Everything else uses flat, theme-aware surfaces for a consistent, premium feel.
 */
export const GlassButton: React.FC<GlassButtonProps> = ({
  variant = 'default',
  size = 'md',
  children,
  className,
  ...props
}) => {
  const variants = {
    primary:
      'bg-gradient-to-r from-primary to-accent text-white border border-transparent shadow-primary hover:brightness-110',
    default:
      'bg-[var(--surface-2)] text-app border border-[var(--border)] hover:bg-[var(--surface-3)]',
    outline:
      'bg-transparent text-app border border-[var(--border-strong)] hover:bg-[var(--surface-2)]',
    ghost:
      'bg-transparent text-app-muted border border-transparent hover:bg-[var(--surface-2)] hover:text-app',
    danger:
      'bg-[color:rgba(239,68,68,0.14)] text-red-300 border border-[color:rgba(239,68,68,0.3)] hover:bg-[color:rgba(239,68,68,0.22)]',
  };

  const sizes = {
    sm: 'h-9 px-3.5 text-sm gap-1.5',
    md: 'h-10 px-4 text-sm gap-2',
    lg: 'h-12 px-6 text-base gap-2',
  };

  return (
    <button
      className={cn(
        'inline-flex items-center justify-center rounded-xl font-semibold whitespace-nowrap',
        'transition-all duration-200 active:scale-[0.98] focus-ring',
        'disabled:opacity-50 disabled:cursor-not-allowed disabled:active:scale-100',
        variants[variant],
        sizes[size],
        className
      )}
      {...props}
    >
      {children}
    </button>
  );
};
