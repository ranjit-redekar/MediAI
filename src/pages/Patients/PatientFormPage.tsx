import React from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Plus, Edit } from 'lucide-react';
import { FormPageLayout } from '../../components/ui/FormPageLayout';
import { PatientForm } from '../../components/forms/PatientForm';
import { usePatients } from '../../context/PatientsContext';
import type { Patient } from '../../types';

export const PatientFormPage: React.FC = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const { getPatient, addPatient, updatePatient } = usePatients();
  const editing = id ? getPatient(id) : undefined;
  const isEdit = !!id;

  const handleSubmit = (data: Partial<Patient>) => {
    if (isEdit && editing) {
      updatePatient(editing.id, data);
      navigate(`/patients/${editing.id}`);
    } else {
      const created = addPatient(data);
      navigate(`/patients/${created.id}`);
    }
  };

  return (
    <FormPageLayout
      title={isEdit ? 'Edit Patient' : 'Add New Patient'}
      subtitle={isEdit ? editing?.name : 'Register a new patient record'}
      backLabel="Back to Patients"
      backTo="/patients"
      icon={isEdit ? <Edit className="w-5 h-5 text-white" /> : <Plus className="w-5 h-5 text-white" />}
    >
      <PatientForm
        patient={editing}
        onSubmit={handleSubmit}
        onCancel={() => navigate('/patients')}
      />
    </FormPageLayout>
  );
};
