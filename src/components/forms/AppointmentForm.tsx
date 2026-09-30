import React, { useState, useEffect } from 'react';
import { GlassInput } from '../ui/GlassInput';
import { GlassSelect } from '../ui/GlassSelect';
import { GlassButton } from '../ui/GlassButton';
import { db } from '../../data';
import { nextFreeSlot } from '../../data/slots';
import { useAppointments } from '../../context/AppointmentsContext';
import { fromDateKey } from '../../utils/date';
import type { Appointment } from '../../types';

interface AppointmentFormProps {
  appointment?: Appointment;
  onSubmit: (appointment: Partial<Appointment>) => void;
  onCancel: () => void;
}

const statuses = [
  { value: 'Scheduled', label: 'Scheduled' },
  { value: 'Completed', label: 'Completed' },
  { value: 'Cancelled', label: 'Cancelled' },
  { value: 'No-Show', label: 'No-Show' },
];

const types = [
  { value: 'In-Person', label: 'In-Person' },
  { value: 'Video', label: 'Video' },
  { value: 'Phone', label: 'Phone' },
];

export const AppointmentForm: React.FC<AppointmentFormProps> = ({
  appointment,
  onSubmit,
  onCancel
}) => {
  const [formData, setFormData] = useState<Partial<Appointment>>({
    patientId: '',
    patientName: '',
    doctorId: '',
    doctorName: '',
    specialty: '',
    date: '',
    time: '',
    status: 'Scheduled',
    type: 'In-Person',
    notes: '',
  });

  const [selectedPatient, setSelectedPatient] = useState('');
  const [selectedDoctor, setSelectedDoctor] = useState('');

  useEffect(() => {
    if (appointment) {
      setFormData(appointment);
      setSelectedPatient(appointment.patientId);
      setSelectedDoctor(appointment.doctorId);
    }
  }, [appointment]);

  const handlePatientChange = (patientId: string) => {
    setSelectedPatient(patientId);
    const patient = db.patients.find(p => p.id === patientId);
    if (patient) {
      setFormData(prev => ({
        ...prev,
        patientId: patient.id,
        patientName: patient.name
      }));
    }
  };

  const handleDoctorChange = (doctorId: string) => {
    setSelectedDoctor(doctorId);
    const doctor = db.doctors.find(d => d.id === doctorId);
    if (doctor) {
      setFormData(prev => ({
        ...prev,
        doctorId: doctor.id,
        doctorName: doctor.name,
        specialty: doctor.specialty
      }));
    }
  };

  // Pre-fill the booking: once a doctor is picked, their next free slot is one click.
  const { appointments } = useAppointments();
  const doctor = db.doctors.find(d => d.id === selectedDoctor);
  const suggestion = !appointment && doctor ? nextFreeSlot(doctor, appointments) : null;
  const suggestionTaken = suggestion && formData.date === suggestion.date && formData.time === suggestion.time;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(formData);
  };

  const handleChange = (field: keyof Appointment, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const patientOptions = db.patients.map(p => ({ value: p.id, label: `${p.name} (${p.id})` }));
  const doctorOptions = db.doctors.map(d => ({ value: d.id, label: `${d.name} - ${d.specialty}` }));

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <GlassSelect
          label="Patient"
          value={selectedPatient}
          onChange={(e) => handlePatientChange(e.target.value)}
          options={[{ value: '', label: 'Select Patient' }, ...patientOptions]}
          required
        />
        <GlassSelect
          label="Doctor"
          value={selectedDoctor}
          onChange={(e) => handleDoctorChange(e.target.value)}
          options={[{ value: '', label: 'Select Doctor' }, ...doctorOptions]}
          required
        />
        {suggestion && !suggestionTaken && (
          <div className="md:col-span-2 flex flex-wrap items-center gap-3 px-3 py-2.5 rounded-xl border border-primary/30 bg-primary/[0.06]">
            <p className="text-sm text-app flex-1 min-w-0">
              Next free with {doctor?.name}:{' '}
              <span className="font-semibold">
                {fromDateKey(suggestion.date).toLocaleDateString(undefined, { weekday: 'short', day: 'numeric', month: 'short' })}, {suggestion.time}
              </span>
            </p>
            <GlassButton type="button" size="sm" variant="default" onClick={() => setFormData(prev => ({ ...prev, ...suggestion }))}>
              Use this slot
            </GlassButton>
          </div>
        )}
        <GlassInput
          label="Date"
          type="date"
          value={formData.date}
          onChange={(e) => handleChange('date', e.target.value)}
          required
        />
        <GlassInput
          label="Time"
          type="time"
          value={formData.time}
          onChange={(e) => handleChange('time', e.target.value)}
          required
        />
        <GlassSelect
          label="Type"
          value={formData.type}
          onChange={(e) => handleChange('type', e.target.value)}
          options={types}
        />
        {/* A new booking is always Scheduled; status only matters when editing one. */}
        {appointment && (
          <GlassSelect
            label="Status"
            value={formData.status}
            onChange={(e) => handleChange('status', e.target.value)}
            options={statuses}
          />
        )}
      </div>
      <GlassInput
        label="Notes"
        value={formData.notes}
        onChange={(e) => handleChange('notes', e.target.value)}
        placeholder="Additional notes..."
      />

      <div className="flex justify-end gap-3 pt-4">
        <GlassButton type="button" variant="ghost" onClick={onCancel}>
          Cancel
        </GlassButton>
        <GlassButton type="submit" variant="primary">
          {appointment ? 'Update Appointment' : 'Add Appointment'}
        </GlassButton>
      </div>
    </form>
  );
};
