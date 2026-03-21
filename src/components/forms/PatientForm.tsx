import React, { useState, useEffect } from 'react';
import { GlassInput } from '../ui/GlassInput';
import { GlassSelect } from '../ui/GlassSelect';
import { GlassButton } from '../ui/GlassButton';
import type { Patient } from '../../types';

interface PatientFormProps {
  patient?: Patient;
  onSubmit: (patient: Partial<Patient>) => void;
  onCancel: () => void;
}

const bloodGroups = [
  { value: 'A+', label: 'A+' },
  { value: 'A-', label: 'A-' },
  { value: 'B+', label: 'B+' },
  { value: 'B-', label: 'B-' },
  { value: 'AB+', label: 'AB+' },
  { value: 'AB-', label: 'AB-' },
  { value: 'O+', label: 'O+' },
  { value: 'O-', label: 'O-' },
];

const genders = [
  { value: 'Male', label: 'Male' },
  { value: 'Female', label: 'Female' },
  { value: 'Other', label: 'Other' },
];

const statuses = [
  { value: 'Active', label: 'Active' },
  { value: 'Inactive', label: 'Inactive' },
  { value: 'Critical', label: 'Critical' },
];

export const PatientForm: React.FC<PatientFormProps> = ({
  patient,
  onSubmit,
  onCancel
}) => {
  const [formData, setFormData] = useState<Partial<Patient>>({
    name: '',
    age: 0,
    gender: 'Male',
    bloodGroup: 'O+',
    phone: '',
    email: '',
    address: '',
    status: 'Active',
    aiRiskScore: 0,
  });

  useEffect(() => {
    if (patient) {
      setFormData(patient);
    }
  }, [patient]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(formData);
  };

  const handleChange = (field: keyof Patient, value: string | number) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <GlassInput
          label="Full Name"
          value={formData.name}
          onChange={(e) => handleChange('name', e.target.value)}
          required
        />
        <GlassInput
          label="Age"
          type="number"
          value={formData.age}
          onChange={(e) => handleChange('age', parseInt(e.target.value))}
          required
        />
        <GlassSelect
          label="Gender"
          value={formData.gender}
          onChange={(e) => handleChange('gender', e.target.value)}
          options={genders}
        />
        <GlassSelect
          label="Blood Group"
          value={formData.bloodGroup}
          onChange={(e) => handleChange('bloodGroup', e.target.value)}
          options={bloodGroups}
        />
        <GlassInput
          label="Phone"
          type="tel"
          value={formData.phone}
          onChange={(e) => handleChange('phone', e.target.value)}
          required
        />
        <GlassInput
          label="Email"
          type="email"
          value={formData.email}
          onChange={(e) => handleChange('email', e.target.value)}
          required
        />
        <GlassSelect
          label="Status"
          value={formData.status}
          onChange={(e) => handleChange('status', e.target.value)}
          options={statuses}
        />
        <GlassInput
          label="AI Risk Score"
          type="number"
          min="0"
          max="100"
          value={formData.aiRiskScore}
          onChange={(e) => handleChange('aiRiskScore', parseInt(e.target.value))}
        />
      </div>
      <GlassInput
        label="Address"
        value={formData.address}
        onChange={(e) => handleChange('address', e.target.value)}
      />

      <div className="flex justify-end gap-3 pt-4">
        <GlassButton type="button" variant="ghost" onClick={onCancel}>
          Cancel
        </GlassButton>
        <GlassButton type="submit" variant="primary">
          {patient ? 'Update Patient' : 'Add Patient'}
        </GlassButton>
      </div>
    </form>
  );
};
