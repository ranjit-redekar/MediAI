import React, { useMemo, useState } from 'react';
import { Search, Download, CreditCard, DollarSign, Filter, Printer } from 'lucide-react';
import { GlassCard } from '../components/ui/GlassCard';
import { GlassInput } from '../components/ui/GlassInput';
import { GlassBadge } from '../components/ui/GlassBadge';
import { GlassButton } from '../components/ui/GlassButton';
import { db } from '../data';
import { cn } from '../utils/cn';

export const Billing: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const statusTabs = useMemo(() => {
    const paid = db.bills.filter(b => b.status === 'Paid').length;
    const pending = db.bills.filter(b => b.status === 'Pending').length;
    const overdue = db.bills.filter(b => b.status === 'Overdue').length;
    return [
      { label: 'All invoices', value: 'all', count: db.bills.length },
      { label: 'Paid', value: 'Paid', count: paid },
      { label: 'Pending', value: 'Pending', count: pending },
      { label: 'Overdue', value: 'Overdue', count: overdue }
    ];
  }, []);

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
      <div className="space-y-1">
        <h1 className="text-3xl font-bold text-white">Billing</h1>
        <p className="text-white/60">Manage invoices and payments</p>
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

      <GlassCard className="space-y-4">
        <div className="flex flex-col gap-3 lg:flex-row lg:items-center">
          <div className="flex-1">
            <GlassInput
              placeholder="Search bills by patient or invoice id..."
              icon={<Search className="w-4 h-4" />}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <div className="flex flex-wrap gap-2">
            <GlassButton variant="ghost" className="flex items-center gap-2 px-4">
              <Filter className="w-4 h-4" />
              Advanced filters
            </GlassButton>
            <GlassButton variant="ghost" className="flex items-center gap-2 px-4">
              <Printer className="w-4 h-4" />
              Print batch
            </GlassButton>
            <GlassButton variant="primary" className="flex items-center gap-2 px-4">
              <Download className="w-4 h-4" />
              New invoice
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
