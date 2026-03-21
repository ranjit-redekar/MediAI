import React, { useState } from 'react';
import { Search, FlaskConical, CheckCircle, Clock, AlertCircle } from 'lucide-react';
import { GlassCard } from '../components/ui/GlassCard';
import { GlassInput } from '../components/ui/GlassInput';
import { GlassBadge } from '../components/ui/GlassBadge';
import { db } from '../data';

export const Laboratory: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('');

  const filteredTests = db.labTests.filter((test) =>
    test.patientName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    test.testName.toLowerCase().includes(searchTerm.toLowerCase())
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
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-white">Laboratory</h1>
          <p className="text-white/60 mt-1">Manage lab tests and results</p>
        </div>
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

      <GlassCard>
        <GlassInput
          placeholder="Search tests by patient or test name..."
          icon={<Search className="w-4 h-4" />}
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
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
