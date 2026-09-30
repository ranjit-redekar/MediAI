import React, { useMemo, useState } from 'react';
import { Pill, AlertTriangle, Package, Plus, CalendarClock, ShoppingCart } from 'lucide-react';
import { GlassCard } from '../components/ui/GlassCard';
import { GlassBadge } from '../components/ui/GlassBadge';
import { GlassButton } from '../components/ui/GlassButton';
import { PageHeader } from '../components/ui/PageHeader';
import { SearchInput } from '../components/ui/SearchInput';
import { FilterTabs } from '../components/ui/FilterTabs';
import { EmptyState } from '../components/ui/EmptyState';
import { MiniStat } from '../components/ui/StatCard';
import { useToast } from '../context/ToastContext';
import { useAIActions } from '../context/AIActionsContext';
import { db } from '../data';
import { daysUntilExpiry, stockStatus, TARGET_STOCK_UNITS } from '../data/pharmacy';
import type { StockStatus } from '../types';
import { cn } from '../utils/cn';

const statusVariant = (status: StockStatus) => {
  switch (status) {
    case 'In Stock': return 'success' as const;
    case 'Low Stock': return 'warning' as const;
    case 'Out of Stock':
    case 'Expired': return 'danger' as const;
  }
};

const countBy = (status: StockStatus) => db.medicines.filter(m => stockStatus(m) === status).length;

export const Pharmacy: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');
  const { toast } = useToast();

  const statusTabs = useMemo(() => [
    { label: 'All items', value: 'All', count: db.medicines.length },
    { label: 'In stock', value: 'In Stock', count: countBy('In Stock') },
    { label: 'Low stock', value: 'Low Stock', count: countBy('Low Stock') },
    { label: 'Out of stock', value: 'Out of Stock', count: countBy('Out of Stock') },
    { label: 'Expired', value: 'Expired', count: countBy('Expired') },
  ], []);

  const query = searchTerm.trim().toLowerCase();
  const filteredMedicines = db.medicines.filter(med =>
    (!query || med.name.toLowerCase().includes(query) || med.category.toLowerCase().includes(query)) &&
    (statusFilter === 'All' || stockStatus(med) === statusFilter)
  );

  const lowStockCount = countBy('Low Stock');
  const outOfStockCount = countBy('Out of Stock');
  const expiredCount = countBy('Expired');
  const expiringSoon = db.medicines.filter(m => {
    const d = daysUntilExpiry(m);
    return m.stock > 0 && d > 0 && d <= 90;
  });

  const isFiltered = query !== '' || statusFilter !== 'All';
  const resetFilters = () => { setSearchTerm(''); setStatusFilter('All'); };

  // The card's button acts on the same reorder draft that sits in the queue,
  // so approving in either place is one decision, not two purchase orders.
  const { allActions, statusOf, approve, reset, canAction } = useAIActions();
  const reorderDraft = (medicineId: string) => allActions.find(a => a.id === `STOCK-${medicineId}-reorder`);
  const approveReorder = (medicineId: string) => {
    const draft = reorderDraft(medicineId);
    if (!draft) return;
    approve(draft.id);
    toast('Reorder approved', {
      description: draft.detail,
      variant: 'ai',
      action: { label: 'Undo', onClick: () => reset(draft.id) },
    });
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Pharmacy"
        subtitle="Stock levels, expiry windows, and supply risk at a glance"
        actions={
          <GlassButton
            variant="primary"
            onClick={() => toast('New item form ready', { description: 'Connect inventory to save real stock records.' })}
          >
            <Plus className="w-4 h-4" /> New item
          </GlassButton>
        }
      />

      {(expiredCount > 0 || outOfStockCount > 0 || expiringSoon.length > 0) && (
        <div className="reveal flex flex-col sm:flex-row items-start sm:items-center gap-3 p-4 rounded-2xl bg-amber-500/[0.07] border border-amber-500/20">
          <AlertTriangle className="w-5 h-5 text-amber-400 flex-shrink-0" />
          <div className="flex-1 min-w-0">
            <p className="text-sm font-semibold text-app">Supply needs attention</p>
            <p className="text-xs text-app-muted mt-0.5">
              {[
                expiredCount > 0 && `${expiredCount} expired batch${expiredCount === 1 ? '' : 'es'} still on the shelf`,
                outOfStockCount > 0 && `${outOfStockCount} out of stock`,
                expiringSoon.length > 0 && `${expiringSoon.length} expiring within 90 days`,
              ].filter(Boolean).join(' · ')}
            </p>
          </div>
          {(expiredCount > 0 || outOfStockCount > 0) && (
            <GlassButton variant="ghost" size="sm" onClick={() => setStatusFilter(expiredCount > 0 ? 'Expired' : 'Out of Stock')}>
              Show items
            </GlassButton>
          )}
        </div>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        <MiniStat icon={Package} label="Expired on shelf" value={expiredCount} tint="text-red-400" ring="bg-red-500/15" index={0} />
        <MiniStat icon={AlertTriangle} label="Low Stock" value={lowStockCount} tint="text-amber-400" ring="bg-amber-500/15" index={1} />
        <MiniStat icon={Pill} label="Out of Stock" value={outOfStockCount} tint="text-red-400" ring="bg-red-500/15" index={2} />
        <MiniStat icon={CalendarClock} label="Expiring ≤ 90d" value={expiringSoon.length} tint="text-cyan-400" ring="bg-cyan-500/15" index={3} />
      </div>

      <GlassCard padding="sm" hover={false}>
        <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
          <SearchInput
            width="lg"
            placeholder="Search medicines by name or category…"
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
            aria-label="Search medicines"
          />
          <FilterTabs
            tabs={statusTabs}
            value={statusFilter}
            onChange={setStatusFilter}
            label="Filter medicines by stock status"
          />
        </div>
      </GlassCard>

      {filteredMedicines.length === 0 ? (
        <GlassCard hover={false} padding="none">
          <EmptyState
            icon={Pill}
            title="No medicines match your filters"
            description="Try another name or category, or clear the stock filter to see the full inventory."
            action={isFiltered ? { label: 'Clear filters', onClick: resetFilters } : undefined}
          />
        </GlassCard>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
          {filteredMedicines.map((medicine, i) => {
            const status = stockStatus(medicine);
            const days = daysUntilExpiry(medicine);
            const expirySoon = days > 0 && days <= 90;
            const expired = days <= 0;
            const stockPct = Math.min(100, Math.round((medicine.stock / TARGET_STOCK_UNITS) * 100));

            return (
              <GlassCard
                key={medicine.id}
                hover={false}
                className="reveal hover-lift flex flex-col"
                style={{ animationDelay: `${Math.min(i, 12) * 45}ms` }}
              >
                <div className="flex items-start justify-between mb-4">
                  <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-primary/20 to-accent/20 flex items-center justify-center">
                    <Pill className="w-6 h-6 text-primary" />
                  </div>
                  <GlassBadge variant={statusVariant(status)} size="sm">{status}</GlassBadge>
                </div>

                <h3 className="font-semibold text-app text-lg leading-snug">{medicine.name}</h3>
                <p className="text-app-muted text-sm">{medicine.category}</p>
                <p className="text-app-subtle text-xs mt-1">{medicine.manufacturer}</p>

                <div className="mt-4 pt-4 border-t border-[var(--border)] space-y-3 flex-1">
                  <div>
                    <div className="flex justify-between text-sm mb-1.5">
                      <span className="text-app-subtle">Stock</span>
                      <span className="text-app font-medium tabular-nums">{medicine.stock} units</span>
                    </div>
                    <div
                      className="h-1.5 rounded-full bg-[var(--surface-3)] overflow-hidden"
                      role="progressbar"
                      aria-valuenow={medicine.stock}
                      aria-valuemin={0}
                      aria-valuemax={TARGET_STOCK_UNITS}
                      aria-label={`${medicine.name} stock level`}
                    >
                      <div
                        className={cn(
                          'h-full rounded-full transition-all duration-700',
                          status === 'Out of Stock' || status === 'Expired' ? 'bg-red-400'
                            : status === 'Low Stock' ? 'bg-amber-400'
                            : 'bg-emerald-400'
                        )}
                        style={{ width: `${stockPct}%` }}
                      />
                    </div>
                  </div>

                  <div className="flex justify-between text-sm">
                    <span className="text-app-subtle">Price</span>
                    <span className="text-app tabular-nums">${medicine.unitPrice.toFixed(2)}</span>
                  </div>

                  <div className="flex justify-between text-sm">
                    <span className="text-app-subtle">Expires</span>
                    <span className={cn(
                      'tabular-nums',
                      expired ? 'text-red-400 font-medium'
                        : expirySoon ? 'text-amber-400 font-medium'
                        : 'text-app-muted'
                    )}>
                      {medicine.expiryDate}
                      {expirySoon && ` · ${days}d`}
                      {expired && ' · expired'}
                    </span>
                  </div>
                </div>

                {(() => {
                  const draft = reorderDraft(medicine.id);
                  if (!draft) return null;
                  if (statusOf(draft.id) === 'approved') {
                    return <p className="mt-4 text-sm font-medium text-emerald-400 text-center">Reorder approved</p>;
                  }
                  if (!canAction(draft)) {
                    return <p className="mt-4 text-xs text-app-subtle text-center">Reorder drafted for the pharmacist</p>;
                  }
                  return (
                    <GlassButton variant="default" size="sm" className="w-full mt-4" onClick={() => approveReorder(medicine.id)}>
                      <ShoppingCart className="w-3.5 h-3.5" /> Approve reorder · {TARGET_STOCK_UNITS - (status === 'Expired' ? 0 : medicine.stock)} units
                    </GlassButton>
                  );
                })()}
              </GlassCard>
            );
          })}
        </div>
      )}
    </div>
  );
};
