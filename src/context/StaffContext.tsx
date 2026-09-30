import React, { createContext, useCallback, useContext, useMemo, useState } from 'react';
import type { StaffMember, StaffStatus } from '../types/staff';
import { staffMembers as seed } from '../data/staff';
import { todayKey } from '../utils/date';
import { avatarFor } from '../utils/avatar';

export type NewStaffInput = Omit<StaffMember, 'id' | 'avatar' | 'joinedDate'> & {
  joinedDate?: string;
};

interface StaffContextValue {
  staff: StaffMember[];
  addStaff: (input: NewStaffInput) => void;
  updateStaff: (id: string, fields: Partial<StaffMember>) => void;
  setStatus: (id: string, status: StaffStatus) => void;
}

const StaffContext = createContext<StaffContextValue | undefined>(undefined);

let seq = 9100;
const nextId = () => `EMP-${++seq}`;


export const StaffProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [staff, setStaff] = useState<StaffMember[]>(seed);

  const addStaff = useCallback((input: NewStaffInput) => {
    const id = nextId();
    const member: StaffMember = {
      ...input,
      id,
      avatar: avatarFor(input.name, input.gender),
      joinedDate: input.joinedDate ?? todayKey()
    };
    setStaff(prev => [member, ...prev]);
  }, []);

  const updateStaff = useCallback((id: string, fields: Partial<StaffMember>) => {
    setStaff(prev => prev.map(s => {
      if (s.id !== id) return s;
      const next = { ...s, ...fields };
      return { ...next, avatar: avatarFor(next.name, next.gender) };
    }));
  }, []);

  const setStatus = useCallback((id: string, status: StaffStatus) => {
    setStaff(prev => prev.map(s => (s.id === id ? { ...s, status } : s)));
  }, []);

  const value = useMemo<StaffContextValue>(
    () => ({ staff, addStaff, updateStaff, setStatus }),
    [staff, addStaff, updateStaff, setStatus]
  );

  return <StaffContext.Provider value={value}>{children}</StaffContext.Provider>;
};

export const useStaff = () => {
  const ctx = useContext(StaffContext);
  if (!ctx) throw new Error('useStaff must be used within StaffProvider');
  return ctx;
};
