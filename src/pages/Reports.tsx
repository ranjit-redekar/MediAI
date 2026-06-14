import React, { useMemo, useState } from 'react';
import { FileText, Download, BarChart3, Users, TrendingUp } from 'lucide-react';
import { GlassCard } from '../components/ui/GlassCard';
import { GlassButton } from '../components/ui/GlassButton';
import { PageHeader } from '../components/ui/PageHeader';
import { SearchInput } from '../components/ui/SearchInput';
import { MiniStat } from '../components/ui/StatCard';
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
      <PageHeader
        title="Reports"
        subtitle="View and download system reports"
        actions={
          <GlassButton variant="primary">
            <Download className="w-4 h-4" />
            Generate report
          </GlassButton>
        }
      />

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        <MiniStat icon={FileText} label="Total Reports" value={24} tint="text-primary-light" ring="bg-primary/15" index={0} />
        <MiniStat icon={BarChart3} label="Generated This Month" value={8} tint="text-emerald-400" ring="bg-emerald-500/15" index={1} />
        <MiniStat icon={Users} label="Patient Reports" value={12} tint="text-accent-light" ring="bg-accent/15" index={2} />
        <MiniStat icon={TrendingUp} label="Financial Reports" value={6} tint="text-amber-400" ring="bg-amber-500/15" index={3} />
      </div>

      <GlassCard padding="sm">
        <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
          <SearchInput
            width="lg"
            placeholder="Search by name or type…"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
          <div className="flex flex-wrap gap-2">
            <GlassButton variant="ghost"><FileText className="w-4 h-4" /> Templates</GlassButton>
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
              {filtered.map((report, i) => (
                <tr key={report.id} className="reveal hover:bg-white/5 transition-colors" style={{ animationDelay: `${i * 40}ms` }}>
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
