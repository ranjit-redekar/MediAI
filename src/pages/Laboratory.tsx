import React, { useMemo, useState } from 'react';
import { Search, FlaskConical, CheckCircle, Clock, AlertCircle, Filter } from 'lucide-react';
import { GlassCard } from '../components/ui/GlassCard';
import { GlassInput } from '../components/ui/GlassInput';
import { GlassBadge } from '../components/ui/GlassBadge';
import { GlassButton } from '../components/ui/GlassButton';
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
      <div className="space-y-1">
        <h1 className="text-3xl font-bold text-white">Laboratory</h1>
        <p className="text-white/60">Manage lab tests and results</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
        <GlassCard>
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-amber-500/20 flex items-center justify-center">
              <Clock className="w-6 h-6 text-amber-400" />
            </div>
            <div>
              <p className="text-white/60 text-sm">Pending</p>
              <h3 className="text-2xl font-bold text-white">{pendingCount}</h3>
            </div>
          </div>
        </GlassCard>
        <GlassCard>
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-cyan-500/20 flex items-center justify-center">
              <FlaskConical className="w-6 h-6 text-cyan-400" />
            </div>
            <div>
              <p className="text-white/60 text-sm">In Progress</p>
              <h3 className="text-2xl font-bold text-white">{inProgressCount}</h3>
            </div>
          </div>
        </GlassCard>
        <GlassCard>
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-emerald-500/20 flex items-center justify-center">
              <CheckCircle className="w-6 h-6 text-emerald-400" />
            </div>
            <div>
              <p className="text-white/60 text-sm">Completed</p>
              <h3 className="text-2xl font-bold text-white">{completedCount}</h3>
            </div>
          </div>
        </GlassCard>
      </div>

      <GlassCard className="space-y-4">
        <div className="flex flex-col gap-3 lg:flex-row lg:items-center">
          <div className="flex-1">
            <GlassInput
              placeholder="Search tests by patient or test name..."
              icon={<Search className="w-4 h-4" />}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <div className="flex flex-wrap gap-2">
            <GlassButton variant="ghost" className="flex items-center gap-2 px-4">
              <Filter className="w-4 h-4" />
              Panels
            </GlassButton>
            <GlassButton variant="primary" className="flex items-center gap-2 px-4">
              <FlaskConical className="w-4 h-4" />
              New test
            </GlassButton>
          </div>
        </div>
        <div className="flex flex-wrap gap-2">
          {statusTabs.map((tab) => {
            const active = statusFilter === tab.value;
            return (
              <button
                key={tab.value}
                onClick={() => setStatusFilter(tab.value)}
                className={cn(
                  'px-4 py-2 rounded-2xl border text-xs font-semibold flex items-center gap-2 transition-all',
                  active
                    ? 'bg-primary/20 border-primary/40 text-white shadow-lg shadow-primary/20'
                    : 'bg-white/5 border-white/10 text-white/60 hover:text-white'
                )}
              >
                <span>{tab.label}</span>
                <span className="text-[11px] text-white/50">{tab.count}</span>
              </button>
            );
          })}
        </div>
      </GlassCard>

      <div className="space-y-4">
        {filteredTests.map((test) => (
          <GlassCard key={test.id}>
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
