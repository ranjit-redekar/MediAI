import React, { useId } from 'react';
import { ChevronDown } from 'lucide-react';
import { cn } from '../../utils/cn';

interface GlassSelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  label?: string;
  error?: string;
  options: { value: string; label: string }[];
}

export const GlassSelect: React.FC<GlassSelectProps> = ({
  label,
  error,
  options,
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
        <select
          className={cn(
            'w-full h-11 rounded-xl glass-input border pl-4 pr-10 text-sm text-app appearance-none',
            'outline-none transition-all duration-200 focus-ring cursor-pointer',
            'focus:border-[var(--border-strong)]',
            error && 'border-[color:var(--danger)]',
            className
          )}
          {...props}
          id={id}
          aria-invalid={error ? true : undefined}
          aria-describedby={error ? errorId : props['aria-describedby']}
        >
          {options.map((option) => (
            <option key={option.value} value={option.value} className="bg-[var(--surface-solid)] text-app">
              {option.label}
            </option>
          ))}
        </select>
        <ChevronDown className="w-4 h-4 text-app-subtle absolute right-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
      </div>
      {error && <p id={errorId} className="mt-1.5 text-sm text-[color:var(--danger)]">{error}</p>}
    </div>
  );
};
