import React, { createContext, useCallback, useContext, useMemo, useRef, useState } from 'react';
import { daysUntilExpiry, medicines as seed } from '../data/pharmacy';
import type { Medicine } from '../types';

export type NewMedicineInput = Omit<Medicine, 'id'>;

interface PharmacyContextValue {
  medicines: Medicine[];
  addMedicine: (input: NewMedicineInput) => Medicine;
  updateMedicine: (id: string, fields: Partial<Medicine>) => void;
  /**
   * A delivery arrives: adds the units and takes the new batch's expiry.
   * ponytail: one expiry per item, no batches — an expired remainder is
   * replaced, not tracked alongside. Model batches when dispensing needs FEFO.
   */
  receiveStock: (id: string, units: number, expiryDate: string) => void;
}

const PharmacyContext = createContext<PharmacyContextValue | undefined>(undefined);

export const PharmacyProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [medicines, setMedicines] = useState<Medicine[]>(seed);
  const lastId = useRef(Math.max(0, ...seed.map(m => Number(m.id.slice(1)) || 0)));

  const addMedicine = useCallback((input: NewMedicineInput) => {
    const medicine: Medicine = { ...input, id: `M${String(++lastId.current).padStart(3, '0')}` };
    setMedicines(prev => [medicine, ...prev]);
    return medicine;
  }, []);

  const updateMedicine = useCallback((id: string, fields: Partial<Medicine>) => {
    setMedicines(prev => prev.map(m => (m.id === id ? { ...m, ...fields } : m)));
  }, []);

  const receiveStock = useCallback((id: string, units: number, expiryDate: string) => {
    setMedicines(prev => prev.map(m => {
      if (m.id !== id) return m;
      // Expired units are pulled, not topped up: the new count is the delivery.
      const expired = daysUntilExpiry(m) <= 0;
      return { ...m, stock: (expired ? 0 : m.stock) + units, expiryDate };
    }));
  }, []);

  const value = useMemo(() => ({ medicines, addMedicine, updateMedicine, receiveStock }),
    [medicines, addMedicine, updateMedicine, receiveStock]);
  return <PharmacyContext.Provider value={value}>{children}</PharmacyContext.Provider>;
};

export const usePharmacy = () => {
  const ctx = useContext(PharmacyContext);
  if (!ctx) throw new Error('usePharmacy must be used within a PharmacyProvider');
  return ctx;
};
