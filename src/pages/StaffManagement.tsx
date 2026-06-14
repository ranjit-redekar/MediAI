import React from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Users, Plus, Edit, Trash2, Stethoscope, HeartPulse, Activity, Pill,
  FlaskConical, Briefcase, Sparkles, Shield, Cpu, Phone, Mail,
  UserCheck, UserMinus, Building2
} from 'lucide-react';
import type { LucideIcon } from 'lucide-react';
import { GlassCard } from '../components/ui/GlassCard';
import { GlassButton } from '../components/ui/GlassButton';
import { GlassSelect } from '../components/ui/GlassSelect';
import { PageHeader } from '../components/ui/PageHeader';
import { SearchInput } from '../components/ui/SearchInput';
import { DeleteConfirmModal } from '../components/ui/DeleteConfirmModal';
import { useStaff } from '../context/StaffContext';
import { cn } from '../utils/cn';
import { STAFF_CATEGORIES, STAFF_STATUSES } from '../types/staff';
import type { StaffCategory, StaffMember, StaffStatus } from '../types/staff';

const categoryMeta: Record<StaffCategory, { icon: LucideIcon; tint: string }> = {
  Doctors: { icon: Stethoscope, tint: 'text-sky-300' },
  Nursing: { icon: HeartPulse, tint: 'text-rose-300' },
  'Allied Health': { icon: Activity, tint: 'text-emerald-300' },
  Pharmacy: { icon: Pill, tint: 'text-violet-300' },
  Laboratory: { icon: FlaskConical, tint: 'text-cyan-300' },
  Administration: { icon: Briefcase, tint: 'text-amber-300' },
  'Support Services': { icon: Sparkles, tint: 'text-teal-300' },
  Security: { icon: Shield, tint: 'text-indigo-300' },
  'IT & Biomedical': { icon: Cpu, tint: 'text-fuchsia-300' }
};

export const StaffManagement: React.FC = () => {
  const navigate = useNavigate();
  const { staff, removeStaff, setStatus } = useStaff();
  const [search, setSearch] = React.useState('');
  const [category, setCategory] = React.useState<'all' | StaffCategory>('all');
  const [status, setStatusFilter] = React.useState<'all' | StaffStatus>('all');

  const [deleting, setDeleting] = React.useState<StaffMember | null>(null);

  const filtered = staff.filter(s => {
    const q = search.trim().toLowerCase();
    const matchesSearch = !q || s.name.toLowerCase().includes(q) || s.role.toLowerCase().includes(q) ||
      s.id.toLowerCase().includes(q) || s.department.toLowerCase().includes(q);
    const matchesCat = category === 'all' || s.category === category;
    const matchesStatus = status === 'all' || s.status === status;
    return matchesSearch && matchesCat && matchesStatus;
  });

  const stats = {
    total: staff.length,
    onDuty: staff.filter(s => s.status === 'Active').length,
    onLeave: staff.filter(s => s.status === 'On Leave').length,
    departments: new Set(staff.map(s => s.department)).size
  };

  const openAdd = () => navigate('/staff/new');
  const openEdit = (s: StaffMember) => navigate(`/staff/${s.id}/edit`);

  return (
    <div className="space-y-6">
      <PageHeader
        title="Staff Management"
        subtitle="Manage every team member across the hospital — clinical, support, and administrative."
        actions={
          <GlassButton variant="primary" onClick={openAdd}>
            <Plus className="w-4 h-4" />
            Add Staff
          </GlassButton>
        }
      />

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard icon={Users} label="Total Staff" value={stats.total} tint="from-blue-500 to-cyan-500" />
        <StatCard icon={UserCheck} label="On Duty" value={stats.onDuty} tint="from-emerald-500 to-teal-500" />
        <StatCard icon={UserMinus} label="On Leave" value={stats.onLeave} tint="from-amber-500 to-orange-500" />
        <StatCard icon={Building2} label="Departments" value={stats.departments} tint="from-violet-500 to-fuchsia-500" />
      </div>

      {/* Category chips */}
      <div className="flex flex-wrap gap-2">
        <CategoryChip active={category === 'all'} onClick={() => setCategory('all')} label="All" count={staff.length} />
        {STAFF_CATEGORIES.map(cat => {
          const count = staff.filter(s => s.category === cat).length;
          if (count === 0 && category !== cat) return null;
          const Icon = categoryMeta[cat].icon;
          return (
            <CategoryChip
              key={cat}
              active={category === cat}
              onClick={() => setCategory(cat)}
              label={cat}
              count={count}
              icon={Icon}
              tint={categoryMeta[cat].tint}
            />
          );
        })}
      </div>

      {/* Filters + table */}
      <GlassCard padding="none" hover={false} className="overflow-hidden">
        <div className="p-4 flex flex-col md:flex-row gap-3 border-b border-[var(--border)]">
          <SearchInput
            placeholder="Search by name, role, ID, or department…"
            value={search}
            onChange={e => setSearch(e.target.value)}
          />
          <div className="w-full md:w-48 flex-shrink-0">
            <GlassSelect
              options={[{ value: 'all', label: 'All statuses' }, ...STAFF_STATUSES.map(s => ({ value: s, label: s }))]}
              value={status}
              onChange={e => setStatusFilter(e.target.value as 'all' | StaffStatus)}
            />
          </div>
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="w-full min-w-[820px]">
            <thead>
              <tr className="text-left text-xs uppercase tracking-wide text-white/40 border-b border-white/10">
                <th className="px-4 py-3 font-medium">Staff member</th>
                <th className="px-4 py-3 font-medium">Role / Department</th>
                <th className="px-4 py-3 font-medium">Shift</th>
                <th className="px-4 py-3 font-medium">Contact</th>
                <th className="px-4 py-3 font-medium">Status</th>
                <th className="px-4 py-3 font-medium text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map(s => {
                const Icon = categoryMeta[s.category].icon;
                return (
                  <tr key={s.id} className="border-b border-white/5 hover:bg-white/5 transition-colors">
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        <img src={s.avatar} alt={s.name} className="w-9 h-9 rounded-full border border-white/10" />
                        <div className="min-w-0">
                          <p className="text-sm font-medium text-white truncate">{s.name}</p>
                          <p className="text-xs text-white/40">{s.id}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <Icon className={cn('w-4 h-4 flex-shrink-0', categoryMeta[s.category].tint)} />
                        <div className="min-w-0">
                          <p className="text-sm text-white truncate">{s.role}</p>
                          <p className="text-xs text-white/40 truncate">{s.department}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <span className="text-sm text-white/70">{s.shift}</span>
                      <p className="text-xs text-white/40">{s.employmentType}</p>
                    </td>
                    <td className="px-4 py-3">
                      <p className="text-xs text-white/60 flex items-center gap-1"><Phone className="w-3 h-3" />{s.phone}</p>
                      <p className="text-xs text-white/40 flex items-center gap-1 truncate max-w-[180px]"><Mail className="w-3 h-3" />{s.email}</p>
                    </td>
                    <td className="px-4 py-3">
                      <select
                        value={s.status}
                        onChange={e => setStatus(s.id, e.target.value as StaffStatus)}
                        className={cn(
                          'text-xs rounded-lg px-2 py-1 border bg-transparent outline-none cursor-pointer',
                          s.status === 'Active' && 'text-emerald-300 border-emerald-500/30',
                          s.status === 'On Leave' && 'text-amber-300 border-amber-500/30',
                          s.status === 'Off Duty' && 'text-cyan-300 border-cyan-500/30',
                          s.status === 'Inactive' && 'text-white/50 border-white/20'
                        )}
                      >
                        {STAFF_STATUSES.map(st => <option key={st} value={st} className="bg-slate-900 text-white">{st}</option>)}
                      </select>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center justify-end gap-1">
                        <button onClick={() => openEdit(s)} title="Edit" className="p-2 rounded-lg hover:bg-white/10 text-white/50 hover:text-white transition-colors">
                          <Edit className="w-4 h-4" />
                        </button>
                        <button onClick={() => setDeleting(s)} title="Remove" className="p-2 rounded-lg hover:bg-red-500/20 text-white/50 hover:text-red-300 transition-colors">
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
          {filtered.length === 0 && (
            <div className="py-12 text-center text-white/40 text-sm">No staff match your filters.</div>
          )}
        </div>
      </GlassCard>

      <DeleteConfirmModal
        isOpen={!!deleting}
        onClose={() => setDeleting(null)}
        onConfirm={() => { if (deleting) removeStaff(deleting.id); setDeleting(null); }}
        title="Remove staff member"
        message="This will remove the staff member from the directory."
        itemName={deleting?.name}
      />
    </div>
  );
};

const StatCard: React.FC<{ icon: LucideIcon; label: string; value: number; tint: string }> = ({ icon: Icon, label, value, tint }) => (
  <GlassCard padding="sm" hover={false} className="flex items-center justify-between">
    <div>
      <p className="text-white/60 text-sm">{label}</p>
      <h3 className="text-2xl font-bold text-white mt-1">{value}</h3>
    </div>
    <div className={cn('w-11 h-11 rounded-xl bg-gradient-to-br flex items-center justify-center', tint)}>
      <Icon className="w-5 h-5 text-white" />
    </div>
  </GlassCard>
);

const CategoryChip: React.FC<{ active: boolean; onClick: () => void; label: string; count: number; icon?: LucideIcon; tint?: string }> = ({ active, onClick, label, count, icon: Icon, tint }) => (
  <button
    onClick={onClick}
    className={cn(
      'flex items-center gap-2 px-3 py-1.5 rounded-full border text-sm transition-all',
      active ? 'bg-violet-500/20 border-violet-500/40 text-white' : 'bg-white/5 border-white/10 text-white/60 hover:bg-white/10'
    )}
  >
    {Icon && <Icon className={cn('w-3.5 h-3.5', tint)} />}
    {label}
    <span className={cn('px-1.5 rounded-full text-xs', active ? 'bg-white/15' : 'bg-white/10 text-white/50')}>{count}</span>
  </button>
);
