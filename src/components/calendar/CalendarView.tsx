import React, { useState, useMemo } from 'react';
import {
  ChevronLeft, ChevronRight, Clock, Video, Phone, UserRound,
  Calendar, Stethoscope, FileText, Edit, CheckCircle, XCircle,
  AlertCircle, TrendingUp
} from 'lucide-react';
import { GlassCard } from '../ui/GlassCard';
import { GlassBadge } from '../ui/GlassBadge';
import { db } from '../../data';
import type { Appointment } from '../../types';

interface CalendarViewProps {
  appointments: Appointment[];
  onSelectAppointment: (appointment: Appointment) => void;
  onDateSelect: (date: string) => void;
}

const daysOfWeek = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

const STATUS_CONFIG = {
  Scheduled:  { color: 'bg-indigo-500',  text: 'text-indigo-300',  border: 'border-indigo-500/40',  bg: 'bg-indigo-500/15',  dot: 'bg-indigo-400',  badge: 'primary'  as const },
  Completed:  { color: 'bg-emerald-500', text: 'text-emerald-300', border: 'border-emerald-500/40', bg: 'bg-emerald-500/15', dot: 'bg-emerald-400', badge: 'success'  as const },
  Cancelled:  { color: 'bg-red-500',     text: 'text-red-300',     border: 'border-red-500/40',     bg: 'bg-red-500/15',     dot: 'bg-red-400',     badge: 'danger'   as const },
  'No-Show':  { color: 'bg-amber-500',   text: 'text-amber-300',   border: 'border-amber-500/40',   bg: 'bg-amber-500/15',   dot: 'bg-amber-400',   badge: 'warning'  as const },
};

const TYPE_ICON = {
  'In-Person': <UserRound className="w-3 h-3" />,
  'Video':     <Video className="w-3 h-3" />,
  'Phone':     <Phone className="w-3 h-3" />,
};

const TYPE_COLOR = {
  'In-Person': 'text-indigo-300',
  'Video':     'text-violet-300',
  'Phone':     'text-cyan-300',
};

export const CalendarView: React.FC<CalendarViewProps> = ({
  appointments,
  onSelectAppointment,
  onDateSelect,
}) => {
  // Default to the month of the most recent appointment so the calendar always
  // lands on data (mock data may not be in the current real-world month).
  const [currentDate, setCurrentDate] = useState(() => {
    const dates = appointments.map(a => a.date).sort();
    const latest = dates[dates.length - 1];
    return latest ? new Date(latest + 'T00:00:00') : new Date();
  });
  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  const [selectedApt, setSelectedApt] = useState<Appointment | null>(null);

  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();

  // Build 42-cell grid
  const days = useMemo(() => {
    const firstDay = new Date(year, month, 1).getDay();
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    const daysInPrevMonth = new Date(year, month, 0).getDate();
    const result: { date: number; month: 'prev' | 'current' | 'next'; fullDate: string }[] = [];

    for (let i = firstDay - 1; i >= 0; i--) {
      const d = new Date(year, month - 1, daysInPrevMonth - i);
      result.push({ date: daysInPrevMonth - i, month: 'prev', fullDate: d.toISOString().split('T')[0] });
    }
    for (let i = 1; i <= daysInMonth; i++) {
      const d = new Date(year, month, i);
      result.push({ date: i, month: 'current', fullDate: d.toISOString().split('T')[0] });
    }
    const remaining = 42 - result.length;
    for (let i = 1; i <= remaining; i++) {
      const d = new Date(year, month + 1, i);
      result.push({ date: i, month: 'next', fullDate: d.toISOString().split('T')[0] });
    }
    return result;
  }, [year, month]);

  // Month-scope stats
  const monthApts = useMemo(() => {
    const prefix = `${year}-${String(month + 1).padStart(2, '0')}`;
    return appointments.filter(a => a.date.startsWith(prefix));
  }, [appointments, year, month]);

  const scheduled = monthApts.filter(a => a.status === 'Scheduled').length;
  const completed  = monthApts.filter(a => a.status === 'Completed').length;
  const cancelled  = monthApts.filter(a => a.status === 'Cancelled').length;
  const noShow     = monthApts.filter(a => a.status === 'No-Show').length;

  // Upcoming (next 7 days from today)
  const today = new Date().toISOString().split('T')[0];
  const upcoming = useMemo(() => {
    const limit = new Date();
    limit.setDate(limit.getDate() + 7);
    const limitStr = limit.toISOString().split('T')[0];
    return [...appointments]
      .filter(a => a.date >= today && a.date <= limitStr && a.status === 'Scheduled')
      .sort((a, b) => a.date.localeCompare(b.date) || a.time.localeCompare(b.time))
      .slice(0, 6);
  }, [appointments, today]);

  const getDateApts = (date: string) => appointments.filter(a => a.date === date);

  const navigateMonth = (dir: 'prev' | 'next') => {
    setCurrentDate(prev => {
      const d = new Date(prev);
      d.setMonth(prev.getMonth() + (dir === 'next' ? 1 : -1));
      return d;
    });
  };

  const handleDateClick = (fullDate: string) => {
    setSelectedDate(fullDate);
    setSelectedApt(null);
    onDateSelect(fullDate);
  };

  const handleAptClick = (e: React.MouseEvent, apt: Appointment) => {
    e.stopPropagation();
    setSelectedApt(apt);
    setSelectedDate(apt.date);
  };

  const monthName = currentDate.toLocaleString('default', { month: 'long', year: 'numeric' });
  const selectedDateApts = selectedDate ? getDateApts(selectedDate) : [];

  return (
    <div className="space-y-5">

      {/* ── Month Stats Bar ─────────────────────────────────────────────────── */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {[
          { label: 'Total This Month', value: monthApts.length, icon: <Calendar className="w-4 h-4" />, color: 'text-white', bg: 'bg-white/10', border: 'border-white/15' },
          { label: 'Scheduled',        value: scheduled,        icon: <TrendingUp className="w-4 h-4" />, color: 'text-indigo-300',  bg: 'bg-indigo-500/15',  border: 'border-indigo-500/30' },
          { label: 'Completed',        value: completed,        icon: <CheckCircle className="w-4 h-4" />, color: 'text-emerald-300', bg: 'bg-emerald-500/15', border: 'border-emerald-500/30' },
          { label: 'Cancelled / NS',   value: cancelled + noShow, icon: <XCircle className="w-4 h-4" />, color: 'text-red-300',     bg: 'bg-red-500/15',     border: 'border-red-500/30' },
        ].map(s => (
          <div key={s.label} className={`flex items-center gap-3 p-4 rounded-2xl border ${s.bg} ${s.border}`}>
            <div className={`${s.color} flex-shrink-0`}>{s.icon}</div>
            <div>
              <div className={`text-2xl font-bold ${s.color}`}>{s.value}</div>
              <div className="text-xs text-white/50">{s.label}</div>
            </div>
          </div>
        ))}
      </div>

      {/* ── Calendar + Side Panel ────────────────────────────────────────────── */}
      <div className="flex flex-col xl:flex-row gap-5">

        {/* Calendar */}
        <div className="flex-1 min-w-0 space-y-3">
          {/* Navigation */}
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-bold text-white">{monthName}</h2>
            <div className="flex gap-1">
              <button onClick={() => navigateMonth('prev')} className="p-2 hover:bg-white/10 rounded-xl transition-colors">
                <ChevronLeft className="w-5 h-5 text-white" />
              </button>
              <button
                onClick={() => { setCurrentDate(new Date()); handleDateClick(today); }}
                className="px-4 py-2 text-sm font-medium text-white hover:bg-white/10 rounded-xl transition-colors border border-white/10"
              >
                Today
              </button>
              <button onClick={() => navigateMonth('next')} className="p-2 hover:bg-white/10 rounded-xl transition-colors">
                <ChevronRight className="w-5 h-5 text-white" />
              </button>
            </div>
          </div>

          <GlassCard padding="none" className="overflow-hidden">
            {/* Day headers */}
            <div className="grid grid-cols-7 border-b border-white/10">
              {daysOfWeek.map(d => (
                <div key={d} className="py-3 text-center text-xs font-semibold text-white/50 uppercase tracking-wider">{d}</div>
              ))}
            </div>

            {/* Day cells */}
            <div className="grid grid-cols-7">
              {days.map((day, idx) => {
                const apts = getDateApts(day.fullDate);
                const isToday    = day.fullDate === today;
                const isSelected = day.fullDate === selectedDate;
                const isOther    = day.month !== 'current';
                const isWeekend  = idx % 7 === 0 || idx % 7 === 6;

                return (
                  <div
                    key={idx}
                    onClick={() => handleDateClick(day.fullDate)}
                    className={`
                      min-h-[110px] p-2 border-r border-b border-white/5 cursor-pointer
                      transition-all duration-150
                      ${isOther    ? 'opacity-40' : ''}
                      ${isWeekend && !isOther ? 'bg-white/[0.02]' : ''}
                      ${isToday   ? 'bg-indigo-500/10' : ''}
                      ${isSelected ? 'bg-white/[0.08] ring-inset ring-2 ring-indigo-500/70' : 'hover:bg-white/[0.05]'}
                    `}
                  >
                    {/* Date number */}
                    <div className={`
                      w-7 h-7 flex items-center justify-center rounded-full text-sm font-semibold mb-1.5
                      ${isToday ? 'bg-indigo-500 text-white shadow-lg shadow-indigo-500/40' : 'text-white/80'}
                    `}>
                      {day.date}
                    </div>

                    {/* Appointment pills */}
                    <div className="space-y-1">
                      {apts.slice(0, 2).map((apt, i) => {
                        const sc = STATUS_CONFIG[apt.status];
                        return (
                          <div
                            key={i}
                            onClick={e => handleAptClick(e, apt)}
                            className={`
                              group/pill flex items-center gap-1 px-1.5 py-1 rounded-lg border
                              cursor-pointer hover:brightness-125 transition-all
                              ${sc.bg} ${sc.border}
                            `}
                          >
                            <div className={`w-1.5 h-1.5 rounded-full flex-shrink-0 ${sc.dot}`} />
                            <span className={`text-[10px] font-medium truncate leading-none ${sc.text}`}>
                              {apt.time} {apt.patientName.split(' ')[0]}
                            </span>
                            <span className={`ml-auto flex-shrink-0 ${TYPE_COLOR[apt.type]}`}>
                              {TYPE_ICON[apt.type]}
                            </span>
                          </div>
                        );
                      })}
                      {apts.length === 2 && (
                        // show 3rd inline if exactly 3
                        null
                      )}
                      {apts.length > 2 && (
                        <div className="flex items-center gap-1 px-1.5">
                          <AlertCircle className="w-3 h-3 text-white/30" />
                          <span className="text-[10px] text-white/40">+{apts.length - 2} more</span>
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </GlassCard>

          {/* Legend */}
          <div className="flex flex-wrap items-center gap-4 px-1">
            {(Object.keys(STATUS_CONFIG) as (keyof typeof STATUS_CONFIG)[]).map(status => (
              <div key={status} className="flex items-center gap-1.5">
                <div className={`w-2 h-2 rounded-full ${STATUS_CONFIG[status].dot}`} />
                <span className="text-xs text-white/40">{status}</span>
              </div>
            ))}
            <div className="ml-auto flex items-center gap-3">
              {(['In-Person', 'Video', 'Phone'] as const).map(t => (
                <div key={t} className={`flex items-center gap-1 text-xs ${TYPE_COLOR[t]} opacity-70`}>
                  {TYPE_ICON[t]} {t}
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* ── Right Side Panel ──────────────────────────────────────────────── */}
        <div className="xl:w-80 flex-shrink-0 space-y-4">

          {/* Selected Date Detail */}
          {selectedDate ? (
            <GlassCard className="space-y-4">
              <div className="flex items-center gap-2 pb-3 border-b border-white/10">
                <Calendar className="w-4 h-4 text-indigo-400" />
                <div>
                  <p className="text-sm font-semibold text-white">
                    {new Date(selectedDate + 'T00:00:00').toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}
                  </p>
                  <p className="text-xs text-white/40">{selectedDateApts.length} appointment{selectedDateApts.length !== 1 ? 's' : ''}</p>
                </div>
              </div>

              {selectedDateApts.length === 0 ? (
                <div className="text-center py-6">
                  <Calendar className="w-10 h-10 text-white/10 mx-auto mb-2" />
                  <p className="text-sm text-white/30">No appointments</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {selectedDateApts
                    .sort((a, b) => a.time.localeCompare(b.time))
                    .map(apt => {
                      const sc = STATUS_CONFIG[apt.status];
                      const patient = db.patients.find(p => p.id === apt.patientId);
                      const isActive = selectedApt?.id === apt.id;
                      return (
                        <div
                          key={apt.id}
                          onClick={() => setSelectedApt(isActive ? null : apt)}
                          className={`
                            rounded-2xl border cursor-pointer transition-all duration-200
                            ${isActive ? `${sc.bg} ${sc.border}` : 'bg-white/5 border-white/10 hover:bg-white/8'}
                          `}
                        >
                          {/* Summary row */}
                          <div className="flex items-center gap-3 p-3">
                            {patient?.avatar ? (
                              <img src={patient.avatar} alt={apt.patientName} className="w-9 h-9 rounded-xl border border-white/10 flex-shrink-0 object-cover" />
                            ) : (
                              <div className="w-9 h-9 rounded-xl bg-white/10 flex items-center justify-center flex-shrink-0">
                                <UserRound className="w-4 h-4 text-white/40" />
                              </div>
                            )}
                            <div className="flex-1 min-w-0">
                              <p className="text-sm font-semibold text-white truncate">{apt.patientName}</p>
                              <div className="flex items-center gap-1.5 mt-0.5">
                                <Clock className="w-3 h-3 text-white/30" />
                                <span className="text-xs text-white/50">{apt.time}</span>
                                <span className={`flex items-center gap-0.5 text-xs ${TYPE_COLOR[apt.type]}`}>
                                  {TYPE_ICON[apt.type]} {apt.type}
                                </span>
                              </div>
                            </div>
                            <GlassBadge variant={sc.badge} size="sm">{apt.status}</GlassBadge>
                          </div>

                          {/* Expanded detail */}
                          {isActive && (
                            <div className="px-3 pb-3 space-y-2 border-t border-white/10 pt-3">
                              <div className="flex items-center gap-2 text-xs text-white/60">
                                <Stethoscope className="w-3.5 h-3.5 text-indigo-400" />
                                <span>{apt.doctorName}</span>
                                <span className="text-white/30">·</span>
                                <span>{apt.specialty}</span>
                              </div>
                              {apt.notes && (
                                <div className="flex items-start gap-2 text-xs text-white/50">
                                  <FileText className="w-3.5 h-3.5 flex-shrink-0 mt-0.5 text-white/30" />
                                  <span className="italic">{apt.notes}</span>
                                </div>
                              )}
                              {patient && (
                                <div className="flex items-center gap-2 text-xs text-white/40 pt-1">
                                  <span>Age {patient.age}</span>
                                  <span>·</span>
                                  <span>{patient.gender}</span>
                                  <span>·</span>
                                  <span>{patient.bloodGroup}</span>
                                </div>
                              )}
                              <div className="flex gap-2 pt-1">
                                <button
                                  onClick={e => { e.stopPropagation(); onSelectAppointment(apt); }}
                                  className="flex-1 flex items-center justify-center gap-1.5 py-2 rounded-xl bg-indigo-500/20 hover:bg-indigo-500/30 text-indigo-300 text-xs font-medium transition-colors border border-indigo-500/30"
                                >
                                  <Edit className="w-3 h-3" /> Edit
                                </button>
                              </div>
                            </div>
                          )}
                        </div>
                      );
                    })}
                </div>
              )}
            </GlassCard>
          ) : (
            <GlassCard className="text-center py-8">
              <Calendar className="w-10 h-10 text-white/10 mx-auto mb-3" />
              <p className="text-sm text-white/30">Click a date to see appointments</p>
            </GlassCard>
          )}

          {/* Upcoming Appointments */}
          <GlassCard>
            <div className="flex items-center gap-2 mb-4">
              <div className="w-2 h-2 rounded-full bg-indigo-400 animate-pulse" />
              <h3 className="text-sm font-semibold text-white">Upcoming (Next 7 Days)</h3>
              <span className="ml-auto text-xs text-white/30">{upcoming.length}</span>
            </div>
            {upcoming.length === 0 ? (
              <p className="text-xs text-white/30 text-center py-4">No upcoming appointments</p>
            ) : (
              <div className="space-y-2">
                {upcoming.map(apt => {
                  const patient = db.patients.find(p => p.id === apt.patientId);
                  const aptDate = new Date(apt.date + 'T00:00:00');
                  const isAptToday = apt.date === today;
                  return (
                    <div
                      key={apt.id}
                      onClick={() => { handleDateClick(apt.date); setSelectedApt(apt); }}
                      className="flex items-center gap-3 p-2.5 rounded-xl hover:bg-white/8 cursor-pointer transition-colors group"
                    >
                      {patient?.avatar ? (
                        <img src={patient.avatar} alt={apt.patientName} className="w-8 h-8 rounded-lg border border-white/10 flex-shrink-0 object-cover" />
                      ) : (
                        <div className="w-8 h-8 rounded-lg bg-white/10 flex items-center justify-center flex-shrink-0">
                          <UserRound className="w-4 h-4 text-white/30" />
                        </div>
                      )}
                      <div className="flex-1 min-w-0">
                        <p className="text-xs font-medium text-white truncate">{apt.patientName}</p>
                        <div className="flex items-center gap-1 mt-0.5">
                          <Clock className="w-3 h-3 text-white/25" />
                          <span className="text-[10px] text-white/40">{apt.time}</span>
                          <span className={`flex items-center gap-0.5 text-[10px] ${TYPE_COLOR[apt.type]}`}>
                            {TYPE_ICON[apt.type]}
                          </span>
                        </div>
                      </div>
                      <div className="text-right flex-shrink-0">
                        <div className={`text-[10px] font-semibold ${isAptToday ? 'text-indigo-400' : 'text-white/40'}`}>
                          {isAptToday ? 'Today' : aptDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </GlassCard>

          {/* Type Breakdown */}
          <GlassCard>
            <h3 className="text-sm font-semibold text-white mb-3 flex items-center gap-2">
              <Stethoscope className="w-4 h-4 text-indigo-400" /> Month Breakdown
            </h3>
            <div className="space-y-2.5">
              {(['In-Person', 'Video', 'Phone'] as const).map(t => {
                const count = monthApts.filter(a => a.type === t).length;
                const pct = monthApts.length ? Math.round((count / monthApts.length) * 100) : 0;
                return (
                  <div key={t}>
                    <div className="flex items-center justify-between mb-1">
                      <div className={`flex items-center gap-1.5 text-xs ${TYPE_COLOR[t]}`}>
                        {TYPE_ICON[t]} {t}
                      </div>
                      <span className="text-xs text-white/50">{count} ({pct}%)</span>
                    </div>
                    <div className="h-1.5 bg-white/10 rounded-full overflow-hidden">
                      <div
                        className={`h-full rounded-full transition-all duration-500 ${
                          t === 'In-Person' ? 'bg-indigo-500' :
                          t === 'Video'     ? 'bg-violet-500' : 'bg-cyan-500'
                        }`}
                        style={{ width: `${pct}%` }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </GlassCard>
        </div>
      </div>
    </div>
  );
};
