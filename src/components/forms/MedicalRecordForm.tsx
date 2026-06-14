import React, { useState } from 'react';
import { GlassButton } from '../ui/GlassButton';
import type { MedicalRecord } from '../../types';

interface MedicalRecordFormProps {
  onSubmit: (record: Partial<MedicalRecord>) => void;
  onCancel: () => void;
}

export const MedicalRecordForm: React.FC<MedicalRecordFormProps> = ({ onSubmit, onCancel }) => {
  const [formData, setFormData] = useState<Partial<MedicalRecord>>({
    diagnosis: '', symptoms: [], medications: [], doctorId: '', notes: '', visitType: 'Routine',
  });
  const [symptomInput, setSymptomInput] = useState('');
  const [medicationInput, setMedicationInput] = useState('');

  const handleSubmit = (e: React.FormEvent) => { e.preventDefault(); onSubmit(formData); };

  const addSymptom = () => {
    if (symptomInput.trim()) {
      setFormData(prev => ({ ...prev, symptoms: [...(prev.symptoms || []), symptomInput.trim()] }));
      setSymptomInput('');
    }
  };
  const addMedication = () => {
    if (medicationInput.trim()) {
      setFormData(prev => ({ ...prev, medications: [...(prev.medications || []), medicationInput.trim()] }));
      setMedicationInput('');
    }
  };

  const inputCls = "w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 outline-none focus:bg-white/10 focus:border-white/30 text-white placeholder:text-white/40 transition-all";

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid grid-cols-2 gap-4">
        <div className="col-span-2">
          <label className="block text-xs font-medium text-white/60 mb-1.5">Diagnosis *</label>
          <input value={formData.diagnosis} onChange={e => setFormData(p => ({ ...p, diagnosis: e.target.value }))} className={inputCls} placeholder="Enter diagnosis" required />
        </div>
        <div>
          <label className="block text-xs font-medium text-white/60 mb-1.5">Visit Type</label>
          <select value={formData.visitType} onChange={e => setFormData(p => ({ ...p, visitType: e.target.value as MedicalRecord['visitType'] }))}
            className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white outline-none focus:bg-white/10 focus:border-white/30">
            {['Emergency', 'Routine', 'Follow-up', 'Specialist', 'Surgery', 'Preventive'].map(v => (
              <option key={v} value={v} className="bg-slate-900">{v}</option>
            ))}
          </select>
        </div>
        <div>
          <label className="block text-xs font-medium text-white/60 mb-1.5">Doctor ID *</label>
          <input value={formData.doctorId} onChange={e => setFormData(p => ({ ...p, doctorId: e.target.value }))} className={inputCls} placeholder="e.g. D001" required />
        </div>
      </div>

      {/* Symptoms */}
      <div>
        <label className="block text-xs font-medium text-white/60 mb-1.5">Symptoms</label>
        <div className="flex gap-2 mb-2">
          <input value={symptomInput} onChange={e => setSymptomInput(e.target.value)} onKeyDown={e => e.key === 'Enter' && (e.preventDefault(), addSymptom())}
            className={`flex-1 ${inputCls}`} placeholder="Type and press Enter" />
          <button type="button" onClick={addSymptom} className="px-4 py-2 rounded-xl bg-white/10 hover:bg-white/20 text-white text-sm transition-colors">Add</button>
        </div>
        <div className="flex flex-wrap gap-2">
          {formData.symptoms?.map((s, i) => (
            <span key={i} className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs bg-white/10 text-white">
              {s} <button type="button" onClick={() => setFormData(p => ({ ...p, symptoms: p.symptoms?.filter((_, j) => j !== i) }))} className="text-white/40 hover:text-white ml-1">×</button>
            </span>
          ))}
        </div>
      </div>

      {/* Medications */}
      <div>
        <label className="block text-xs font-medium text-white/60 mb-1.5">Medications</label>
        <div className="flex gap-2 mb-2">
          <input value={medicationInput} onChange={e => setMedicationInput(e.target.value)} onKeyDown={e => e.key === 'Enter' && (e.preventDefault(), addMedication())}
            className={`flex-1 ${inputCls}`} placeholder="Type and press Enter" />
          <button type="button" onClick={addMedication} className="px-4 py-2 rounded-xl bg-white/10 hover:bg-white/20 text-white text-sm transition-colors">Add</button>
        </div>
        <div className="flex flex-wrap gap-2">
          {formData.medications?.map((m, i) => (
            <span key={i} className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs bg-emerald-500/20 text-emerald-300">
              {m} <button type="button" onClick={() => setFormData(p => ({ ...p, medications: p.medications?.filter((_, j) => j !== i) }))} className="text-emerald-400/50 hover:text-emerald-300 ml-1">×</button>
            </span>
          ))}
        </div>
      </div>

      <div>
        <label className="block text-xs font-medium text-white/60 mb-1.5">Follow-up Date</label>
        <input type="date" value={formData.followUpDate || ''} onChange={e => setFormData(p => ({ ...p, followUpDate: e.target.value }))}
          className={inputCls} />
      </div>

      <div>
        <label className="block text-xs font-medium text-white/60 mb-1.5">Clinical Notes</label>
        <textarea value={formData.notes} onChange={e => setFormData(p => ({ ...p, notes: e.target.value }))}
          className={`${inputCls} resize-none`} rows={3} placeholder="Additional clinical notes..." />
      </div>

      <div className="flex justify-end gap-3 pt-2 border-t border-white/10">
        <GlassButton type="button" variant="ghost" onClick={onCancel}>Cancel</GlassButton>
        <GlassButton type="submit" variant="primary">Add Record</GlassButton>
      </div>
    </form>
  );
};
