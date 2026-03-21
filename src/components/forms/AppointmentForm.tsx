import React, { useState, useEffect } from 'react';
import { GlassInput } from '../ui/GlassInput';
import { GlassSelect } from '../ui/GlassSelect';
import { GlassButton } from '../ui/GlassButton';
import { db } from '../../data';
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
        <GlassSelect
          label="Status"
          value={formData.status}
          onChange={(e) => handleChange('status', e.target.value)}
          options={statuses}
        />
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
