import React, { createContext, useCallback, useContext, useMemo, useState } from 'react';
import type { Consultation, PrescribedMedicine, Visit } from '../types/journey';
import { initialVisits } from '../data/journeyMock';

interface DoctorRef {
  id: string;
  name: string;
  specialty: string;
}

interface NewVisitInput {
  patientId: string;
  patientName: string;
  patientAvatar?: string;
  age: number;
  gender: string;
  reason: string;
  symptoms: string[];
  scheduledTime: string;
  priority: 'Routine' | 'Urgent';
}

interface JourneyContextValue {
  visits: Visit[];
  scheduleVisit: (input: NewVisitInput) => void;
  checkIn: (visitId: string) => void;
  sendToDoctor: (visitId: string, doctor: DoctorRef) => void;
  updateConsultation: (visitId: string, consultationId: string, fields: Partial<Consultation>) => void;
  referToDoctor: (visitId: string, doctor: DoctorRef) => void;
  addPrescriptionItem: (visitId: string, item: Omit<PrescribedMedicine, 'id' | 'dispensed'>) => void;
  removePrescriptionItem: (visitId: string, itemId: string) => void;
  sendToPharmacy: (visitId: string) => void;
  dispenseMedicine: (visitId: string, rxId: string) => void;
  completeVisit: (visitId: string) => void;
}

const JourneyContext = createContext<JourneyContextValue | undefined>(undefined);

let seq = 100;
const uid = (prefix: string) => `${prefix}-${++seq}`;

export const JourneyProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [visits, setVisits] = useState<Visit[]>(initialVisits);

  const patch = useCallback((visitId: string, updater: (v: Visit) => Visit) => {
    setVisits(prev => prev.map(v => (v.id === visitId ? updater(v) : v)));
  }, []);

  const scheduleVisit = useCallback((input: NewVisitInput) => {
    const visit: Visit = {
      id: uid('V'),
      ...input,
      stage: 'Scheduled',
      consultations: [],
      prescription: [],
      pharmacyStatus: 'Awaiting'
    };
    setVisits(prev => [visit, ...prev]);
  }, []);

  const checkIn = useCallback((visitId: string) => {
    const stamp = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    patch(visitId, v => ({ ...v, stage: 'Reception', checkedInAt: v.checkedInAt ?? stamp }));
  }, [patch]);

  const sendToDoctor = useCallback((visitId: string, doctor: DoctorRef) => {
    patch(visitId, v => ({
      ...v,
      stage: 'Consultation',
      consultations: v.consultations.length
        ? v.consultations
        : [{
            id: uid('C'),
            doctorId: doctor.id,
            doctorName: doctor.name,
            specialty: doctor.specialty,
            diagnosis: '',
            notes: '',
            completed: false
          }]
    }));
  }, [patch]);

  const updateConsultation = useCallback((visitId: string, consultationId: string, fields: Partial<Consultation>) => {
    patch(visitId, v => ({
      ...v,
      consultations: v.consultations.map(c => (c.id === consultationId ? { ...c, ...fields } : c))
    }));
  }, [patch]);

  const referToDoctor = useCallback((visitId: string, doctor: DoctorRef) => {
    patch(visitId, v => ({
      ...v,
      consultations: [
        ...v.consultations.map(c => ({ ...c, completed: true })),
        {
          id: uid('C'),
          doctorId: doctor.id,
          doctorName: doctor.name,
          specialty: doctor.specialty,
          diagnosis: '',
          notes: '',
          completed: false
        }
      ]
    }));
  }, [patch]);

  const addPrescriptionItem = useCallback((visitId: string, item: Omit<PrescribedMedicine, 'id' | 'dispensed'>) => {
    patch(visitId, v => {
      if (v.prescription.some(p => p.medicineId === item.medicineId)) return v;
      return { ...v, prescription: [...v.prescription, { ...item, id: uid('RX'), dispensed: false }] };
    });
  }, [patch]);

  const removePrescriptionItem = useCallback((visitId: string, itemId: string) => {
    patch(visitId, v => ({ ...v, prescription: v.prescription.filter(p => p.id !== itemId) }));
  }, [patch]);

  const sendToPharmacy = useCallback((visitId: string) => {
    patch(visitId, v => ({
      ...v,
      stage: 'Pharmacy',
      pharmacyStatus: 'Awaiting',
      consultations: v.consultations.map(c => ({ ...c, completed: true }))
    }));
  }, [patch]);

  const dispenseMedicine = useCallback((visitId: string, rxId: string) => {
    patch(visitId, v => {
      const prescription = v.prescription.map(p => (p.id === rxId ? { ...p, dispensed: true } : p));
      const allDispensed = prescription.length > 0 && prescription.every(p => p.dispensed);
      return { ...v, prescription, pharmacyStatus: allDispensed ? 'Fulfilled' : 'Dispensing' };
    });
  }, [patch]);

  const completeVisit = useCallback((visitId: string) => {
    patch(visitId, v => ({ ...v, stage: 'Completed', pharmacyStatus: 'Fulfilled' }));
  }, [patch]);

  const value = useMemo<JourneyContextValue>(() => ({
    visits,
    scheduleVisit,
    checkIn,
    sendToDoctor,
    updateConsultation,
    referToDoctor,
    addPrescriptionItem,
    removePrescriptionItem,
    sendToPharmacy,
    dispenseMedicine,
    completeVisit
  }), [visits, scheduleVisit, checkIn, sendToDoctor, updateConsultation, referToDoctor, addPrescriptionItem, removePrescriptionItem, sendToPharmacy, dispenseMedicine, completeVisit]);

  return <JourneyContext.Provider value={value}>{children}</JourneyContext.Provider>;
};

export const useJourney = () => {
  const ctx = useContext(JourneyContext);
  if (!ctx) throw new Error('useJourney must be used within JourneyProvider');
  return ctx;
};
