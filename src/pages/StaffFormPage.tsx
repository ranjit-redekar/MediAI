import React from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Plus, Edit } from 'lucide-react';
import { FormPageLayout, FormSection } from '../components/ui/FormPageLayout';
import { GlassInput } from '../components/ui/GlassInput';
import { GlassSelect } from '../components/ui/GlassSelect';
import { GlassButton } from '../components/ui/GlassButton';
import { useStaff } from '../context/StaffContext';
import type { NewStaffInput } from '../context/StaffContext';
import {
  STAFF_CATEGORIES, STAFF_STATUSES, SHIFT_TYPES, EMPLOYMENT_TYPES, ROLE_LIBRARY
} from '../types/staff';
import type { StaffCategory, StaffStatus } from '../types/staff';

const blank: NewStaffInput = {
  name: '', role: ROLE_LIBRARY['Doctors'][0], category: 'Doctors', department: '',
  status: 'Active', shift: 'General', employmentType: 'Full-time', phone: '', email: '', location: ''
};

export const StaffFormPage: React.FC = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const { staff, addStaff, updateStaff } = useStaff();
  const editing = id ? staff.find(s => s.id === id) : undefined;
  const isEdit = !!id;

  const [form, setForm] = React.useState<NewStaffInput>(() => {
    if (editing) {
      const { id: _id, avatar: _a, joinedDate, ...rest } = editing;
      void _id; void _a;
      return { ...rest, joinedDate };
    }
    return blank;
  });

  const set = <K extends keyof NewStaffInput>(key: K, value: NewStaffInput[K]) =>
    setForm(prev => ({ ...prev, [key]: value }));

  const roleOptions = React.useMemo(() => {
    const lib = ROLE_LIBRARY[form.category] ?? [];
    const withCurrent = form.role && !lib.includes(form.role) ? [form.role, ...lib] : lib;
    return withCurrent.map(r => ({ value: r, label: r }));
  }, [form.category, form.role]);

  const valid = form.name.trim().length > 1 && form.department.trim().length > 0 && form.phone.trim().length >= 6;

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!valid) return;
    if (isEdit && editing) updateStaff(editing.id, form);
    else addStaff(form);
    navigate('/staff');
  };

  return (
    <FormPageLayout
      title={isEdit ? 'Edit Staff Member' : 'Add Staff Member'}
      subtitle={isEdit ? editing?.name : 'Create a new team member record'}
      backLabel="Back to Staff"
      backTo="/staff"
      icon={isEdit ? <Edit className="w-5 h-5 text-white" /> : <Plus className="w-5 h-5 text-white" />}
    >
      <form onSubmit={submit} className="space-y-8">
        <FormSection title="Role & Department">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <GlassSelect
              label="Category"
              options={STAFF_CATEGORIES.map(c => ({ value: c, label: c }))}
              value={form.category}
              onChange={e => {
                const cat = e.target.value as StaffCategory;
                setForm(prev => ({ ...prev, category: cat, role: ROLE_LIBRARY[cat][0] }));
              }}
            />
            <GlassSelect label="Role / Position" options={roleOptions} value={form.role} onChange={e => set('role', e.target.value)} />
            <GlassInput label="Department *" placeholder="e.g. Cardiology" value={form.department} onChange={e => set('department', e.target.value)} />
            <GlassSelect label="Status" options={STAFF_STATUSES.map(s => ({ value: s, label: s }))} value={form.status} onChange={e => set('status', e.target.value as StaffStatus)} />
            <GlassSelect label="Shift" options={SHIFT_TYPES.map(s => ({ value: s, label: s }))} value={form.shift} onChange={e => set('shift', e.target.value as NewStaffInput['shift'])} />
            <GlassSelect label="Employment" options={EMPLOYMENT_TYPES.map(s => ({ value: s, label: s }))} value={form.employmentType} onChange={e => set('employmentType', e.target.value as NewStaffInput['employmentType'])} />
          </div>
        </FormSection>

        <FormSection title="Personal & Contact">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <GlassInput label="Full name *" placeholder="e.g. Dr. Jane Doe" value={form.name} onChange={e => set('name', e.target.value)} />
            <GlassInput label="Phone *" placeholder="+1 (555) 000-0000" value={form.phone} onChange={e => set('phone', e.target.value)} />
            <GlassInput label="Email" placeholder="name@mediai.com" value={form.email} onChange={e => set('email', e.target.value)} />
            <GlassInput label="Location / Block" placeholder="e.g. Block A" value={form.location ?? ''} onChange={e => set('location', e.target.value)} />
          </div>
        </FormSection>

        <div className="flex justify-end gap-3 pt-2 border-t border-white/10">
          <GlassButton type="button" variant="ghost" onClick={() => navigate('/staff')}>Cancel</GlassButton>
          <GlassButton type="submit" variant="primary" disabled={!valid}>
            {isEdit ? 'Save Changes' : 'Add Staff'}
          </GlassButton>
        </div>
      </form>
    </FormPageLayout>
  );
};
