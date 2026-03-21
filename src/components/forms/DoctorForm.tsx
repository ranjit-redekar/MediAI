import React, { useState, useEffect } from 'react';
import { GlassInput } from '../ui/GlassInput';
import { GlassSelect } from '../ui/GlassSelect';
import { GlassButton } from '../ui/GlassButton';
import type { Doctor } from '../../types';

interface DoctorFormProps {
  doctor?: Doctor;
  onSubmit: (doctor: Partial<Doctor>) => void;
  onCancel: () => void;
}

const specialties = [
  { value: 'Internal Medicine', label: 'Internal Medicine' },
  { value: 'Cardiology', label: 'Cardiology' },
  { value: 'Orthopedics', label: 'Orthopedics' },
  { value: 'Pediatrics', label: 'Pediatrics' },
  { value: 'Neurology', label: 'Neurology' },
  { value: 'Dermatology', label: 'Dermatology' },
  { value: 'OB/GYN', label: 'OB/GYN' },
  { value: 'Endocrinology', label: 'Endocrinology' },
];

const statuses = [
  { value: 'Available', label: 'Available' },
  { value: 'Busy', label: 'Busy' },
  { value: 'Offline', label: 'Offline' },
];

const departments = [
  { value: 'General Medicine', label: 'General Medicine' },
  { value: 'Cardiology', label: 'Cardiology' },
  { value: 'Orthopedics', label: 'Orthopedics' },
  { value: 'Pediatrics', label: 'Pediatrics' },
  { value: 'Neurology', label: 'Neurology' },
  { value: 'Dermatology', label: 'Dermatology' },
  { value: 'OB/GYN', label: 'OB/GYN' },
  { value: 'Endocrinology', label: 'Endocrinology' },
];

export const DoctorForm: React.FC<DoctorFormProps> = ({
  doctor,
  onSubmit,
  onCancel
}) => {
  const [formData, setFormData] = useState<Partial<Doctor>>({
    name: '',
    specialty: 'Internal Medicine',
    qualification: '',
    experience: 0,
    phone: '',
    email: '',
    department: 'General Medicine',
    status: 'Available',
    rating: 5,
    patientsCount: 0,
  });

  useEffect(() => {
    if (doctor) {
      setFormData(doctor);
    }
  }, [doctor]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(formData);
  };

  const handleChange = (field: keyof Doctor, value: string | number) => {
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
        <GlassSelect
          label="Specialty"
          value={formData.specialty}
          onChange={(e) => handleChange('specialty', e.target.value)}
          options={specialties}
        />
        <GlassInput
          label="Qualification"
          value={formData.qualification}
          onChange={(e) => handleChange('qualification', e.target.value)}
          placeholder="e.g., MD, FACP"
          required
        />
        <GlassInput
          label="Experience (years)"
          type="number"
          value={formData.experience}
          onChange={(e) => handleChange('experience', parseInt(e.target.value))}
          required
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
          label="Department"
          value={formData.department}
          onChange={(e) => handleChange('department', e.target.value)}
          options={departments}
        />
        <GlassSelect
          label="Status"
          value={formData.status}
          onChange={(e) => handleChange('status', e.target.value)}
          options={statuses}
        />
        <GlassInput
          label="Rating"
          type="number"
          min="0"
          max="5"
          step="0.1"
          value={formData.rating}
          onChange={(e) => handleChange('rating', parseFloat(e.target.value))}
        />
        <GlassInput
          label="Patients Count"
          type="number"
          value={formData.patientsCount}
          onChange={(e) => handleChange('patientsCount', parseInt(e.target.value))}
        />
      </div>

      <div className="flex justify-end gap-3 pt-4">
        <GlassButton type="button" variant="ghost" onClick={onCancel}>
          Cancel
        </GlassButton>
        <GlassButton type="submit" variant="primary">
          {doctor ? 'Update Doctor' : 'Add Doctor'}
        </GlassButton>
      </div>
    </form>
  );
};
