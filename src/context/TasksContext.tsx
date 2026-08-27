import React, { createContext, useCallback, useContext, useMemo, useState } from 'react';
import { db } from '../data';

export interface Task {
  id: string;
  title: string;
  description: string;
  badge: string;
  severity: 'info' | 'warning' | 'critical';
  /** Agent that raised the task — used to deep-link into its viewbook. */
  agentId: string;
  patientId?: string;
}

interface TasksContextValue {
  tasks: Task[];
  openCount: number;
  resolve: (id: string) => void;
  /** Restores every dismissed task — powers the "Undo" toast action. */
  restoreAll: () => void;
}

const TasksContext = createContext<TasksContextValue | undefined>(undefined);

const seedTasks = (): Task[] =>
  db.aiInsights.slice(0, 5).map(insight => ({
    id: insight.id,
    title: insight.type,
    description: insight.description,
    badge: insight.severity,
    severity:
      insight.severity === 'Critical' ? 'critical'
      : insight.severity === 'High' ? 'warning'
      : 'info',
    agentId: insight.agentId ?? 'quickcheck-agent',
    patientId: insight.patientId,
  }));

export const TasksProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [tasks, setTasks] = useState<Task[]>(seedTasks);

  const resolve = useCallback((id: string) => {
    setTasks(prev => prev.filter(t => t.id !== id));
  }, []);

  const restoreAll = useCallback(() => setTasks(seedTasks()), []);

  const value = useMemo<TasksContextValue>(
    () => ({ tasks, openCount: tasks.length, resolve, restoreAll }),
    [tasks, resolve, restoreAll]
  );

  return <TasksContext.Provider value={value}>{children}</TasksContext.Provider>;
};

export const useTasks = () => {
  const ctx = useContext(TasksContext);
  if (!ctx) throw new Error('useTasks must be used within a TasksProvider');
  return ctx;
};
