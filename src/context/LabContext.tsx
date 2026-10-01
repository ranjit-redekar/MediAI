import React, { createContext, useCallback, useContext, useMemo, useRef, useState } from 'react';
import { labTests as seed } from '../data/laboratory';
import { matchTest, resultsFor, testDefinition } from '../data/labCatalog';
import { clockNow } from '../data/demoToday';
import type { LabTest } from '../types';

export interface NewLabOrder {
  patientId: string;
  patientName: string;
  testName: string;
  doctorId: string;
  doctorName: string;
  collectOn: string;
  priority?: LabTest['priority'];
}

interface LabContextValue {
  tests: LabTest[];
  addOrder: (order: NewLabOrder) => LabTest;
  /** Withdraws an order — only while nothing has been done with it. */
  cancelOrder: (id: string) => void;
  /** Sample taken: the order moves from Pending to In Progress. */
  collect: (id: string) => void;
  /** Values in, flags computed from the catalogue ranges, order complete. */
  enterResults: (id: string, values: Record<string, number>) => void;
  /** The critical value was read back to the ordering clinician. */
  markCalled: (id: string, by: string) => void;
}

const LabContext = createContext<LabContextValue | undefined>(undefined);

export const LabProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [tests, setTests] = useState<LabTest[]>(seed);
  const lastId = useRef(Math.max(0, ...seed.map(t => Number(t.id.slice(1)) || 0)));

  const patch = useCallback((id: string, fn: (t: LabTest) => LabTest) => {
    setTests(prev => prev.map(t => (t.id === id ? fn(t) : t)));
  }, []);

  const addOrder = useCallback((o: NewLabOrder) => {
    const def = testDefinition(o.testName) ?? matchTest(o.testName);
    const test: LabTest = {
      id: `L${String(++lastId.current).padStart(3, '0')}`,
      patientId: o.patientId,
      patientName: o.patientName,
      testName: def?.name ?? o.testName,
      category: def?.category ?? 'General',
      orderedDate: o.collectOn,
      status: 'Pending',
      doctorId: o.doctorId,
      doctorName: o.doctorName,
      priority: o.priority ?? 'Routine',
      orderedAt: clockNow().getTime(),
      collectOn: o.collectOn,
    };
    setTests(prev => [test, ...prev]);
    return test;
  }, []);

  const cancelOrder = useCallback((id: string) => {
    setTests(prev => prev.filter(t => t.id !== id || t.status !== 'Pending'));
  }, []);

  const collect = useCallback((id: string) => patch(id, t => (t.status === 'Pending' ? { ...t, status: 'In Progress' } : t)), [patch]);

  const enterResults = useCallback((id: string, values: Record<string, number>) => {
    patch(id, t => {
      const def = testDefinition(t.testName);
      if (!def) return t;
      return { ...t, status: 'Completed', completedDate: t.collectOn ?? t.orderedDate, results: resultsFor(def, values) };
    });
  }, [patch]);

  const markCalled = useCallback((id: string, by: string) => {
    patch(id, t => ({ ...t, criticalCalledAt: clockNow().getTime(), criticalCalledBy: by }));
  }, [patch]);

  const value = useMemo(() => ({ tests, addOrder, cancelOrder, collect, enterResults, markCalled }),
    [tests, addOrder, cancelOrder, collect, enterResults, markCalled]);
  return <LabContext.Provider value={value}>{children}</LabContext.Provider>;
};

export const useLab = () => {
  const ctx = useContext(LabContext);
  if (!ctx) throw new Error('useLab must be used within a LabProvider');
  return ctx;
};
