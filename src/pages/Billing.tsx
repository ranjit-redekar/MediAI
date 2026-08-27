import React, { useMemo, useState } from 'react';
import { Download, CreditCard, DollarSign, Printer, Receipt, FileWarning, Eye } from 'lucide-react';
import { GlassCard } from '../components/ui/GlassCard';
import { GlassBadge } from '../components/ui/GlassBadge';
import { GlassButton } from '../components/ui/GlassButton';
import { GlassModal } from '../components/ui/GlassModal';
import { PageHeader } from '../components/ui/PageHeader';
import { SearchInput } from '../components/ui/SearchInput';
import { FilterTabs } from '../components/ui/FilterTabs';
import { EmptyState } from '../components/ui/EmptyState';
import { SortableHeader, TableHeader, useSort } from '../components/ui/DataTable';
import { MiniStat } from '../components/ui/StatCard';
import { useToast } from '../context/ToastContext';
import { db } from '../data';
import type { Bill } from '../types';

const statusVariant = (status: string) => {
  switch (status) {
    case 'Paid': return 'success' as const;
    case 'Pending': return 'warning' as const;
    case 'Overdue': return 'danger' as const;
    default: return 'default' as const;
  }
};

export const Billing: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [selected, setSelected] = useState<Bill | null>(null);
  const { toast } = useToast();
  const { sortKey, direction, onSort, sortRows } = useSort<Bill>('date', 'desc');

  const statusTabs = useMemo(() => [
    { label: 'All invoices', value: 'all', count: db.bills.length },
    { label: 'Paid', value: 'Paid', count: db.bills.filter(b => b.status === 'Paid').length },
    { label: 'Pending', value: 'Pending', count: db.bills.filter(b => b.status === 'Pending').length },
    { label: 'Overdue', value: 'Overdue', count: db.bills.filter(b => b.status === 'Overdue').length },
  ], []);

  const query = searchTerm.trim().toLowerCase();
  const filteredBills = useMemo(() => {
    const rows = db.bills.filter(bill => {
      const matchesSearch =
        !query ||
        bill.patientName.toLowerCase().includes(query) ||
        bill.id.toLowerCase().includes(query);
      const matchesStatus = statusFilter === 'all' || bill.status === statusFilter;
      return matchesSearch && matchesStatus;
    });
    return sortRows(rows, {
      id: b => b.id,
      patientName: b => b.patientName,
      date: b => b.date,
      total: b => b.total,
      status: b => b.status,
    });
  }, [query, statusFilter, sortRows]);

  const totalRevenue = db.bills.filter(b => b.status === 'Paid').reduce((sum, b) => sum + b.total, 0);
  const pendingAmount = db.bills
    .filter(b => b.status === 'Pending' || b.status === 'Overdue')
    .reduce((sum, b) => sum + b.total, 0);
  const overdueCount = db.bills.filter(b => b.status === 'Overdue').length;

  const isFiltered = query !== '' || statusFilter !== 'all';
  const resetFilters = () => { setSearchTerm(''); setStatusFilter('all'); };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Billing"
        subtitle="Track invoices, payments, and outstanding balances"
        actions={
          <>
            <GlassButton
              variant="ghost"
              onClick={() =>
                toast('Batch print queued', {
                  description: `${filteredBills.length} invoice${filteredBills.length === 1 ? '' : 's'} sent to the printer queue.`,
                  variant: 'info',
                })
              }
            >
              <Printer className="w-4 h-4" /> Print batch
            </GlassButton>
            <GlassButton
              variant="primary"
              onClick={() =>
                toast('Invoice draft created', {
                  description: 'A blank invoice is ready. Connect billing to issue it for real.',
                })
              }
            >
              <Receipt className="w-4 h-4" /> New invoice
            </GlassButton>
          </>
        }
      />

      {overdueCount > 0 && (
        <div className="reveal flex items-start gap-3 p-4 rounded-2xl bg-red-500/[0.07] border border-red-500/20">
          <FileWarning className="w-5 h-5 text-red-400 flex-shrink-0 mt-0.5" />
          <div className="flex-1 min-w-0">
            <p className="text-sm font-semibold text-app">
              {overdueCount} invoice{overdueCount === 1 ? ' is' : 's are'} overdue
            </p>
            <p className="text-xs text-app-muted mt-0.5">
              Chase these first — they account for the largest share of your outstanding balance.
            </p>
          </div>
          <GlassButton variant="ghost" size="sm" onClick={() => setStatusFilter('Overdue')}>
            Review
          </GlassButton>
        </div>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
        <MiniStat icon={DollarSign} label="Collected" value={totalRevenue} prefix="$" tint="text-emerald-400" ring="bg-emerald-500/15" index={0} />
        <MiniStat icon={CreditCard} label="Outstanding" value={pendingAmount} prefix="$" tint="text-amber-400" ring="bg-amber-500/15" index={1} />
        <MiniStat icon={Receipt} label="Total Invoices" value={db.bills.length} tint="text-primary-light" ring="bg-primary/15" index={2} />
      </div>

      <GlassCard padding="sm" hover={false}>
        <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
          <SearchInput
            width="lg"
            placeholder="Search by patient or invoice ID…"
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
            aria-label="Search invoices"
          />
          <FilterTabs
            tabs={statusTabs}
            value={statusFilter}
            onChange={setStatusFilter}
            label="Filter invoices by status"
          />
        </div>
      </GlassCard>

      <GlassCard padding="none" hover={false} className="overflow-hidden">
        {filteredBills.length === 0 ? (
          <EmptyState
            icon={Receipt}
            title="No invoices match your filters"
            description="Try a different patient name or invoice ID, or clear the status filter to see everything."
            action={isFiltered ? { label: 'Clear filters', onClick: resetFilters } : undefined}
          />
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="w-full">
                <caption className="sr-only">
                  Invoices, sortable by ID, patient, date, total, and status
                </caption>
                <thead className="bg-[var(--surface-2)] border-b border-[var(--border)]">
                  <tr>
                    <SortableHeader label="Invoice ID" columnKey="id" activeKey={sortKey} direction={direction} onSort={onSort} />
                    <SortableHeader label="Patient" columnKey="patientName" activeKey={sortKey} direction={direction} onSort={onSort} />
                    <SortableHeader label="Date" columnKey="date" activeKey={sortKey} direction={direction} onSort={onSort} />
                    <TableHeader>Items</TableHeader>
                    <SortableHeader label="Total" columnKey="total" activeKey={sortKey} direction={direction} onSort={onSort} align="right" />
                    <SortableHeader label="Status" columnKey="status" activeKey={sortKey} direction={direction} onSort={onSort} align="center" />
                    <TableHeader align="right"><span className="sr-only">Actions</span></TableHeader>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[var(--border)]">
                  {filteredBills.map((bill, i) => (
                    <tr
                      key={bill.id}
                      className="reveal hover:bg-[var(--surface-2)] transition-colors"
                      style={{ animationDelay: `${Math.min(i, 12) * 35}ms` }}
                    >
                      <td className="px-6 py-4 text-app-muted font-mono text-sm">{bill.id}</td>
                      <td className="px-6 py-4 text-app font-medium">{bill.patientName}</td>
                      <td className="px-6 py-4 text-app-muted text-sm">{bill.date}</td>
                      <td className="px-6 py-4 text-app-muted text-sm">{bill.items.length} items</td>
                      <td className="px-6 py-4 text-right font-semibold text-app tabular-nums">
                        ${bill.total.toFixed(2)}
                      </td>
                      <td className="px-6 py-4 text-center">
                        <GlassBadge variant={statusVariant(bill.status)} size="sm">{bill.status}</GlassBadge>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <GlassButton
                          variant="ghost"
                          size="sm"
                          onClick={() => setSelected(bill)}
                          aria-label={`View invoice ${bill.id}`}
                        >
                          <Eye className="w-4 h-4" />
                        </GlassButton>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <div className="px-6 py-3 border-t border-[var(--border)] text-xs text-app-subtle">
              Showing {filteredBills.length} of {db.bills.length} invoices
            </div>
          </>
        )}
      </GlassCard>

      <GlassModal
        isOpen={selected !== null}
        onClose={() => setSelected(null)}
        title={selected ? `Invoice ${selected.id}` : ''}
        description={selected ? `${selected.patientName} · ${selected.date}` : undefined}
        size="lg"
        footer={
          <>
            <GlassButton variant="ghost" onClick={() => setSelected(null)}>Close</GlassButton>
            <GlassButton
              variant="primary"
              onClick={() => {
                toast('Invoice downloaded', {
                  description: `${selected?.id}.pdf saved to your downloads (demo).`,
                });
                setSelected(null);
              }}
            >
              <Download className="w-4 h-4" /> Download PDF
            </GlassButton>
          </>
        }
      >
        {selected && (
          <div className="space-y-5">
            <div className="flex items-center justify-between">
              <GlassBadge variant={statusVariant(selected.status)}>{selected.status}</GlassBadge>
              <p className="text-2xl font-bold text-app tabular-nums">${selected.total.toFixed(2)}</p>
            </div>

            <div className="rounded-xl border border-[var(--border)] overflow-hidden">
              <table className="w-full text-sm">
                <thead className="bg-[var(--surface-2)]">
                  <tr>
                    <TableHeader className="!py-2.5 !px-4">Line item</TableHeader>
                    <TableHeader align="center" className="!py-2.5 !px-4">Qty</TableHeader>
                    <TableHeader align="right" className="!py-2.5 !px-4">Unit</TableHeader>
                    <TableHeader align="right" className="!py-2.5 !px-4">Amount</TableHeader>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[var(--border)]">
                  {selected.items.map(item => (
                    <tr key={item.id}>
                      <td className="px-4 py-3 text-app">{item.description}</td>
                      <td className="px-4 py-3 text-center text-app-muted tabular-nums">{item.quantity}</td>
                      <td className="px-4 py-3 text-right text-app-muted tabular-nums">${item.unitPrice.toFixed(2)}</td>
                      <td className="px-4 py-3 text-right text-app font-medium tabular-nums">${item.total.toFixed(2)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <dl className="space-y-2 text-sm">
              <div className="flex justify-between">
                <dt className="text-app-muted">Subtotal</dt>
                <dd className="text-app tabular-nums">${selected.subtotal.toFixed(2)}</dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-app-muted">Tax</dt>
                <dd className="text-app tabular-nums">${selected.tax.toFixed(2)}</dd>
              </div>
              {selected.discount > 0 && (
                <div className="flex justify-between">
                  <dt className="text-app-muted">Discount</dt>
                  <dd className="text-emerald-400 tabular-nums">-${selected.discount.toFixed(2)}</dd>
                </div>
              )}
              <div className="flex justify-between pt-2 border-t border-[var(--border)] font-semibold">
                <dt className="text-app">Total</dt>
                <dd className="text-app tabular-nums">${selected.total.toFixed(2)}</dd>
              </div>
              {selected.paymentMethod && (
                <div className="flex justify-between pt-1">
                  <dt className="text-app-muted">Payment method</dt>
                  <dd className="text-app-muted">{selected.paymentMethod}</dd>
                </div>
              )}
            </dl>
          </div>
        )}
      </GlassModal>
    </div>
  );
};
