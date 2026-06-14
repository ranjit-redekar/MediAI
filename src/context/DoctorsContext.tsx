import React, { createContext, useCallback, useContext, useMemo, useState } from 'react';
import type { Doctor } from '../types';
import { doctors as seed } from '../data/doctors';

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

  const addDoctor = useCallback((data: Partial<Doctor>) => {
    const doctor = {
      ...data,
      schedule: data.schedule ?? defaultSchedule
    } as Doctor;
    setDoctors(prev => {
      const id = `D${String(prev.length + 1).padStart(3, '0')}`;
      doctor.id = id;
      doctor.avatar = data.avatar ?? `https://i.pravatar.cc/150?u=${id}`;
      return [...prev, doctor];
    });
    return doctor;
  }, []);

  const updateDoctor = useCallback((id: string, data: Partial<Doctor>) => {
    setDoctors(prev => prev.map(d => (d.id === id ? { ...d, ...data } : d)));
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
