import React, { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, Star, Calendar, Plus, Edit, Trash2, Eye, TrendingUp, DollarSign, Globe } from 'lucide-react';
import { GlassCard } from '../../components/ui/GlassCard';
import { GlassInput } from '../../components/ui/GlassInput';
import { GlassButton } from '../../components/ui/GlassButton';
import { GlassModal } from '../../components/ui/GlassModal';
import { DeleteConfirmModal } from '../../components/ui/DeleteConfirmModal';
import { DoctorForm } from '../../components/forms/DoctorForm';
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
  const [doctors, setDoctors] = useState<Doctor[]>(db.doctors);

  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
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

  const handleAdd = (doctorData: Partial<Doctor>) => {
    const newDoctor: Doctor = {
      ...doctorData,
      id: `D${String(doctors.length + 1).padStart(3, '0')}`,
      avatar: `https://i.pravatar.cc/150?u=${Date.now()}`,
      schedule: [
        { day: 'Monday', startTime: '09:00', endTime: '17:00', isAvailable: true },
        { day: 'Tuesday', startTime: '09:00', endTime: '17:00', isAvailable: true },
        { day: 'Wednesday', startTime: '09:00', endTime: '17:00', isAvailable: true },
        { day: 'Thursday', startTime: '09:00', endTime: '17:00', isAvailable: true },
        { day: 'Friday', startTime: '09:00', endTime: '16:00', isAvailable: true },
      ]
    } as Doctor;
    setDoctors([...doctors, newDoctor]);
    setIsAddModalOpen(false);
  };

  const handleEdit = (doctorData: Partial<Doctor>) => {
    if (selectedDoctor) {
      setDoctors(doctors.map(d => d.id === selectedDoctor.id ? { ...d, ...doctorData } : d));
      setIsEditModalOpen(false);
      setSelectedDoctor(null);
    }
  };

  const handleDelete = () => {
    if (selectedDoctor) {
      setDoctors(doctors.filter(d => d.id !== selectedDoctor.id));
      setIsDeleteModalOpen(false);
      setSelectedDoctor(null);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="space-y-1">
        <h1 className="text-3xl font-bold text-white">Doctors</h1>
        <p className="text-white/60">{doctors.length} physicians on staff</p>
      </div>

      {/* Filters */}
      <GlassCard className="space-y-4">
        <div className="flex flex-col gap-3 xl:flex-row xl:items-center xl:justify-between">
          <div className="flex flex-1 flex-col gap-3 sm:flex-row sm:items-center">
            <GlassInput
              placeholder="Search by name, specialty or department..."
              icon={<Search className="w-4 h-4" />}
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
            />
            <div className="flex flex-wrap gap-2">
              <GlassButton
                variant="ghost"
                className="flex items-center gap-2 px-4"
                onClick={() => setStatusFilter('Available')}
              >
                <Calendar className="w-4 h-4" />
                Available today
              </GlassButton>
              <GlassButton
                variant="ghost"
                className="flex items-center gap-2 px-4"
                onClick={() => setStatusFilter('Busy')}
              >
                <TrendingUp className="w-4 h-4" />
                High demand
              </GlassButton>
            </div>
          </div>
          <GlassButton
            variant="primary"
            onClick={() => setIsAddModalOpen(true)}
            className="flex items-center justify-center gap-2 w-full sm:w-auto"
          >
            <Plus className="w-4 h-4" />
            Add Doctor
          </GlassButton>
        </div>
        <div className="flex flex-wrap gap-2">
          {doctorStatusTabs.map(tab => {
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

      {/* Doctor Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
        {filteredDoctors.map(doctor => {
          const sc = STATUS_CONFIG[doctor.status];
          const doctorApts = db.appointments.filter(a => a.doctorId === doctor.id);
          const completedCount = doctorApts.filter(a => a.status === 'Completed').length;
          const availableDays = doctor.schedule.filter(s => s.isAvailable).length;

          return (
            <GlassCard
              key={doctor.id}
              className="relative group flex flex-col cursor-pointer hover:scale-[1.02] transition-transform duration-200"
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
                  onClick={e => { e.stopPropagation(); setSelectedDoctor(doctor); setIsEditModalOpen(true); }}
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

      {/* Add Modal */}
      <GlassModal isOpen={isAddModalOpen} onClose={() => setIsAddModalOpen(false)} title="Add New Doctor" size="lg">
        <DoctorForm onSubmit={handleAdd} onCancel={() => setIsAddModalOpen(false)} />
      </GlassModal>

      {/* Edit Modal */}
      <GlassModal isOpen={isEditModalOpen} onClose={() => { setIsEditModalOpen(false); setSelectedDoctor(null); }} title="Edit Doctor" size="lg">
        <DoctorForm doctor={selectedDoctor || undefined} onSubmit={handleEdit} onCancel={() => { setIsEditModalOpen(false); setSelectedDoctor(null); }} />
      </GlassModal>

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
