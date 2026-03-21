import React, { useState } from 'react';
import { Search, Download, CreditCard, DollarSign } from 'lucide-react';
import { GlassCard } from '../components/ui/GlassCard';
import { GlassInput } from '../components/ui/GlassInput';
import { GlassBadge } from '../components/ui/GlassBadge';
import { GlassButton } from '../components/ui/GlassButton';
import { db } from '../data';

export const Billing: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');

  const filteredBills = db.bills.filter((bill) => {
    const matchesSearch = bill.patientName.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || bill.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const totalRevenue = db.bills.filter(b => b.status === 'Paid').reduce((sum, b) => sum + b.total, 0);
  const pendingAmount = db.bills.filter(b => b.status === 'Pending' || b.status === 'Overdue').reduce((sum, b) => sum + b.total, 0);

  const getStatusVariant = (status: string) => {
    switch (status) {
      case 'Paid': return 'success';
      case 'Pending': return 'warning';
      case 'Overdue': return 'danger';
      default: return 'default';
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-white">Billing</h1>
          <p className="text-white/60 mt-1">Manage invoices and payments</p>
        </div>
        <GlassButton variant="primary">
          <Download className="w-4 h-4 mr-2" />
          Export
        </GlassButton>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
        <GlassCard>
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-emerald-500/20 flex items-center justify-center">
              <DollarSign className="w-6 h-6 text-emerald-400" />
            </div>
            <div>
              <p className="text-white/60 text-sm">Total Revenue</p>
              <h3 className="text-2xl font-bold text-white">${totalRevenue.toLocaleString()}</h3>
            </div>
          </div>
        </GlassCard>
        <GlassCard>
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-amber-500/20 flex items-center justify-center">
              <CreditCard className="w-6 h-6 text-amber-400" />
            </div>
            <div>
              <p className="text-white/60 text-sm">Pending</p>
              <h3 className="text-2xl font-bold text-white">${pendingAmount.toLocaleString()}</h3>
            </div>
          </div>
        </GlassCard>
        <GlassCard>
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-primary/20 flex items-center justify-center">
              <DollarSign className="w-6 h-6 text-primary" />
            </div>
            <div>
              <p className="text-white/60 text-sm">Total Invoices</p>
              <h3 className="text-2xl font-bold text-white">{db.bills.length}</h3>
            </div>
          </div>
        </GlassCard>
      </div>

      <GlassCard>
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="flex-1">
            <GlassInput
              placeholder="Search bills by patient name..."
              icon={<Search className="w-4 h-4" />}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="glass-input px-4 py-2 rounded-xl bg-white/5 border border-white/10 text-white"
          >
            <option value="all" className="bg-slate-900">All Status</option>
            <option value="Paid" className="bg-slate-900">Paid</option>
            <option value="Pending" className="bg-slate-900">Pending</option>
            <option value="Overdue" className="bg-slate-900">Overdue</option>
          </select>
        </div>
      </GlassCard>

      <GlassCard padding="none" className="overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-white/5 border-b border-white/10">
              <tr>
                <th className="text-left text-sm font-medium text-white/70 px-6 py-4">Invoice ID</th>
                <th className="text-left text-sm font-medium text-white/70 px-6 py-4">Patient</th>
                <th className="text-left text-sm font-medium text-white/70 px-6 py-4">Date</th>
                <th className="text-left text-sm font-medium text-white/70 px-6 py-4">Items</th>
                <th className="text-right text-sm font-medium text-white/70 px-6 py-4">Total</th>
                <th className="text-center text-sm font-medium text-white/70 px-6 py-4">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {filteredBills.map((bill) => (
                <tr key={bill.id} className="hover:bg-white/5 transition-colors">
                  <td className="px-6 py-4 text-white/70">{bill.id}</td>
                  <td className="px-6 py-4 text-white">{bill.patientName}</td>
                  <td className="px-6 py-4 text-white/70">{bill.date}</td>
                  <td className="px-6 py-4 text-white/70">{bill.items.length} items</td>
                  <td className="px-6 py-4 text-right font-medium text-white">${bill.total.toFixed(2)}</td>
                  <td className="px-6 py-4 text-center">
                    <GlassBadge variant={getStatusVariant(bill.status)}>{bill.status}</GlassBadge>
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
