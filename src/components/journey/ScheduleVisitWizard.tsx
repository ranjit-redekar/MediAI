import React from 'react';
import {
  X,
  UserPlus,
  UserRound,
  Search,
  ArrowLeft,
  ArrowRight,
  CalendarPlus,
  CheckCircle2,
  Stethoscope,
  ClipboardList,
  AlertTriangle,
  Phone,
  Mail
} from 'lucide-react';
import { GlassInput } from '../ui/GlassInput';
import { GlassButton } from '../ui/GlassButton';
import { GlassSelect } from '../ui/GlassSelect';
import { useJourney } from '../../context/JourneyContext';
import { db } from '../../data';
import { cn } from '../../utils/cn';
import type { Patient } from '../../types';

interface ScheduleVisitWizardProps {
  open: boolean;
  onClose: () => void;
}

type Mode = 'existing' | 'new';

const STEPS = ['Patient', 'Visit details', 'Confirm'] as const;

const emptyNewPatient = {
  name: '',
  age: '',
  gender: 'Female' as Patient['gender'],
  phone: '',
  email: '',
  bloodGroup: 'O+'
};

const todayISO = () => new Date().toISOString().split('T')[0];

function registerPatient(input: typeof emptyNewPatient): Patient {
  const id = 'P' + String(db.patients.length + 1).padStart(3, '0');
  const patient: Patient = {
    id,
    name: input.name.trim(),
    age: Number(input.age) || 0,
    gender: input.gender,
    bloodGroup: input.bloodGroup,
    phone: input.phone.trim(),
    email: input.email.trim() || `${input.name.trim().toLowerCase().replace(/\s+/g, '.')}@email.com`,
    address: '—',
    registrationDate: todayISO(),
    lastVisit: todayISO(),
    status: 'Active',
    avatar: `https://i.pravatar.cc/150?u=${id}`,
    medicalHistory: []
  };
  db.patients.push(patient);
  return patient;
}

export const ScheduleVisitWizard: React.FC<ScheduleVisitWizardProps> = ({ open, onClose }) => {
  const { scheduleVisit } = useJourney();
  const [step, setStep] = React.useState(0);
  const [mode, setMode] = React.useState<Mode | null>(null);

  // existing patient
  const [search, setSearch] = React.useState('');
  const [selectedPatientId, setSelectedPatientId] = React.useState('');

  // new patient
  const [newPatient, setNewPatient] = React.useState(emptyNewPatient);

  // visit details
  const [reason, setReason] = React.useState('');
  const [symptoms, setSymptoms] = React.useState('');
  const [time, setTime] = React.useState('11:00 AM');
  const [priority, setPriority] = React.useState<'Routine' | 'Urgent'>('Routine');

  const reset = React.useCallback(() => {
    setStep(0);
    setMode(null);
    setSearch('');
    setSelectedPatientId('');
    setNewPatient(emptyNewPatient);
    setReason('');
    setSymptoms('');
    setTime('11:00 AM');
    setPriority('Routine');
  }, []);

  const close = () => {
    onClose();
    // small delay so the reset isn't visible during the close animation
    window.setTimeout(reset, 250);
  };

  const filteredPatients = React.useMemo(() => {
    const q = search.trim().toLowerCase();
    const list = q
      ? db.patients.filter(p => p.name.toLowerCase().includes(q) || p.id.toLowerCase().includes(q) || p.phone.includes(q))
      : db.patients;
    return list.slice(0, 6);
  }, [search]);

  const selectedPatient = db.patients.find(p => p.id === selectedPatientId);

  // ---- step validation ----
  const newPatientValid = newPatient.name.trim().length > 1 && Number(newPatient.age) > 0 && newPatient.phone.trim().length >= 6;
  const step1Valid = mode === 'existing' ? !!selectedPatientId : mode === 'new' ? newPatientValid : false;

  const summaryName = mode === 'new' ? newPatient.name.trim() : selectedPatient?.name ?? '';

  const confirm = () => {
    const patient = mode === 'new' ? registerPatient(newPatient) : selectedPatient;
    if (!patient) return;
    scheduleVisit({
      patientId: patient.id,
      patientName: patient.name,
      patientAvatar: patient.avatar,
      age: patient.age,
      gender: patient.gender,
      reason: reason.trim() || 'General consultation',
      symptoms: symptoms.split(',').map(s => s.trim()).filter(Boolean),
      scheduledTime: time,
      priority
    });
    close();
  };

  return (
    <div
      className={cn(
        'fixed inset-0 z-[60] flex items-start justify-center p-4 transition-colors duration-200',
        open ? 'bg-black/60 pointer-events-auto' : 'bg-transparent pointer-events-none'
      )}
      onClick={close}
    >
      <div
        onClick={e => e.stopPropagation()}
        className={cn(
          'mt-12 w-full max-w-xl rounded-3xl border glass-panel backdrop-blur-2xl overflow-hidden transition-all duration-200',
          open ? 'opacity-100 translate-y-0' : 'opacity-0 -translate-y-6'
        )}
      >
        {/* Header */}
        <div className="p-5 border-b border-white/10 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-primary to-accent flex items-center justify-center">
              <CalendarPlus className="w-5 h-5 text-white" />
            </div>
            <div>
              <h2 className="text-lg font-semibold text-white">New Appointment</h2>
              <p className="text-xs text-white/50">Book a patient into today's journey</p>
            </div>
          </div>
          <button onClick={close} className="p-2 rounded-lg hover:bg-white/10 transition-colors">
            <X className="w-5 h-5 text-white/60" />
          </button>
        </div>

        {/* Stepper */}
        <div className="px-5 py-4 flex items-center gap-2">
          {STEPS.map((label, i) => (
            <React.Fragment key={label}>
              <div className="flex items-center gap-2">
                <div className={cn(
                  'w-7 h-7 rounded-full flex items-center justify-center text-xs font-semibold border',
                  i < step && 'bg-emerald-500/20 border-emerald-500/40 text-emerald-300',
                  i === step && 'bg-violet-500/30 border-violet-500/50 text-white',
                  i > step && 'bg-white/5 border-white/10 text-white/40'
                )}>
                  {i < step ? <CheckCircle2 className="w-4 h-4" /> : i + 1}
                </div>
                <span className={cn('text-xs hidden sm:block', i === step ? 'text-white font-medium' : 'text-white/40')}>{label}</span>
              </div>
              {i < STEPS.length - 1 && <div className={cn('h-0.5 flex-1 rounded', i < step ? 'bg-emerald-500/40' : 'bg-white/10')} />}
            </React.Fragment>
          ))}
        </div>

        {/* Body */}
        <div className="px-5 pb-5 max-h-[60vh] overflow-y-auto">
          {step === 0 && (
            <div className="space-y-4">
              <p className="text-sm text-white/70">Is this a returning patient or someone new?</p>
              <div className="grid grid-cols-2 gap-3">
                <button
                  onClick={() => setMode('existing')}
                  className={cn(
                    'p-4 rounded-2xl border text-left transition-all',
                    mode === 'existing' ? 'border-violet-500/50 bg-violet-500/15' : 'border-white/10 bg-white/5 hover:bg-white/10'
                  )}
                >
                  <UserRound className={cn('w-6 h-6 mb-2', mode === 'existing' ? 'text-violet-300' : 'text-white/60')} />
                  <p className="text-sm font-semibold text-white">Returning patient</p>
                  <p className="text-xs text-white/50 mt-0.5">Already registered with us</p>
                </button>
                <button
                  onClick={() => setMode('new')}
                  className={cn(
                    'p-4 rounded-2xl border text-left transition-all',
                    mode === 'new' ? 'border-violet-500/50 bg-violet-500/15' : 'border-white/10 bg-white/5 hover:bg-white/10'
                  )}
                >
                  <UserPlus className={cn('w-6 h-6 mb-2', mode === 'new' ? 'text-violet-300' : 'text-white/60')} />
                  <p className="text-sm font-semibold text-white">New patient</p>
                  <p className="text-xs text-white/50 mt-0.5">First visit — add their details</p>
                </button>
              </div>

              {mode === 'existing' && (
                <div className="pt-1">
                  <div className="relative">
                    <Search className="w-4 h-4 text-white/40 absolute left-4 top-1/2 -translate-y-1/2" />
                    <input
                      autoFocus
                      value={search}
                      onChange={e => setSearch(e.target.value)}
                      placeholder="Search by name, ID, or phone…"
                      className="w-full glass-input border rounded-xl pl-11 pr-4 py-3 text-sm outline-none focus:border-white/30"
                    />
                  </div>
                  <div className="mt-2 space-y-1.5">
                    {filteredPatients.map(p => (
                      <button
                        key={p.id}
                        onClick={() => setSelectedPatientId(p.id)}
                        className={cn(
                          'w-full flex items-center gap-3 p-2.5 rounded-xl border transition-all text-left',
                          selectedPatientId === p.id ? 'border-violet-500/50 bg-violet-500/15' : 'border-white/10 bg-white/5 hover:bg-white/10'
                        )}
                      >
                        <img src={p.avatar} alt={p.name} className="w-9 h-9 rounded-full border border-white/10" />
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-white truncate">{p.name}</p>
                          <p className="text-xs text-white/40">{p.id} · {p.age} yrs · {p.gender}</p>
                        </div>
                        {selectedPatientId === p.id && <CheckCircle2 className="w-5 h-5 text-violet-300" />}
                      </button>
                    ))}
                    {filteredPatients.length === 0 && (
                      <p className="text-xs text-white/40 text-center py-3">No match — try the New patient option.</p>
                    )}
                  </div>
                </div>
              )}

              {mode === 'new' && (
                <div className="pt-1 space-y-3">
                  <GlassInput
                    label="Full name *"
                    placeholder="e.g. Anita Sharma"
                    value={newPatient.name}
                    onChange={e => setNewPatient(p => ({ ...p, name: e.target.value }))}
                  />
                  <div className="grid grid-cols-3 gap-3">
                    <GlassInput
                      label="Age *"
                      type="number"
                      placeholder="34"
                      value={newPatient.age}
                      onChange={e => setNewPatient(p => ({ ...p, age: e.target.value }))}
                    />
                    <GlassSelect
                      label="Gender"
                      options={[{ value: 'Female', label: 'Female' }, { value: 'Male', label: 'Male' }, { value: 'Other', label: 'Other' }]}
                      value={newPatient.gender}
                      onChange={e => setNewPatient(p => ({ ...p, gender: e.target.value as Patient['gender'] }))}
                    />
                    <GlassSelect
                      label="Blood"
                      options={['O+', 'O-', 'A+', 'A-', 'B+', 'B-', 'AB+', 'AB-'].map(b => ({ value: b, label: b }))}
                      value={newPatient.bloodGroup}
                      onChange={e => setNewPatient(p => ({ ...p, bloodGroup: e.target.value }))}
                    />
                  </div>
                  <GlassInput
                    label="Phone *"
                    placeholder="+1 (555) 000-0000"
                    icon={<Phone className="w-4 h-4" />}
                    value={newPatient.phone}
                    onChange={e => setNewPatient(p => ({ ...p, phone: e.target.value }))}
                  />
                  <GlassInput
                    label="Email (optional)"
                    placeholder="name@email.com"
                    icon={<Mail className="w-4 h-4" />}
                    value={newPatient.email}
                    onChange={e => setNewPatient(p => ({ ...p, email: e.target.value }))}
                  />
                  <p className="text-[11px] text-white/40">* required. A patient record is created automatically.</p>
                </div>
              )}
            </div>
          )}

          {step === 1 && (
            <div className="space-y-4">
              <div className="flex items-center gap-2 text-sm text-white/70">
                <Stethoscope className="w-4 h-4 text-violet-300" />
                Why is {summaryName || 'the patient'} visiting today?
              </div>
              <GlassInput
                label="Reason for visit"
                placeholder="e.g. Persistent cough and mild fever"
                value={reason}
                onChange={e => setReason(e.target.value)}
              />
              <GlassInput
                label="Symptoms (separate with commas)"
                placeholder="Cough, Fever, Fatigue"
                value={symptoms}
                onChange={e => setSymptoms(e.target.value)}
              />
              <div className="grid grid-cols-2 gap-3">
                <GlassInput label="Preferred time" value={time} onChange={e => setTime(e.target.value)} />
                <GlassSelect
                  label="Priority"
                  options={[{ value: 'Routine', label: 'Routine' }, { value: 'Urgent', label: 'Urgent — see sooner' }]}
                  value={priority}
                  onChange={e => setPriority(e.target.value as 'Routine' | 'Urgent')}
                />
              </div>
            </div>
          )}

          {step === 2 && (
            <div className="space-y-4">
              <div className="flex items-center gap-2 text-sm text-white/70">
                <ClipboardList className="w-4 h-4 text-violet-300" />
                Please review before confirming.
              </div>
              <div className="rounded-2xl border border-white/10 bg-white/5 p-4 space-y-3">
                <div className="flex items-center gap-3">
                  <img
                    src={mode === 'new' ? `https://i.pravatar.cc/150?u=new` : selectedPatient?.avatar}
                    alt={summaryName}
                    className="w-12 h-12 rounded-full border border-white/10"
                  />
                  <div>
                    <p className="text-sm font-semibold text-white">{summaryName}</p>
                    <p className="text-xs text-white/50">
                      {mode === 'new'
                        ? `New patient · ${newPatient.age || '—'} yrs · ${newPatient.gender}`
                        : `${selectedPatient?.id} · ${selectedPatient?.age} yrs · ${selectedPatient?.gender}`}
                    </p>
                  </div>
                  {mode === 'new' && (
                    <span className="ml-auto px-2 py-0.5 rounded-full text-xs bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                      Will be registered
                    </span>
                  )}
                </div>
                <div className="h-px bg-white/10" />
                <Row label="Reason" value={reason.trim() || 'General consultation'} />
                <Row label="Symptoms" value={symptoms.split(',').map(s => s.trim()).filter(Boolean).join(', ') || '—'} />
                <Row label="Time" value={time} />
                <Row
                  label="Priority"
                  value={priority}
                  highlight={priority === 'Urgent'}
                />
              </div>
              <div className="flex items-start gap-2 text-xs text-white/50 bg-white/5 rounded-xl p-3 border border-white/10">
                <AlertTriangle className="w-4 h-4 text-violet-300 flex-shrink-0 mt-0.5" />
                After confirming, the patient appears under <span className="text-white/80">&nbsp;Scheduled&nbsp;</span> on the journey board. Reception can then check them in.
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-5 border-t border-white/10 flex items-center justify-between gap-3">
          <GlassButton
            variant="ghost"
            onClick={step === 0 ? close : () => setStep(s => s - 1)}
            className="flex items-center gap-2"
          >
            <ArrowLeft className="w-4 h-4" />
            {step === 0 ? 'Cancel' : 'Back'}
          </GlassButton>

          {step < STEPS.length - 1 ? (
            <GlassButton
              variant="primary"
              disabled={step === 0 ? !step1Valid : false}
              onClick={() => setStep(s => s + 1)}
              className="flex items-center gap-2"
            >
              Continue
              <ArrowRight className="w-4 h-4" />
            </GlassButton>
          ) : (
            <GlassButton variant="primary" onClick={confirm} className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4" />
              Confirm Appointment
            </GlassButton>
          )}
        </div>
      </div>
    </div>
  );
};

const Row: React.FC<{ label: string; value: string; highlight?: boolean }> = ({ label, value, highlight }) => (
  <div className="flex items-start justify-between gap-4 text-sm">
    <span className="text-white/40">{label}</span>
    <span className={cn('text-right', highlight ? 'text-amber-300 font-medium' : 'text-white')}>{value}</span>
  </div>
);
