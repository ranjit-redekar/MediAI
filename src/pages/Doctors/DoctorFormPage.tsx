import React from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Plus, Edit } from 'lucide-react';
import { FormPageLayout } from '../../components/ui/FormPageLayout';
import { DoctorForm } from '../../components/forms/DoctorForm';
import { useDoctors } from '../../context/DoctorsContext';
import type { Doctor } from '../../types';

export const DoctorFormPage: React.FC = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const { getDoctor, addDoctor, updateDoctor } = useDoctors();
  const editing = id ? getDoctor(id) : undefined;
  const isEdit = !!id;

  const handleSubmit = (data: Partial<Doctor>) => {
    if (isEdit && editing) {
      updateDoctor(editing.id, data);
      navigate(`/doctors/${editing.id}`);
    } else {
      const created = addDoctor(data);
      navigate(`/doctors/${created.id}`);
    }
  };

  return (
    <FormPageLayout
      title={isEdit ? 'Edit Doctor' : 'Add New Doctor'}
      subtitle={isEdit ? editing?.name : 'Create a new doctor profile'}
      backLabel="Back to Doctors"
      backTo="/doctors"
      icon={isEdit ? <Edit className="w-5 h-5 text-white" /> : <Plus className="w-5 h-5 text-white" />}
    >
      <DoctorForm
        doctor={editing}
        onSubmit={handleSubmit}
        onCancel={() => navigate('/doctors')}
      />
    </FormPageLayout>
  );
};
