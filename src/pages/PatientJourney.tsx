import React from 'react';
import {
  CalendarPlus,
  ClipboardCheck,
  Stethoscope,
  Pill,
  CheckCircle2,
  X,
  Sparkles,
  Plus,
  Trash2,
  ArrowRight,
  UserRound,
  Clock,
  AlertTriangle,
  ChevronRight,
  Bot
} from 'lucide-react';
import type { LucideIcon } from 'lucide-react';
import { GlassCard } from '../components/ui/GlassCard';
import { GlassBadge } from '../components/ui/GlassBadge';
import { GlassButton } from '../components/ui/GlassButton';
import { GlassInput } from '../components/ui/GlassInput';
import { GlassSelect } from '../components/ui/GlassSelect';
import { useJourney } from '../context/JourneyContext';
import { ScheduleVisitWizard } from '../components/journey/ScheduleVisitWizard';
import { PageHeader } from '../components/ui/PageHeader';
import { recommendMedicines } from '../data/journeyMock';
import { db } from '../data';
import { cn } from '../utils/cn';
import type { JourneyStage, MedicineSuggestion, Visit } from '../types/journey';
import { JOURNEY_STAGES } from '../types/journey';

interface StageMeta {
  label: string;
  icon: LucideIcon;
  accent: string;       // text + icon tint
  dot: string;          // status dot bg
  column: string;       // column header gradient
}

const STAGE_META: Record<JourneyStage, StageMeta> = {
  Scheduled: { label: 'Scheduled', icon: CalendarPlus, accent: 'text-sky-300', dot: 'bg-sky-400', column: 'from-sky-500/20' },
  Reception: { label: 'Reception', icon: ClipboardCheck, accent: 'text-indigo-300', dot: 'bg-indigo-400', column: 'from-indigo-500/20' },
  Consultation: { label: 'With Doctor', icon: Stethoscope, accent: 'text-violet-300', dot: 'bg-violet-400', column: 'from-violet-500/20' },
  Pharmacy: { label: 'Medical Store', icon: Pill, accent: 'text-emerald-300', dot: 'bg-emerald-400', column: 'from-emerald-500/20' },
  Completed: { label: 'Completed', icon: CheckCircle2, accent: 'text-teal-300', dot: 'bg-teal-400', column: 'from-teal-500/20' }
};

const doctorOptions = db.doctors.map(d => ({ value: d.id, label: `${d.name} · ${d.specialty}` }));
const medicineOptions = [
  { value: '', label: 'Add medicine manually…' },
  ...db.medicines.map(m => ({ value: m.id, label: `${m.name} (${m.category})` }))
];

export const PatientJourney: React.FC = () => {
  const { visits } = useJourney();
  const [selectedId, setSelectedId] = React.useState<string | null>(null);
  const [scheduleOpen, setScheduleOpen] = React.useState(false);

  const selected = visits.find(v => v.id === selectedId) ?? null;

  const countFor = (stage: JourneyStage) => visits.filter(v => v.stage === stage).length;

  return (
    <div className="space-y-6">
      <PageHeader
        title="Patient Journey"
        subtitle="Track every patient from booking through reception, consultation, and the medical store."
        actions={
          <>
            <GlassBadge variant="primary" className="hidden sm:inline-flex">
              <Sparkles className="w-3 h-3 mr-1" />
              AI-assisted prescribing
            </GlassBadge>
            <GlassButton variant="primary" onClick={() => setScheduleOpen(true)}>
              <CalendarPlus className="w-4 h-4" />
              New Appointment
            </GlassButton>
          </>
        }
      />

      {/* Pipeline summary */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
        {JOURNEY_STAGES.map(stage => {
          const meta = STAGE_META[stage];
          return (
            <GlassCard key={stage} padding="sm" hover={false} className="flex items-center gap-3">
              <div className={cn('w-10 h-10 rounded-xl flex items-center justify-center bg-white/5', meta.accent)}>
                <meta.icon className="w-5 h-5" />
              </div>
              <div>
                <p className="text-2xl font-bold text-white leading-none">{countFor(stage)}</p>
                <p className="text-xs text-white/50 mt-1">{meta.label}</p>
              </div>
            </GlassCard>
          );
        })}
      </div>

      {/* Helper line for non-technical staff */}
      <div className="flex items-center gap-2 text-xs text-white/50 px-1">
        <Sparkles className="w-3.5 h-3.5 text-violet-300 flex-shrink-0" />
        <span>Tap any patient card to see their next step. Patients move left → right as each stage is completed.</span>
      </div>

      {/* Board */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-5 gap-4">
        {JOURNEY_STAGES.map(stage => {
          const meta = STAGE_META[stage];
          const items = visits.filter(v => v.stage === stage);
          return (
            <div key={stage} className="flex flex-col">
              <div className={cn('flex items-center justify-between px-3 py-2 rounded-xl mb-3 bg-gradient-to-r to-transparent', meta.column)}>
                <div className="flex items-center gap-2">
                  <span className={cn('w-2 h-2 rounded-full', meta.dot)} />
                  <span className="text-sm font-semibold text-white">{meta.label}</span>
                </div>
                <span className="text-xs text-white/50">{items.length}</span>
              </div>
              <div className="space-y-3 min-h-[80px]">
                {items.length === 0 && (
                  <div className="rounded-xl border border-dashed border-white/10 p-4 text-center text-xs text-white/30">
                    No patients
                  </div>
                )}
                {items.map(visit => (
                  <VisitCard key={visit.id} visit={visit} onClick={() => setSelectedId(visit.id)} />
                ))}
              </div>
            </div>
          );
        })}
      </div>

      <VisitDrawer visit={selected} onClose={() => setSelectedId(null)} />
      <ScheduleVisitWizard open={scheduleOpen} onClose={() => setScheduleOpen(false)} />
    </div>
  );
};

// --- Visit card ------------------------------------------------------------

const VisitCard: React.FC<{ visit: Visit; onClick: () => void }> = ({ visit, onClick }) => {
  const activeDoctor = visit.consultations.find(c => !c.completed) ?? visit.consultations[visit.consultations.length - 1];
  return (
    <button
      onClick={onClick}
      className="w-full text-left p-3 rounded-2xl border border-white/10 bg-white/5 hover:bg-white/10 transition-all group"
    >
      <div className="flex items-center gap-3">
        <img src={visit.patientAvatar} alt={visit.patientName} className="w-9 h-9 rounded-full border border-white/10" />
        <div className="flex-1 min-w-0">
          <p className="text-sm font-semibold text-white truncate">{visit.patientName}</p>
          <p className="text-xs text-white/50 truncate">{visit.reason}</p>
        </div>
        {visit.priority === 'Urgent' && (
          <AlertTriangle className="w-4 h-4 text-amber-400 flex-shrink-0" />
        )}
      </div>
      <div className="flex items-center justify-between mt-2.5 text-xs text-white/40">
        <span className="flex items-center gap-1">
          <Clock className="w-3 h-3" />
          {visit.scheduledTime}
        </span>
        {visit.stage === 'Consultation' && activeDoctor && (
          <span className="truncate max-w-[110px] text-violet-300">{activeDoctor.doctorName}</span>
        )}
        {visit.stage === 'Pharmacy' && (
          <span className="text-emerald-300">
            {visit.prescription.filter(p => p.dispensed).length}/{visit.prescription.length} dispensed
          </span>
        )}
        {visit.stage !== 'Consultation' && visit.stage !== 'Pharmacy' && (
          <ChevronRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
        )}
      </div>
    </button>
  );
};

// --- Visit drawer ----------------------------------------------------------

const VisitDrawer: React.FC<{ visit: Visit | null; onClose: () => void }> = ({ visit, onClose }) => {
  const open = !!visit;
  return (
    <>
      <div
        className={cn(
          'fixed inset-0 bg-black/60 backdrop-blur-sm z-40 transition-opacity duration-300',
          open ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'
        )}
        onClick={onClose}
      />
      <aside
        className={cn(
          'fixed inset-y-0 right-0 z-50 w-full sm:w-[460px] glass-panel backdrop-blur-2xl border-l',
          'transition-transform duration-300 ease-in-out overflow-y-auto',
          open ? 'translate-x-0' : 'translate-x-full'
        )}
      >
        {visit && <DrawerBody visit={visit} onClose={onClose} />}
      </aside>
    </>
  );
};

const DrawerBody: React.FC<{ visit: Visit; onClose: () => void }> = ({ visit, onClose }) => {
  const stageIndex = JOURNEY_STAGES.indexOf(visit.stage);
  return (
    <div>
      {/* Header */}
      <div className="p-5 border-b border-white/10 sticky top-0 glass-panel z-10">
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-center gap-3">
            <img src={visit.patientAvatar} alt={visit.patientName} className="w-12 h-12 rounded-full border border-white/10" />
            <div>
              <h2 className="text-lg font-semibold text-white">{visit.patientName}</h2>
              <p className="text-xs text-white/50">{visit.age} yrs · {visit.gender} · {visit.patientId}</p>
            </div>
          </div>
          <button onClick={onClose} className="p-2 rounded-lg hover:bg-white/10 transition-colors">
            <X className="w-5 h-5 text-white/60" />
          </button>
        </div>

        {/* Stage stepper */}
        <div className="flex items-center gap-1 mt-4">
          {JOURNEY_STAGES.map((stage, i) => (
            <React.Fragment key={stage}>
              <div className="flex flex-col items-center gap-1 flex-1">
                <div className={cn(
                  'w-7 h-7 rounded-full flex items-center justify-center border',
                  i < stageIndex && 'bg-emerald-500/20 border-emerald-500/40 text-emerald-300',
                  i === stageIndex && 'bg-violet-500/30 border-violet-500/50 text-white',
                  i > stageIndex && 'bg-white/5 border-white/10 text-white/30'
                )}>
                  {i < stageIndex ? <CheckCircle2 className="w-4 h-4" /> : React.createElement(STAGE_META[stage].icon, { className: 'w-3.5 h-3.5' })}
                </div>
                <span className={cn('text-[9px] text-center leading-tight', i === stageIndex ? 'text-white' : 'text-white/40')}>
                  {STAGE_META[stage].label}
                </span>
              </div>
              {i < JOURNEY_STAGES.length - 1 && <div className={cn('h-0.5 flex-1 -mt-4', i < stageIndex ? 'bg-emerald-500/40' : 'bg-white/10')} />}
            </React.Fragment>
          ))}
        </div>
      </div>

      {/* Chief complaint */}
      <div className="p-5 border-b border-white/10">
        <p className="text-xs uppercase tracking-wide text-white/40 mb-1">Reason for visit</p>
        <p className="text-sm text-white">{visit.reason}</p>
        {visit.symptoms.length > 0 && (
          <div className="flex flex-wrap gap-1.5 mt-3">
            {visit.symptoms.map(s => (
              <span key={s} className="px-2 py-0.5 rounded-full text-xs bg-white/5 border border-white/10 text-white/70">{s}</span>
            ))}
          </div>
        )}
      </div>

      {/* Stage-specific actions */}
      <div className="p-5">
        {visit.stage === 'Scheduled' && <ReceptionPanel visit={visit} />}
        {visit.stage === 'Reception' && <AssignDoctorPanel visit={visit} />}
        {visit.stage === 'Consultation' && <ConsultationPanel visit={visit} />}
        {visit.stage === 'Pharmacy' && <PharmacyPanel visit={visit} />}
        {visit.stage === 'Completed' && <CompletedPanel visit={visit} />}
      </div>
    </div>
  );
};

// --- Stage panels ----------------------------------------------------------

const PanelHeading: React.FC<{ icon: LucideIcon; title: string; subtitle?: string }> = ({ icon: Icon, title, subtitle }) => (
  <div className="flex items-center gap-2 mb-4">
    <div className="p-2 rounded-xl bg-white/5">
      <Icon className="w-4 h-4 text-violet-300" />
    </div>
    <div>
      <p className="text-sm font-semibold text-white">{title}</p>
      {subtitle && <p className="text-xs text-white/40">{subtitle}</p>}
    </div>
  </div>
);

const ReceptionPanel: React.FC<{ visit: Visit }> = ({ visit }) => {
  const { checkIn } = useJourney();
  return (
    <div>
      <PanelHeading icon={ClipboardCheck} title="Reception check-in" subtitle="Confirm the patient has arrived" />
      <p className="text-sm text-white/60 mb-4">
        {visit.patientName} is scheduled for {visit.scheduledTime}. Check the patient in to move them to the reception queue.
      </p>
      <GlassButton variant="primary" onClick={() => checkIn(visit.id)} className="w-full flex items-center justify-center gap-2">
        <ClipboardCheck className="w-4 h-4" />
        Check in at Reception
      </GlassButton>
    </div>
  );
};

const AssignDoctorPanel: React.FC<{ visit: Visit }> = ({ visit }) => {
  const { sendToDoctor } = useJourney();
  const [doctorId, setDoctorId] = React.useState(db.doctors[0]?.id ?? '');

  const assign = () => {
    const doc = db.doctors.find(d => d.id === doctorId);
    if (!doc) return;
    sendToDoctor(visit.id, { id: doc.id, name: doc.name, specialty: doc.specialty });
  };

  return (
    <div>
      <PanelHeading icon={UserRound} title="Assign to doctor" subtitle={`Checked in at ${visit.checkedInAt ?? '—'}`} />
      <GlassSelect
        label="Attending doctor"
        options={doctorOptions}
        value={doctorId}
        onChange={e => setDoctorId(e.target.value)}
      />
      <GlassButton variant="primary" onClick={assign} className="w-full mt-4 flex items-center justify-center gap-2">
        Send to Doctor
        <ArrowRight className="w-4 h-4" />
      </GlassButton>
    </div>
  );
};

const ConsultationPanel: React.FC<{ visit: Visit }> = ({ visit }) => {
  const { updateConsultation, addPrescriptionItem, removePrescriptionItem, referToDoctor, sendToPharmacy } = useJourney();
  const active = visit.consultations.find(c => !c.completed) ?? visit.consultations[visit.consultations.length - 1];
  const [suggestions, setSuggestions] = React.useState<MedicineSuggestion[] | null>(null);
  const [manualMed, setManualMed] = React.useState('');
  const [referId, setReferId] = React.useState('');

  if (!active) return null;

  const runAI = () => setSuggestions(recommendMedicines(active.diagnosis, visit.symptoms));

  const addManual = (medId: string) => {
    const med = db.medicines.find(m => m.id === medId);
    if (!med) return;
    addPrescriptionItem(visit.id, {
      medicineId: med.id,
      name: med.name,
      category: med.category,
      dosage: 'As directed',
      prescribedBy: active.doctorName,
      aiSuggested: false
    });
    setManualMed('');
  };

  const addSuggestion = (s: MedicineSuggestion) => {
    addPrescriptionItem(visit.id, {
      medicineId: s.medicineId,
      name: s.name,
      category: s.category,
      dosage: s.dosage,
      prescribedBy: active.doctorName,
      aiSuggested: true,
      rationale: s.rationale
    });
  };

  const refer = () => {
    const doc = db.doctors.find(d => d.id === referId);
    if (!doc) return;
    referToDoctor(visit.id, { id: doc.id, name: doc.name, specialty: doc.specialty });
    setReferId('');
    setSuggestions(null);
  };

  const prescribedIds = new Set(visit.prescription.map(p => p.medicineId));

  return (
    <div className="space-y-6">
      {/* Consultation timeline (Doctor 1, Doctor 2, …) */}
      {visit.consultations.length > 1 && (
        <div className="space-y-2">
          <p className="text-xs uppercase tracking-wide text-white/40">Consultations</p>
          {visit.consultations.map((c, i) => (
            <div key={c.id} className={cn('flex items-center gap-2 text-sm px-3 py-2 rounded-xl border',
              c.completed ? 'border-white/10 bg-white/5 text-white/60' : 'border-violet-500/40 bg-violet-500/10 text-white')}>
              <span className="text-xs text-white/40">Dr {i + 1}</span>
              <span className="flex-1 truncate">{c.doctorName}</span>
              {c.completed ? <CheckCircle2 className="w-4 h-4 text-emerald-400" /> : <span className="text-xs text-violet-300">Active</span>}
            </div>
          ))}
        </div>
      )}

      {/* Diagnosis & notes */}
      <div>
        <PanelHeading icon={Stethoscope} title={active.doctorName} subtitle={active.specialty} />
        <GlassInput
          label="Diagnosis"
          placeholder="e.g. Acute bronchitis"
          value={active.diagnosis}
          onChange={e => updateConsultation(visit.id, active.id, { diagnosis: e.target.value })}
        />
        <div className="mt-3">
          <label className="block text-sm font-medium text-white/80 mb-2">Clinical notes</label>
          <textarea
            value={active.notes}
            onChange={e => updateConsultation(visit.id, active.id, { notes: e.target.value })}
            placeholder="Examination findings, advice…"
            rows={3}
            className="w-full glass-input backdrop-blur-md border rounded-xl px-4 py-3 outline-none transition-all focus:bg-white/10 focus:border-white/30 text-sm"
          />
        </div>
      </div>

      {/* AI medicine recommendations */}
      <div className="rounded-2xl border border-violet-500/30 bg-gradient-to-br from-violet-500/10 to-fuchsia-500/5 p-4">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <div className="p-1.5 rounded-lg bg-violet-500/20">
              <Bot className="w-4 h-4 text-violet-200" />
            </div>
            <div>
              <p className="text-sm font-semibold text-white flex items-center gap-1">
                AI Medicine Recommendations
                <Sparkles className="w-3 h-3 text-violet-300" />
              </p>
              <p className="text-[11px] text-white/40">Based on diagnosis + symptoms</p>
            </div>
          </div>
          <GlassButton size="sm" variant="ghost" onClick={runAI}>
            {suggestions ? 'Refresh' : 'Suggest'}
          </GlassButton>
        </div>

        {suggestions === null && (
          <p className="text-xs text-white/40">
            Enter a diagnosis above, then tap <span className="text-violet-300">Suggest</span> to get AI-recommended medicines from inventory.
          </p>
        )}
        {suggestions?.length === 0 && (
          <p className="text-xs text-white/40">No confident match yet — refine the diagnosis or add medicines manually below.</p>
        )}
        <div className="space-y-2">
          {suggestions?.map(s => {
            const added = prescribedIds.has(s.medicineId);
            return (
              <div key={s.medicineId} className="rounded-xl border border-white/10 bg-white/5 p-3">
                <div className="flex items-start justify-between gap-2">
                  <div className="min-w-0">
                    <p className="text-sm font-medium text-white truncate">{s.name}</p>
                    <p className="text-[11px] text-white/50">{s.category} · {s.dosage}</p>
                  </div>
                  <button
                    disabled={added}
                    onClick={() => addSuggestion(s)}
                    className={cn(
                      'flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-medium transition-colors flex-shrink-0',
                      added ? 'bg-emerald-500/20 text-emerald-300 cursor-default' : 'bg-violet-500/30 text-white hover:bg-violet-500/40'
                    )}
                  >
                    {added ? <CheckCircle2 className="w-3.5 h-3.5" /> : <Plus className="w-3.5 h-3.5" />}
                    {added ? 'Added' : 'Add'}
                  </button>
                </div>
                <p className="text-[11px] text-white/40 mt-1.5">{s.rationale}</p>
                <div className="mt-1.5 h-1 rounded-full bg-white/10 overflow-hidden">
                  <div className="h-full bg-gradient-to-r from-violet-400 to-fuchsia-400" style={{ width: `${s.confidence}%` }} />
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Current prescription */}
      <div>
        <p className="text-xs uppercase tracking-wide text-white/40 mb-2">Prescription ({visit.prescription.length})</p>
        <div className="space-y-2">
          {visit.prescription.length === 0 && (
            <p className="text-xs text-white/30">No medicines added yet.</p>
          )}
          {visit.prescription.map(p => (
            <div key={p.id} className="flex items-center gap-2 p-2.5 rounded-xl bg-white/5 border border-white/10">
              <Pill className="w-4 h-4 text-emerald-300 flex-shrink-0" />
              <div className="flex-1 min-w-0">
                <p className="text-sm text-white truncate flex items-center gap-1.5">
                  {p.name}
                  {p.aiSuggested && <Sparkles className="w-3 h-3 text-violet-300 flex-shrink-0" />}
                </p>
                <p className="text-[11px] text-white/40 truncate">{p.dosage}</p>
              </div>
              <button onClick={() => removePrescriptionItem(visit.id, p.id)} className="p-1.5 rounded-lg hover:bg-red-500/20 text-white/40 hover:text-red-300 transition-colors">
                <Trash2 className="w-3.5 h-3.5" />
              </button>
            </div>
          ))}
        </div>
        <div className="mt-2">
          <GlassSelect options={medicineOptions} value={manualMed} onChange={e => addManual(e.target.value)} />
        </div>
      </div>

      {/* Actions */}
      <div className="space-y-3 pt-2 border-t border-white/10">
        <div>
          <p className="text-xs uppercase tracking-wide text-white/40 mb-2">Refer to another doctor</p>
          <div className="flex gap-2">
            <GlassSelect
              className="flex-1"
              options={[{ value: '', label: 'Select doctor…' }, ...doctorOptions.filter(o => !visit.consultations.some(c => c.doctorId === o.value))]}
              value={referId}
              onChange={e => setReferId(e.target.value)}
            />
            <GlassButton variant="default" onClick={refer} disabled={!referId}>Refer</GlassButton>
          </div>
        </div>
        <GlassButton
          variant="primary"
          onClick={() => sendToPharmacy(visit.id)}
          disabled={visit.prescription.length === 0}
          className="w-full flex items-center justify-center gap-2"
        >
          <Pill className="w-4 h-4" />
          Send Prescription to Medical Store
        </GlassButton>
      </div>
    </div>
  );
};

const PharmacyPanel: React.FC<{ visit: Visit }> = ({ visit }) => {
  const { dispenseMedicine, completeVisit } = useJourney();
  const allDispensed = visit.prescription.length > 0 && visit.prescription.every(p => p.dispensed);
  const lastDoctor = visit.consultations[visit.consultations.length - 1];

  return (
    <div className="space-y-5">
      <PanelHeading icon={Pill} title="Medical Store" subtitle={`Prescribed by ${lastDoctor?.doctorName ?? '—'}`} />

      {lastDoctor?.diagnosis && (
        <div className="rounded-xl bg-white/5 border border-white/10 p-3">
          <p className="text-xs text-white/40">Diagnosis</p>
          <p className="text-sm text-white">{lastDoctor.diagnosis}</p>
        </div>
      )}

      <div className="space-y-2">
        {visit.prescription.map(p => (
          <div key={p.id} className={cn('flex items-center gap-3 p-3 rounded-xl border',
            p.dispensed ? 'border-emerald-500/30 bg-emerald-500/10' : 'border-white/10 bg-white/5')}>
            <Pill className={cn('w-4 h-4 flex-shrink-0', p.dispensed ? 'text-emerald-400' : 'text-white/50')} />
            <div className="flex-1 min-w-0">
              <p className="text-sm text-white truncate">{p.name}</p>
              <p className="text-[11px] text-white/40 truncate">{p.dosage}</p>
            </div>
            {p.dispensed ? (
              <span className="flex items-center gap-1 text-xs text-emerald-300"><CheckCircle2 className="w-4 h-4" /> Dispensed</span>
            ) : (
              <GlassButton size="sm" variant="ghost" onClick={() => dispenseMedicine(visit.id, p.id)}>Dispense</GlassButton>
            )}
          </div>
        ))}
      </div>

      <GlassButton
        variant="primary"
        onClick={() => completeVisit(visit.id)}
        disabled={!allDispensed}
        className="w-full flex items-center justify-center gap-2"
      >
        <CheckCircle2 className="w-4 h-4" />
        {allDispensed ? 'Complete Visit' : 'Dispense all to finish'}
      </GlassButton>
    </div>
  );
};

const CompletedPanel: React.FC<{ visit: Visit }> = ({ visit }) => {
  const lastDoctor = visit.consultations[visit.consultations.length - 1];
  return (
    <div className="space-y-4">
      <div className="flex flex-col items-center text-center py-4">
        <div className="w-14 h-14 rounded-2xl bg-emerald-500/20 border border-emerald-500/30 flex items-center justify-center mb-3">
          <CheckCircle2 className="w-7 h-7 text-emerald-300" />
        </div>
        <p className="text-base font-semibold text-white">Journey complete</p>
        <p className="text-sm text-white/50">Patient has collected medicines from the store.</p>
      </div>
      <div className="rounded-xl bg-white/5 border border-white/10 p-4 space-y-3">
        <div>
          <p className="text-xs text-white/40">Seen by</p>
          <p className="text-sm text-white">{visit.consultations.map(c => c.doctorName).join(' → ')}</p>
        </div>
        {lastDoctor?.diagnosis && (
          <div>
            <p className="text-xs text-white/40">Diagnosis</p>
            <p className="text-sm text-white">{lastDoctor.diagnosis}</p>
          </div>
        )}
        <div>
          <p className="text-xs text-white/40 mb-1">Medicines dispensed</p>
          <div className="space-y-1">
            {visit.prescription.map(p => (
              <p key={p.id} className="text-sm text-white flex items-center gap-1.5">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" /> {p.name} · <span className="text-white/40">{p.dosage}</span>
              </p>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
