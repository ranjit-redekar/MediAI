import React, { useDeferredValue, useMemo, useState } from 'react';
import { AlertTriangle, CalendarClock, PackageX, Plus, ShoppingCart, Truck, Pill, ChevronLeft, ChevronRight } from 'lucide-react';
import { GlassCard } from '../components/ui/GlassCard';
import { GlassBadge } from '../components/ui/GlassBadge';
import { GlassButton } from '../components/ui/GlassButton';
import { GlassInput } from '../components/ui/GlassInput';
import { GlassSelect } from '../components/ui/GlassSelect';
import { GlassModal } from '../components/ui/GlassModal';
import { PageHeader } from '../components/ui/PageHeader';
import { SearchInput } from '../components/ui/SearchInput';
import { FilterTabs } from '../components/ui/FilterTabs';
import { EmptyState } from '../components/ui/EmptyState';
import { MiniStat } from '../components/ui/StatCard';
import { SortableHeader, TableHeader, useSort } from '../components/ui/DataTable';
import { useToast } from '../context/ToastContext';
import { useAIActions } from '../context/AIActionsContext';
import { usePharmacy } from '../context/PharmacyContext';
import { daysUntilExpiry, reorderLevelOf, stockStatus, targetStockOf, LOW_STOCK_UNITS } from '../data/pharmacy';
import { addDays, todayKey } from '../utils/date';
import type { Medicine, StockStatus } from '../types';
import { cn } from '../utils/cn';

const statusVariant = (status: StockStatus) => {
  switch (status) {
    case 'In Stock': return 'success' as const;
    case 'Low Stock': return 'warning' as const;
    case 'Out of Stock':
    case 'Expired': return 'danger' as const;
  }
};

const PAGE_SIZE = 25;
const EXPIRY_WINDOW_DAYS = 90;
/** What the pharmacist should look at first — also the default view. */
const needsAttention = (m: Medicine) => stockStatus(m) !== 'In Stock';
const expiringSoon = (m: Medicine) => { const d = daysUntilExpiry(m); return m.stock > 0 && d > 0 && d <= EXPIRY_WINDOW_DAYS; };

/**
 * Inventory at hospital scale: a dense, sortable table with the items that
 * need action first, instead of a card per medicine. Hundreds of lines stay
 * usable because the default view is the short list that needs work.
 */
export const Pharmacy: React.FC = () => {
  const { medicines, addMedicine, receiveStock } = usePharmacy();
  const { toast } = useToast();
  const [search, setSearch] = useState('');
  const query = useDeferredValue(search.trim().toLowerCase());
  const [view, setView] = useState('attention');
  const [category, setCategory] = useState('');
  const [page, setPage] = useState(0);
  const [receiving, setReceiving] = useState<Medicine | null>(null);
  const [adding, setAdding] = useState(false);
  const { sortKey, direction, onSort, sortRows } = useSort<Medicine>('status', 'asc');

  const counts = useMemo(() => ({
    attention: medicines.filter(needsAttention).length,
    expired: medicines.filter(m => stockStatus(m) === 'Expired').length,
    out: medicines.filter(m => stockStatus(m) === 'Out of Stock').length,
    low: medicines.filter(m => stockStatus(m) === 'Low Stock').length,
    expiring: medicines.filter(expiringSoon).length,
  }), [medicines]);

  const categories = useMemo(() => [...new Set(medicines.map(m => m.category))].sort(), [medicines]);

  const rows = useMemo(() => {
    const inView = (m: Medicine) =>
      view === 'attention' ? needsAttention(m)
      : view === 'expiring' ? expiringSoon(m)
      : view === 'all' ? true
      : stockStatus(m) === view;
    const filtered = medicines.filter(m =>
      inView(m) &&
      (!category || m.category === category) &&
      (!query || m.name.toLowerCase().includes(query) || m.manufacturer.toLowerCase().includes(query) || m.id.toLowerCase() === query));
    // Status sorts by urgency, not alphabetically.
    const urgency: Record<StockStatus, number> = { Expired: 0, 'Out of Stock': 1, 'Low Stock': 2, 'In Stock': 3 };
    return sortRows(filtered, {
      name: m => m.name,
      category: m => m.category,
      stock: m => m.stock,
      expiry: m => m.expiryDate,
      price: m => m.unitPrice,
      status: m => urgency[stockStatus(m)] * 1e6 + m.stock,
    });
  }, [medicines, view, category, query, sortRows]);

  const pages = Math.max(1, Math.ceil(rows.length / PAGE_SIZE));
  const current = Math.min(page, pages - 1);
  const visible = rows.slice(current * PAGE_SIZE, current * PAGE_SIZE + PAGE_SIZE);
  // Any filter change goes back to page 1.
  const resetPage = <T,>(fn: (v: T) => void) => (v: T) => { fn(v); setPage(0); };

  // The row's button acts on the same reorder draft that sits in the queue,
  // so approving in either place is one decision, not two purchase orders.
  const { allActions, statusOf, approve, dismiss, reset, canAction } = useAIActions();
  const reorderDraft = (id: string) => allActions.find(a => a.id === `STOCK-${id}-reorder`);
  const approveDraft = (id: string, title: string) => {
    const draft = allActions.find(a => a.id === id);
    if (!draft) return;
    approve(id);
    toast(title, { description: draft.detail, variant: 'ai', action: { label: 'Undo', onClick: () => reset(id) } });
  };

  const tabs = [
    { label: 'Needs attention', value: 'attention', count: counts.attention },
    { label: `Expiring ≤ ${EXPIRY_WINDOW_DAYS}d`, value: 'expiring', count: counts.expiring },
    { label: 'All items', value: 'all', count: medicines.length },
  ];

  return (
    <div className="space-y-6">
      <PageHeader
        title="Pharmacy"
        subtitle={`${medicines.length} items in inventory · ${counts.attention} need attention`}
        actions={
          <GlassButton variant="primary" onClick={() => setAdding(true)}>
            <Plus className="w-4 h-4" /> Add item
          </GlassButton>
        }
      />

      {/* Each tile is also a shortcut to that list. */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {([
          ['Expired', counts.expired, PackageX, 'text-red-400', 'bg-red-500/15'],
          ['Out of Stock', counts.out, Pill, 'text-red-400', 'bg-red-500/15'],
          ['Low Stock', counts.low, AlertTriangle, 'text-amber-400', 'bg-amber-500/15'],
          ['expiring', counts.expiring, CalendarClock, 'text-cyan-400', 'bg-cyan-500/15'],
        ] as const).map(([key, value, icon, tint, ring], i) => (
          <button key={key} onClick={() => { setView(key); setPage(0); }} className="text-left rounded-2xl focus-ring">
            <MiniStat icon={icon} label={key === 'expiring' ? `Expiring ≤ ${EXPIRY_WINDOW_DAYS}d` : key} value={value} tint={tint} ring={ring} index={i} />
          </button>
        ))}
      </div>

      <GlassCard padding="none" hover={false}>
        <div className="p-4 flex flex-col gap-3 lg:flex-row lg:items-center border-b border-[var(--border)]">
          <SearchInput
            width="lg"
            placeholder="Search name, manufacturer, or item ID…"
            value={search}
            onChange={e => { setSearch(e.target.value); setPage(0); }}
            aria-label="Search inventory"
          />
          <div className="lg:w-56">
            <GlassSelect
              aria-label="Filter by category"
              options={[{ value: '', label: 'All categories' }, ...categories.map(c => ({ value: c, label: c }))]}
              value={category}
              onChange={e => resetPage(setCategory)(e.target.value)}
            />
          </div>
          <FilterTabs tabs={tabs} value={['attention', 'expiring', 'all'].includes(view) ? view : ''} onChange={resetPage(setView)} label="Inventory view" className="lg:ml-auto" />
        </div>

        {rows.length === 0 ? (
          <EmptyState
            icon={Pill}
            title={view === 'attention' && !query && !category ? 'Nothing needs attention' : 'No items match'}
            description={view === 'attention' && !query && !category ? 'Every item is in stock and in date.' : 'Try another search or category, or switch to All items.'}
            action={{ label: 'Show all items', onClick: () => { setView('all'); setSearch(''); setCategory(''); setPage(0); } }}
          />
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <caption className="sr-only">Pharmacy inventory, sortable by name, category, stock, expiry, price and status</caption>
                <thead className="bg-[var(--surface-2)] border-b border-[var(--border)] sticky top-0">
                  <tr>
                    <SortableHeader label="Item" columnKey="name" activeKey={sortKey} direction={direction} onSort={onSort} className="px-4" />
                    <SortableHeader label="Category" columnKey="category" activeKey={sortKey} direction={direction} onSort={onSort} className="hidden md:table-cell px-4" />
                    <SortableHeader label="Stock" columnKey="stock" activeKey={sortKey} direction={direction} onSort={onSort} className="px-4" />
                    <SortableHeader label="Expiry" columnKey="expiry" activeKey={sortKey} direction={direction} onSort={onSort} className="hidden sm:table-cell px-4" />
                    <SortableHeader label="Price" columnKey="price" activeKey={sortKey} direction={direction} onSort={onSort} className="hidden lg:table-cell px-4" />
                    <SortableHeader label="Status" columnKey="status" activeKey={sortKey} direction={direction} onSort={onSort} className="px-4" />
                    <TableHeader align="right" className="px-4">Action</TableHeader>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[var(--border)]">
                  {visible.map(m => {
                    const status = stockStatus(m);
                    const days = daysUntilExpiry(m);
                    const draft = reorderDraft(m.id);
                    const quarantine = allActions.find(a => a.id === `STOCK-${m.id}-quarantine`);
                    const pct = Math.min(100, Math.round((m.stock / targetStockOf(m)) * 100));
                    return (
                      <tr key={m.id} className="hover:bg-[var(--surface-2)] transition-colors">
                        <td className="px-4 py-2.5">
                          <p className="font-medium text-app">{m.name}</p>
                          <p className="text-xs text-app-subtle">{m.manufacturer} · {m.id}</p>
                        </td>
                        <td className="hidden md:table-cell px-4 py-2.5 text-app-muted">{m.category}</td>
                        <td className="px-4 py-2.5">
                          <p className="tabular-nums text-app whitespace-nowrap">{m.stock} <span className="text-xs text-app-subtle">/ min {reorderLevelOf(m)}</span></p>
                          <div className="mt-1 h-1 w-24 rounded-full bg-[var(--surface-3)] overflow-hidden" aria-hidden="true">
                            <div className={cn('h-full rounded-full', status === 'In Stock' ? 'bg-emerald-500' : status === 'Low Stock' ? 'bg-amber-500' : 'bg-red-500')} style={{ width: `${pct}%` }} />
                          </div>
                        </td>
                        <td className={cn('hidden sm:table-cell px-4 py-2.5 tabular-nums whitespace-nowrap',
                          days <= 0 ? 'text-red-400 font-medium' : days <= EXPIRY_WINDOW_DAYS ? 'text-amber-400 font-medium' : 'text-app-muted')}>
                          {m.expiryDate}
                          <span className="block text-xs">{days <= 0 ? 'expired' : days <= EXPIRY_WINDOW_DAYS ? `in ${days}d` : ''}</span>
                        </td>
                        <td className="hidden lg:table-cell px-4 py-2.5 tabular-nums text-app-muted">${m.unitPrice.toFixed(2)}</td>
                        <td className="px-4 py-2.5 whitespace-nowrap">
                          {statusOf(`STOCK-${m.id}-quarantine`) === 'approved'
                            ? <GlassBadge variant="default" size="sm">Quarantined</GlassBadge>
                            : <GlassBadge variant={statusVariant(status)} size="sm">{status}</GlassBadge>}
                        </td>
                        <td className="px-4 py-2.5 text-right whitespace-nowrap">
                          {/* An expired batch is pulled first; reordering comes after. */}
                          {quarantine && statusOf(quarantine.id) === 'pending' && canAction(quarantine) ? (
                            <GlassButton size="sm" variant="danger" onClick={() => approveDraft(quarantine.id, 'Batch quarantined')} className="mr-2">
                              <PackageX className="w-3.5 h-3.5" /> Quarantine
                            </GlassButton>
                          ) : draft && statusOf(draft.id) === 'pending' && canAction(draft) && (
                            <GlassButton size="sm" variant="default" onClick={() => approveDraft(draft.id, 'Reorder approved')} className="mr-2">
                              <ShoppingCart className="w-3.5 h-3.5" /> Approve reorder
                            </GlassButton>
                          )}
                          {draft && statusOf(draft.id) === 'approved' && (
                            <span className="mr-2 text-xs font-medium text-emerald-400">Reorder approved</span>
                          )}
                          <GlassButton size="sm" variant="ghost" onClick={() => setReceiving(m)} aria-label={`Receive stock for ${m.name}`}>
                            <Truck className="w-3.5 h-3.5" /> Receive
                          </GlassButton>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
            <div className="flex items-center justify-between gap-3 px-4 py-3 border-t border-[var(--border)] text-xs text-app-subtle">
              <span>
                Showing {current * PAGE_SIZE + 1}–{Math.min(rows.length, (current + 1) * PAGE_SIZE)} of {rows.length}
              </span>
              {pages > 1 && (
                <div className="flex items-center gap-1">
                  <GlassButton size="sm" variant="ghost" disabled={current === 0} onClick={() => setPage(current - 1)} aria-label="Previous page">
                    <ChevronLeft className="w-4 h-4" />
                  </GlassButton>
                  <span className="px-2 tabular-nums">Page {current + 1} of {pages}</span>
                  <GlassButton size="sm" variant="ghost" disabled={current >= pages - 1} onClick={() => setPage(current + 1)} aria-label="Next page">
                    <ChevronRight className="w-4 h-4" />
                  </GlassButton>
                </div>
              )}
            </div>
          </>
        )}
      </GlassCard>

      <ReceiveStockModal
        medicine={receiving}
        onClose={() => setReceiving(null)}
        onReceive={(units, expiry) => {
          if (!receiving) return;
          receiveStock(receiving.id, units, expiry);
          // The delivery answers any open reorder draft for this item; don't leave it in the queue.
          const open = reorderDraft(receiving.id);
          const cleared = open && statusOf(open.id) === 'pending' && canAction(open);
          if (cleared) dismiss(open.id);
          toast('Stock received', {
            description: `${units} units of ${receiving.name}, expiring ${expiry}.${cleared ? ' Its reorder draft is cleared from the queue.' : ''}`,
            variant: 'success',
          });
          setReceiving(null);
        }}
      />
      <AddItemModal
        open={adding}
        categories={categories}
        onClose={() => setAdding(false)}
        onAdd={input => {
          const m = addMedicine(input);
          toast('Item added', { description: `${m.name} (${m.id}) is in the inventory.`, variant: 'success' });
          setAdding(false);
          setSearch(m.name);
          setView('all');
          setPage(0);
        }}
      />
    </div>
  );
};

// --- Receive a delivery --------------------------------------------------------

const ReceiveStockModal: React.FC<{
  medicine: Medicine | null;
  onClose: () => void;
  onReceive: (units: number, expiryDate: string) => void;
}> = ({ medicine, onClose, onReceive }) => {
  const [units, setUnits] = useState('');
  const [expiry, setExpiry] = useState(addDays(todayKey(), 365));
  const n = Number(units);
  const valid = Number.isInteger(n) && n > 0 && n <= 100_000 && expiry > todayKey();
  const close = () => { setUnits(''); onClose(); };
  return (
    <GlassModal
      isOpen={!!medicine}
      onClose={close}
      title="Receive stock"
      description={medicine ? `${medicine.name} · ${medicine.stock} on the shelf now` : undefined}
      size="sm"
      footer={
        <div className="flex justify-end gap-2">
          <GlassButton variant="ghost" onClick={close}>Cancel</GlassButton>
          <GlassButton variant="primary" disabled={!valid} onClick={() => { onReceive(n, expiry); setUnits(''); }}>Receive</GlassButton>
        </div>
      }
    >
      <div className="space-y-4">
        <GlassInput label="Units received" type="number" min={1} inputMode="numeric" value={units} onChange={e => setUnits(e.target.value)} autoFocus />
        <GlassInput label="Batch expiry" type="date" min={addDays(todayKey(), 1)} value={expiry} onChange={e => setExpiry(e.target.value)} />
        {medicine && daysUntilExpiry(medicine) <= 0 && (
          <p className="text-xs text-amber-400">The {medicine.stock} expired units on the shelf are replaced by this delivery, not added to it.</p>
        )}
      </div>
    </GlassModal>
  );
};

// --- Add an item ----------------------------------------------------------------

const AddItemModal: React.FC<{
  open: boolean;
  categories: string[];
  onClose: () => void;
  onAdd: (input: Omit<Medicine, 'id'>) => void;
}> = ({ open, categories, onClose, onAdd }) => {
  const blank = { name: '', category: categories[0] ?? '', manufacturer: '', unitPrice: '', stock: '0', reorderLevel: String(LOW_STOCK_UNITS), expiryDate: addDays(todayKey(), 365) };
  const [f, setF] = useState(blank);
  const set = (k: keyof typeof blank) => (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => setF(prev => ({ ...prev, [k]: e.target.value }));
  const price = Number(f.unitPrice), stock = Number(f.stock), reorder = Number(f.reorderLevel);
  const valid = f.name.trim().length > 1 && f.category && f.manufacturer.trim() && price > 0 && Number.isInteger(stock) && stock >= 0 && Number.isInteger(reorder) && reorder > 0 && f.expiryDate > todayKey();
  const close = () => { setF(blank); onClose(); };
  return (
    <GlassModal
      isOpen={open}
      onClose={close}
      title="Add inventory item"
      description="A new line in the formulary. Stock can be 0 and received later."
      size="md"
      footer={
        <div className="flex justify-end gap-2">
          <GlassButton variant="ghost" onClick={close}>Cancel</GlassButton>
          <GlassButton
            variant="primary"
            disabled={!valid}
            onClick={() => {
              onAdd({
                name: f.name.trim(), category: f.category, manufacturer: f.manufacturer.trim(), unitPrice: price,
                stock, reorderLevel: reorder, expiryDate: f.expiryDate, description: '',
              });
              setF(blank);
            }}
          >
            Add item
          </GlassButton>
        </div>
      }
    >
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="sm:col-span-2"><GlassInput label="Name and strength" placeholder="e.g. Amoxicillin 250mg" value={f.name} onChange={set('name')} autoFocus /></div>
        <GlassSelect label="Category" options={categories.map(c => ({ value: c, label: c }))} value={f.category} onChange={set('category')} />
        <GlassInput label="Manufacturer" value={f.manufacturer} onChange={set('manufacturer')} />
        <GlassInput label="Unit price ($)" type="number" min={0} step="0.01" value={f.unitPrice} onChange={set('unitPrice')} />
        <GlassInput label="Opening stock" type="number" min={0} value={f.stock} onChange={set('stock')} />
        <GlassInput label="Reorder at (units)" type="number" min={1} value={f.reorderLevel} onChange={set('reorderLevel')} />
        <GlassInput label="Expiry" type="date" min={addDays(todayKey(), 1)} value={f.expiryDate} onChange={set('expiryDate')} />
      </div>
    </GlassModal>
  );
};
