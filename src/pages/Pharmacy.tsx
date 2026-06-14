import React, { useMemo, useState } from 'react';
import { Pill, AlertTriangle, Package, Plus } from 'lucide-react';
import { GlassCard } from '../components/ui/GlassCard';
import { GlassBadge } from '../components/ui/GlassBadge';
import { GlassButton } from '../components/ui/GlassButton';
import { PageHeader } from '../components/ui/PageHeader';
import { SearchInput } from '../components/ui/SearchInput';
import { MiniStat } from '../components/ui/StatCard';
import { db } from '../data';
import { cn } from '../utils/cn';

export const Pharmacy: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('All');
  const statusTabs = useMemo(() => {
    const inStock = db.medicines.filter(m => m.status === 'In Stock').length;
    const low = db.medicines.filter(m => m.status === 'Low Stock').length;
    const out = db.medicines.filter(m => m.status === 'Out of Stock').length;
    return [
      { label: 'All items', value: 'All', count: db.medicines.length },
      { label: 'In stock', value: 'In Stock', count: inStock },
      { label: 'Low stock', value: 'Low Stock', count: low },
      { label: 'Out of stock', value: 'Out of Stock', count: out }
    ];
  }, []);

  const filteredMedicines = db.medicines.filter((med) =>
    (med.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    med.category.toLowerCase().includes(searchTerm.toLowerCase())) &&
    (statusFilter === 'All' || med.status === statusFilter)
  );

  const lowStockCount = db.medicines.filter(m => m.status === 'Low Stock').length;
  const outOfStockCount = db.medicines.filter(m => m.status === 'Out of Stock').length;

  const getStatusVariant = (status: string) => {
    switch (status) {
      case 'In Stock': return 'success';
      case 'Low Stock': return 'warning';
      case 'Out of Stock': return 'danger';
      default: return 'default';
    }
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Pharmacy"
        subtitle="Manage medicine inventory"
        actions={
          <GlassButton variant="primary">
            <Plus className="w-4 h-4" />
            New item
          </GlassButton>
        }
      />

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
        <MiniStat icon={Package} label="Total Medicines" value={db.medicines.length} tint="text-emerald-400" ring="bg-emerald-500/15" index={0} />
        <MiniStat icon={AlertTriangle} label="Low Stock" value={lowStockCount} tint="text-amber-400" ring="bg-amber-500/15" index={1} />
        <MiniStat icon={Pill} label="Out of Stock" value={outOfStockCount} tint="text-red-400" ring="bg-red-500/15" index={2} />
      </div>

      <GlassCard padding="sm">
        <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
          <SearchInput
            width="lg"
            placeholder="Search medicines by name or category…"
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

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {filteredMedicines.map((medicine, i) => (
          <GlassCard key={medicine.id} hover={false} className="reveal hover-lift" style={{ animationDelay: `${i * 45}ms` }}>
            <div className="flex items-start justify-between mb-4">
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-primary/20 to-accent/20 flex items-center justify-center">
                <Pill className="w-6 h-6 text-primary" />
              </div>
              <GlassBadge variant={getStatusVariant(medicine.status)}>{medicine.status}</GlassBadge>
            </div>
            
            <h3 className="font-semibold text-white text-lg">{medicine.name}</h3>
            <p className="text-white/60 text-sm">{medicine.category}</p>
            <p className="text-white/40 text-xs mt-1">{medicine.manufacturer}</p>
            
            <div className="mt-4 pt-4 border-t border-white/10 space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-white/50">Stock</span>
                <span className="text-white">{medicine.stock} units</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-white/50">Price</span>
                <span className="text-white">${medicine.unitPrice.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-white/50">Expires</span>
                <span className="text-white/70">{medicine.expiryDate}</span>
              </div>
            </div>
          </GlassCard>
        ))}
      </div>
    </div>
  );
};
