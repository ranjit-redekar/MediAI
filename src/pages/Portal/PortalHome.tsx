import React, { useMemo, useState } from 'react';
import {
  CalendarDays, Video, MapPin, FlaskConical, Receipt, Pill, Download,
  ChevronRight, CheckCircle2, AlertCircle, Clock, Sparkles, MessageSquare,
} from 'lucide-react';
import { GlassCard } from '../../components/ui/GlassCard';
import { GlassButton } from '../../components/ui/GlassButton';
import { GlassBadge } from '../../components/ui/GlassBadge';
import { EmptyState } from '../../components/ui/EmptyState';
import { useToast } from '../../context/ToastContext';
import { useSession } from '../../context/SessionContext';
import { db } from '../../data';
import { cn } from '../../utils/cn';

/** The demo patient this portal is signed in as. */
const PATIENT_ID = 'P001';

type TabId = 'visits' | 'results' | 'bills';

const TABS: { id: TabId; label: string; icon: React.ReactNode }[] = [
  { id: 'visits', label: 'My visits', icon: <CalendarDays className="w-4 h-4" /> },
  { id: 'results', label: 'My results', icon: <FlaskConical className="w-4 h-4" /> },
  { id: 'bills', label: 'My bills', icon: <Receipt className="w-4 h-4" /> },
];

export const PortalHome: React.FC = () => {
  const { role } = useSession();
  const { toast } = useToast();
  const [tab, setTab] = useState<TabId>('visits');

  const patient = db.patients.find(p => p.id === PATIENT_ID);

  const appointments = useMemo(() => db.appointments.filter(a => a.patientId === PATIENT_ID), []);
  const upcoming = useMemo(
    () => appointments
      .filter(a => a.status === 'Scheduled')
      .sort((a, b) => `${a.date}${a.time}`.localeCompare(`${b.date}${b.time}`)),
    [appointments]
  );
  const past = useMemo(() => appointments.filter(a => a.status !== 'Scheduled'), [appointments]);
  const labs = useMemo(() => db.labTests.filter(t => t.patientId === PATIENT_ID), []);
  const bills = useMemo(() => db.bills.filter(b => b.patientId === PATIENT_ID), []);
  const prescriptions = useMemo(
    () => (patient?.medicalHistory ?? []).flatMap(r => r.medications).slice(0, 4),
    [patient]
  );

  const outstanding = bills.filter(b => b.status !== 'Paid').reduce((sum, b) => sum + b.total, 0);
  const next = upcoming[0];
  const firstName = role.demoUser.name.split(' ')[0];

  return (
    <div className="space-y-6">
      <div>
        <p className="text-sm text-app-subtle">Welcome back</p>
        <h1 className="text-2xl sm:text-[28px] font-bold text-app tracking-tight">{firstName}</h1>
      </div>

      {/* Next visit — the one thing a patient opens this app for */}
      {next ? (
        <GlassCard hover={false} className="relative overflow-hidden reveal ring-grad">
          <div className="absolute inset-0 bg-gradient-to-br from-primary/[0.12] to-transparent pointer-events-none" />
          <div className="relative flex flex-col sm:flex-row sm:items-center gap-5">
            <div className="flex-1 min-w-0">
              <GlassBadge variant="primary" size="sm">Next appointment</GlassBadge>
              <h2 className="text-xl font-bold text-app mt-2.5">{next.doctorName}</h2>
              <p className="text-sm text-app-muted">{next.specialty}</p>

              <div className="flex flex-wrap items-center gap-4 mt-3 text-sm text-app-muted">
                <span className="flex items-center gap-1.5">
                  <CalendarDays className="w-4 h-4 text-app-subtle" />
                  {new Date(next.date).toLocaleDateString(undefined, { weekday: 'long', day: 'numeric', month: 'long' })}
                </span>
                <span className="flex items-center gap-1.5">
                  <Clock className="w-4 h-4 text-app-subtle" /> {next.time}
                </span>
                <span className="flex items-center gap-1.5">
                  {next.type === 'Video'
                    ? <Video className="w-4 h-4 text-app-subtle" />
                    : <MapPin className="w-4 h-4 text-app-subtle" />}
                  {next.type}
                </span>
              </div>

              {next.notes && <p className="text-xs text-app-subtle mt-2.5 italic">{next.notes}</p>}
            </div>

            <div className="flex sm:flex-col gap-2 flex-shrink-0">
              {next.type === 'Video' && (
                <GlassButton
                  variant="primary"
                  onClick={() => toast('Video room opening', { description: 'Your clinician will join at the scheduled time.', variant: 'info' })}
                >
                  <Video className="w-4 h-4" /> Join call
                </GlassButton>
              )}
              <GlassButton
                variant="default"
                onClick={() => toast('Reschedule requested', { description: 'The clinic will confirm a new slot shortly.', variant: 'info' })}
              >
                Reschedule
              </GlassButton>
            </div>
          </div>
        </GlassCard>
      ) : (
        <GlassCard hover={false} padding="none">
          <EmptyState
            icon={CalendarDays}
            title="No upcoming appointments"
            description="When your clinic books your next visit, it will appear here with joining details."
            action={{ label: 'Request an appointment', onClick: () => toast('Request sent', { description: 'The clinic will contact you to confirm a time.' }) }}
          />
        </GlassCard>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <GlassCard hover={false} className="reveal" style={{ animationDelay: '60ms' }}>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-violet-500/15 flex items-center justify-center flex-shrink-0">
              <Pill className="w-5 h-5 text-violet-400" />
            </div>
            <div className="min-w-0">
              <p className="text-xs text-app-subtle">Active prescriptions</p>
              <p className="text-xl font-bold text-app tabular-nums">{prescriptions.length}</p>
            </div>
          </div>
        </GlassCard>

        <GlassCard hover={false} className="reveal" style={{ animationDelay: '120ms' }}>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-cyan-500/15 flex items-center justify-center flex-shrink-0">
              <FlaskConical className="w-5 h-5 text-cyan-400" />
            </div>
            <div className="min-w-0">
              <p className="text-xs text-app-subtle">Test results</p>
              <p className="text-xl font-bold text-app tabular-nums">{labs.length}</p>
            </div>
          </div>
        </GlassCard>

        <GlassCard hover={false} className="reveal" style={{ animationDelay: '180ms' }}>
          <div className="flex items-center gap-3">
            <div className={cn(
              'w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0',
              outstanding > 0 ? 'bg-amber-500/15' : 'bg-emerald-500/15'
            )}>
              <Receipt className={cn('w-5 h-5', outstanding > 0 ? 'text-amber-400' : 'text-emerald-400')} />
            </div>
            <div className="min-w-0">
              <p className="text-xs text-app-subtle">Amount due</p>
              <p className="text-xl font-bold text-app tabular-nums">${outstanding.toFixed(2)}</p>
            </div>
          </div>
        </GlassCard>
      </div>

      <div>
        <div role="tablist" aria-label="My health record" className="flex gap-2 mb-4 overflow-x-auto hide-scrollbar">
          {TABS.map(t => (
            <button
              key={t.id}
              role="tab"
              aria-selected={tab === t.id}
              onClick={() => setTab(t.id)}
              className={cn(
                'h-10 px-4 rounded-xl border text-sm font-semibold inline-flex items-center gap-2 transition-all focus-ring flex-shrink-0',
                tab === t.id
                  ? 'bg-primary/15 border-primary/40 text-app'
                  : 'bg-[var(--surface-2)] border-[var(--border)] text-app-muted hover:text-app'
              )}
            >
              {t.icon}
              {t.label}
            </button>
          ))}
        </div>

        {tab === 'visits' && (
          <div className="space-y-3">
            {past.length === 0 ? (
              <GlassCard hover={false} padding="none">
                <EmptyState icon={CalendarDays} title="No past visits yet" description="Your visit history will build up here." />
              </GlassCard>
            ) : past.map((apt, i) => (
              <GlassCard key={apt.id} hover={false} className="reveal" style={{ animationDelay: `${i * 50}ms` }}>
                <div className="flex items-center justify-between gap-4">
                  <div className="min-w-0">
                    <p className="font-semibold text-app truncate">{apt.doctorName}</p>
                    <p className="text-sm text-app-muted">{apt.specialty} · {apt.date}</p>
                    {apt.notes && <p className="text-xs text-app-subtle mt-1 truncate">{apt.notes}</p>}
                  </div>
                  <GlassBadge
                    size="sm"
                    variant={apt.status === 'Completed' ? 'success' : apt.status === 'Cancelled' ? 'danger' : 'warning'}
                  >
                    {apt.status}
                  </GlassBadge>
                </div>
              </GlassCard>
            ))}
          </div>
        )}

        {tab === 'results' && (
          <div className="space-y-3">
            {labs.length === 0 ? (
              <GlassCard hover={false} padding="none">
                <EmptyState icon={FlaskConical} title="No results yet" description="Lab results are published here as soon as your clinician releases them." />
              </GlassCard>
            ) : labs.map((test, i) => {
              const hasCritical = test.results?.some(r => r.status === 'Critical');
              return (
                <GlassCard
                  key={test.id}
                  hover={false}
                  className={cn('reveal', hasCritical && 'border-amber-500/30')}
                  style={{ animationDelay: `${i * 50}ms` }}
                >
                  <div className="flex items-start justify-between gap-4">
                    <div className="min-w-0">
                      <p className="font-semibold text-app">{test.testName}</p>
                      <p className="text-sm text-app-muted">Ordered by {test.doctorName} · {test.orderedDate}</p>
                    </div>
                    <GlassBadge size="sm" variant={test.status === 'Completed' ? 'success' : 'warning'}>
                      {test.status}
                    </GlassBadge>
                  </div>

                  {test.results && test.results.length > 0 && (
                    <div className="mt-4 pt-4 border-t border-[var(--border)] space-y-2">
                      {test.results.map((r, idx) => (
                        <div key={idx} className="flex items-center justify-between gap-3 text-sm">
                          <span className="text-app-muted min-w-0 truncate">{r.parameter}</span>
                          <span className="flex items-center gap-2 flex-shrink-0">
                            <span className="text-app font-medium tabular-nums">{r.value} {r.unit}</span>
                            {r.status === 'Normal'
                              ? <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                              : <AlertCircle className="w-4 h-4 text-amber-400" />}
                          </span>
                        </div>
                      ))}
                      {hasCritical && (
                        <p className="text-xs text-amber-300 mt-3 flex items-start gap-1.5">
                          <AlertCircle className="w-3.5 h-3.5 flex-shrink-0 mt-px" />
                          Your clinician has been notified about a result outside the normal range and will contact you.
                        </p>
                      )}
                    </div>
                  )}
                </GlassCard>
              );
            })}
          </div>
        )}

        {tab === 'bills' && (
          <div className="space-y-3">
            {bills.length === 0 ? (
              <GlassCard hover={false} padding="none">
                <EmptyState icon={Receipt} title="Nothing to pay" description="Invoices for your visits will appear here." />
              </GlassCard>
            ) : bills.map((bill, i) => (
              <GlassCard key={bill.id} hover={false} className="reveal" style={{ animationDelay: `${i * 50}ms` }}>
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <div className="min-w-0">
                    <p className="font-semibold text-app">Invoice {bill.id}</p>
                    <p className="text-sm text-app-muted">{bill.date} · {bill.items.length} items</p>
                  </div>
                  <div className="flex items-center gap-3 flex-shrink-0">
                    <span className="text-lg font-bold text-app tabular-nums">${bill.total.toFixed(2)}</span>
                    <GlassBadge
                      size="sm"
                      variant={bill.status === 'Paid' ? 'success' : bill.status === 'Overdue' ? 'danger' : 'warning'}
                    >
                      {bill.status}
                    </GlassBadge>
                    {bill.status === 'Paid' ? (
                      <GlassButton
                        variant="ghost"
                        size="sm"
                        onClick={() => toast('Receipt downloaded', { description: `${bill.id}.pdf saved (demo).` })}
                        aria-label={`Download receipt ${bill.id}`}
                      >
                        <Download className="w-4 h-4" />
                      </GlassButton>
                    ) : (
                      <GlassButton
                        variant="primary"
                        size="sm"
                        onClick={() => toast('Payment page opening', { description: `Paying $${bill.total.toFixed(2)} for ${bill.id} (demo).`, variant: 'info' })}
                      >
                        Pay now
                      </GlassButton>
                    )}
                  </div>
                </div>
              </GlassCard>
            ))}
          </div>
        )}
      </div>

      {/* The patient-side equivalent of the staff copilot */}
      <GlassCard hover={false} className="reveal">
        <div className="flex flex-col sm:flex-row sm:items-center gap-4">
          <div className="w-10 h-10 rounded-xl bg-violet-500/15 flex items-center justify-center flex-shrink-0">
            <Sparkles className="w-5 h-5 text-violet-400" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="font-semibold text-app">Have a question about your care?</p>
            <p className="text-sm text-app-muted mt-0.5">
              Send a message to your care team — answers usually arrive within a working day.
            </p>
          </div>
          <GlassButton
            variant="default"
            className="flex-shrink-0"
            onClick={() => toast('Message sent', { description: 'Your care team will reply here shortly.', variant: 'ai' })}
          >
            <MessageSquare className="w-4 h-4" /> Message care team
            <ChevronRight className="w-3.5 h-3.5" />
          </GlassButton>
        </div>
      </GlassCard>
    </div>
  );
};
