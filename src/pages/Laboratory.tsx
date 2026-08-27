import React, { useMemo, useState } from 'react';
import { FlaskConical, CheckCircle, Clock, AlertCircle, ChevronDown, Bell } from 'lucide-react';
import { GlassCard } from '../components/ui/GlassCard';
import { GlassBadge } from '../components/ui/GlassBadge';
import { GlassButton } from '../components/ui/GlassButton';
import { PageHeader } from '../components/ui/PageHeader';
import { SearchInput } from '../components/ui/SearchInput';
import { FilterTabs } from '../components/ui/FilterTabs';
import { EmptyState } from '../components/ui/EmptyState';
import { MiniStat } from '../components/ui/StatCard';
import { useToast } from '../context/ToastContext';
import { db } from '../data';
import { cn } from '../utils/cn';

const statusVariant = (status: string) => {
  switch (status) {
    case 'Completed': return 'success' as const;
    case 'In Progress': return 'info' as const;
    case 'Pending': return 'warning' as const;
    default: return 'default' as const;
  }
};

const resultVariant = (status: string) =>
  status === 'Normal' ? 'success' as const
  : status === 'Critical' ? 'danger' as const
  : 'warning' as const;

export const Laboratory: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');
  const [expanded, setExpanded] = useState<string | null>(null);
  const { toast } = useToast();

  const statusTabs = useMemo(() => [
    { label: 'All tests', value: 'All', count: db.labTests.length },
    { label: 'Pending', value: 'Pending', count: db.labTests.filter(t => t.status === 'Pending').length },
    { label: 'In progress', value: 'In Progress', count: db.labTests.filter(t => t.status === 'In Progress').length },
    { label: 'Completed', value: 'Completed', count: db.labTests.filter(t => t.status === 'Completed').length },
  ], []);

  const query = searchTerm.trim().toLowerCase();
  const filteredTests = db.labTests.filter(test =>
    (!query || test.patientName.toLowerCase().includes(query) || test.testName.toLowerCase().includes(query)) &&
    (statusFilter === 'All' || test.status === statusFilter)
  );

  const pendingCount = db.labTests.filter(t => t.status === 'Pending').length;
  const inProgressCount = db.labTests.filter(t => t.status === 'In Progress').length;
  const completedCount = db.labTests.filter(t => t.status === 'Completed').length;
  const criticalCount = db.labTests.filter(t => t.results?.some(r => r.status === 'Critical')).length;

  const isFiltered = query !== '' || statusFilter !== 'All';
  const resetFilters = () => { setSearchTerm(''); setStatusFilter('All'); };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Laboratory"
        subtitle="Order queue, turnaround, and result review"
        actions={
          <GlassButton
            variant="primary"
            onClick={() => toast('Test order started', { description: 'Connect the LIS to submit real orders.' })}
          >
            <FlaskConical className="w-4 h-4" /> New test
          </GlassButton>
        }
      />

      {criticalCount > 0 && (
        <div className="reveal flex items-start gap-3 p-4 rounded-2xl bg-red-500/[0.07] border border-red-500/20">
          <AlertCircle className="w-5 h-5 text-red-400 flex-shrink-0 mt-0.5" />
          <div className="flex-1 min-w-0">
            <p className="text-sm font-semibold text-app">
              {criticalCount} result set{criticalCount === 1 ? ' contains' : 's contain'} a critical value
            </p>
            <p className="text-xs text-app-muted mt-0.5">
              Critical values should reach the ordering clinician within the hour.
            </p>
          </div>
          <GlassButton
            variant="ghost"
            size="sm"
            onClick={() => toast('Clinicians notified', { description: 'Critical result pages sent to the ordering doctors.', variant: 'warning' })}
          >
            <Bell className="w-3.5 h-3.5" /> Notify
          </GlassButton>
        </div>
      )}

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-5">
        <MiniStat icon={Clock} label="Pending" value={pendingCount} tint="text-amber-400" ring="bg-amber-500/15" index={0} />
        <MiniStat icon={FlaskConical} label="In Progress" value={inProgressCount} tint="text-cyan-400" ring="bg-cyan-500/15" index={1} />
        <MiniStat icon={CheckCircle} label="Completed" value={completedCount} tint="text-emerald-400" ring="bg-emerald-500/15" index={2} />
        <MiniStat icon={AlertCircle} label="Critical Values" value={criticalCount} tint="text-red-400" ring="bg-red-500/15" index={3} />
      </div>

      <GlassCard padding="sm" hover={false}>
        <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
          <SearchInput
            width="lg"
            placeholder="Search tests by patient or test name…"
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
            aria-label="Search lab tests"
          />
          <FilterTabs
            tabs={statusTabs}
            value={statusFilter}
            onChange={setStatusFilter}
            label="Filter lab tests by status"
          />
        </div>
      </GlassCard>

      {filteredTests.length === 0 ? (
        <GlassCard hover={false} padding="none">
          <EmptyState
            icon={FlaskConical}
            title="No lab tests match your filters"
            description="Try a different patient or test name, or clear the status filter to see the whole queue."
            action={isFiltered ? { label: 'Clear filters', onClick: resetFilters } : undefined}
          />
        </GlassCard>
      ) : (
        <div className="space-y-3">
          {filteredTests.map((test, i) => {
            const hasResults = Boolean(test.results?.length);
            const isOpen = expanded === test.id;
            const hasCritical = test.results?.some(r => r.status === 'Critical');

            return (
              <GlassCard
                key={test.id}
                hover={false}
                padding="none"
                className={cn(
                  'reveal hover-lift overflow-hidden',
                  hasCritical && 'border-red-500/30'
                )}
                style={{ animationDelay: `${Math.min(i, 12) * 50}ms` }}
              >
                <div className="p-5 flex flex-col md:flex-row md:items-center justify-between gap-4">
                  <div className="flex items-center gap-4 min-w-0">
                    <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-secondary/20 to-primary/20 flex items-center justify-center flex-shrink-0">
                      <FlaskConical className="w-6 h-6 text-secondary" />
                    </div>
                    <div className="min-w-0">
                      <h3 className="font-semibold text-app truncate">{test.testName}</h3>
                      <p className="text-sm text-app-muted truncate">{test.patientName}</p>
                      <p className="text-xs text-app-subtle truncate">Ordered by {test.doctorName}</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-4 md:gap-6 flex-shrink-0">
                    <div className="text-left md:text-right">
                      <p className="text-sm text-app-muted">{test.category}</p>
                      <p className="text-xs text-app-subtle">Ordered {test.orderedDate}</p>
                      {test.completedDate && (
                        <p className="text-xs text-app-subtle">Completed {test.completedDate}</p>
                      )}
                    </div>
                    <GlassBadge variant={statusVariant(test.status)} size="sm">{test.status}</GlassBadge>

                    {hasResults && (
                      <button
                        onClick={() => setExpanded(isOpen ? null : test.id)}
                        aria-expanded={isOpen}
                        aria-label={`${isOpen ? 'Hide' : 'Show'} results for ${test.testName}`}
                        className="p-2 rounded-lg text-app-subtle hover:text-app hover:bg-[var(--surface-2)] transition-colors focus-ring"
                      >
                        <ChevronDown className={cn('w-4 h-4 transition-transform', isOpen && 'rotate-180')} />
                      </button>
                    )}
                  </div>
                </div>

                {hasResults && isOpen && (
                  <div className="px-5 pb-5 pt-4 border-t border-[var(--border)] bg-[var(--surface-2)]">
                    <h4 className="text-sm font-semibold text-app mb-3">Results</h4>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
                      {test.results!.map((result, idx) => (
                        <div
                          key={idx}
                          className={cn(
                            'p-3 rounded-xl border',
                            result.status === 'Critical'
                              ? 'bg-red-500/[0.07] border-red-500/25'
                              : 'bg-[var(--surface-1)] border-[var(--border)]'
                          )}
                        >
                          <div className="flex items-center gap-2">
                            <span className="text-sm font-medium text-app">{result.parameter}</span>
                            {result.status === 'Critical' && <AlertCircle className="w-4 h-4 text-red-400 flex-shrink-0" />}
                          </div>
                          <p className="text-lg font-semibold text-app mt-1 tabular-nums">
                            {result.value} <span className="text-sm font-normal text-app-muted">{result.unit}</span>
                          </p>
                          <p className="text-xs text-app-subtle">Ref: {result.referenceRange}</p>
                          <GlassBadge variant={resultVariant(result.status)} size="sm" className="mt-2">
                            {result.status}
                          </GlassBadge>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </GlassCard>
            );
          })}
        </div>
      )}
    </div>
  );
};
