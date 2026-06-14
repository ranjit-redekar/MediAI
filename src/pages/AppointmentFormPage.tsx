import React from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Plus, Edit } from 'lucide-react';
import { FormPageLayout } from '../components/ui/FormPageLayout';
import { AppointmentForm } from '../components/forms/AppointmentForm';
import { useAppointments } from '../context/AppointmentsContext';
import type { Appointment } from '../types';

export const AppointmentFormPage: React.FC = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const { getAppointment, addAppointment, updateAppointment } = useAppointments();
  const editing = id ? getAppointment(id) : undefined;
  const isEdit = !!id;

  const handleSubmit = (data: Partial<Appointment>) => {
    if (isEdit && editing) updateAppointment(editing.id, data);
    else addAppointment(data);
    navigate('/appointments');
  };

  return (
    <FormPageLayout
      title={isEdit ? 'Edit Appointment' : 'Add New Appointment'}
      subtitle={isEdit ? `${editing?.patientName} · ${editing?.date}` : 'Schedule a new appointment'}
      backLabel="Back to Schedule"
      backTo="/appointments"
      icon={isEdit ? <Edit className="w-5 h-5 text-white" /> : <Plus className="w-5 h-5 text-white" />}
    >
      <AppointmentForm
        appointment={editing}
        onSubmit={handleSubmit}
        onCancel={() => navigate('/appointments')}
      />
    </FormPageLayout>
  );
};
