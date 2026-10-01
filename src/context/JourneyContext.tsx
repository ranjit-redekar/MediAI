import React, { createContext, useCallback, useContext, useMemo, useState } from 'react';
import type { Consultation, PrescribedMedicine, Visit } from '../types/journey';
import { initialVisits, mergeWithBook } from '../data/journeyMock';
import { useAppointments } from './AppointmentsContext';
import { clockNow } from '../data/demoToday';

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
  /** A walk-in is already here: they join straight at Reception. */
  addWalkIn: (input: NewVisitInput) => void;
  checkIn: (visitId: string) => void;
  sendToDoctor: (visitId: string, doctor: DoctorRef) => void;
  updateConsultation: (visitId: string, consultationId: string, fields: Partial<Consultation>) => void;
  referToDoctor: (visitId: string, doctor: DoctorRef) => void;
  addPrescriptionItem: (visitId: string, item: Omit<PrescribedMedicine, 'id' | 'dispensed'>) => void;
  removePrescriptionItem: (visitId: string, itemId: string) => void;
  sendToPharmacy: (visitId: string) => void;
  dispenseMedicine: (visitId: string, rxId: string) => void;
  completeVisit: (visitId: string) => void;
  /** Ends a consultation that needs nothing from the store. */
  finishVisit: (visitId: string) => void;
  /** Takes a late patient off the board and records the no-show on the booking. */
  markNoShow: (visitId: string) => void;
}

const JourneyContext = createContext<JourneyContextValue | undefined>(undefined);

/** Arrival stamp: the clock time shown on the card and the instant waiting counts from. */
const stamp = () => {
  const now = clockNow();
  return { checkedInAt: now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }), arrivedAt: now.getTime() };
};

let seq = 100;
const uid = (prefix: string) => `${prefix}-${++seq}`;

export const JourneyProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { appointments, updateAppointment } = useAppointments();
  const [stored, setVisits] = useState<Visit[]>(initialVisits);
  const visits = useMemo(() => mergeWithBook(stored, appointments), [stored, appointments]);

  // A visit that joined from the book isn't in `stored` yet; it's added on its first step.
  const patch = useCallback((visitId: string, updater: (v: Visit) => Visit) => {
    setVisits(prev => mergeWithBook(prev, appointments).map(v => (v.id === visitId ? updater(v) : v)));
  }, [appointments]);

  const addWalkIn = useCallback((input: NewVisitInput) => {
    const visit: Visit = {
      id: uid('V'),
      ...input,
      ...stamp(),
      stage: 'Reception',
      consultations: [],
      prescription: [],
      pharmacyStatus: 'Awaiting'
    };
    setVisits(prev => [visit, ...prev]);
  }, []);

  const checkIn = useCallback((visitId: string) => {
    patch(visitId, v => ({ ...v, stage: 'Reception', ...(v.arrivedAt ? {} : stamp()) }));
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

  const finishVisit = useCallback((visitId: string) => {
    patch(visitId, v => ({
      ...v,
      stage: 'Completed',
      pharmacyStatus: 'Fulfilled',
      consultations: v.consultations.map(c => ({ ...c, completed: true })),
    }));
  }, [patch]);

  const markNoShow = useCallback((visitId: string) => {
    // Booked visits leave the board through the book (see mergeWithBook);
    // a walk-in has no booking, so it is simply removed.
    if (visitId.startsWith('V-A')) updateAppointment(visitId.slice(2), { status: 'No-Show' });
    else setVisits(prev => prev.filter(v => v.id !== visitId));
  }, [updateAppointment]);

  const value = useMemo<JourneyContextValue>(() => ({
    visits,
    addWalkIn,
    checkIn,
    sendToDoctor,
    updateConsultation,
    referToDoctor,
    addPrescriptionItem,
    removePrescriptionItem,
    sendToPharmacy,
    dispenseMedicine,
    completeVisit,
    finishVisit,
    markNoShow,
  }), [visits, addWalkIn, checkIn, sendToDoctor, updateConsultation, referToDoctor, addPrescriptionItem, removePrescriptionItem, sendToPharmacy, dispenseMedicine, completeVisit, finishVisit, markNoShow]);

  return <JourneyContext.Provider value={value}>{children}</JourneyContext.Provider>;
};

export const useJourney = () => {
  const ctx = useContext(JourneyContext);
  if (!ctx) throw new Error('useJourney must be used within JourneyProvider');
  return ctx;
};
