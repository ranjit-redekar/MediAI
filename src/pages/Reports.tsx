import React from 'react';
import { FileText, Download, BarChart3, Users, TrendingUp } from 'lucide-react';
import { GlassCard } from '../components/ui/GlassCard';
import { GlassButton } from '../components/ui/GlassButton';
import { db } from '../data';

const reports = [
  { id: 1, title: 'Monthly Patient Report', type: 'Patients', date: '2024-03-01', size: '2.4 MB' },
  { id: 2, title: 'Revenue Analysis Q1', type: 'Financial', date: '2024-03-01', size: '1.8 MB' },
  { id: 3, title: 'Doctor Performance', type: 'Staff', date: '2024-02-28', size: '3.1 MB' },
  { id: 4, title: 'Lab Test Summary', type: 'Laboratory', date: '2024-02-28', size: '1.2 MB' },
  { id: 5, title: 'Pharmacy Inventory', type: 'Pharmacy', date: '2024-02-27', size: '0.9 MB' },
  { id: 6, title: 'AI Insights Report', type: 'AI Analytics', date: '2024-02-27', size: '2.7 MB' },
];

export const Reports: React.FC = () => {
  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-white">Reports</h1>
          <p className="text-white/60 mt-1">View and download system reports</p>
        </div>
        <GlassButton variant="primary">
          <Download className="w-4 h-4 mr-2" />
          Generate Report
        </GlassButton>
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
              {reports.map((report) => (
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
