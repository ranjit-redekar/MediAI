import React, { useMemo, useState } from 'react';
import { FlaskConical, CheckCircle, Clock, AlertCircle } from 'lucide-react';
import { GlassCard } from '../components/ui/GlassCard';
import { GlassBadge } from '../components/ui/GlassBadge';
import { GlassButton } from '../components/ui/GlassButton';
import { PageHeader } from '../components/ui/PageHeader';
import { SearchInput } from '../components/ui/SearchInput';
import { MiniStat } from '../components/ui/StatCard';
import { db } from '../data';
import { cn } from '../utils/cn';

export const Laboratory: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('All');
  const statusTabs = useMemo(() => {
    const pending = db.labTests.filter(t => t.status === 'Pending').length;
    const inProgress = db.labTests.filter(t => t.status === 'In Progress').length;
    const completed = db.labTests.filter(t => t.status === 'Completed').length;
    return [
      { label: 'All tests', value: 'All', count: db.labTests.length },
      { label: 'Pending', value: 'Pending', count: pending },
      { label: 'In progress', value: 'In Progress', count: inProgress },
      { label: 'Completed', value: 'Completed', count: completed }
    ];
  }, []);

  const filteredTests = db.labTests.filter((test) =>
    (test.patientName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    test.testName.toLowerCase().includes(searchTerm.toLowerCase())) &&
    (statusFilter === 'All' || test.status === statusFilter)
  );

  const pendingCount = db.labTests.filter(t => t.status === 'Pending').length;
  const inProgressCount = db.labTests.filter(t => t.status === 'In Progress').length;
  const completedCount = db.labTests.filter(t => t.status === 'Completed').length;

  const getStatusVariant = (status: string) => {
    switch (status) {
      case 'Completed': return 'success';
      case 'In Progress': return 'info';
      case 'Pending': return 'warning';
      default: return 'default';
    }
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Laboratory"
        subtitle="Manage lab tests and results"
        actions={
          <GlassButton variant="primary">
            <FlaskConical className="w-4 h-4" />
            New test
          </GlassButton>
        }
      />

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
        <MiniStat icon={Clock} label="Pending" value={pendingCount} tint="text-amber-400" ring="bg-amber-500/15" index={0} />
        <MiniStat icon={FlaskConical} label="In Progress" value={inProgressCount} tint="text-cyan-400" ring="bg-cyan-500/15" index={1} />
        <MiniStat icon={CheckCircle} label="Completed" value={completedCount} tint="text-emerald-400" ring="bg-emerald-500/15" index={2} />
      </div>

      <GlassCard padding="sm">
        <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
          <SearchInput
            width="lg"
            placeholder="Search tests by patient or test name…"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
          <div className="flex flex-wrap gap-2">
            {statusTabs.map((tab) => {
              const active = statusFilter === tab.value;
              return (
                <button
                  key={tab.value}
                  onClick={() => setStatusFilter(tab.value)}
                  className={cn(
                    'h-9 px-3.5 rounded-lg border text-xs font-semibold inline-flex items-center gap-2 transition-all',
                    active
                      ? 'bg-primary/15 border-primary/40 text-app'
                      : 'bg-[var(--surface-2)] border-[var(--border)] text-app-muted hover:text-app hover:border-[var(--border-strong)]'
                  )}
                >
                  <span>{tab.label}</span>
                  <span className={cn('text-[11px] px-1.5 rounded-full', active ? 'bg-primary/20 text-app' : 'bg-[var(--surface-3)] text-app-subtle')}>{tab.count}</span>
                </button>
              );
            })}
          </div>
        </div>
      </GlassCard>

      <div className="space-y-3">
        {filteredTests.map((test, i) => (
          <GlassCard key={test.id} hover={false} className="reveal hover-lift" style={{ animationDelay: `${i * 50}ms` }}>
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-secondary/20 to-primary/20 flex items-center justify-center">
                  <FlaskConical className="w-6 h-6 text-secondary" />
                </div>
                <div>
                  <h3 className="font-semibold text-white">{test.testName}</h3>
                  <p className="text-sm text-white/60">{test.patientName}</p>
                  <p className="text-xs text-white/40">Ordered by {test.doctorName}</p>
                </div>
              </div>

              <div className="flex items-center gap-6">
                <div className="text-right">
                  <p className="text-sm text-white/60">{test.category}</p>
                  <p className="text-xs text-white/40">Ordered: {test.orderedDate}</p>
                  {test.completedDate && (
                    <p className="text-xs text-white/40">Completed: {test.completedDate}</p>
                  )}
                </div>
                <GlassBadge variant={getStatusVariant(test.status)}>{test.status}</GlassBadge>
              </div>
            </div>

            {test.results && test.results.length > 0 && (
              <div className="mt-4 pt-4 border-t border-white/10">
                <h4 className="text-sm font-medium text-white/80 mb-3">Results</h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
                  {test.results.map((result, idx) => (
                    <div key={idx} className="p-3 rounded-xl bg-white/5">
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-medium text-white">{result.parameter}</span>
                        {result.status === 'Critical' && <AlertCircle className="w-4 h-4 text-red-400" />}
                      </div>
                      <p className="text-lg font-semibold text-white mt-1">
                        {result.value} <span className="text-sm font-normal text-white/60">{result.unit}</span>
                      </p>
                      <p className="text-xs text-white/40">Ref: {result.referenceRange}</p>
                      <GlassBadge 
                        variant={result.status === 'Normal' ? 'success' : result.status === 'Critical' ? 'danger' : 'warning'}
                        size="sm"
                        className="mt-2"
                      >
                        {result.status}
                      </GlassBadge>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </GlassCard>
        ))}
      </div>
    </div>
  );
};
