import React, { useState, useMemo } from 'react';
import {
  Calendar as CalendarIcon, List, Plus, Edit, Trash2, Search,
  Clock, Video, Phone, UserRound, Filter, ChevronDown, ChevronUp,
  CalendarDays, Stethoscope, MoreHorizontal, CheckCircle2, XCircle,
  AlertCircle, ArrowUpDown
} from 'lucide-react';
import { GlassCard } from '../components/ui/GlassCard';
import { GlassButton } from '../components/ui/GlassButton';
import { GlassModal } from '../components/ui/GlassModal';
import { GlassBadge } from '../components/ui/GlassBadge';
import { DeleteConfirmModal } from '../components/ui/DeleteConfirmModal';
import { AppointmentForm } from '../components/forms/AppointmentForm';
import { CalendarView } from '../components/calendar/CalendarView';
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
  const [appointments, setAppointments] = useState<Appointment[]>(db.appointments);
  const [viewMode, setViewMode] = useState<'calendar' | 'list'>('calendar');

  // Filter & Search states
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('All');
  const [typeFilter, setTypeFilter] = useState<string>('All');
  const [dateSort, setDateSort] = useState<'asc' | 'desc'>('desc');
  const [expandedGroups, setExpandedGroups] = useState<Set<string>>(new Set());

  // Modal states
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [selectedAppointment, setSelectedAppointment] = useState<Appointment | null>(null);
  const [selectedDate, setSelectedDate] = useState<string | null>(null);

  const handleAdd = (appointmentData: Partial<Appointment>) => {
    const newAppointment: Appointment = {
      ...appointmentData,
      id: `A${String(appointments.length + 1).padStart(3, '0')}`,
    } as Appointment;
    
    setAppointments([...appointments, newAppointment]);
    setIsAddModalOpen(false);
  };

  const handleEdit = (appointmentData: Partial<Appointment>) => {
    if (selectedAppointment) {
      setAppointments(appointments.map(a => 
        a.id === selectedAppointment.id ? { ...a, ...appointmentData } : a
      ));
      setIsEditModalOpen(false);
      setSelectedAppointment(null);
    }
  };

  const handleDelete = () => {
    if (selectedAppointment) {
      setAppointments(appointments.filter(a => a.id !== selectedAppointment.id));
      setIsDeleteModalOpen(false);
      setSelectedAppointment(null);
    }
  };

  const openEditModal = (appointment: Appointment) => {
    setSelectedAppointment(appointment);
    setIsEditModalOpen(true);
  };

  const openDeleteModal = (appointment: Appointment) => {
    setSelectedAppointment(appointment);
    setIsDeleteModalOpen(true);
  };

  const handleDateSelect = (date: string) => {
    setSelectedDate(date);
  };

  const handleAppointmentSelect = (appointment: Appointment) => {
    setSelectedAppointment(appointment);
    setIsEditModalOpen(true);
  };

  // Filter and sort appointments
  const filteredAppointments = useMemo(() => {
    let filtered = appointments.filter(apt => {
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

  // Group by date
  const groupedAppointments = useMemo(() => {
    const groups: Record<string, Appointment[]> = {};
    filteredAppointments.forEach(apt => {
      if (!groups[apt.date]) groups[apt.date] = [];
      groups[apt.date].push(apt);
    });
    return groups;
  }, [filteredAppointments]);

  const toggleGroup = (date: string) => {
    setExpandedGroups(prev => {
      const next = new Set(prev);
      if (next.has(date)) next.delete(date);
      else next.add(date);
      return next;
    });
  };

  const formatDateHeader = (dateStr: string) => {
    const date = new Date(dateStr + 'T00:00:00');
    const today = new Date().toISOString().split('T')[0];
    const tomorrow = new Date(Date.now() + 86400000).toISOString().split('T')[0];

    if (dateStr === today) return 'Today';
    if (dateStr === tomorrow) return 'Tomorrow';
    return date.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' });
  };

  const stats = useMemo(() => ({
    total: filteredAppointments.length,
    scheduled: filteredAppointments.filter(a => a.status === 'Scheduled').length,
    completed: filteredAppointments.filter(a => a.status === 'Completed').length,
    cancelled: filteredAppointments.filter(a => a.status === 'Cancelled').length,
    noShow: filteredAppointments.filter(a => a.status === 'No-Show').length,
  }), [filteredAppointments]);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-white">Appointments</h1>
          <p className="text-white/60 mt-1">Manage patient appointments</p>
        </div>
        <div className="flex items-center gap-3">
          {/* View Toggle */}
          <div className="flex bg-white/5 rounded-xl p-1">
            <button
              onClick={() => setViewMode('calendar')}
              className={`
                flex items-center gap-2 px-4 py-2 rounded-lg transition-all
                ${viewMode === 'calendar' 
                  ? 'bg-indigo-500 text-white' 
                  : 'text-white/60 hover:text-white hover:bg-white/10'
                }
              `}
            >
              <CalendarIcon className="w-4 h-4" />
              Calendar
            </button>
            <button
              onClick={() => setViewMode('list')}
              className={`
                flex items-center gap-2 px-4 py-2 rounded-lg transition-all
                ${viewMode === 'list' 
                  ? 'bg-indigo-500 text-white' 
                  : 'text-white/60 hover:text-white hover:bg-white/10'
                }
              `}
            >
              <List className="w-4 h-4" />
              List
            </button>
          </div>
          <GlassButton variant="primary" onClick={() => setIsAddModalOpen(true)}>
            <Plus className="w-4 h-4 mr-2" />
            New
          </GlassButton>
        </div>
      </div>

      {/* Calendar View */}
      {viewMode === 'calendar' ? (
        <CalendarView
          appointments={appointments}
          onSelectAppointment={handleAppointmentSelect}
          onDateSelect={handleDateSelect}
        />
      ) : (
        /* List View */
        <div className="space-y-5">
          {/* Stats Bar */}
          <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
            {[
              { label: 'Total', value: stats.total, color: 'text-white', bg: 'bg-white/10', border: 'border-white/15' },
              { label: 'Scheduled', value: stats.scheduled, color: 'text-indigo-300', bg: 'bg-indigo-500/15', border: 'border-indigo-500/30' },
              { label: 'Completed', value: stats.completed, color: 'text-emerald-300', bg: 'bg-emerald-500/15', border: 'border-emerald-500/30' },
              { label: 'Cancelled', value: stats.cancelled, color: 'text-red-300', bg: 'bg-red-500/15', border: 'border-red-500/30' },
              { label: 'No-Show', value: stats.noShow, color: 'text-amber-300', bg: 'bg-amber-500/15', border: 'border-amber-500/30' },
            ].map(s => (
              <div key={s.label} className={`p-4 rounded-2xl border ${s.bg} ${s.border} text-center`}>
                <div className={`text-2xl font-bold ${s.color}`}>{s.value}</div>
                <div className="text-xs text-white/40 mt-0.5">{s.label}</div>
              </div>
            ))}
          </div>

          {/* Filters */}
          <GlassCard>
            <div className="flex flex-col lg:flex-row gap-4">
              {/* Search */}
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/30" />
                <input
                  type="text"
                  placeholder="Search patients, doctors, specialties..."
                  value={searchTerm}
                  onChange={e => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 bg-white/5 border border-white/10 rounded-xl text-white placeholder:text-white/30 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 text-sm"
                />
              </div>

              {/* Filter Dropdowns */}
              <div className="flex gap-3">
                <div className="relative">
                  <Filter className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/30" />
                  <select
                    value={statusFilter}
                    onChange={e => setStatusFilter(e.target.value)}
                    className="pl-10 pr-8 py-2.5 bg-white/5 border border-white/10 rounded-xl text-white text-sm appearance-none cursor-pointer focus:outline-none focus:ring-2 focus:ring-indigo-500/50"
                  >
                    <option value="All" className="bg-slate-900">All Status</option>
                    <option value="Scheduled" className="bg-slate-900">Scheduled</option>
                    <option value="Completed" className="bg-slate-900">Completed</option>
                    <option value="Cancelled" className="bg-slate-900">Cancelled</option>
                    <option value="No-Show" className="bg-slate-900">No-Show</option>
                  </select>
                  <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/30 pointer-events-none" />
                </div>

                <div className="relative">
                  <Video className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/30" />
                  <select
                    value={typeFilter}
                    onChange={e => setTypeFilter(e.target.value)}
                    className="pl-10 pr-8 py-2.5 bg-white/5 border border-white/10 rounded-xl text-white text-sm appearance-none cursor-pointer focus:outline-none focus:ring-2 focus:ring-indigo-500/50"
                  >
                    <option value="All" className="bg-slate-900">All Types</option>
                    <option value="In-Person" className="bg-slate-900">In-Person</option>
                    <option value="Video" className="bg-slate-900">Video</option>
                    <option value="Phone" className="bg-slate-900">Phone</option>
                  </select>
                  <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/30 pointer-events-none" />
                </div>

                <button
                  onClick={() => setDateSort(prev => prev === 'asc' ? 'desc' : 'asc')}
                  className="flex items-center gap-2 px-4 py-2.5 bg-white/5 border border-white/10 rounded-xl text-white text-sm hover:bg-white/10 transition-colors"
                >
                  <ArrowUpDown className="w-4 h-4" />
                  {dateSort === 'asc' ? 'Oldest First' : 'Newest First'}
                </button>
              </div>
            </div>
          </GlassCard>

          {/* Grouped List */}
          {Object.keys(groupedAppointments).length === 0 ? (
            <GlassCard className="text-center py-16">
              <CalendarDays className="w-16 h-16 text-white/10 mx-auto mb-4" />
              <p className="text-white/40 text-lg">No appointments found</p>
              <p className="text-white/30 text-sm mt-1">Try adjusting your filters</p>
            </GlassCard>
          ) : (
            <div className="space-y-4">
              {Object.entries(groupedAppointments).map(([date, apts]) => {
                const isExpanded = expandedGroups.has(date);
                const dateStats = {
                  total: apts.length,
                  scheduled: apts.filter(a => a.status === 'Scheduled').length,
                };

                return (
                  <div key={date} className="space-y-2">
                    {/* Date Header */}
                    <button
                      onClick={() => toggleGroup(date)}
                      className="w-full flex items-center justify-between p-4 rounded-2xl bg-white/5 border border-white/10 hover:bg-white/[0.07] transition-colors"
                    >
                      <div className="flex items-center gap-4">
                        <div className="flex flex-col items-center justify-center w-14 h-14 rounded-xl bg-indigo-500/20 border border-indigo-500/30">
                          <span className="text-xs text-indigo-300 font-medium uppercase">
                            {new Date(date + 'T00:00:00').toLocaleDateString('en-US', { month: 'short' })}
                          </span>
                          <span className="text-xl font-bold text-white">
                            {new Date(date + 'T00:00:00').getDate()}
                          </span>
                        </div>
                        <div className="text-left">
                          <h3 className="text-lg font-semibold text-white">{formatDateHeader(date)}</h3>
                          <p className="text-sm text-white/40">
                            {dateStats.total} appointment{dateStats.total !== 1 ? 's' : ''}
                            {dateStats.scheduled > 0 && ` · ${dateStats.scheduled} scheduled`}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        {isExpanded ? (
                          <ChevronUp className="w-5 h-5 text-white/40" />
                        ) : (
                          <ChevronDown className="w-5 h-5 text-white/40" />
                        )}
                      </div>
                    </button>

                    {/* Appointments for this date */}
                    {isExpanded && (
                      <div className="grid gap-2 pl-4">
                        {apts.map(apt => {
                          const patient = db.patients.find(p => p.id === apt.patientId);
                          const statusCfg = STATUS_CONFIG[apt.status];
                          const typeCfg = TYPE_CONFIG[apt.type];

                          return (
                            <GlassCard
                              key={apt.id}
                              className="flex items-center gap-4 p-4 hover:bg-white/[0.07] transition-colors group"
                            >
                              {/* Time Column */}
                              <div className="flex flex-col items-center justify-center w-16 flex-shrink-0">
                                <span className="text-lg font-bold text-white">{apt.time}</span>
                                <span className="text-xs text-white/30">{apt.id}</span>
                              </div>

                              {/* Status Stripe */}
                              <div className={`w-1 h-12 rounded-full flex-shrink-0 ${statusCfg.color}`} />

                              {/* Patient Avatar */}
                              {patient?.avatar ? (
                                <img
                                  src={patient.avatar}
                                  alt={apt.patientName}
                                  className="w-12 h-12 rounded-xl border border-white/10 object-cover flex-shrink-0"
                                />
                              ) : (
                                <div className="w-12 h-12 rounded-xl bg-white/10 flex items-center justify-center flex-shrink-0">
                                  <UserRound className="w-5 h-5 text-white/30" />
                                </div>
                              )}

                              {/* Main Info */}
                              <div className="flex-1 min-w-0">
                                <div className="flex items-center gap-2 flex-wrap">
                                  <span className="font-semibold text-white text-base">{apt.patientName}</span>
                                  <span className={`flex items-center gap-1 px-2 py-0.5 rounded-full text-xs ${typeCfg.bg} ${typeCfg.color} border border-white/10`}>
                                    {typeCfg.icon}
                                    {apt.type}
                                  </span>
                                </div>
                                <div className="flex items-center gap-3 mt-1 text-sm text-white/50">
                                  <span className="flex items-center gap-1">
                                    <Stethoscope className="w-3.5 h-3.5" />
                                    {apt.doctorName}
                                  </span>
                                  <span className="text-white/20">·</span>
                                  <span>{apt.specialty}</span>
                                </div>
                                {apt.notes && (
                                  <p className="text-xs text-white/40 mt-1.5 italic truncate">"{apt.notes}"</p>
                                )}
                              </div>

                              {/* Status Badge */}
                              <div className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full border ${statusCfg.bg} ${statusCfg.border} ${statusCfg.text} text-xs font-medium flex-shrink-0`}>
                                {statusCfg.icon}
                                {apt.status}
                              </div>

                              {/* Actions */}
                              <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0">
                                <button
                                  onClick={() => openEditModal(apt)}
                                  className="p-2 hover:bg-white/10 rounded-lg transition-colors"
                                  title="Edit"
                                >
                                  <Edit className="w-4 h-4 text-white/60" />
                                </button>
                                <button
                                  onClick={() => openDeleteModal(apt)}
                                  className="p-2 hover:bg-red-500/20 rounded-lg transition-colors"
                                  title="Delete"
                                >
                                  <Trash2 className="w-4 h-4 text-red-400" />
                                </button>
                              </div>
                            </GlassCard>
                          );
                        })}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* Add Modal */}
      <GlassModal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        title="Add New Appointment"
        size="lg"
      >
        <AppointmentForm
          onSubmit={handleAdd}
          onCancel={() => setIsAddModalOpen(false)}
        />
      </GlassModal>

      {/* Edit Modal */}
      <GlassModal
        isOpen={isEditModalOpen}
        onClose={() => {
          setIsEditModalOpen(false);
          setSelectedAppointment(null);
        }}
        title="Edit Appointment"
        size="lg"
      >
        <AppointmentForm
          appointment={selectedAppointment || undefined}
          onSubmit={handleEdit}
          onCancel={() => {
            setIsEditModalOpen(false);
            setSelectedAppointment(null);
          }}
        />
      </GlassModal>

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
