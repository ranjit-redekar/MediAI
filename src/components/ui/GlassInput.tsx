import React, { useId } from 'react';
import { cn } from '../../utils/cn';

interface GlassInputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  icon?: React.ReactNode;
}

export const GlassInput: React.FC<GlassInputProps> = ({
  label,
  error,
  icon,
  className,
  ...props
}) => {
  // Label and error are tied to the field, so screen readers announce them and
  // clicking the label focuses it.
  const generatedId = useId();
  const id = props.id ?? generatedId;
  const errorId = `${id}-error`;
  return (
    <div className="w-full">
      {label && (
        <label htmlFor={id} className="block text-sm font-medium text-app-muted mb-1.5">
          {label}
        </label>
      )}
      <div className="relative">
        {icon && (
          <div className="absolute left-3.5 top-1/2 -translate-y-1/2 text-app-subtle pointer-events-none">
            {icon}
          </div>
        )}
        <input
          className={cn(
            'w-full h-11 rounded-xl glass-input border px-4 text-sm text-app',
            'outline-none transition-all duration-200 focus-ring',
            'focus:border-[var(--border-strong)]',
            icon && 'pl-10',
            error && 'border-[color:var(--danger)]',
            className
          )}
          {...props}
          id={id}
          aria-invalid={error ? true : undefined}
          aria-describedby={error ? errorId : props['aria-describedby']}
        />
      </div>
      {error && <p id={errorId} className="mt-1.5 text-sm text-[color:var(--danger)]">{error}</p>}
    </div>
  );
};
