import React, { useDeferredValue, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { AlertCircle, ChevronDown, ChevronLeft, ChevronRight, Clock, FlaskConical, PhoneCall, Syringe, TestTube2, Timer } from 'lucide-react';
import { GlassCard } from '../components/ui/GlassCard';
import { GlassBadge } from '../components/ui/GlassBadge';
import { GlassButton } from '../components/ui/GlassButton';
import { GlassInput } from '../components/ui/GlassInput';
import { GlassSelect } from '../components/ui/GlassSelect';
import { GlassModal } from '../components/ui/GlassModal';
import { PageHeader } from '../components/ui/PageHeader';
import { SearchInput } from '../components/ui/SearchInput';
import { FilterTabs } from '../components/ui/FilterTabs';
import { EmptyState } from '../components/ui/EmptyState';
import { MiniStat } from '../components/ui/StatCard';
import { TableHeader } from '../components/ui/DataTable';
import { useToast } from '../context/ToastContext';
import { useSession } from '../context/SessionContext';
import { useLab } from '../context/LabContext';
import { usePatients } from '../context/PatientsContext';
import { flagValue, rangeLabel, testDefinition } from '../data/labCatalog';
import { clockNow } from '../data/demoToday';
import { fromDateKey, todayKey } from '../utils/date';
import type { LabTest, TestResult } from '../types';
import type { RoleId } from '../types/access';
import { cn } from '../utils/cn';

const PAGE_SIZE = 25;
/** Turnaround targets, order to result. */
const TARGET_MIN = { STAT: 60, Routine: 240 } as const;
const CAN_COLLECT: RoleId[] = ['lab-technician', 'nurse', 'admin'];
const CAN_RESULT: RoleId[] = ['lab-technician'];
const CAN_CALL: RoleId[] = ['lab-technician', 'admin'];

const statusVariant = (s: LabTest['status']) => (s === 'Completed' ? 'success' : s === 'In Progress' ? 'info' : 'warning') as 'success' | 'info' | 'warning';
const flagVariant = (s: TestResult['status']) => (s === 'Normal' ? 'success' : s === 'Critical' ? 'danger' : 'warning') as 'success' | 'danger' | 'warning';

const dueDate = (t: LabTest) => t.collectOn ?? t.orderedDate;
const minutesOpen = (t: LabTest) => (t.orderedAt ? Math.max(0, Math.floor((clockNow().getTime() - t.orderedAt) / 60_000)) : 0);
const target = (t: LabTest) => TARGET_MIN[t.priority ?? 'Routine'];
const isOverdue = (t: LabTest) => t.status !== 'Completed' && dueDate(t) <= todayKey() && minutesOpen(t) > target(t);
const uncalledCritical = (t: LabTest) => !!t.results?.some(r => r.status === 'Critical') && !t.criticalCalledAt;
const worst = (t: LabTest) => (t.results?.some(r => r.status === 'Critical') ? 2 : t.results?.some(r => r.status === 'Abnormal') ? 1 : 0);
const ago = (min: number) => (min < 60 ? `${min} min` : `${Math.floor(min / 60)} h ${min % 60} min`);

type View = 'worklist' | 'collect' | 'running' | 'overdue' | 'results' | 'upcoming' | 'all';

/**
 * The bench's worklist, at a real lab's volume: what to collect and run now
 * (STAT first, oldest first), turnaround against target, result entry that
 * flags values itself, and critical values held at the top until someone has
 * phoned them through.
 */
export const Laboratory: React.FC = () => {
  const { tests, collect, enterResults, markCalled } = useLab();
  const { getPatient } = usePatients();
  const { role } = useSession();
  const { toast } = useToast();
  const [search, setSearch] = useState('');
  const query = useDeferredValue(search.trim().toLowerCase());
  const [view, setView] = useState<View>('worklist');
  const [category, setCategory] = useState('');
  const [page, setPage] = useState(0);
  const [open, setOpen] = useState<string | null>(null);
  const [entering, setEntering] = useState<LabTest | null>(null);
  const today = todayKey();

  const counts = useMemo(() => ({
    collect: tests.filter(t => t.status === 'Pending' && dueDate(t) <= today).length,
    running: tests.filter(t => t.status === 'In Progress').length,
    overdue: tests.filter(isOverdue).length,
    results: tests.filter(t => t.status === 'Completed' && t.completedDate === today).length,
    upcoming: tests.filter(t => t.status !== 'Completed' && dueDate(t) > today).length,
    worklist: tests.filter(t => t.status !== 'Completed' && dueDate(t) <= today).length,
  }), [tests, today]);
  const criticals = tests.filter(uncalledCritical);
  const categories = useMemo(() => [...new Set(tests.map(t => t.category))].sort(), [tests]);

  const rows = useMemo(() => {
    const inView = (t: LabTest) => {
      switch (view) {
        case 'worklist': return t.status !== 'Completed' && dueDate(t) <= today;
        case 'collect': return t.status === 'Pending' && dueDate(t) <= today;
        case 'running': return t.status === 'In Progress';
        case 'overdue': return isOverdue(t);
        case 'results': return t.status === 'Completed' && t.completedDate === today;
        case 'upcoming': return t.status !== 'Completed' && dueDate(t) > today;
        default: return true;
      }
    };
    const list = tests.filter(t =>
      inView(t) &&
      (!category || t.category === category) &&
      (!query || t.patientName.toLowerCase().includes(query) || t.testName.toLowerCase().includes(query) || t.id.toLowerCase() === query));
    // Worklists: STAT first, then oldest. Results: flagged first, then newest.
    return [...list].sort((a, b) => {
      if (view === 'results' || view === 'all') return worst(b) - worst(a) || (b.orderedAt ?? 0) - (a.orderedAt ?? 0);
      if (view === 'upcoming') return dueDate(a).localeCompare(dueDate(b));
      return (a.priority === 'STAT' ? 0 : 1) - (b.priority === 'STAT' ? 0 : 1) || (a.orderedAt ?? 0) - (b.orderedAt ?? 0);
    });
  }, [tests, view, category, query, today]);

  const pages = Math.max(1, Math.ceil(rows.length / PAGE_SIZE));
  const current = Math.min(page, pages - 1);
  const visible = rows.slice(current * PAGE_SIZE, current * PAGE_SIZE + PAGE_SIZE);
  const go = (v: View) => { setView(v); setPage(0); };

  const canCollect = CAN_COLLECT.includes(role.id);
  const canResult = CAN_RESULT.includes(role.id);
  const canCall = CAN_CALL.includes(role.id);

  const tabs = [
    { label: 'Worklist', value: 'worklist', count: counts.worklist },
    { label: 'Results today', value: 'results', count: counts.results },
    { label: 'Upcoming', value: 'upcoming', count: counts.upcoming },
    { label: 'All', value: 'all', count: tests.length },
  ];

  return (
    <div className="space-y-6">
      <PageHeader
        title="Laboratory"
        subtitle={`${counts.worklist} open orders today · ${counts.overdue} past turnaround target`}
      />

      {/* Critical values stay here until someone has phoned them through. */}
      {criticals.length > 0 && (
        <section aria-label="Critical values to call" className="rounded-2xl border border-red-500/30 bg-red-500/[0.07] p-4 space-y-3">
          <p className="flex items-center gap-2 text-sm font-semibold text-app">
            <AlertCircle className="w-5 h-5 text-red-500" />
            {criticals.length} critical value{criticals.length === 1 ? '' : 's'} to phone through — within the hour, with read-back
          </p>
          {criticals.map(t => (
            <div key={t.id} className="flex flex-wrap items-center gap-3 rounded-xl bg-[var(--surface-1)] border border-[var(--border)] p-3">
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-app">
                  {t.patientName} · {t.testName}{' '}
                  {t.results!.filter(r => r.status === 'Critical').map(r => (
                    <span key={r.parameter} className="text-red-500">{r.parameter !== t.testName && `${r.parameter} `}{r.value}{r.unit && ` ${r.unit}`} (ref {r.referenceRange})</span>
                  ))}
                </p>
                <p className="text-xs text-app-muted">Call {t.doctorName} · ordered {t.priority === 'STAT' ? 'STAT' : 'routine'} · {t.id}</p>
              </div>
              {canCall ? (
                <GlassButton size="sm" variant="danger" onClick={() => {
                  markCalled(t.id, role.demoUser.name);
                  toast('Critical call logged', { description: `${t.doctorName} informed about ${t.patientName}'s ${t.testName}.`, variant: 'success' });
                }}>
                  <PhoneCall className="w-3.5 h-3.5" /> Mark called
                </GlassButton>
              ) : (
                <span className="text-xs text-app-muted">The lab calls this through</span>
              )}
            </div>
          ))}
        </section>
      )}

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {([
          ['collect', 'To collect', counts.collect, Syringe, 'text-amber-400', 'bg-amber-500/15'],
          ['running', 'In progress', counts.running, TestTube2, 'text-cyan-400', 'bg-cyan-500/15'],
          ['overdue', 'Past target', counts.overdue, Timer, 'text-red-400', 'bg-red-500/15'],
          ['results', 'Results today', counts.results, FlaskConical, 'text-emerald-400', 'bg-emerald-500/15'],
        ] as const).map(([v, label, value, icon, tint, ring], i) => (
          <button key={v} onClick={() => go(v)} className="text-left rounded-2xl focus-ring" aria-pressed={view === v}>
            <MiniStat icon={icon} label={label} value={value} tint={tint} ring={ring} index={i} />
          </button>
        ))}
      </div>

      <GlassCard padding="none" hover={false}>
        <div className="p-4 flex flex-col gap-3 lg:flex-row lg:items-center border-b border-[var(--border)]">
          <SearchInput width="lg" placeholder="Search patient, test, or order ID…" value={search}
            onChange={e => { setSearch(e.target.value); setPage(0); }} aria-label="Search lab orders" />
          <div className="lg:w-52">
            <GlassSelect aria-label="Filter by section" value={category} onChange={e => { setCategory(e.target.value); setPage(0); }}
              options={[{ value: '', label: 'All sections' }, ...categories.map(c => ({ value: c, label: c }))]} />
          </div>
          <FilterTabs tabs={tabs} value={tabs.some(t => t.value === view) ? view : ''} onChange={v => go(v as View)} label="Lab view" className="lg:ml-auto" />
        </div>

        {rows.length === 0 ? (
          <EmptyState
            icon={FlaskConical}
            title={view === 'worklist' && !query && !category ? 'Bench is clear' : 'No orders match'}
            description={view === 'worklist' && !query && !category ? 'Nothing waiting to be collected or run.' : 'Try another search or section, or switch to All.'}
            action={{ label: 'Show all orders', onClick: () => { setSearch(''); setCategory(''); go('all'); } }}
          />
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <caption className="sr-only">Laboratory orders</caption>
                <thead className="bg-[var(--surface-2)] border-b border-[var(--border)]">
                  <tr>
                    <TableHeader className="px-4">Order</TableHeader>
                    <TableHeader className="px-4">Patient</TableHeader>
                    <TableHeader className="hidden md:table-cell px-4">Turnaround</TableHeader>
                    <TableHeader className="px-4">Status</TableHeader>
                    <TableHeader align="right" className="px-4">Action</TableHeader>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[var(--border)]">
                  {visible.map(t => {
                    const mins = minutesOpen(t);
                    const late = t.status !== 'Completed' && mins > target(t);
                    const future = dueDate(t) > today;
                    const known = getPatient(t.patientId);
                    const flagged = worst(t);
                    return (
                      <React.Fragment key={t.id}>
                        <tr className={cn('hover:bg-[var(--surface-2)] transition-colors', flagged === 2 && 'bg-red-500/[0.05]')}>
                          <td className="px-4 py-2.5">
                            <p className="font-medium text-app flex items-center gap-2">
                              {t.priority === 'STAT' && <span className="rounded px-1.5 py-0.5 text-[10px] font-bold bg-red-600 text-white">STAT</span>}
                              {t.testName}
                            </p>
                            <p className="text-xs text-app-subtle">{t.category} · {t.id} · {t.doctorName}</p>
                          </td>
                          <td className="px-4 py-2.5">
                            {known
                              ? <Link to={`/patients/${known.id}`} className="font-medium text-app hover:underline focus-ring rounded">{t.patientName}</Link>
                              : <span className="font-medium text-app">{t.patientName}</span>}
                          </td>
                          <td className="hidden md:table-cell px-4 py-2.5 whitespace-nowrap">
                            {future ? (
                              <span className="text-app-muted">Due {fromDateKey(dueDate(t)).toLocaleDateString(undefined, { weekday: 'short', day: 'numeric', month: 'short' })}</span>
                            ) : t.status === 'Completed' ? (
                              <span className="text-app-muted">Resulted</span>
                            ) : (
                              <span className={cn('flex items-center gap-1', late ? 'text-red-500 font-semibold' : mins > target(t) * 0.75 ? 'text-amber-500 font-medium' : 'text-app-muted')}>
                                <Clock className="w-3.5 h-3.5" /> {ago(mins)} <span className="text-xs font-normal text-app-subtle">/ {target(t) / 60} h target</span>
                              </span>
                            )}
                          </td>
                          <td className="px-4 py-2.5 whitespace-nowrap">
                            <GlassBadge variant={statusVariant(t.status)} size="sm">{t.status === 'Pending' ? (future ? 'Scheduled' : 'To collect') : t.status}</GlassBadge>
                            {flagged > 0 && <GlassBadge variant={flagged === 2 ? 'danger' : 'warning'} size="sm" className="ml-1.5">{flagged === 2 ? 'Critical' : 'Abnormal'}</GlassBadge>}
                          </td>
                          <td className="px-4 py-2.5 text-right whitespace-nowrap">
                            {t.status === 'Pending' && !future && canCollect && (
                              <GlassButton size="sm" variant="default" onClick={() => collect(t.id)}>
                                <Syringe className="w-3.5 h-3.5" /> Collect sample
                              </GlassButton>
                            )}
                            {t.status === 'In Progress' && canResult && (
                              <GlassButton size="sm" variant="primary" disabled={!testDefinition(t.testName)} onClick={() => setEntering(t)}
                                title={testDefinition(t.testName) ? undefined : 'No result template for this test'}>
                                <FlaskConical className="w-3.5 h-3.5" /> Enter results
                              </GlassButton>
                            )}
                            {t.results?.length ? (
                              <button
                                onClick={() => setOpen(open === t.id ? null : t.id)}
                                aria-expanded={open === t.id}
                                className="ml-1 inline-flex items-center gap-1 px-2 py-1.5 rounded-lg text-xs font-medium text-app-muted hover:text-app hover:bg-[var(--surface-2)] focus-ring"
                              >
                                Results <ChevronDown className={cn('w-3.5 h-3.5 transition-transform', open === t.id && 'rotate-180')} />
                              </button>
                            ) : null}
                          </td>
                        </tr>
                        {open === t.id && t.results && (
                          <tr className="bg-[var(--surface-2)]">
                            <td colSpan={5} className="px-4 py-3">
                              <ResultsTable results={t.results} />
                              {t.criticalCalledAt && (
                                <p className="mt-2 text-xs text-app-muted">
                                  Critical value phoned through by {t.criticalCalledBy} at {new Date(t.criticalCalledAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}.
                                </p>
                              )}
                            </td>
                          </tr>
                        )}
                      </React.Fragment>
                    );
                  })}
                </tbody>
              </table>
            </div>
            <div className="flex items-center justify-between gap-3 px-4 py-3 border-t border-[var(--border)] text-xs text-app-subtle">
              <span>Showing {current * PAGE_SIZE + 1}–{Math.min(rows.length, (current + 1) * PAGE_SIZE)} of {rows.length}</span>
              {pages > 1 && (
                <div className="flex items-center gap-1">
                  <GlassButton size="sm" variant="ghost" disabled={current === 0} onClick={() => setPage(current - 1)} aria-label="Previous page"><ChevronLeft className="w-4 h-4" /></GlassButton>
                  <span className="px-2 tabular-nums">Page {current + 1} of {pages}</span>
                  <GlassButton size="sm" variant="ghost" disabled={current >= pages - 1} onClick={() => setPage(current + 1)} aria-label="Next page"><ChevronRight className="w-4 h-4" /></GlassButton>
                </div>
              )}
            </div>
          </>
        )}
      </GlassCard>

      <ResultEntryModal
        test={entering}
        onClose={() => setEntering(null)}
        onSave={values => {
          if (!entering) return;
          enterResults(entering.id, values);
          const def = testDefinition(entering.testName)!;
          const critical = def.params.some(p => flagValue(p, values[p.name]) === 'Critical');
          toast(critical ? 'Critical value — call it through now' : 'Results released', {
            description: `${entering.patientName} · ${entering.testName}`,
            variant: critical ? 'warning' : 'success',
          });
          setEntering(null);
        }}
      />
    </div>
  );
};

const ResultsTable: React.FC<{ results: TestResult[] }> = ({ results }) => (
  <table className="w-full text-sm">
    <thead>
      <tr className="text-xs text-app-subtle text-left">
        <th className="py-1 pr-4 font-medium">Parameter</th><th className="py-1 pr-4 font-medium">Value</th>
        <th className="py-1 pr-4 font-medium">Reference</th><th className="py-1 font-medium">Flag</th>
      </tr>
    </thead>
    <tbody>
      {results.map(r => (
        <tr key={r.parameter}>
          <td className="py-1 pr-4 text-app">{r.parameter}</td>
          <td className={cn('py-1 pr-4 tabular-nums font-semibold', r.status === 'Critical' ? 'text-red-500' : r.status === 'Abnormal' ? 'text-amber-500' : 'text-app')}>
            {r.value} <span className="font-normal text-app-subtle">{r.unit}</span>
          </td>
          <td className="py-1 pr-4 text-app-muted tabular-nums">{r.referenceRange}</td>
          <td className="py-1"><GlassBadge variant={flagVariant(r.status)} size="sm">{r.status}</GlassBadge></td>
        </tr>
      ))}
    </tbody>
  </table>
);

/** One field per parameter, flagged live from the catalogue ranges as it's typed. */
const ResultEntryModal: React.FC<{ test: LabTest | null; onClose: () => void; onSave: (values: Record<string, number>) => void }> = ({ test, onClose, onSave }) => {
  const [values, setValues] = useState<Record<string, string>>({});
  const def = test ? testDefinition(test.testName) : undefined;
  const parsed = Object.fromEntries((def?.params ?? []).map(p => [p.name, values[p.name]?.trim() === '' ? NaN : Number(values[p.name])]));
  const complete = !!def && def.params.every(p => values[p.name] !== undefined && Number.isFinite(parsed[p.name]));
  const close = () => { setValues({}); onClose(); };
  return (
    <GlassModal
      isOpen={!!test}
      onClose={close}
      title={test ? `Results · ${test.testName}` : 'Results'}
      description={test ? `${test.patientName} · ${test.id} · ordered by ${test.doctorName}` : undefined}
      size="md"
      footer={
        <div className="flex justify-end gap-2">
          <GlassButton variant="ghost" onClick={close}>Cancel</GlassButton>
          <GlassButton variant="primary" disabled={!complete} onClick={() => { onSave(parsed as Record<string, number>); setValues({}); }}>Release results</GlassButton>
        </div>
      }
    >
      <div className="space-y-3">
        {def?.params.map(p => {
          const v = parsed[p.name];
          const flag = Number.isFinite(v) && values[p.name] !== undefined ? flagValue(p, v) : null;
          return (
            <div key={p.name} className="grid grid-cols-[1fr_auto] items-end gap-3">
              <GlassInput
                label={`${p.name}${p.unit ? ` (${p.unit})` : ''} · ref ${rangeLabel(p)}`}
                type="number"
                step="any"
                inputMode="decimal"
                value={values[p.name] ?? ''}
                onChange={e => setValues(prev => ({ ...prev, [p.name]: e.target.value }))}
              />
              <div className="h-11 flex items-center w-20">
                {flag && <GlassBadge variant={flagVariant(flag)} size="sm">{flag}</GlassBadge>}
              </div>
            </div>
          );
        })}
      </div>
    </GlassModal>
  );
};
