import React, { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from 'react';
import { CheckCircle2, AlertTriangle, Info, XCircle, X, Sparkles } from 'lucide-react';
import { cn } from '../utils/cn';

export type ToastVariant = 'success' | 'error' | 'warning' | 'info' | 'ai';

export interface Toast {
  id: number;
  title: string;
  description?: string;
  variant: ToastVariant;
  /** Optional inline action, e.g. "Undo" or "View". */
  action?: { label: string; onClick: () => void };
  duration: number;
}

interface ToastOptions {
  description?: string;
  variant?: ToastVariant;
  action?: { label: string; onClick: () => void };
  duration?: number;
}

interface ToastContextValue {
  toast: (title: string, options?: ToastOptions) => void;
  dismiss: (id: number) => void;
}

const ToastContext = createContext<ToastContextValue | undefined>(undefined);

export const ToastProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [toasts, setToasts] = useState<Toast[]>([]);
  const nextId = useRef(1);

  const dismiss = useCallback((id: number) => {
    setToasts(prev => prev.filter(t => t.id !== id));
  }, []);

  const toast = useCallback((title: string, options: ToastOptions = {}) => {
    const id = nextId.current++;
    const entry: Toast = {
      id,
      title,
      description: options.description,
      variant: options.variant ?? 'success',
      action: options.action,
      duration: options.duration ?? 4000,
    };
    // Cap the stack so a burst of actions never covers the screen.
    setToasts(prev => [...prev.slice(-3), entry]);
  }, []);

  const value = useMemo<ToastContextValue>(() => ({ toast, dismiss }), [toast, dismiss]);

  return (
    <ToastContext.Provider value={value}>
      {children}
      <Toaster toasts={toasts} onDismiss={dismiss} />
    </ToastContext.Provider>
  );
};

export const useToast = () => {
  const ctx = useContext(ToastContext);
  if (!ctx) throw new Error('useToast must be used within a ToastProvider');
  return ctx;
};

const variantStyles: Record<ToastVariant, { icon: typeof Info; tint: string; ring: string; bar: string }> = {
  success: { icon: CheckCircle2,  tint: 'text-emerald-400', ring: 'bg-emerald-500/15', bar: 'bg-emerald-400' },
  error:   { icon: XCircle,       tint: 'text-red-400',     ring: 'bg-red-500/15',     bar: 'bg-red-400' },
  warning: { icon: AlertTriangle, tint: 'text-amber-400',   ring: 'bg-amber-500/15',   bar: 'bg-amber-400' },
  info:    { icon: Info,          tint: 'text-cyan-400',    ring: 'bg-cyan-500/15',    bar: 'bg-cyan-400' },
  ai:      { icon: Sparkles,      tint: 'text-violet-400',  ring: 'bg-violet-500/15',  bar: 'bg-violet-400' },
};

const Toaster: React.FC<{ toasts: Toast[]; onDismiss: (id: number) => void }> = ({ toasts, onDismiss }) => (
  <div
    className="fixed bottom-4 right-4 z-[100] flex flex-col gap-2.5 w-[min(calc(100vw-2rem),22rem)] pointer-events-none"
    role="region"
    aria-label="Notifications"
  >
    {toasts.map(t => (
      <ToastRow key={t.id} toast={t} onDismiss={onDismiss} />
    ))}
  </div>
);

const ToastRow: React.FC<{ toast: Toast; onDismiss: (id: number) => void }> = ({ toast, onDismiss }) => {
  const { icon: Icon, tint, ring, bar } = variantStyles[toast.variant];
  const [paused, setPaused] = useState(false);

  useEffect(() => {
    if (paused) return;
    const id = window.setTimeout(() => onDismiss(toast.id), toast.duration);
    return () => window.clearTimeout(id);
  }, [toast.id, toast.duration, paused, onDismiss]);

  return (
    <div
      role="status"
      aria-live="polite"
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
      className="reveal-pop pointer-events-auto glass-modal border rounded-2xl overflow-hidden shadow-lifted"
    >
      <div className="flex items-start gap-3 p-3.5">
        <div className={cn('w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0', ring)}>
          <Icon className={cn('w-4 h-4', tint)} />
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-sm font-semibold text-app leading-snug">{toast.title}</p>
          {toast.description && (
            <p className="text-xs text-app-muted mt-0.5 leading-relaxed">{toast.description}</p>
          )}
          {toast.action && (
            <button
              onClick={() => { toast.action!.onClick(); onDismiss(toast.id); }}
              className={cn('mt-2 text-xs font-semibold hover:underline focus-ring rounded', tint)}
            >
              {toast.action.label}
            </button>
          )}
        </div>
        <button
          onClick={() => onDismiss(toast.id)}
          aria-label="Dismiss notification"
          className="p-1 rounded-lg text-app-subtle hover:text-app hover:bg-[var(--surface-2)] transition-colors focus-ring flex-shrink-0"
        >
          <X className="w-3.5 h-3.5" />
        </button>
      </div>
      <div className="h-0.5 bg-[var(--surface-3)]">
        <div
          className={cn('h-full', bar)}
          style={{
            animation: `toastBar ${toast.duration}ms linear forwards`,
            animationPlayState: paused ? 'paused' : 'running',
          }}
        />
      </div>
    </div>
  );
};
