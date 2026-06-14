import React from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { FileText } from 'lucide-react';
import { FormPageLayout } from '../../components/ui/FormPageLayout';
import { MedicalRecordForm } from '../../components/forms/MedicalRecordForm';
import { usePatients } from '../../context/PatientsContext';
import type { MedicalRecord } from '../../types';

const todayISO = () => new Date().toISOString().split('T')[0];

export const MedicalRecordFormPage: React.FC = () => {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const { getPatient, updatePatient } = usePatients();
  const patient = id ? getPatient(id) : undefined;

  const handleSubmit = (record: Partial<MedicalRecord>) => {
    if (!patient) return;
    const history = patient.medicalHistory ?? [];
    const newRecord = {
      ...record,
      id: `MR${String(history.length + 1).padStart(3, '0')}`,
      date: todayISO()
    } as MedicalRecord;
    updatePatient(patient.id, { medicalHistory: [newRecord, ...history] });
    navigate(`/patients/${patient.id}`);
  };

  return (
    <FormPageLayout
      title="Add Medical Record"
      subtitle={patient?.name}
      backLabel="Back to Patient"
      backTo={`/patients/${id}`}
      icon={<FileText className="w-5 h-5 text-white" />}
    >
      <MedicalRecordForm
        onSubmit={handleSubmit}
        onCancel={() => navigate(`/patients/${id}`)}
      />
    </FormPageLayout>
  );
};
