import React from 'react';
import { cn } from '../../utils/cn';

interface GlassButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'default' | 'primary' | 'ghost' | 'danger';
  size?: 'sm' | 'md' | 'lg';
  children: React.ReactNode;
  className?: string;
}

export const GlassButton: React.FC<GlassButtonProps> = ({
  variant = 'default',
  size = 'md',
  children,
  className,
  ...props
}) => {
  const variants = {
    default: 'bg-white/10 border border-white/20 hover:bg-white/20',
    primary: 'bg-gradient-to-r from-primary to-accent border-0 hover:shadow-lg hover:shadow-primary/30',
    ghost: 'bg-transparent border border-white/10 hover:bg-white/10',
    danger: 'bg-red-500/20 border border-red-500/30 hover:bg-red-500/30 text-red-200'
  };

  const sizes = {
    sm: 'px-3 py-1.5 text-sm',
    md: 'px-4 py-2',
    lg: 'px-6 py-3 text-lg'
  };

  return (
    <button
      className={cn(
        'rounded-xl font-medium transition-all duration-300',
        'hover:scale-105 active:scale-95',
        'disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100',
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
