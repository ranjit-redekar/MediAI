import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  ArrowLeft, Star, Mail, Phone, Calendar, Clock, Users,
  Award, Globe, Stethoscope, TrendingUp, CheckCircle,
  DollarSign, BarChart2, Video, UserRound, Activity, Edit,
  ChevronDown, Pill, FileText, ArrowRight
} from 'lucide-react';
import {
  XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, BarChart, Bar
} from 'recharts';
import { GlassCard } from '../../components/ui/GlassCard';
import { GlassButton } from '../../components/ui/GlassButton';
import { GlassBadge } from '../../components/ui/GlassBadge';
import { useDoctors } from '../../context/DoctorsContext';
import { db } from '../../data';
import { cn } from '../../utils/cn';
import type { Appointment } from '../../types';

type TabId = 'overview' | 'schedule' | 'appointments' | 'patients';

const TABS: { id: TabId; label: string; icon: React.ReactNode }[] = [
  { id: 'overview',      label: 'Overview',      icon: <UserRound className="w-4 h-4" /> },
  { id: 'appointments',  label: 'Appointments',  icon: <Calendar className="w-4 h-4" /> },
  { id: 'schedule',      label: 'Schedule',      icon: <Clock className="w-4 h-4" /> },
  { id: 'patients',      label: 'Patients',      icon: <Users className="w-4 h-4" /> },
];

const STATUS_CONFIG = {
  Available: { label: 'Available', dot: 'bg-emerald-500', text: 'text-emerald-400', bg: 'bg-emerald-500/20', border: 'border-emerald-500/30' },
  Busy:      { label: 'Busy',      dot: 'bg-amber-500 animate-pulse', text: 'text-amber-400', bg: 'bg-amber-500/20', border: 'border-amber-500/30' },
  Offline:   { label: 'Offline',   dot: 'bg-gray-500', text: 'text-gray-400', bg: 'bg-gray-500/20', border: 'border-gray-500/30' },
};

const APT_STATUS_CONFIG = {
  Scheduled:  { variant: 'primary'  as const, barColor: '#6366f1' },
  Completed:  { variant: 'success'  as const, barColor: '#10b981' },
  Cancelled:  { variant: 'danger'   as const, barColor: '#ef4444' },
  'No-Show':  { variant: 'warning'  as const, barColor: '#f59e0b' },
};

export const DoctorDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const { getDoctor } = useDoctors();
  const doctor = getDoctor(id ?? '');
  const doctorAppointments = db.appointments.filter(a => a.doctorId === id);

  const [activeTab, setActiveTab] = useState<TabId>('overview');
  const [aptFilter, setAptFilter] = useState<string>('All');

  if (!doctor) {
    return (
      <div className="flex flex-col items-center justify-center py-24 gap-4">
        <div className="w-20 h-20 rounded-full bg-white/5 flex items-center justify-center">
          <UserRound className="w-10 h-10 text-white/20" />
        </div>
        <p className="text-white/50 text-lg">Doctor not found</p>
        <GlassButton variant="primary" onClick={() => navigate('/doctors')}>Back to Doctors</GlassButton>
      </div>
    );
  }

  const sc = STATUS_CONFIG[doctor.status];

  const completed   = doctorAppointments.filter(a => a.status === 'Completed').length;
  const scheduled   = doctorAppointments.filter(a => a.status === 'Scheduled').length;
  const cancelled   = doctorAppointments.filter(a => a.status === 'Cancelled').length;
  const noShow      = doctorAppointments.filter(a => a.status === 'No-Show').length;

  // Build a monthly chart from appointments
  const monthlyMap: Record<string, { month: string; completed: number; total: number }> = {};
  doctorAppointments.forEach(a => {
    const d = new Date(a.date);
    const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
    const label = d.toLocaleString('default', { month: 'short' });
    if (!monthlyMap[key]) monthlyMap[key] = { month: label, completed: 0, total: 0 };
    monthlyMap[key].total++;
    if (a.status === 'Completed') monthlyMap[key].completed++;
  });
  const monthlyData = Object.values(monthlyMap).sort((a, b) => a.month.localeCompare(b.month));

  // Unique patients
  const uniquePatientIds = [...new Set(doctorAppointments.map(a => a.patientId))];
  const doctorPatients = uniquePatientIds.map(pid => db.patients.find(p => p.id === pid)).filter(Boolean);

  const filteredApts = aptFilter === 'All' ? doctorAppointments : doctorAppointments.filter(a => a.status === aptFilter);
  const sortedApts = [...filteredApts].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

  const availableDays = doctor.schedule.filter(s => s.isAvailable).length;

  return (
    <div className="space-y-6">
      {/* Back */}
      <button onClick={() => navigate('/doctors')} className="flex items-center gap-2 text-white/60 hover:text-white transition-colors group">
        <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
        <span className="text-sm">Back to Doctors</span>
      </button>

      {/* Hero Banner */}
      <div className="relative overflow-hidden rounded-3xl">
        <div className="absolute inset-0 glass-card rounded-3xl" />
        <div className="absolute inset-0 rounded-3xl bg-gradient-to-r from-indigo-500/15 via-violet-500/[0.06] to-transparent" />

        <div className="relative p-6 md:p-8">
          <div className="flex flex-col md:flex-row gap-6 items-start">
            {/* Avatar */}
            <div className="relative flex-shrink-0">
              <img
                src={doctor.avatar}
                alt={doctor.name}
                className="w-28 h-28 md:w-36 md:h-36 rounded-3xl border-4 border-white/20 object-cover shadow-2xl"
              />
              <div className={`absolute -bottom-2 -right-2 flex items-center gap-1.5 px-2.5 py-1 rounded-full border-2 border-slate-900 ${sc.bg} ${sc.border}`}>
                <div className={`w-2 h-2 rounded-full ${sc.dot}`} />
                <span className={`text-xs font-bold ${sc.text}`}>{sc.label}</span>
              </div>
            </div>

            {/* Core Info */}
            <div className="flex-1 min-w-0">
              <div className="flex flex-wrap items-start justify-between gap-4">
                <div>
                  <h1 className="text-2xl sm:text-[28px] font-bold text-app tracking-tight mb-1">{doctor.name}</h1>
                  <p className="text-lg text-indigo-300">{doctor.specialty}</p>
                  <p className="text-white/50 text-sm">{doctor.qualification} · {doctor.department}</p>
                </div>
                <GlassButton variant="ghost" size="sm">
                  <Edit className="w-4 h-4 mr-1.5" /> Edit Profile
                </GlassButton>
              </div>

              {/* Star rating */}
              <div className="flex items-center gap-2 mt-3">
                <div className="flex">
                  {[1,2,3,4,5].map(s => (
                    <Star key={s} className={`w-4 h-4 ${s <= Math.round(doctor.rating) ? 'text-amber-400 fill-amber-400' : 'text-white/20'}`} />
                  ))}
                </div>
                <span className="text-white font-semibold">{doctor.rating}</span>
                <span className="text-white/40 text-sm">({doctor.totalAppointments?.toLocaleString()} total appointments)</span>
              </div>

              {/* Key metrics row */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mt-5">
                <MetricChip icon={<Users className="w-4 h-4 text-indigo-400" />} label="Patients" value={doctor.patientsCount.toLocaleString()} />
                <MetricChip icon={<TrendingUp className="w-4 h-4 text-emerald-400" />} label="Experience" value={`${doctor.experience} yrs`} />
                <MetricChip icon={<BarChart2 className="w-4 h-4 text-violet-400" />} label="Completion" value={`${doctor.completionRate ?? 95}%`} />
                <MetricChip icon={<DollarSign className="w-4 h-4 text-amber-400" />} label="Fee / Visit" value={`$${doctor.consultationFee}`} />
              </div>
            </div>
          </div>

          {/* Contact + Languages row */}
          <div className="mt-6 pt-6 border-t border-white/10 flex flex-wrap gap-4 items-center justify-between">
            <div className="flex flex-wrap gap-4">
              <a href={`mailto:${doctor.email}`} className="flex items-center gap-2 text-sm text-white/60 hover:text-white transition-colors">
                <Mail className="w-4 h-4" /> {doctor.email}
              </a>
              <a href={`tel:${doctor.phone}`} className="flex items-center gap-2 text-sm text-white/60 hover:text-white transition-colors">
                <Phone className="w-4 h-4" /> {doctor.phone}
              </a>
              {doctor.joinedDate && (
                <div className="flex items-center gap-2 text-sm text-white/60">
                  <Calendar className="w-4 h-4" />
                  Joined {new Date(doctor.joinedDate).toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
                </div>
              )}
            </div>
            {doctor.languages && (
              <div className="flex items-center gap-2">
                <Globe className="w-4 h-4 text-white/40" />
                {doctor.languages.map(lang => (
                  <span key={lang} className="px-2.5 py-1 rounded-full bg-white/10 text-white/70 text-xs">{lang}</span>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex overflow-x-auto gap-1 p-1 bg-white/5 rounded-2xl border border-white/10">
        {TABS.map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`
              flex items-center gap-2 px-5 py-2.5 rounded-xl whitespace-nowrap transition-all font-medium text-sm flex-shrink-0
              ${activeTab === tab.id
                ? 'bg-gradient-to-r from-indigo-500 to-violet-500 text-white shadow-lg'
                : 'text-white/60 hover:text-white hover:bg-white/10'
              }
            `}
          >
            {tab.icon} {tab.label}
            {tab.id === 'appointments' && (
              <span className="w-5 h-5 rounded-full bg-white/20 text-white text-xs flex items-center justify-center">
                {doctorAppointments.length}
              </span>
            )}
            {tab.id === 'patients' && (
              <span className="w-5 h-5 rounded-full bg-white/20 text-white text-xs flex items-center justify-center">
                {uniquePatientIds.length}
              </span>
            )}
          </button>
        ))}
      </div>

      {/* Tab Content */}
      {activeTab === 'overview' && (
        <OverviewTab doctor={doctor} completed={completed} scheduled={scheduled} cancelled={cancelled} noShow={noShow} monthlyData={monthlyData} />
      )}
      {activeTab === 'appointments' && (
        <AppointmentsTab
          appointments={sortedApts}
          allAppointments={doctorAppointments}
          filter={aptFilter}
          onFilterChange={setAptFilter}
          scheduled={scheduled} completed={completed} cancelled={cancelled} noShow={noShow}
        />
      )}
      {activeTab === 'schedule' && (
        <ScheduleTab doctor={doctor} availableDays={availableDays} />
      )}
      {activeTab === 'patients' && (
        <PatientsTab patients={doctorPatients} appointments={doctorAppointments} />
      )}
    </div>
  );
};

// ── Metric Chip ────────────────────────────────────────────────────────────────
const MetricChip: React.FC<{ icon: React.ReactNode; label: string; value: string }> = ({ icon, label, value }) => (
  <div className="flex items-center gap-2 p-3 rounded-xl bg-white/5 border border-white/10">
    <div className="p-1.5 rounded-lg bg-white/10 flex-shrink-0">{icon}</div>
    <div>
      <p className="text-xs text-white/40">{label}</p>
      <p className="text-sm font-semibold text-white">{value}</p>
    </div>
  </div>
);

// ── Overview Tab ───────────────────────────────────────────────────────────────
const OverviewTab: React.FC<{
  doctor: NonNullable<ReturnType<typeof db.doctors.find>>;
  completed: number; scheduled: number; cancelled: number; noShow: number;
  monthlyData: { month: string; completed: number; total: number }[];
}> = ({ doctor, completed, scheduled, cancelled, noShow, monthlyData }) => (
  <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
    {/* Left: Bio + Achievements */}
    <div className="lg:col-span-2 space-y-6">
      {/* Bio */}
      {doctor.bio && (
        <GlassCard>
          <div className="flex items-center gap-2 mb-4">
            <Stethoscope className="w-5 h-5 text-indigo-400" />
            <h3 className="font-semibold text-white">About</h3>
          </div>
          <p className="text-white/75 leading-relaxed">{doctor.bio}</p>
        </GlassCard>
      )}

      {/* Monthly Performance Chart */}
      {monthlyData.length > 0 && (
        <GlassCard>
          <div className="flex items-center justify-between mb-5">
            <div>
              <h3 className="font-semibold text-white flex items-center gap-2">
                <Activity className="w-5 h-5 text-violet-400" />
                Appointment Activity
              </h3>
              <p className="text-sm text-white/50">Completed vs total appointments</p>
            </div>
          </div>
          <div className="h-52">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={monthlyData} barGap={4}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                <XAxis dataKey="month" stroke="rgba(255,255,255,0.4)" tick={{ fontSize: 12 }} />
                <YAxis stroke="rgba(255,255,255,0.4)" tick={{ fontSize: 12 }} />
                <Tooltip
                  contentStyle={{ backgroundColor: 'rgba(15,23,42,0.95)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '12px', color: '#fff' }}
                />
                <Bar dataKey="total" fill="rgba(99,102,241,0.2)" radius={[6,6,0,0]} name="Total" />
                <Bar dataKey="completed" fill="#6366f1" radius={[6,6,0,0]} name="Completed" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </GlassCard>
      )}

      {/* Achievements */}
      {doctor.achievements && doctor.achievements.length > 0 && (
        <GlassCard>
          <div className="flex items-center gap-2 mb-4">
            <Award className="w-5 h-5 text-amber-400" />
            <h3 className="font-semibold text-white">Achievements & Certifications</h3>
          </div>
          <div className="space-y-3">
            {doctor.achievements.map((ach, i) => (
              <div key={i} className="flex items-start gap-3 p-3 rounded-xl bg-amber-500/10 border border-amber-500/20">
                <div className="w-6 h-6 rounded-full bg-amber-500/20 flex items-center justify-center flex-shrink-0 mt-0.5">
                  <CheckCircle className="w-3.5 h-3.5 text-amber-400" />
                </div>
                <span className="text-sm text-white/80">{ach}</span>
              </div>
            ))}
          </div>
        </GlassCard>
      )}
    </div>

    {/* Right: Stats */}
    <div className="space-y-5">
      {/* Appointment Breakdown */}
      <GlassCard>
        <h3 className="font-semibold text-white mb-4 flex items-center gap-2">
          <BarChart2 className="w-4 h-4 text-indigo-400" /> Appointment Stats
        </h3>
        <div className="space-y-3">
          {[
            { label: 'Scheduled', count: scheduled, color: 'bg-indigo-500', text: 'text-indigo-400' },
            { label: 'Completed', count: completed, color: 'bg-emerald-500', text: 'text-emerald-400' },
            { label: 'Cancelled', count: cancelled, color: 'bg-red-500', text: 'text-red-400' },
            { label: 'No-Show', count: noShow, color: 'bg-amber-500', text: 'text-amber-400' },
          ].map(({ label, count, color, text }) => {
            const total = scheduled + completed + cancelled + noShow || 1;
            return (
              <div key={label}>
                <div className="flex items-center justify-between mb-1">
                  <span className="text-sm text-white/60">{label}</span>
                  <span className={`text-sm font-semibold ${text}`}>{count}</span>
                </div>
                <div className="h-1.5 bg-white/10 rounded-full overflow-hidden">
                  <div className={`h-full rounded-full ${color}`} style={{ width: `${(count / total) * 100}%` }} />
                </div>
              </div>
            );
          })}
        </div>
      </GlassCard>

      {/* Quick Info */}
      <GlassCard>
        <h3 className="font-semibold text-white mb-4">Quick Info</h3>
        <div className="space-y-3">
          <InfoRow label="Department" value={doctor.department} />
          <InfoRow label="Qualification" value={doctor.qualification} />
          <InfoRow label="Experience" value={`${doctor.experience} years`} />
          {doctor.consultationFee && <InfoRow label="Consultation Fee" value={`$${doctor.consultationFee}`} />}
          {doctor.completionRate && <InfoRow label="Completion Rate" value={`${doctor.completionRate}%`} />}
          {doctor.joinedDate && <InfoRow label="Member Since" value={new Date(doctor.joinedDate).getFullYear().toString()} />}
        </div>
      </GlassCard>

      {/* Languages */}
      {doctor.languages && (
        <GlassCard>
          <h3 className="font-semibold text-white mb-3 flex items-center gap-2">
            <Globe className="w-4 h-4 text-cyan-400" /> Languages
          </h3>
          <div className="flex flex-wrap gap-2">
            {doctor.languages.map(lang => (
              <span key={lang} className="px-3 py-1.5 rounded-xl bg-cyan-500/10 border border-cyan-500/20 text-sm text-cyan-300">{lang}</span>
            ))}
          </div>
        </GlassCard>
      )}
    </div>
  </div>
);

const InfoRow: React.FC<{ label: string; value: string }> = ({ label, value }) => (
  <div className="flex items-center justify-between py-1 border-b border-white/5 last:border-0">
    <span className="text-sm text-white/50">{label}</span>
    <span className="text-sm font-medium text-white">{value}</span>
  </div>
);

// ── Appointments Tab ───────────────────────────────────────────────────────────
const AppointmentsTab: React.FC<{
  appointments: Appointment[];
  allAppointments: Appointment[];
  filter: string;
  onFilterChange: (f: string) => void;
  scheduled: number; completed: number; cancelled: number; noShow: number;
}> = ({ appointments, allAppointments, filter, onFilterChange, scheduled, completed, cancelled, noShow }) => {
  const navigate = useNavigate();
  const [openId, setOpenId] = useState<string | null>(null);

  return (
    <div className="space-y-5">
      {/* Summary Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {[
          { label: 'Scheduled', count: scheduled, color: 'text-indigo-400', bg: 'bg-indigo-500/15' },
          { label: 'Completed', count: completed, color: 'text-emerald-400', bg: 'bg-emerald-500/15' },
          { label: 'Cancelled', count: cancelled, color: 'text-red-400', bg: 'bg-red-500/15' },
          { label: 'No-Show',   count: noShow,    color: 'text-amber-400', bg: 'bg-amber-500/15' },
        ].map((s, i) => (
          <div key={s.label} className={cn('reveal p-4 rounded-2xl border border-[var(--border)]', s.bg)} style={{ animationDelay: `${i * 60}ms` }}>
            <div className={`text-3xl font-bold ${s.color} mb-1`}>{s.count}</div>
            <div className="text-sm text-app-muted">{s.label}</div>
          </div>
        ))}
      </div>

      {/* Filter */}
      <div className="flex flex-wrap gap-2">
        {['All', 'Scheduled', 'Completed', 'Cancelled', 'No-Show'].map(f => (
          <button
            key={f}
            onClick={() => onFilterChange(f)}
            className={cn(
              'h-9 px-3.5 rounded-lg text-sm font-medium inline-flex items-center gap-2 transition-all border',
              filter === f
                ? 'bg-primary/15 border-primary/40 text-app'
                : 'bg-[var(--surface-2)] border-[var(--border)] text-app-muted hover:text-app hover:border-[var(--border-strong)]'
            )}
          >
            {f}
            {f !== 'All' && (
              <span className={cn('px-1.5 rounded-full text-[11px]', filter === f ? 'bg-primary/20 text-app' : 'bg-[var(--surface-3)] text-app-subtle')}>
                {allAppointments.filter(a => a.status === f).length}
              </span>
            )}
          </button>
        ))}
      </div>

      {/* Appointments List */}
      <div className="space-y-3">
        {appointments.length === 0 ? (
          <GlassCard className="text-center py-10">
            <Calendar className="w-12 h-12 text-app-subtle opacity-50 mx-auto mb-3" />
            <p className="text-app-muted">No appointments found</p>
          </GlassCard>
        ) : (
          appointments.map((apt, i) => {
            const patient = db.patients.find(p => p.id === apt.patientId);
            const record = patient?.medicalHistory?.find(r => r.date === apt.date);
            const isOpen = openId === apt.id;
            const d = new Date(apt.date + 'T00:00:00');
            return (
              <GlassCard key={apt.id} hover={false} padding="none" className="reveal overflow-hidden" style={{ animationDelay: `${i * 40}ms` }}>
                {/* Summary row — click to expand */}
                <button onClick={() => setOpenId(isOpen ? null : apt.id)} className="w-full text-left flex items-center gap-3 sm:gap-4 p-4 hover:bg-[var(--surface-2)] transition-colors">
                  <div className={cn('w-1.5 self-stretch rounded-full flex-shrink-0',
                    apt.status === 'Scheduled' ? 'bg-indigo-500' : apt.status === 'Completed' ? 'bg-emerald-500' : apt.status === 'Cancelled' ? 'bg-red-500' : 'bg-amber-500')} />
                  {patient?.avatar ? (
                    <img src={patient.avatar} alt={apt.patientName} className="w-11 h-11 rounded-full border border-[var(--border)] object-cover flex-shrink-0" />
                  ) : (
                    <div className="w-11 h-11 rounded-full bg-[var(--surface-3)] flex items-center justify-center flex-shrink-0"><UserRound className="w-5 h-5 text-app-subtle" /></div>
                  )}
                  <div className="flex-1 min-w-0">
                    <div className="flex flex-wrap items-center gap-2 mb-0.5">
                      <span className="font-semibold text-app">{apt.patientName}</span>
                      <GlassBadge variant={APT_STATUS_CONFIG[apt.status].variant} size="sm">{apt.status}</GlassBadge>
                      <span className={cn('inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs',
                        apt.type === 'Video' ? 'bg-violet-500/15 text-violet-300' : apt.type === 'Phone' ? 'bg-cyan-500/15 text-cyan-300' : 'bg-indigo-500/15 text-indigo-300')}>
                        {apt.type === 'Video' ? <Video className="w-3 h-3" /> : apt.type === 'Phone' ? <Phone className="w-3 h-3" /> : <UserRound className="w-3 h-3" />}{apt.type}
                      </span>
                    </div>
                    <div className="flex flex-wrap items-center gap-3 text-xs text-app-subtle">
                      <span className="flex items-center gap-1"><Calendar className="w-3 h-3" />{d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</span>
                      <span className="flex items-center gap-1"><Clock className="w-3 h-3" />{apt.time}</span>
                    </div>
                  </div>
                  <ChevronDown className={cn('w-5 h-5 text-app-subtle flex-shrink-0 transition-transform', isOpen && 'rotate-180')} />
                </button>

                {/* Expanded details */}
                {isOpen && (
                  <div className="px-4 pb-4 pt-1 border-t border-[var(--border)] reveal">
                    {/* Patient + visit info */}
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-3">
                      <DetailItem icon={<UserRound className="w-4 h-4 text-white/40" />} label="Patient" value={`${apt.patientName}${patient ? ` · ${patient.age}y ${patient.gender}` : ''}`} />
                      <DetailItem icon={<Clock className="w-4 h-4 text-white/40" />} label="Time" value={`${apt.time}`} />
                      <DetailItem icon={<Calendar className="w-4 h-4 text-white/40" />} label="Date" value={d.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric', year: 'numeric' })} />
                      <DetailItem icon={<FileText className="w-4 h-4 text-white/40" />} label="Reference" value={apt.id} />
                      {patient && <DetailItem icon={<Phone className="w-4 h-4 text-white/40" />} label="Contact" value={patient.phone} />}
                      <DetailItem icon={<Stethoscope className="w-4 h-4 text-white/40" />} label="Type" value={apt.type} />
                    </div>

                    {apt.notes && (
                      <div className="mt-3 p-3 rounded-xl bg-[var(--surface-2)] border border-[var(--border)]">
                        <p className="text-xs text-app-subtle mb-1 flex items-center gap-1"><FileText className="w-3.5 h-3.5" /> Appointment note</p>
                        <p className="text-sm text-app-muted italic">"{apt.notes}"</p>
                      </div>
                    )}

                    {/* What was recommended at this visit */}
                    {record ? (
                      <div className="mt-3 p-4 rounded-xl bg-emerald-500/[0.07] border border-emerald-500/20">
                        <p className="text-xs text-emerald-300 mb-2 flex items-center gap-1.5"><CheckCircle className="w-3.5 h-3.5" /> Diagnosis & recommendation</p>
                        <p className="text-sm font-semibold text-app">{record.diagnosis}</p>
                        {record.notes && <p className="text-sm text-app-muted italic mt-1">"{record.notes}"</p>}
                        {record.medications.length > 0 && (
                          <div className="mt-3">
                            <p className="text-xs text-app-subtle mb-1.5">Prescribed</p>
                            <div className="flex flex-wrap gap-1.5">
                              {record.medications.map((m, mi) => (
                                <span key={mi} className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-xs bg-[var(--surface-2)] text-app-muted">
                                  <Pill className="w-3 h-3 text-emerald-400" />{m}
                                </span>
                              ))}
                            </div>
                          </div>
                        )}
                        {record.followUpDate && (
                          <p className="text-xs text-amber-300 mt-2.5 flex items-center gap-1"><Calendar className="w-3 h-3" /> Follow-up: {record.followUpDate}</p>
                        )}
                      </div>
                    ) : apt.status === 'Completed' ? (
                      <p className="mt-3 text-xs text-app-subtle italic">No clinical record was logged for this visit.</p>
                    ) : null}

                    <div className="flex flex-wrap gap-2 mt-3">
                      <GlassButton variant="primary" size="sm" onClick={() => navigate(`/patients/${apt.patientId}`)}>
                        <UserRound className="w-3.5 h-3.5" /> View patient
                        <ArrowRight className="w-3.5 h-3.5" />
                      </GlassButton>
                      <GlassButton variant="ghost" size="sm" onClick={() => navigate(`/appointments/${apt.id}/edit`)}>
                        <Edit className="w-3.5 h-3.5" /> Edit appointment
                      </GlassButton>
                    </div>
                  </div>
                )}
              </GlassCard>
            );
          })
        )}
      </div>
    </div>
  );
};

const DetailItem: React.FC<{ icon: React.ReactNode; label: string; value: string }> = ({ icon, label, value }) => (
  <div className="flex items-start gap-2">
    <div className="mt-0.5 flex-shrink-0">{icon}</div>
    <div className="min-w-0">
      <p className="text-xs text-app-subtle">{label}</p>
      <p className="text-sm text-app truncate">{value}</p>
    </div>
  </div>
);

// ── Schedule Tab ───────────────────────────────────────────────────────────────
const ScheduleTab: React.FC<{
  doctor: NonNullable<ReturnType<typeof db.doctors.find>>;
  availableDays: number;
}> = ({ doctor, availableDays }) => (
  <div className="space-y-6">
    {/* Summary */}
    <div className="grid grid-cols-3 gap-4">
      <GlassCard className="text-center">
        <div className="text-3xl font-bold text-indigo-400 mb-1">{availableDays}</div>
        <div className="text-sm text-white/60">Available Days</div>
      </GlassCard>
      <GlassCard className="text-center">
        <div className="text-3xl font-bold text-emerald-400 mb-1">
          {doctor.schedule.reduce((acc, s) => {
            if (!s.isAvailable) return acc;
            const [sh, sm] = s.startTime.split(':').map(Number);
            const [eh, em] = s.endTime.split(':').map(Number);
            return acc + (eh * 60 + em - sh * 60 - sm);
          }, 0) / 60}h
        </div>
        <div className="text-sm text-white/60">Weekly Hours</div>
      </GlassCard>
      <GlassCard className="text-center">
        <div className="text-3xl font-bold text-violet-400 mb-1">{5 - availableDays}</div>
        <div className="text-sm text-white/60">Days Off</div>
      </GlassCard>
    </div>

    {/* Schedule Grid */}
    <GlassCard>
      <h3 className="font-semibold text-white mb-5 flex items-center gap-2">
        <Clock className="w-5 h-5 text-indigo-400" /> Weekly Schedule
      </h3>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
        {doctor.schedule.map(slot => (
          <div
            key={slot.day}
            className={`
              p-5 rounded-2xl border transition-all duration-200
              ${slot.isAvailable
                ? 'bg-indigo-500/10 border-indigo-500/30 hover:bg-indigo-500/20'
                : 'bg-white/5 border-white/5 opacity-50'
              }
            `}
          >
            <div className="flex items-center justify-between mb-3">
              <span className="font-semibold text-white text-sm">{slot.day}</span>
              <div className={`w-2.5 h-2.5 rounded-full ${slot.isAvailable ? 'bg-emerald-500' : 'bg-red-500/60'}`} />
            </div>
            {slot.isAvailable ? (
              <>
                <div className="flex items-center gap-1.5 text-xs text-white/60 mb-1">
                  <Clock className="w-3 h-3" /> {slot.startTime}
                </div>
                <div className="text-center text-white/30 text-xs my-1">↓</div>
                <div className="flex items-center gap-1.5 text-xs text-white/60">
                  <Clock className="w-3 h-3" /> {slot.endTime}
                </div>
                <div className="mt-3 text-xs text-indigo-400 font-medium text-center">
                  {(() => {
                    const [sh, sm] = slot.startTime.split(':').map(Number);
                    const [eh, em] = slot.endTime.split(':').map(Number);
                    const hours = (eh * 60 + em - sh * 60 - sm) / 60;
                    return `${hours}h shift`;
                  })()}
                </div>
              </>
            ) : (
              <div className="text-center mt-2">
                <span className="text-xs text-white/30">Not Available</span>
              </div>
            )}
          </div>
        ))}
      </div>
    </GlassCard>
  </div>
);

// ── Patients Tab ───────────────────────────────────────────────────────────────
const PatientsTab: React.FC<{
  patients: (NonNullable<ReturnType<typeof db.patients.find>> | undefined)[];
  appointments: Appointment[];
}> = ({ patients, appointments }) => (
  <div className="space-y-4">
    <div className="flex items-center justify-between">
      <div>
        <h3 className="text-lg font-semibold text-white">Patients Under Care</h3>
        <p className="text-white/50 text-sm">{patients.length} unique patient{patients.length !== 1 ? 's' : ''} seen</p>
      </div>
    </div>
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      {patients.map(patient => {
        if (!patient) return null;
        const patientApts = appointments.filter(a => a.patientId === patient.id);
        const lastApt = [...patientApts].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())[0];
        return (
          <GlassCard key={patient.id} className="flex items-center gap-4 hover:bg-white/8 transition-colors">
            <img src={patient.avatar} alt={patient.name} className="w-12 h-12 rounded-xl border border-white/10 flex-shrink-0" />
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2">
                <span className="font-semibold text-white">{patient.name}</span>
                <GlassBadge
                  variant={patient.status === 'Active' ? 'success' : patient.status === 'Critical' ? 'danger' : 'default'}
                  size="sm"
                >{patient.status}</GlassBadge>
              </div>
              <div className="text-xs text-white/50 mt-0.5">
                {patient.age} yrs · {patient.gender} · {patient.bloodGroup}
              </div>
              {lastApt && (
                <div className="text-xs text-white/40 mt-1 flex items-center gap-1">
                  <Calendar className="w-3 h-3" />
                  Last visit: {lastApt.date} · {patientApts.length} appointment{patientApts.length !== 1 ? 's' : ''}
                </div>
              )}
            </div>
            {patient.aiRiskScore !== undefined && (
              <div className="text-right flex-shrink-0">
                <div className={`text-lg font-bold ${
                  patient.aiRiskScore >= 70 ? 'text-red-400' :
                  patient.aiRiskScore >= 40 ? 'text-amber-400' : 'text-emerald-400'
                }`}>{patient.aiRiskScore}</div>
                <div className="text-xs text-white/30">AI Risk</div>
              </div>
            )}
          </GlassCard>
        );
      })}
    </div>
  </div>
);
