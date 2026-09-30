import React, { createContext, useCallback, useContext, useMemo, useRef, useState } from 'react';
import type { Appointment } from '../types';
import { appointments as seed } from '../data/appointments';

interface AppointmentsContextValue {
  appointments: Appointment[];
  getAppointment: (id: string) => Appointment | undefined;
  addAppointment: (data: Partial<Appointment>) => Appointment;
  updateAppointment: (id: string, data: Partial<Appointment>) => void;
  removeAppointment: (id: string) => void;
}

const AppointmentsContext = createContext<AppointmentsContextValue | undefined>(undefined);

export const AppointmentsProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [appointments, setAppointments] = useState<Appointment[]>(seed);

  const lastId = useRef(Math.max(0, ...seed.map(a => Number(a.id.slice(1)) || 0)));

  const getAppointment = useCallback((id: string) => appointments.find(a => a.id === id), [appointments]);

  const addAppointment = useCallback((data: Partial<Appointment>) => {
    // The id is assigned before the state update so callers get it back (it used
    // to be set inside the updater, which runs later), and it counts on from the
    // highest id in use: `length + 1` collided with ids like A106 in a gapped list.
    const appointment = { ...data, id: `A${String(++lastId.current).padStart(3, '0')}` } as Appointment;
    setAppointments(prev => [...prev, appointment]);
    return appointment;
  }, []);

  const updateAppointment = useCallback((id: string, data: Partial<Appointment>) => {
    setAppointments(prev => prev.map(a => (a.id === id ? { ...a, ...data } : a)));
  }, []);

  const removeAppointment = useCallback((id: string) => {
    setAppointments(prev => prev.filter(a => a.id !== id));
  }, []);

  const value = useMemo<AppointmentsContextValue>(
    () => ({ appointments, getAppointment, addAppointment, updateAppointment, removeAppointment }),
    [appointments, getAppointment, addAppointment, updateAppointment, removeAppointment]
  );

  return <AppointmentsContext.Provider value={value}>{children}</AppointmentsContext.Provider>;
};

export const useAppointments = () => {
  const ctx = useContext(AppointmentsContext);
  if (!ctx) throw new Error('useAppointments must be used within AppointmentsProvider');
  return ctx;
};
