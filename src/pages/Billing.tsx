import React, { useMemo, useState } from 'react';
import { Download, CreditCard, DollarSign, Printer } from 'lucide-react';
import { GlassCard } from '../components/ui/GlassCard';
import { GlassBadge } from '../components/ui/GlassBadge';
import { GlassButton } from '../components/ui/GlassButton';
import { PageHeader } from '../components/ui/PageHeader';
import { SearchInput } from '../components/ui/SearchInput';
import { MiniStat } from '../components/ui/StatCard';
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
      <PageHeader
        title="Billing"
        subtitle="Manage invoices and payments"
        actions={
          <>
            <GlassButton variant="ghost"><Printer className="w-4 h-4" /> Print batch</GlassButton>
            <GlassButton variant="primary"><Download className="w-4 h-4" /> New invoice</GlassButton>
          </>
        }
      />

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
        <MiniStat icon={DollarSign} label="Total Revenue" value={totalRevenue} prefix="$" tint="text-emerald-400" ring="bg-emerald-500/15" index={0} />
        <MiniStat icon={CreditCard} label="Pending" value={pendingAmount} prefix="$" tint="text-amber-400" ring="bg-amber-500/15" index={1} />
        <MiniStat icon={DollarSign} label="Total Invoices" value={db.bills.length} tint="text-primary-light" ring="bg-primary/15" index={2} />
      </div>

      <GlassCard padding="sm">
        <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
          <SearchInput
            width="lg"
            placeholder="Search bills by patient or invoice id…"
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
              {filteredBills.map((bill, i) => (
                <tr key={bill.id} className="reveal hover:bg-white/5 transition-colors" style={{ animationDelay: `${i * 35}ms` }}>
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
