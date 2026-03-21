import React, { useState } from 'react';
import { Search, Pill, AlertTriangle, Package } from 'lucide-react';
import { GlassCard } from '../components/ui/GlassCard';
import { GlassInput } from '../components/ui/GlassInput';
import { GlassBadge } from '../components/ui/GlassBadge';
import { db } from '../data';

export const Pharmacy: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('');

  const filteredMedicines = db.medicines.filter((med) =>
    med.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    med.category.toLowerCase().includes(searchTerm.toLowerCase())
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
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-white">Pharmacy</h1>
          <p className="text-white/60 mt-1">Manage medicine inventory</p>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
        <GlassCard>
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-emerald-500/20 flex items-center justify-center">
              <Package className="w-6 h-6 text-emerald-400" />
            </div>
            <div>
              <p className="text-white/60 text-sm">Total Medicines</p>
              <h3 className="text-2xl font-bold text-white">{db.medicines.length}</h3>
            </div>
          </div>
        </GlassCard>
        <GlassCard>
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-amber-500/20 flex items-center justify-center">
              <AlertTriangle className="w-6 h-6 text-amber-400" />
            </div>
            <div>
              <p className="text-white/60 text-sm">Low Stock</p>
              <h3 className="text-2xl font-bold text-white">{lowStockCount}</h3>
            </div>
          </div>
        </GlassCard>
        <GlassCard>
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-red-500/20 flex items-center justify-center">
              <Pill className="w-6 h-6 text-red-400" />
            </div>
            <div>
              <p className="text-white/60 text-sm">Out of Stock</p>
              <h3 className="text-2xl font-bold text-white">{outOfStockCount}</h3>
            </div>
          </div>
        </GlassCard>
      </div>

      <GlassCard>
        <GlassInput
          placeholder="Search medicines by name or category..."
          icon={<Search className="w-4 h-4" />}
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </GlassCard>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {filteredMedicines.map((medicine) => (
          <GlassCard key={medicine.id}>
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
