import React, { createContext, useCallback, useContext, useMemo, useState } from 'react';
import type { Patient } from '../types';
import { patients as seed } from '../data/patients';

interface PatientsContextValue {
  patients: Patient[];
  getPatient: (id: string) => Patient | undefined;
  addPatient: (data: Partial<Patient>) => Patient;
  updatePatient: (id: string, data: Partial<Patient>) => void;
  removePatient: (id: string) => void;
}

const PatientsContext = createContext<PatientsContextValue | undefined>(undefined);

const todayISO = () => new Date().toISOString().split('T')[0];

export const PatientsProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [patients, setPatients] = useState<Patient[]>(seed);

  const getPatient = useCallback((id: string) => patients.find(p => p.id === id), [patients]);

  const addPatient = useCallback((data: Partial<Patient>) => {
    const id = `P${String(seed.length + 1).padStart(3, '0')}`;
    const patient = {
      ...data,
      id,
      registrationDate: todayISO(),
      lastVisit: todayISO(),
      avatar: data.avatar ?? `https://i.pravatar.cc/150?u=${id}`,
      medicalHistory: data.medicalHistory ?? []
    } as Patient;
    setPatients(prev => {
      // keep ids unique even after multiple adds in one session
      const seq = prev.length + 1;
      patient.id = `P${String(seq).padStart(3, '0')}`;
      return [...prev, patient];
    });
    return patient;
  }, []);

  const updatePatient = useCallback((id: string, data: Partial<Patient>) => {
    setPatients(prev => prev.map(p => (p.id === id ? { ...p, ...data } : p)));
  }, []);

  const removePatient = useCallback((id: string) => {
    setPatients(prev => prev.filter(p => p.id !== id));
  }, []);

  const value = useMemo<PatientsContextValue>(
    () => ({ patients, getPatient, addPatient, updatePatient, removePatient }),
    [patients, getPatient, addPatient, updatePatient, removePatient]
  );

  return <PatientsContext.Provider value={value}>{children}</PatientsContext.Provider>;
};

export const usePatients = () => {
  const ctx = useContext(PatientsContext);
  if (!ctx) throw new Error('usePatients must be used within PatientsProvider');
  return ctx;
};
