import React, { createContext, useCallback, useContext, useMemo, useRef, useState } from 'react';
import type { Patient } from '../types';
import { patients as seed } from '../data/patients';
import { todayKey } from '../utils/date';
import { avatarFor } from '../utils/avatar';

interface PatientsContextValue {
  patients: Patient[];
  getPatient: (id: string) => Patient | undefined;
  addPatient: (data: Partial<Patient>) => Patient;
  updatePatient: (id: string, data: Partial<Patient>) => void;
}

const PatientsContext = createContext<PatientsContextValue | undefined>(undefined);


export const PatientsProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [patients, setPatients] = useState<Patient[]>(seed);

  const getPatient = useCallback((id: string) => patients.find(p => p.id === id), [patients]);

  const lastId = useRef(Math.max(0, ...seed.map(p => Number(p.id.slice(1)) || 0)));

  const addPatient = useCallback((data: Partial<Patient>) => {
    // Id from a counter past the highest in use, assigned before the update so the caller gets it.
    const id = `P${String(++lastId.current).padStart(3, '0')}`;
    const patient = {
      ...data,
      id,
      registrationDate: todayKey(),
      lastVisit: todayKey(),
      avatar: avatarFor(data.name ?? '', data.gender),
      medicalHistory: data.medicalHistory ?? []
    } as Patient;
    setPatients(prev => [...prev, patient]);
    return patient;
  }, []);

  const updatePatient = useCallback((id: string, data: Partial<Patient>) => {
    setPatients(prev => prev.map(p => {
      if (p.id !== id) return p;
      const next = { ...p, ...data };
      return { ...next, avatar: avatarFor(next.name, next.gender) };
    }));
  }, []);


  const value = useMemo<PatientsContextValue>(
    () => ({ patients, getPatient, addPatient, updatePatient }),
    [patients, getPatient, addPatient, updatePatient]
  );

  return <PatientsContext.Provider value={value}>{children}</PatientsContext.Provider>;
};

export const usePatients = () => {
  const ctx = useContext(PatientsContext);
  if (!ctx) throw new Error('usePatients must be used within PatientsProvider');
  return ctx;
};
