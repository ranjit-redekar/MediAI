import React from 'react';
import { useSearchParams } from 'react-router-dom';
import { createPortal } from 'react-dom';
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
  Bot,
  UserPlus,
  UserX,
} from 'lucide-react';
import type { LucideIcon } from 'lucide-react';
import { GlassButton } from '../components/ui/GlassButton';
import { GlassInput } from '../components/ui/GlassInput';
import { GlassSelect } from '../components/ui/GlassSelect';
import { useJourney } from '../context/JourneyContext';
import { useSession } from '../context/SessionContext';
import { usePatients } from '../context/PatientsContext';
import { usePharmacy } from '../context/PharmacyContext';
import type { Medicine } from '../types';
import type { RoleId } from '../types/access';
import { ScheduleVisitWizard } from '../components/journey/ScheduleVisitWizard';
import { PageHeader } from '../components/ui/PageHeader';
import { allergyConflict, recommendMedicines } from '../data/journeyMock';
import { db } from '../data';
import { stockStatus } from '../data/pharmacy';
import { clockNow } from '../data/demoToday';
import { AllergyRow } from '../components/patients/AllergyRow';
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
// Only what the store can actually dispense: out-of-stock and expired batches aren't offered.
const medicineOptionsFrom = (medicines: Medicine[]) => [
  { value: '', label: 'Add medicine manually…' },
  ...medicines
    .filter(m => stockStatus(m) === 'In Stock' || stockStatus(m) === 'Low Stock')
    .sort((a, b) => a.name.localeCompare(b.name))
    .map(m => ({ value: m.id, label: `${m.name} (${m.category})${stockStatus(m) === 'Low Stock' ? ' · low stock' : ''}` }))
];

/** Whole minutes from an epoch-ms instant to the board's clock. */
const minutesSince = (ms?: number) => (ms === undefined ? 0 : Math.floor((clockNow().getTime() - ms) / 60_000));
/** A slot this far past with no check-in counts as late. */
const LATE_AFTER_MIN = 10;

export const PatientJourney: React.FC = () => {
  const { visits } = useJourney();
  // `?visit=` opens a visit directly — the dashboard's Start button lands here.
  const [searchParams] = useSearchParams();
  const [selectedId, setSelectedId] = React.useState<string | null>(() => searchParams.get('visit'));
  const [scheduleOpen, setScheduleOpen] = React.useState(false);
  const [showCompleted, setShowCompleted] = React.useState(false);
  const { role } = useSession();
  const { checkIn } = useJourney();
  const canCheckIn = STAGE_OWNERS.Scheduled.roles.includes(role.id);

  const selected = visits.find(v => v.id === selectedId) ?? null;


  return (
    <div className="space-y-6">
      <PageHeader
        title="Today"
        subtitle="Every patient in the building today — arrival, consultation, and the medical store."
        actions={
          <>
            {/* Booking lives on Appointments; Today adds people who are already here. */}
            <GlassButton variant="primary" onClick={() => setScheduleOpen(true)}>
              <UserPlus className="w-4 h-4" />
              Add walk-in
            </GlassButton>
          </>
        }
      />

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
            <div key={stage} className={cn('flex flex-col', MOBILE_ORDER[stage])}>
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
                {/* Completed grows all day; keep it to a count until someone asks. */}
                {stage === 'Completed' && items.length > 0 && (
                  <button
                    onClick={() => setShowCompleted(v => !v)}
                    className="w-full rounded-xl border border-dashed border-[var(--border-strong)] p-3 text-xs font-medium text-app-muted hover:text-app transition-colors focus-ring"
                  >
                    {showCompleted ? 'Hide completed' : `${items.length} done · show`}
                  </button>
                )}
                {(stage !== 'Completed' || showCompleted) && items.map(visit => (
                  <VisitCard
                    key={visit.id}
                    visit={visit}
                    onClick={() => setSelectedId(visit.id)}
                    onCheckIn={canCheckIn && visit.stage === 'Scheduled' ? () => checkIn(visit.id) : undefined}
                  />
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

const VisitCard: React.FC<{ visit: Visit; onClick: () => void; onCheckIn?: () => void }> = ({ visit, onClick, onCheckIn }) => {
  const activeDoctor = visit.consultations.find(c => !c.completed) ?? visit.consultations[visit.consultations.length - 1];
  // Who they're with or booked to see — also what tells two visits by one patient apart.
  const doctor = activeDoctor?.doctorName ?? visit.bookedDoctor?.name;
  const waited = visit.stage === 'Reception' ? minutesSince(visit.arrivedAt) : 0;
  const late = visit.stage === 'Scheduled' && visit.scheduledAt !== undefined ? minutesSince(visit.scheduledAt) : 0;
  return (
    <div className="rounded-2xl border border-white/10 bg-white/5 hover:bg-white/10 transition-all">
      <button onClick={onClick} className="w-full text-left p-3 group focus-ring rounded-2xl">
        <div className="flex items-center gap-3">
          <img src={visit.patientAvatar} alt="" className="w-9 h-9 rounded-full border border-white/10" />
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2">
              <p className="text-sm font-semibold text-white truncate flex-1">{visit.patientName}</p>
              {visit.priority === 'Urgent' && (
                <span title="Urgent" className="flex-shrink-0"><AlertTriangle className="w-4 h-4 text-amber-400" aria-label="Urgent" /></span>
              )}
            </div>
            <p className="text-xs text-white/50 truncate">{visit.reason}</p>
          </div>
        </div>
        {/* Its own line, only when it applies: name and doctor keep their full width. */}
        {waited > 0 && (
          <p className={cn('mt-2 text-xs font-semibold', waited >= 30 ? 'text-red-400' : waited >= 15 ? 'text-amber-400' : 'text-white/60')}>
            Waiting {waited} min
          </p>
        )}
        {late >= LATE_AFTER_MIN && <p className="mt-2 text-xs font-semibold text-amber-400">Late by {late} min</p>}
        <div className="flex items-center justify-between gap-2 mt-2 text-xs text-white/40">
          <span className="flex items-center gap-1 min-w-0">
            <Clock className="w-3 h-3 flex-shrink-0" />
            <span className="flex-shrink-0">{visit.scheduledTime}</span>
            {doctor && <span className="truncate text-white/60">· {doctor}</span>}
          </span>
          {visit.stage === 'Pharmacy' && (
            <span className="flex-shrink-0 text-emerald-300">
              {visit.prescription.filter(p => p.dispensed).length}/{visit.prescription.length} dispensed
            </span>
          )}
        </div>
      </button>
      {onCheckIn && (
        <div className="px-3 pb-3 -mt-1">
          <GlassButton size="sm" variant="default" className="w-full" onClick={onCheckIn}>
            <ClipboardCheck className="w-3.5 h-3.5" /> Check in
          </GlassButton>
        </div>
      )}
    </div>
  );
};

// --- Visit drawer ----------------------------------------------------------

const VisitDrawer: React.FC<{ visit: Visit | null; onClose: () => void }> = ({ visit, onClose }) => {
  const open = !!visit;
  // Portalled to <body>: inside the page's `space-y-*` wrapper the fixed panel
  // picked up a 24px top margin and let the header show through above it.
  return createPortal(
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
    </>,
    document.body,
  );
};

const DrawerBody: React.FC<{ visit: Visit; onClose: () => void }> = ({ visit, onClose }) => {
  const stageIndex = JOURNEY_STAGES.indexOf(visit.stage);
  const { role } = useSession();
  const { getPatient } = usePatients();
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

      {/* Chief complaint — with allergies, since this is where prescribing happens */}
      <div className="p-5 border-b border-white/10">
        <div className="-mt-4 mb-4"><AllergyRow allergies={getPatient(visit.patientId)?.allergies} /></div>
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

      {/* Stage-specific actions — only for the role that does this step */}
      <div className="p-5">
        {visit.stage !== 'Completed' && !STAGE_OWNERS[visit.stage].roles.includes(role.id) ? (
          <p className="text-sm text-app-muted">
            Waiting on <span className="font-semibold text-app">{STAGE_OWNERS[visit.stage].label}</span>. You'll see it move here when they're done.
          </p>
        ) : (
          <>
            {visit.stage === 'Scheduled' && <ReceptionPanel visit={visit} />}
            {visit.stage === 'Reception' && <AssignDoctorPanel visit={visit} />}
            {visit.stage === 'Consultation' && <ConsultationPanel visit={visit} />}
            {visit.stage === 'Pharmacy' && <PharmacyPanel visit={visit} />}
            {visit.stage === 'Completed' && <CompletedPanel visit={visit} />}
          </>
        )}
      </div>
    </div>
  );
};

/**
 * Stacked on narrow screens, the stages people are acting on come first;
 * "Scheduled" is often the longest list and would bury them. Wide screens keep
 * the left-to-right flow.
 */
const MOBILE_ORDER: Record<JourneyStage, string> = {
  Reception: 'order-1 xl:order-none',
  Consultation: 'order-2 xl:order-none',
  Pharmacy: 'order-3 xl:order-none',
  Scheduled: 'order-4 xl:order-none',
  Completed: 'order-5 xl:order-none',
};

// --- Stage panels ----------------------------------------------------------

/** Who does each step. Everyone can see the board; only the owner gets the buttons. */
const STAGE_OWNERS: Record<Exclude<JourneyStage, 'Completed'>, { roles: RoleId[]; label: string }> = {
  Scheduled:    { roles: ['admin', 'receptionist', 'nurse'], label: 'reception to check them in' },
  Reception:    { roles: ['admin', 'receptionist', 'nurse'], label: 'reception to assign a doctor' },
  Consultation: { roles: ['doctor', 'assistant-doctor'],     label: 'the doctor to finish the consultation' },
  Pharmacy:     { roles: ['pharmacist'],                     label: 'the pharmacist to dispense' },
};

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
  const { checkIn, markNoShow } = useJourney();
  const late = visit.scheduledAt !== undefined ? minutesSince(visit.scheduledAt) : 0;
  return (
    <div>
      <PanelHeading icon={ClipboardCheck} title="Reception check-in" subtitle="Confirm the patient has arrived" />
      <p className="text-sm text-white/60 mb-4">
        {visit.patientName} is booked for {visit.scheduledTime}
        {visit.bookedDoctor ? ` with ${visit.bookedDoctor.name}` : ''}.
        {late >= LATE_AFTER_MIN && <span className="font-semibold text-amber-400"> Now {late} minutes late.</span>}
      </p>
      <GlassButton variant="primary" onClick={() => checkIn(visit.id)} className="w-full flex items-center justify-center gap-2">
        <ClipboardCheck className="w-4 h-4" />
        Check in at Reception
      </GlassButton>
      {late >= LATE_AFTER_MIN && (
        <GlassButton variant="ghost" onClick={() => markNoShow(visit.id)} className="w-full mt-2 flex items-center justify-center gap-2">
          <UserX className="w-4 h-4" />
          Mark no-show
        </GlassButton>
      )}
    </div>
  );
};

const AssignDoctorPanel: React.FC<{ visit: Visit }> = ({ visit }) => {
  const { sendToDoctor } = useJourney();
  // The booked doctor, not the first name in the list: one click for the usual case.
  const [doctorId, setDoctorId] = React.useState(visit.bookedDoctor?.id ?? '');

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
        options={[...(visit.bookedDoctor ? [] : [{ value: '', label: 'Choose a doctor…' }]), ...doctorOptions]}
        value={doctorId}
        onChange={e => setDoctorId(e.target.value)}
      />
      <GlassButton variant="primary" onClick={assign} disabled={!doctorId} className="w-full mt-4 flex items-center justify-center gap-2">
        {doctorId ? `Send to ${db.doctors.find(d => d.id === doctorId)?.name}` : 'Send to doctor'}
        <ArrowRight className="w-4 h-4" />
      </GlassButton>
    </div>
  );
};

const ConsultationPanel: React.FC<{ visit: Visit }> = ({ visit }) => {
  const { updateConsultation, addPrescriptionItem, removePrescriptionItem, referToDoctor, sendToPharmacy, finishVisit } = useJourney();
  const active = visit.consultations.find(c => !c.completed) ?? visit.consultations[visit.consultations.length - 1];
  const allergies = usePatients().getPatient(visit.patientId)?.allergies;
  const { medicines } = usePharmacy();
  const medicineOptions = React.useMemo(() => medicineOptionsFrom(medicines), [medicines]);
  // Drafted as soon as the consult opens, from the visit reason — the doctor
  // adds what fits instead of typing a diagnosis first and asking.
  const [suggestions, setSuggestions] = React.useState<MedicineSuggestion[] | null>(() =>
    visit.prescription.length ? null : recommendMedicines(`${active?.diagnosis ?? ''} ${visit.reason}`, visit.symptoms, allergies));
  const [manualMed, setManualMed] = React.useState('');
  const [allergyBlock, setAllergyBlock] = React.useState<string | null>(null);
  const [referId, setReferId] = React.useState('');

  if (!active) return null;

  const runAI = () => setSuggestions(recommendMedicines(`${active.diagnosis} ${visit.reason}`, visit.symptoms, allergies));

  const addManual = (medId: string) => {
    const med = medicines.find(m => m.id === medId);
    if (!med) return;
    const clash = allergyConflict(med.name, allergies);
    setAllergyBlock(clash ? `${med.name} not added — ${visit.patientName} has a recorded ${clash} allergy.` : null);
    if (clash) return;
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
              <p className="text-[11px] text-white/40">Drafted from the visit reason and diagnosis · skips allergies and unavailable stock</p>
            </div>
          </div>
          <GlassButton size="sm" variant="ghost" onClick={runAI}>
            {suggestions ? 'Redraft' : 'Draft'}
          </GlassButton>
        </div>

        {suggestions === null && (
          <p className="text-xs text-white/40">Update the diagnosis, then tap <span className="text-violet-300">Draft</span> to redraft.</p>
        )}
        {suggestions?.length === 0 && (
          <p className="text-xs text-white/40">Nothing to suggest for this visit. Add a diagnosis and redraft, or add medicines manually below.</p>
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
          {allergyBlock && (
            <p role="alert" className="mt-2 px-3 py-2 rounded-lg border border-red-500/30 bg-red-500/10 text-xs font-semibold text-app">
              {allergyBlock}
            </p>
          )}
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
        {/* A visit that needs nothing from the store ends here — it used to have no way out. */}
        {visit.prescription.length > 0 ? (
          <GlassButton variant="primary" onClick={() => sendToPharmacy(visit.id)} className="w-full flex items-center justify-center gap-2">
            <Pill className="w-4 h-4" />
            Send prescription to medical store
          </GlassButton>
        ) : (
          <GlassButton variant="primary" onClick={() => finishVisit(visit.id)} className="w-full flex items-center justify-center gap-2">
            <CheckCircle2 className="w-4 h-4" />
            Finish visit — no medicines
          </GlassButton>
        )}
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
        <p className="text-base font-semibold text-white">Visit complete</p>
        <p className="text-sm text-white/50">
          {visit.prescription.length ? 'Medicines collected from the store.' : 'No medicines were prescribed.'}
        </p>
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
        {visit.prescription.length > 0 && <div>
          <p className="text-xs text-white/40 mb-1">Medicines dispensed</p>
          <div className="space-y-1">
            {visit.prescription.map(p => (
              <p key={p.id} className="text-sm text-white flex items-center gap-1.5">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" /> {p.name} · <span className="text-white/40">{p.dosage}</span>
              </p>
            ))}
          </div>
        </div>}
      </div>
    </div>
  );
};
