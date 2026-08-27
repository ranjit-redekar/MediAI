import React, { useMemo, useState } from 'react';
import { FileText, Download, BarChart3, Users, TrendingUp, FileSpreadsheet, Sparkles } from 'lucide-react';
import { GlassCard } from '../components/ui/GlassCard';
import { GlassButton } from '../components/ui/GlassButton';
import { GlassBadge } from '../components/ui/GlassBadge';
import { PageHeader } from '../components/ui/PageHeader';
import { SearchInput } from '../components/ui/SearchInput';
import { FilterTabs } from '../components/ui/FilterTabs';
import { EmptyState } from '../components/ui/EmptyState';
import { SortableHeader, TableHeader, useSort } from '../components/ui/DataTable';
import { MiniStat } from '../components/ui/StatCard';
import { useToast } from '../context/ToastContext';

interface Report {
  id: number;
  title: string;
  type: string;
  date: string;
  size: string;
  /** Rough byte weight, used so the Size column sorts numerically. */
  bytes: number;
}

const reports: Report[] = [
  { id: 1, title: 'Monthly Patient Report', type: 'Patients',     date: '2024-03-01', size: '2.4 MB', bytes: 2_400_000 },
  { id: 2, title: 'Revenue Analysis Q1',    type: 'Financial',    date: '2024-03-01', size: '1.8 MB', bytes: 1_800_000 },
  { id: 3, title: 'Doctor Performance',     type: 'Staff',        date: '2024-02-28', size: '3.1 MB', bytes: 3_100_000 },
  { id: 4, title: 'Lab Test Summary',       type: 'Laboratory',   date: '2024-02-28', size: '1.2 MB', bytes: 1_200_000 },
  { id: 5, title: 'Pharmacy Inventory',     type: 'Pharmacy',     date: '2024-02-27', size: '0.9 MB', bytes:   900_000 },
  { id: 6, title: 'AI Insights Report',     type: 'AI Analytics', date: '2024-02-27', size: '2.7 MB', bytes: 2_700_000 },
];

export const Reports: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [typeFilter, setTypeFilter] = useState('All');
  const { toast } = useToast();
  const { sortKey, direction, onSort, sortRows } = useSort<Report>('date', 'desc');

  const typeTabs = useMemo(() => {
    const counts = reports.reduce<Record<string, number>>((acc, r) => {
      acc[r.type] = (acc[r.type] ?? 0) + 1;
      return acc;
    }, {});
    return [
      { label: 'All categories', value: 'All', count: reports.length },
      ...Object.entries(counts).map(([label, count]) => ({ label, value: label, count })),
    ];
  }, []);

  const query = searchTerm.trim().toLowerCase();
  const filtered = useMemo(() => {
    const rows = reports.filter(report =>
      (!query || report.title.toLowerCase().includes(query) || report.type.toLowerCase().includes(query)) &&
      (typeFilter === 'All' || report.type === typeFilter)
    );
    return sortRows(rows, {
      title: r => r.title,
      type: r => r.type,
      date: r => r.date,
      bytes: r => r.bytes,
    });
  }, [query, typeFilter, sortRows]);

  const isFiltered = query !== '' || typeFilter !== 'All';
  const resetFilters = () => { setSearchTerm(''); setTypeFilter('All'); };

  const download = (title: string) =>
    toast('Download started', {
      description: `${title}.pdf is being prepared (demo — no file is written).`,
      variant: 'info',
    });

  return (
    <div className="space-y-6">
      <PageHeader
        title="Reports"
        subtitle="Generate, browse, and export operational reports"
        actions={
          <>
            <GlassButton
              variant="ghost"
              onClick={() => toast('Template library', { description: 'Report templates open here once reporting is connected.', variant: 'info' })}
            >
              <FileSpreadsheet className="w-4 h-4" /> Templates
            </GlassButton>
            <GlassButton
              variant="primary"
              onClick={() => toast('Report queued', { description: 'Your report will appear in this list when it finishes building.', variant: 'ai' })}
            >
              <Sparkles className="w-4 h-4" /> Generate report
            </GlassButton>
          </>
        }
      />

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-5">
        <MiniStat icon={FileText} label="Total Reports" value={24} tint="text-primary-light" ring="bg-primary/15" index={0} />
        <MiniStat icon={BarChart3} label="This Month" value={8} tint="text-emerald-400" ring="bg-emerald-500/15" index={1} />
        <MiniStat icon={Users} label="Patient Reports" value={12} tint="text-accent-light" ring="bg-accent/15" index={2} />
        <MiniStat icon={TrendingUp} label="Financial Reports" value={6} tint="text-amber-400" ring="bg-amber-500/15" index={3} />
      </div>

      <GlassCard padding="sm" hover={false}>
        <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
          <SearchInput
            width="lg"
            placeholder="Search reports by name or type…"
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
            aria-label="Search reports"
          />
          <FilterTabs
            tabs={typeTabs}
            value={typeFilter}
            onChange={setTypeFilter}
            label="Filter reports by category"
          />
        </div>
      </GlassCard>

      <GlassCard padding="none" hover={false} className="overflow-hidden">
        {filtered.length === 0 ? (
          <EmptyState
            icon={FileText}
            title="No reports match your filters"
            description="Try a different name or category, or generate a new report to add one to the catalog."
            action={isFiltered ? { label: 'Clear filters', onClick: resetFilters } : undefined}
          />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <caption className="sr-only">Report catalog, sortable by name, type, date, and size</caption>
              <thead className="bg-[var(--surface-2)] border-b border-[var(--border)]">
                <tr>
                  <SortableHeader label="Report Name" columnKey="title" activeKey={sortKey} direction={direction} onSort={onSort} />
                  <SortableHeader label="Type" columnKey="type" activeKey={sortKey} direction={direction} onSort={onSort} />
                  <SortableHeader label="Date" columnKey="date" activeKey={sortKey} direction={direction} onSort={onSort} />
                  <SortableHeader label="Size" columnKey="bytes" activeKey={sortKey} direction={direction} onSort={onSort} />
                  <TableHeader align="right"><span className="sr-only">Actions</span></TableHeader>
                </tr>
              </thead>
              <tbody className="divide-y divide-[var(--border)]">
                {filtered.map((report, i) => (
                  <tr
                    key={report.id}
                    className="reveal hover:bg-[var(--surface-2)] transition-colors"
                    style={{ animationDelay: `${i * 40}ms` }}
                  >
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-lg bg-primary/15 flex items-center justify-center flex-shrink-0">
                          <FileText className="w-4 h-4 text-primary" />
                        </div>
                        <span className="text-app font-medium">{report.title}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <GlassBadge size="sm">{report.type}</GlassBadge>
                    </td>
                    <td className="px-6 py-4 text-app-muted text-sm">{report.date}</td>
                    <td className="px-6 py-4 text-app-muted text-sm tabular-nums">{report.size}</td>
                    <td className="px-6 py-4 text-right">
                      <GlassButton
                        variant="ghost"
                        size="sm"
                        onClick={() => download(report.title)}
                        aria-label={`Download ${report.title}`}
                      >
                        <Download className="w-4 h-4" />
                      </GlassButton>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </GlassCard>
    </div>
  );
};
