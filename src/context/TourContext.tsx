import React, { createContext, useCallback, useContext, useMemo, useState } from 'react';

export type TourPlacement = 'top' | 'bottom' | 'left' | 'right' | 'center';

export interface TourStep {
  /** value of the data-tour="..." attribute on the element to highlight */
  target?: string;
  title: string;
  body: string;
  placement?: TourPlacement;
}

const STORAGE_KEY = 'mediai-tour-completed';

export const tourSteps: TourStep[] = [
  {
    title: 'Welcome to MediAI 👋',
    body: "A quick tour of your AI-powered hospital command center. It takes about a minute — you can skip anytime.",
    placement: 'center'
  },
  {
    target: 'nav',
    title: 'Navigation',
    body: 'Move between clinical and administrative modules from the sidebar. Badges show what needs attention.',
    placement: 'right'
  },
  {
    target: 'nav-journey',
    title: 'Patient Journey',
    body: 'Track every patient from booking → reception → doctor → medical store, with AI medicine suggestions along the way.',
    placement: 'right'
  },
  {
    target: 'agents',
    title: 'AI Agents',
    body: 'Specialized agents watch over triage, revenue, staffing and more in real time. Open any to see its playbook.',
    placement: 'right'
  },
  {
    target: 'search',
    title: 'Universal search',
    body: 'Find patients, doctors, or actions instantly. Press ⌘K (Ctrl+K) from anywhere in the portal.',
    placement: 'bottom'
  },
  {
    target: 'copilot',
    title: 'AI Copilot',
    body: 'Ask anything in plain language — “show critical alerts”, “today’s schedule”, “low stock medicines”.',
    placement: 'bottom'
  },
  {
    target: 'notifications',
    title: 'Tasks & alerts',
    body: 'Your AI task inbox collects everything that needs a decision, so nothing slips through.',
    placement: 'bottom'
  },
  {
    target: 'help',
    title: "You're all set!",
    body: 'Click this Help button whenever you want to replay the tour. Welcome aboard 🎉',
    placement: 'bottom'
  }
];

interface TourContextValue {
  active: boolean;
  stepIndex: number;
  steps: TourStep[];
  start: () => void;
  stop: () => void;
  next: () => void;
  prev: () => void;
  hasCompleted: () => boolean;
}

const TourContext = createContext<TourContextValue | undefined>(undefined);

export const TourProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [active, setActive] = useState(false);
  const [stepIndex, setStepIndex] = useState(0);

  const start = useCallback(() => {
    setStepIndex(0);
    setActive(true);
  }, []);

  const finish = useCallback(() => {
    setActive(false);
    try { localStorage.setItem(STORAGE_KEY, 'true'); } catch { /* ignore */ }
  }, []);

  const stop = useCallback(() => finish(), [finish]);

  const next = useCallback(() => {
    setStepIndex(prev => {
      if (prev >= tourSteps.length - 1) {
        finish();
        return prev;
      }
      return prev + 1;
    });
  }, [finish]);

  const prev = useCallback(() => {
    setStepIndex(p => Math.max(0, p - 1));
  }, []);

  const hasCompleted = useCallback(() => {
    try { return !!localStorage.getItem(STORAGE_KEY); } catch { return false; }
  }, []);

  const value = useMemo<TourContextValue>(() => ({
    active, stepIndex, steps: tourSteps, start, stop, next, prev, hasCompleted
  }), [active, stepIndex, start, stop, next, prev, hasCompleted]);

  return <TourContext.Provider value={value}>{children}</TourContext.Provider>;
};

export const useTour = () => {
  const ctx = useContext(TourContext);
  if (!ctx) throw new Error('useTour must be used within TourProvider');
  return ctx;
};
