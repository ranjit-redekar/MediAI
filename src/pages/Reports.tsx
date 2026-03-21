import React, { useMemo, useState } from 'react';
import { FileText, Download, BarChart3, Users, TrendingUp, Search, Filter } from 'lucide-react';
import { GlassCard } from '../components/ui/GlassCard';
import { GlassButton } from '../components/ui/GlassButton';
import { GlassInput } from '../components/ui/GlassInput';
import { cn } from '../utils/cn';

const reports = [
  { id: 1, title: 'Monthly Patient Report', type: 'Patients', date: '2024-03-01', size: '2.4 MB' },
  { id: 2, title: 'Revenue Analysis Q1', type: 'Financial', date: '2024-03-01', size: '1.8 MB' },
  { id: 3, title: 'Doctor Performance', type: 'Staff', date: '2024-02-28', size: '3.1 MB' },
  { id: 4, title: 'Lab Test Summary', type: 'Laboratory', date: '2024-02-28', size: '1.2 MB' },
  { id: 5, title: 'Pharmacy Inventory', type: 'Pharmacy', date: '2024-02-27', size: '0.9 MB' },
  { id: 6, title: 'AI Insights Report', type: 'AI Analytics', date: '2024-02-27', size: '2.7 MB' },
];

export const Reports: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [typeFilter, setTypeFilter] = useState('All');
  const typeTabs = useMemo(() => {
    const map = reports.reduce<Record<string, number>>((acc, report) => {
      acc[report.type] = (acc[report.type] ?? 0) + 1;
      return acc;
    }, {});
    return [
      { label: 'All categories', value: 'All', count: reports.length },
      ...Object.entries(map).map(([label, count]) => ({
        label,
        value: label,
        count
      }))
    ];
  }, []);
  const filtered = reports.filter(report =>
    (report.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    report.type.toLowerCase().includes(searchTerm.toLowerCase())) &&
    (typeFilter === 'All' || report.type === typeFilter)
  );
  return (
    <div className="space-y-6">
      <div className="space-y-1">
        <h1 className="text-3xl font-bold text-white">Reports</h1>
        <p className="text-white/60">View and download system reports</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <GlassCard>
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-primary/20 flex items-center justify-center">
              <FileText className="w-6 h-6 text-primary" />
            </div>
            <div>
              <p className="text-white/60 text-sm">Total Reports</p>
              <h3 className="text-2xl font-bold text-white">24</h3>
            </div>
          </div>
        </GlassCard>
        <GlassCard>
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-emerald-500/20 flex items-center justify-center">
              <BarChart3 className="w-6 h-6 text-emerald-400" />
            </div>
            <div>
              <p className="text-white/60 text-sm">Generated This Month</p>
              <h3 className="text-2xl font-bold text-white">8</h3>
            </div>
          </div>
        </GlassCard>
        <GlassCard>
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-accent/20 flex items-center justify-center">
              <Users className="w-6 h-6 text-accent" />
            </div>
            <div>
              <p className="text-white/60 text-sm">Patient Reports</p>
              <h3 className="text-2xl font-bold text-white">12</h3>
            </div>
          </div>
        </GlassCard>
        <GlassCard>
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-amber-500/20 flex items-center justify-center">
              <TrendingUp className="w-6 h-6 text-amber-400" />
            </div>
            <div>
              <p className="text-white/60 text-sm">Financial Reports</p>
              <h3 className="text-2xl font-bold text-white">6</h3>
            </div>
          </div>
        </GlassCard>
      </div>

      <GlassCard className="space-y-4">
        <div className="flex flex-col gap-3 lg:flex-row lg:items-center">
          <div className="flex-1">
            <GlassInput
              placeholder="Search by name or type..."
              icon={<Search className="w-4 h-4" />}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <div className="flex flex-wrap gap-2">
            <GlassButton variant="ghost" className="flex items-center gap-2 px-4">
              <Filter className="w-4 h-4" />
              Templates
            </GlassButton>
            <GlassButton variant="primary" className="flex items-center gap-2 px-4">
              <Download className="w-4 h-4" />
              Generate report
            </GlassButton>
          </div>
        </div>
        <div className="flex flex-wrap gap-2">
          {typeTabs.map((tab) => {
            const active = typeFilter === tab.value;
            return (
              <button
                key={tab.value}
                onClick={() => setTypeFilter(tab.value)}
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

      <GlassCard padding="none" className="overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-white/5 border-b border-white/10">
              <tr>
                <th className="text-left text-sm font-medium text-white/70 px-6 py-4">Report Name</th>
                <th className="text-left text-sm font-medium text-white/70 px-6 py-4">Type</th>
                <th className="text-left text-sm font-medium text-white/70 px-6 py-4">Date</th>
                <th className="text-left text-sm font-medium text-white/70 px-6 py-4">Size</th>
                <th className="text-right text-sm font-medium text-white/70 px-6 py-4">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {filtered.map((report) => (
                <tr key={report.id} className="hover:bg-white/5 transition-colors">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <FileText className="w-5 h-5 text-primary" />
                      <span className="text-white font-medium">{report.title}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-white/70">{report.type}</td>
                  <td className="px-6 py-4 text-white/70">{report.date}</td>
                  <td className="px-6 py-4 text-white/70">{report.size}</td>
                  <td className="px-6 py-4 text-right">
                    <GlassButton variant="ghost" size="sm">
                      <Download className="w-4 h-4" />
                    </GlassButton>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </GlassCard>
    </div>
  );
};
