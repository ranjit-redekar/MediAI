import React, { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Calendar as CalendarIcon, List, LayoutGrid, Plus, Edit, Trash2,
  Clock, Video, Phone, UserRound,
  CalendarDays, Stethoscope, CheckCircle2, XCircle,
  AlertCircle, ArrowUpDown
} from 'lucide-react';
import { GlassCard } from '../components/ui/GlassCard';
import { GlassButton } from '../components/ui/GlassButton';
import { GlassSelect } from '../components/ui/GlassSelect';
import { PageHeader } from '../components/ui/PageHeader';
import { SearchInput } from '../components/ui/SearchInput';
import { DeleteConfirmModal } from '../components/ui/DeleteConfirmModal';
import { CalendarView } from '../components/calendar/CalendarView';
import { cn } from '../utils/cn';
import { useAppointments } from '../context/AppointmentsContext';
import { db } from '../data';
import type { Appointment } from '../types';

const STATUS_CONFIG = {
  Scheduled:  { color: 'bg-indigo-500',  text: 'text-indigo-300',  bg: 'bg-indigo-500/15',  border: 'border-indigo-500/30',  icon: <Clock className="w-3.5 h-3.5" /> },
  Completed:  { color: 'bg-emerald-500', text: 'text-emerald-300', bg: 'bg-emerald-500/15', border: 'border-emerald-500/30', icon: <CheckCircle2 className="w-3.5 h-3.5" /> },
  Cancelled:  { color: 'bg-red-500',     text: 'text-red-300',     bg: 'bg-red-500/15',     border: 'border-red-500/30',     icon: <XCircle className="w-3.5 h-3.5" /> },
  'No-Show':  { color: 'bg-amber-500',   text: 'text-amber-300',   bg: 'bg-amber-500/15',   border: 'border-amber-500/30',   icon: <AlertCircle className="w-3.5 h-3.5" /> },
};

const TYPE_CONFIG = {
  'In-Person': { icon: <UserRound className="w-3.5 h-3.5" />, label: 'In-Person', color: 'text-indigo-300', bg: 'bg-indigo-500/10' },
  'Video':     { icon: <Video className="w-3.5 h-3.5" />,     label: 'Video',     color: 'text-violet-300', bg: 'bg-violet-500/10' },
  'Phone':     { icon: <Phone className="w-3.5 h-3.5" />,     label: 'Phone',     color: 'text-cyan-300',   bg: 'bg-cyan-500/10' },
};

export const Appointments: React.FC = () => {
  const navigate = useNavigate();
  const { appointments, removeAppointment } = useAppointments();
  const [viewMode, setViewMode] = useState<'calendar' | 'list'>('calendar');
  const [listLayout, setListLayout] = useState<'card' | 'table'>('card');

  // Filter & Search states
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('All');
  const [typeFilter, setTypeFilter] = useState<string>('All');
  const [dateSort, setDateSort] = useState<'asc' | 'desc'>('desc');

  // Delete confirmation state
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [selectedAppointment, setSelectedAppointment] = useState<Appointment | null>(null);

  const handleDelete = () => {
    if (selectedAppointment) {
      removeAppointment(selectedAppointment.id);
      setIsDeleteModalOpen(false);
      setSelectedAppointment(null);
    }
  };

  const openEditModal = (appointment: Appointment) => {
    navigate(`/appointments/${appointment.id}/edit`);
  };

  const openDeleteModal = (appointment: Appointment) => {
    setSelectedAppointment(appointment);
    setIsDeleteModalOpen(true);
  };

  const handleAppointmentSelect = (appointment: Appointment) => {
    navigate(`/appointments/${appointment.id}/edit`);
  };

  // Filter and sort appointments
  const filteredAppointments = useMemo(() => {
    const filtered = appointments.filter(apt => {
      const matchesSearch =
        apt.patientName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        apt.doctorName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        apt.specialty.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesStatus = statusFilter === 'All' || apt.status === statusFilter;
      const matchesType = typeFilter === 'All' || apt.type === typeFilter;
      return matchesSearch && matchesStatus && matchesType;
    });

    filtered.sort((a, b) => {
      const dateCompare = a.date.localeCompare(b.date);
      if (dateCompare !== 0) return dateSort === 'asc' ? dateCompare : -dateCompare;
      return a.time.localeCompare(b.time);
    });

    return filtered;
  }, [appointments, searchTerm, statusFilter, typeFilter, dateSort]);

  const stats = useMemo(() => ({
    total: filteredAppointments.length,
    scheduled: filteredAppointments.filter(a => a.status === 'Scheduled').length,
    completed: filteredAppointments.filter(a => a.status === 'Completed').length,
    cancelled: filteredAppointments.filter(a => a.status === 'Cancelled').length,
    noShow: filteredAppointments.filter(a => a.status === 'No-Show').length,
  }), [filteredAppointments]);

  return (
    <div className="space-y-6">
      <PageHeader
        title="Appointments"
        subtitle="Manage patient appointments"
        actions={
          <>
            <div className="flex items-center bg-[var(--surface-2)] border border-[var(--border)] rounded-xl p-1">
              <button
                onClick={() => setViewMode('calendar')}
                className={cn(
                  'flex items-center gap-2 h-8 px-3 rounded-lg text-sm font-medium transition-all',
                  viewMode === 'calendar' ? 'bg-gradient-to-r from-primary to-accent text-white shadow-primary' : 'text-app-muted hover:text-app'
                )}
              >
                <CalendarIcon className="w-4 h-4" /> Calendar
              </button>
              <button
                onClick={() => setViewMode('list')}
                className={cn(
                  'flex items-center gap-2 h-8 px-3 rounded-lg text-sm font-medium transition-all',
                  viewMode === 'list' ? 'bg-gradient-to-r from-primary to-accent text-white shadow-primary' : 'text-app-muted hover:text-app'
                )}
              >
                <List className="w-4 h-4" /> List
              </button>
            </div>
            <GlassButton variant="primary" onClick={() => navigate('/appointments/new')}>
              <Plus className="w-4 h-4" /> New
            </GlassButton>
          </>
        }
      />

      {/* Calendar View */}
      {viewMode === 'calendar' ? (
        <CalendarView
          appointments={appointments}
          onSelectAppointment={handleAppointmentSelect}
          onDateSelect={() => {}}
        />
      ) : (
        /* List View */
        <div className="space-y-5">
          {/* Compact stats */}
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
            {[
              { label: 'Total', value: stats.total, tint: 'text-app', ring: 'bg-[var(--surface-3)]' },
              { label: 'Scheduled', value: stats.scheduled, tint: 'text-indigo-300', ring: 'bg-indigo-500/15' },
              { label: 'Completed', value: stats.completed, tint: 'text-emerald-300', ring: 'bg-emerald-500/15' },
              { label: 'Cancelled', value: stats.cancelled, tint: 'text-red-300', ring: 'bg-red-500/15' },
              { label: 'No-Show', value: stats.noShow, tint: 'text-amber-300', ring: 'bg-amber-500/15' },
            ].map(s => (
              <GlassCard key={s.label} padding="none" hover={false} className="flex items-center gap-3 p-3.5">
                <div className={cn('w-9 h-9 rounded-lg flex items-center justify-center', s.ring)}>
                  <CalendarDays className={cn('w-4 h-4', s.tint)} />
                </div>
                <div className="min-w-0">
                  <div className={cn('text-xl font-bold leading-none', s.tint)}>{s.value}</div>
                  <div className="text-xs text-app-subtle mt-1">{s.label}</div>
                </div>
              </GlassCard>
            ))}
          </div>

          {/* Filter bar */}
          <GlassCard padding="sm">
            <div className="flex flex-col lg:flex-row lg:items-center gap-3">
              <SearchInput
                width="lg"
                placeholder="Search patients, doctors, specialties…"
                value={searchTerm}
                onChange={e => setSearchTerm(e.target.value)}
              />
              <div className="flex flex-wrap items-center gap-2 lg:ml-auto">
                <div className="w-36">
                  <GlassSelect
                    value={statusFilter}
                    onChange={e => setStatusFilter(e.target.value)}
                    options={[
                      { value: 'All', label: 'All status' },
                      { value: 'Scheduled', label: 'Scheduled' },
                      { value: 'Completed', label: 'Completed' },
                      { value: 'Cancelled', label: 'Cancelled' },
                      { value: 'No-Show', label: 'No-Show' },
                    ]}
                  />
                </div>
                <div className="w-32">
                  <GlassSelect
                    value={typeFilter}
                    onChange={e => setTypeFilter(e.target.value)}
                    options={[
                      { value: 'All', label: 'All types' },
                      { value: 'In-Person', label: 'In-Person' },
                      { value: 'Video', label: 'Video' },
                      { value: 'Phone', label: 'Phone' },
                    ]}
                  />
                </div>
                <GlassButton variant="ghost" onClick={() => setDateSort(prev => prev === 'asc' ? 'desc' : 'asc')}>
                  <ArrowUpDown className="w-4 h-4" />
                  {dateSort === 'asc' ? 'Oldest' : 'Newest'}
                </GlassButton>
                <div className="flex items-center bg-[var(--surface-2)] border border-[var(--border)] rounded-lg p-0.5">
                  <button
                    onClick={() => setListLayout('card')}
                    className={cn('h-8 px-2.5 rounded-md text-xs font-medium transition-colors', listLayout === 'card' ? 'bg-[var(--surface-3)] text-app' : 'text-app-muted hover:text-app')}
                    title="Card view"
                  >
                    <LayoutGrid className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => setListLayout('table')}
                    className={cn('h-8 px-2.5 rounded-md text-xs font-medium transition-colors', listLayout === 'table' ? 'bg-[var(--surface-3)] text-app' : 'text-app-muted hover:text-app')}
                    title="Table view"
                  >
                    <List className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          </GlassCard>

          {/* Results */}
          {filteredAppointments.length === 0 ? (
            <GlassCard className="text-center py-16">
              <CalendarDays className="w-14 h-14 text-app-subtle mx-auto mb-4 opacity-40" />
              <p className="text-app-muted text-lg">No appointments found</p>
              <p className="text-app-subtle text-sm mt-1">Try adjusting your filters</p>
            </GlassCard>
          ) : listLayout === 'table' ? (
            <GlassCard padding="none" className="overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full min-w-[840px] text-sm">
                  <thead>
                    <tr className="text-left text-xs uppercase tracking-wide text-app-subtle border-b border-[var(--border)]">
                      <th className="px-5 py-3.5 font-semibold">Patient</th>
                      <th className="px-5 py-3.5 font-semibold">Doctor</th>
                      <th className="px-5 py-3.5 font-semibold">Date & Time</th>
                      <th className="px-5 py-3.5 font-semibold">Type</th>
                      <th className="px-5 py-3.5 font-semibold">Status</th>
                      <th className="px-5 py-3.5 font-semibold text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredAppointments.map((apt) => {
                      const statusCfg = STATUS_CONFIG[apt.status];
                      const typeCfg = TYPE_CONFIG[apt.type];
                      const patient = db.patients.find(p => p.id === apt.patientId);
                      return (
                        <tr key={apt.id} className="border-b border-[var(--border)] last:border-0 hover:bg-[var(--surface-2)] transition-colors">
                          <td className="px-5 py-3">
                            <div className="flex items-center gap-3">
                              {patient?.avatar ? (
                                <img src={patient.avatar} alt={apt.patientName} className="w-9 h-9 rounded-full border border-[var(--border)] object-cover" />
                              ) : (
                                <div className="w-9 h-9 rounded-full bg-[var(--surface-3)] flex items-center justify-center"><UserRound className="w-4 h-4 text-app-subtle" /></div>
                              )}
                              <span className="font-medium text-app">{apt.patientName}</span>
                            </div>
                          </td>
                          <td className="px-5 py-3">
                            <p className="text-app">{apt.doctorName}</p>
                            <p className="text-xs text-app-subtle">{apt.specialty}</p>
                          </td>
                          <td className="px-5 py-3 text-app-muted whitespace-nowrap">{apt.date} · {apt.time}</td>
                          <td className="px-5 py-3">
                            <span className={cn('inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs', typeCfg.bg, typeCfg.color)}>
                              {typeCfg.icon}{apt.type}
                            </span>
                          </td>
                          <td className="px-5 py-3">
                            <span className={cn('inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs border', statusCfg.bg, statusCfg.border, statusCfg.text)}>
                              {statusCfg.icon}{apt.status}
                            </span>
                          </td>
                          <td className="px-5 py-3">
                            <div className="flex items-center justify-end gap-1">
                              <button onClick={() => openEditModal(apt)} title="Edit" className="p-2 rounded-lg hover:bg-[var(--surface-3)] text-app-subtle hover:text-app transition-colors"><Edit className="w-4 h-4" /></button>
                              <button onClick={() => openDeleteModal(apt)} title="Delete" className="p-2 rounded-lg hover:bg-red-500/15 text-app-subtle hover:text-red-400 transition-colors"><Trash2 className="w-4 h-4" /></button>
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </GlassCard>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
              {filteredAppointments.map((apt) => {
                const statusCfg = STATUS_CONFIG[apt.status];
                const typeCfg = TYPE_CONFIG[apt.type];
                const patient = db.patients.find(p => p.id === apt.patientId);
                return (
                  <GlassCard key={apt.id} padding="none" className="p-4 group">
                    <div className="flex items-start gap-3">
                      {patient?.avatar ? (
                        <img src={patient.avatar} alt={apt.patientName} className="w-11 h-11 rounded-xl border border-[var(--border)] object-cover flex-shrink-0" />
                      ) : (
                        <div className="w-11 h-11 rounded-xl bg-[var(--surface-3)] flex items-center justify-center flex-shrink-0"><UserRound className="w-5 h-5 text-app-subtle" /></div>
                      )}
                      <div className="flex-1 min-w-0">
                        <p className="font-semibold text-app truncate">{apt.patientName}</p>
                        <p className="text-xs text-app-subtle flex items-center gap-1 mt-0.5">
                          <Stethoscope className="w-3 h-3" /> {apt.doctorName}
                        </p>
                      </div>
                      <span className={cn('inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] border flex-shrink-0', statusCfg.bg, statusCfg.border, statusCfg.text)}>
                        {statusCfg.icon}{apt.status}
                      </span>
                    </div>
                    <div className="flex items-center justify-between mt-3 pt-3 border-t border-[var(--border)]">
                      <div className="flex items-center gap-2 text-sm text-app-muted">
                        <Clock className="w-4 h-4 text-app-subtle" />
                        <span>{apt.date}</span>
                        <span className="text-app-subtle">·</span>
                        <span className="font-medium text-app">{apt.time}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className={cn('inline-flex items-center gap-1 text-xs', typeCfg.color)}>{typeCfg.icon}{apt.type}</span>
                        <div className="flex items-center gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity">
                          <button onClick={() => openEditModal(apt)} title="Edit" className="p-1.5 rounded-lg hover:bg-[var(--surface-3)] text-app-subtle hover:text-app transition-colors"><Edit className="w-3.5 h-3.5" /></button>
                          <button onClick={() => openDeleteModal(apt)} title="Delete" className="p-1.5 rounded-lg hover:bg-red-500/15 text-app-subtle hover:text-red-400 transition-colors"><Trash2 className="w-3.5 h-3.5" /></button>
                        </div>
                      </div>
                    </div>
                  </GlassCard>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* Delete Confirmation */}
      <DeleteConfirmModal
        isOpen={isDeleteModalOpen}
        onClose={() => {
          setIsDeleteModalOpen(false);
          setSelectedAppointment(null);
        }}
        onConfirm={handleDelete}
        title="Delete Appointment"
        message="Are you sure you want to delete this appointment? This action cannot be undone."
        itemName={`${selectedAppointment?.patientName} - ${selectedAppointment?.date}`}
      />
    </div>
  );
};
