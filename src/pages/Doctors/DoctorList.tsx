import React, { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Star, Calendar, Plus, Edit, Trash2, Eye, TrendingUp, DollarSign, Globe } from 'lucide-react';
import { GlassCard } from '../../components/ui/GlassCard';
import { GlassButton } from '../../components/ui/GlassButton';
import { PageHeader } from '../../components/ui/PageHeader';
import { SearchInput } from '../../components/ui/SearchInput';
import { DeleteConfirmModal } from '../../components/ui/DeleteConfirmModal';
import { useDoctors } from '../../context/DoctorsContext';
import { db } from '../../data';
import type { Doctor } from '../../types';
import { cn } from '../../utils/cn';

const STATUS_CONFIG = {
  Available: { dot: 'bg-emerald-500', text: 'text-emerald-400', bg: 'bg-emerald-500/20', border: 'border-emerald-500/30' },
  Busy:      { dot: 'bg-amber-500 animate-pulse', text: 'text-amber-400', bg: 'bg-amber-500/20', border: 'border-amber-500/30' },
  Offline:   { dot: 'bg-gray-500', text: 'text-gray-400', bg: 'bg-gray-500/20', border: 'border-gray-500/30' },
};

export const DoctorList: React.FC = () => {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('All');
  const { doctors, removeDoctor } = useDoctors();

  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [selectedDoctor, setSelectedDoctor] = useState<Doctor | null>(null);
  const doctorStatusTabs = useMemo(() => {
    const available = doctors.filter(d => d.status === 'Available').length;
    const busy = doctors.filter(d => d.status === 'Busy').length;
    const offline = doctors.filter(d => d.status === 'Offline').length;
    return [
      { label: 'All Doctors', value: 'All', count: doctors.length },
      { label: 'Available', value: 'Available', count: available },
      { label: 'Busy', value: 'Busy', count: busy },
      { label: 'Offline', value: 'Offline', count: offline }
    ];
  }, [doctors]);

  const filteredDoctors = doctors.filter(d => {
    const matchesSearch = d.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      d.specialty.toLowerCase().includes(searchTerm.toLowerCase()) ||
      d.department.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'All' || d.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const handleDelete = () => {
    if (selectedDoctor) {
      removeDoctor(selectedDoctor.id);
      setIsDeleteModalOpen(false);
      setSelectedDoctor(null);
    }
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Doctors"
        subtitle={`${doctors.length} physicians on staff`}
        actions={
          <GlassButton variant="primary" onClick={() => navigate('/doctors/new')}>
            <Plus className="w-4 h-4" />
            Add Doctor
          </GlassButton>
        }
      />

      {/* Filter bar */}
      <GlassCard padding="sm">
        <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
          <SearchInput
            width="lg"
            placeholder="Search by name, specialty or department…"
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
          />
          <div className="flex flex-wrap gap-2">
            {doctorStatusTabs.map(tab => {
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

      {/* Doctor Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
        {filteredDoctors.map((doctor, i) => {
          const sc = STATUS_CONFIG[doctor.status];
          const doctorApts = db.appointments.filter(a => a.doctorId === doctor.id);
          const completedCount = doctorApts.filter(a => a.status === 'Completed').length;
          const availableDays = doctor.schedule.filter(s => s.isAvailable).length;

          return (
            <GlassCard
              key={doctor.id}
              hover={false}
              style={{ animationDelay: `${i * 60}ms` }}
              className="reveal hover-lift relative group flex flex-col cursor-pointer"
              onClick={() => navigate(`/doctors/${doctor.id}`)}
            >
              {/* Status badge top-right */}
              <div className={`absolute top-4 right-4 flex items-center gap-1.5 px-2.5 py-1 rounded-full ${sc.bg} border ${sc.border}`}>
                <div className={`w-1.5 h-1.5 rounded-full ${sc.dot}`} />
                <span className={`text-xs font-medium ${sc.text}`}>{doctor.status}</span>
              </div>

              {/* Avatar + Rating */}
              <div className="flex items-start gap-4 mb-4">
                <div className="relative flex-shrink-0">
                  <img
                    src={doctor.avatar}
                    alt={doctor.name}
                    className="w-16 h-16 rounded-2xl border-2 border-white/10 object-cover"
                  />
                </div>
                <div className="pt-1 min-w-0 pr-16">
                  <h3 className="font-semibold text-white text-base leading-tight truncate">{doctor.name}</h3>
                  <p className="text-indigo-300 text-sm mt-0.5">{doctor.specialty}</p>
                  <p className="text-white/40 text-xs">{doctor.qualification}</p>
                </div>
              </div>

              {/* Star rating */}
              <div className="flex items-center gap-1.5 mb-4">
                {[1,2,3,4,5].map(s => (
                  <Star key={s} className={`w-3.5 h-3.5 ${s <= Math.round(doctor.rating) ? 'text-amber-400 fill-amber-400' : 'text-white/20'}`} />
                ))}
                <span className="text-sm text-white/70 ml-1">{doctor.rating}</span>
              </div>

              {/* Stats row */}
              <div className="grid grid-cols-3 gap-2 pt-4 border-t border-white/10 mb-4">
                <div className="text-center">
                  <div className="text-base font-bold text-white">{doctor.patientsCount.toLocaleString()}</div>
                  <div className="text-xs text-white/40">Patients</div>
                </div>
                <div className="text-center border-x border-white/10">
                  <div className="text-base font-bold text-white">{doctor.experience}y</div>
                  <div className="text-xs text-white/40">Exp.</div>
                </div>
                <div className="text-center">
                  <div className="text-base font-bold text-indigo-400">{doctorApts.length}</div>
                  <div className="text-xs text-white/40">Visits</div>
                </div>
              </div>

              {/* Schedule + completion */}
              <div className="flex items-center justify-between text-xs text-white/50 mb-4">
                <div className="flex items-center gap-1.5">
                  <Calendar className="w-3.5 h-3.5" />
                  {availableDays} days/week
                </div>
                {completedCount > 0 && (
                  <div className="flex items-center gap-1.5 text-emerald-400">
                    <TrendingUp className="w-3.5 h-3.5" />
                    {completedCount} completed
                  </div>
                )}
              </div>

              {/* Languages */}
              {doctor.languages && (
                <div className="flex items-center gap-1.5 flex-wrap mb-4">
                  <Globe className="w-3 h-3 text-white/30" />
                  {doctor.languages.slice(0, 2).map(l => (
                    <span key={l} className="px-2 py-0.5 rounded-full bg-white/5 text-white/50 text-xs">{l}</span>
                  ))}
                  {doctor.languages.length > 2 && (
                    <span className="text-xs text-white/30">+{doctor.languages.length - 2}</span>
                  )}
                </div>
              )}

              {/* Fee */}
              {doctor.consultationFee && (
                <div className="flex items-center gap-1.5 text-xs text-amber-400/80 mb-2">
                  <DollarSign className="w-3.5 h-3.5" />
                  ${doctor.consultationFee} / consultation
                </div>
              )}

              {/* Action Buttons overlay */}
              <div
                className="absolute bottom-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity flex gap-1"
                onClick={e => e.stopPropagation()}
              >
                <button
                  className="p-2 bg-slate-800/80 hover:bg-indigo-500/60 rounded-lg transition-colors"
                  onClick={() => navigate(`/doctors/${doctor.id}`)}
                  title="View"
                >
                  <Eye className="w-3.5 h-3.5 text-white" />
                </button>
                <button
                  className="p-2 bg-slate-800/80 hover:bg-white/20 rounded-lg transition-colors"
                  onClick={e => { e.stopPropagation(); navigate(`/doctors/${doctor.id}/edit`); }}
                  title="Edit"
                >
                  <Edit className="w-3.5 h-3.5 text-white" />
                </button>
                <button
                  className="p-2 bg-slate-800/80 hover:bg-red-500/50 rounded-lg transition-colors"
                  onClick={e => { e.stopPropagation(); setSelectedDoctor(doctor); setIsDeleteModalOpen(true); }}
                  title="Delete"
                >
                  <Trash2 className="w-3.5 h-3.5 text-white" />
                </button>
              </div>
            </GlassCard>
          );
        })}
      </div>

      {filteredDoctors.length === 0 && (
        <GlassCard className="text-center py-12">
          <p className="text-white/50">No doctors found matching your search</p>
        </GlassCard>
      )}

      {/* Delete Confirmation */}
      <DeleteConfirmModal
        isOpen={isDeleteModalOpen}
        onClose={() => { setIsDeleteModalOpen(false); setSelectedDoctor(null); }}
        onConfirm={handleDelete}
        title="Delete Doctor"
        message="Are you sure you want to delete this doctor? This action cannot be undone."
        itemName={selectedDoctor?.name}
      />
    </div>
  );
};
