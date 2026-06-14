import React, { createContext, useCallback, useContext, useMemo, useState } from 'react';
import type { StaffMember, StaffStatus } from '../types/staff';
import { staffMembers as seed } from '../data/staff';

export type NewStaffInput = Omit<StaffMember, 'id' | 'avatar' | 'joinedDate'> & {
  joinedDate?: string;
};

interface StaffContextValue {
  staff: StaffMember[];
  addStaff: (input: NewStaffInput) => void;
  updateStaff: (id: string, fields: Partial<StaffMember>) => void;
  setStatus: (id: string, status: StaffStatus) => void;
  removeStaff: (id: string) => void;
}

const StaffContext = createContext<StaffContextValue | undefined>(undefined);

let seq = 9100;
const nextId = () => `EMP-${++seq}`;

const todayISO = () => new Date().toISOString().split('T')[0];

export const StaffProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [staff, setStaff] = useState<StaffMember[]>(seed);

  const addStaff = useCallback((input: NewStaffInput) => {
    const id = nextId();
    const member: StaffMember = {
      ...input,
      id,
      avatar: `https://i.pravatar.cc/150?u=${id}`,
      joinedDate: input.joinedDate ?? todayISO()
    };
    setStaff(prev => [member, ...prev]);
  }, []);

  const updateStaff = useCallback((id: string, fields: Partial<StaffMember>) => {
    setStaff(prev => prev.map(s => (s.id === id ? { ...s, ...fields } : s)));
  }, []);

  const setStatus = useCallback((id: string, status: StaffStatus) => {
    setStaff(prev => prev.map(s => (s.id === id ? { ...s, status } : s)));
  }, []);

  const removeStaff = useCallback((id: string) => {
    setStaff(prev => prev.filter(s => s.id !== id));
  }, []);

  const value = useMemo<StaffContextValue>(
    () => ({ staff, addStaff, updateStaff, setStatus, removeStaff }),
    [staff, addStaff, updateStaff, setStatus, removeStaff]
  );

  return <StaffContext.Provider value={value}>{children}</StaffContext.Provider>;
};

export const useStaff = () => {
  const ctx = useContext(StaffContext);
  if (!ctx) throw new Error('useStaff must be used within StaffProvider');
  return ctx;
};
