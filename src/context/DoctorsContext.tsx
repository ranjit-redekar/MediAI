import React, { createContext, useCallback, useContext, useMemo, useRef, useState } from 'react';
import type { Doctor } from '../types';
import { doctors as seed } from '../data/doctors';
import { avatarFor } from '../utils/avatar';

interface DoctorsContextValue {
  doctors: Doctor[];
  getDoctor: (id: string) => Doctor | undefined;
  addDoctor: (data: Partial<Doctor>) => Doctor;
  updateDoctor: (id: string, data: Partial<Doctor>) => void;
  removeDoctor: (id: string) => void;
}

const DoctorsContext = createContext<DoctorsContextValue | undefined>(undefined);

const defaultSchedule = [
  { day: 'Monday', startTime: '09:00', endTime: '17:00', isAvailable: true },
  { day: 'Tuesday', startTime: '09:00', endTime: '17:00', isAvailable: true },
  { day: 'Wednesday', startTime: '09:00', endTime: '17:00', isAvailable: true },
  { day: 'Thursday', startTime: '09:00', endTime: '17:00', isAvailable: true },
  { day: 'Friday', startTime: '09:00', endTime: '16:00', isAvailable: true }
];

export const DoctorsProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [doctors, setDoctors] = useState<Doctor[]>(seed);

  const getDoctor = useCallback((id: string) => doctors.find(d => d.id === id), [doctors]);

  const lastId = useRef(Math.max(0, ...seed.map(d => Number(d.id.slice(1)) || 0)));

  const addDoctor = useCallback((data: Partial<Doctor>) => {
    // Id from a counter past the highest in use: `length + 1` reuses an id after a delete.
    const doctor = {
      ...data,
      id: `D${String(++lastId.current).padStart(3, '0')}`,
      avatar: avatarFor(data.name ?? '', data.gender),
      schedule: data.schedule ?? defaultSchedule
    } as Doctor;
    setDoctors(prev => [...prev, doctor]);
    return doctor;
  }, []);

  const updateDoctor = useCallback((id: string, data: Partial<Doctor>) => {
    setDoctors(prev => prev.map(d => {
      if (d.id !== id) return d;
      const next = { ...d, ...data };
      return { ...next, avatar: avatarFor(next.name, next.gender) };
    }));
  }, []);

  const removeDoctor = useCallback((id: string) => {
    setDoctors(prev => prev.filter(d => d.id !== id));
  }, []);

  const value = useMemo<DoctorsContextValue>(
    () => ({ doctors, getDoctor, addDoctor, updateDoctor, removeDoctor }),
    [doctors, getDoctor, addDoctor, updateDoctor, removeDoctor]
  );

  return <DoctorsContext.Provider value={value}>{children}</DoctorsContext.Provider>;
};

export const useDoctors = () => {
  const ctx = useContext(DoctorsContext);
  if (!ctx) throw new Error('useDoctors must be used within DoctorsProvider');
  return ctx;
};
