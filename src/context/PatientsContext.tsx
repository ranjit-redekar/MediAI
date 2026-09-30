import React, { createContext, useCallback, useContext, useMemo, useState } from 'react';
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

  const addPatient = useCallback((data: Partial<Patient>) => {
    const id = `P${String(seed.length + 1).padStart(3, '0')}`;
    const patient = {
      ...data,
      id,
      registrationDate: todayKey(),
      lastVisit: todayKey(),
      avatar: avatarFor(data.name ?? '', data.gender),
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
