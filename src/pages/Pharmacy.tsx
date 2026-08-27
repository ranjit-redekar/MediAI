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
import { db } from '../data';
import { cn } from '../utils/cn';

const statusVariant = (status: string) => {
  switch (status) {
    case 'In Stock': return 'success' as const;
    case 'Low Stock': return 'warning' as const;
    case 'Out of Stock': return 'danger' as const;
    default: return 'default' as const;
  }
};

/** Days until a date string, used to surface medicines expiring soon. */
const daysUntil = (date: string) =>
  Math.ceil((new Date(date).getTime() - Date.now()) / 86_400_000);

export const Pharmacy: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');
  const { toast } = useToast();

  const statusTabs = useMemo(() => [
    { label: 'All items', value: 'All', count: db.medicines.length },
    { label: 'In stock', value: 'In Stock', count: db.medicines.filter(m => m.status === 'In Stock').length },
    { label: 'Low stock', value: 'Low Stock', count: db.medicines.filter(m => m.status === 'Low Stock').length },
    { label: 'Out of stock', value: 'Out of Stock', count: db.medicines.filter(m => m.status === 'Out of Stock').length },
  ], []);

  const query = searchTerm.trim().toLowerCase();
  const filteredMedicines = db.medicines.filter(med =>
    (!query || med.name.toLowerCase().includes(query) || med.category.toLowerCase().includes(query)) &&
    (statusFilter === 'All' || med.status === statusFilter)
  );

  const lowStockCount = db.medicines.filter(m => m.status === 'Low Stock').length;
  const outOfStockCount = db.medicines.filter(m => m.status === 'Out of Stock').length;
  const expiringSoon = db.medicines.filter(m => {
    const d = daysUntil(m.expiryDate);
    return d > 0 && d <= 90;
  });

  const isFiltered = query !== '' || statusFilter !== 'All';
  const resetFilters = () => { setSearchTerm(''); setStatusFilter('All'); };

  const reorder = (name: string) =>
    toast('Reorder requested', {
      description: `A purchase order for ${name} was drafted for the supplier.`,
      variant: 'info',
    });

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

      {(outOfStockCount > 0 || expiringSoon.length > 0) && (
        <div className="reveal flex flex-col sm:flex-row items-start sm:items-center gap-3 p-4 rounded-2xl bg-amber-500/[0.07] border border-amber-500/20">
          <AlertTriangle className="w-5 h-5 text-amber-400 flex-shrink-0" />
          <div className="flex-1 min-w-0">
            <p className="text-sm font-semibold text-app">Supply needs attention</p>
            <p className="text-xs text-app-muted mt-0.5">
              {outOfStockCount > 0 && `${outOfStockCount} item${outOfStockCount === 1 ? '' : 's'} out of stock`}
              {outOfStockCount > 0 && expiringSoon.length > 0 && ' · '}
              {expiringSoon.length > 0 && `${expiringSoon.length} expiring within 90 days`}
            </p>
          </div>
          {outOfStockCount > 0 && (
            <GlassButton variant="ghost" size="sm" onClick={() => setStatusFilter('Out of Stock')}>
              Show items
            </GlassButton>
          )}
        </div>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        <MiniStat icon={Package} label="Total Medicines" value={db.medicines.length} tint="text-emerald-400" ring="bg-emerald-500/15" index={0} />
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
            const days = daysUntil(medicine.expiryDate);
            const expirySoon = days > 0 && days <= 90;
            const expired = days <= 0;
            // Stock bar is relative to a 200-unit "healthy" shelf target.
            const stockPct = Math.min(100, Math.round((medicine.stock / 200) * 100));

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
                  <GlassBadge variant={statusVariant(medicine.status)} size="sm">{medicine.status}</GlassBadge>
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
                      aria-valuemax={200}
                      aria-label={`${medicine.name} stock level`}
                    >
                      <div
                        className={cn(
                          'h-full rounded-full transition-all duration-700',
                          medicine.status === 'Out of Stock' ? 'bg-red-400'
                            : medicine.status === 'Low Stock' ? 'bg-amber-400'
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

                {medicine.status !== 'In Stock' && (
                  <GlassButton
                    variant="default"
                    size="sm"
                    className="w-full mt-4"
                    onClick={() => reorder(medicine.name)}
                  >
                    <ShoppingCart className="w-3.5 h-3.5" /> Reorder
                  </GlassButton>
                )}
              </GlassCard>
            );
          })}
        </div>
      )}
    </div>
  );
};
