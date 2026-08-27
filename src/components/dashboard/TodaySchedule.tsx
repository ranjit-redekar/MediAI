import React, { useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  CalendarDays, Clock, Video, Phone, UserRound, CheckCircle2,
  XCircle, AlertCircle, ArrowUpRight, Play, Plus,
} from 'lucide-react';
import { GlassCard } from '../ui/GlassCard';
import { GlassButton } from '../ui/GlassButton';
import { EmptyState } from '../ui/EmptyState';
import { useAppointments } from '../../context/AppointmentsContext';
import { useSession } from '../../context/SessionContext';
import { useToast } from '../../context/ToastContext';
import { db } from '../../data';
import { cn } from '../../utils/cn';
import type { Appointment } from '../../types';
import { todayKey } from '../../utils/date';

const TYPE_ICON = {
  'In-Person': UserRound,
  Video,
  Phone,
} as const;

const STATUS_STYLE: Record<Appointment['status'], { tint: string; label: string; icon: React.ReactNode }> = {
  Scheduled: { tint: 'text-indigo-400', label: 'Upcoming', icon: <Clock className="w-3 h-3" /> },
  Completed: { tint: 'text-emerald-400', label: 'Done', icon: <CheckCircle2 className="w-3 h-3" /> },
  Cancelled: { tint: 'text-red-400', label: 'Cancelled', icon: <XCircle className="w-3 h-3" /> },
  'No-Show': { tint: 'text-amber-400', label: 'No-show', icon: <AlertCircle className="w-3 h-3" /> },
};

/**
 * The clinician's own list for today. Desk roles without a linked doctor see
 * the whole day instead, which is what a receptionist actually needs.
 */
export const TodaySchedule: React.FC = () => {
  const { appointments } = useAppointments();
  const { role } = useSession();
  const { toast } = useToast();
  const navigate = useNavigate();

  const today = todayKey();

  const mine = useMemo(() => {
    const forToday = appointments.filter(a => a.date === today);
    const scoped = role.doctorId
      ? forToday.filter(a => a.doctorId === role.doctorId)
      : forToday;
    return [...scoped].sort((a, b) => a.time.localeCompare(b.time));
  }, [appointments, today, role.doctorId]);

  const remaining = mine.filter(a => a.status === 'Scheduled');
  const done = mine.filter(a => a.status === 'Completed').length;
  // First upcoming slot of the day — the one the clinician acts on next.
  const nextUp = remaining[0];

  const heading = role.doctorId ? 'Your schedule today' : "Today's schedule";

  return (
    <GlassCard hover={false} padding="sm" className="reveal h-full flex flex-col" style={{ animationDelay: '140ms' }}>
      <div className="flex items-start justify-between gap-3 mb-4">
        <div className="flex items-center gap-2 min-w-0">
          <div className="p-1.5 rounded-lg bg-emerald-500/15 flex-shrink-0">
            <CalendarDays className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="min-w-0">
            <h3 className="text-sm font-semibold text-app truncate">{heading}</h3>
            <p className="text-[11px] text-app-subtle">
              {mine.length === 0
                ? 'Nothing booked'
                : `${remaining.length} to go · ${done} done`}
            </p>
          </div>
        </div>

        <GlassButton variant="ghost" size="sm" onClick={() => navigate('/appointments')}>
          Full day <ArrowUpRight className="w-3 h-3" />
        </GlassButton>
      </div>

      {mine.length === 0 ? (
        <EmptyState
          compact
          icon={CalendarDays}
          title="No visits today"
          description={role.doctorId
            ? 'Your list is clear. Anything booked in will appear here.'
            : 'Nothing is on the schedule for today yet.'}
          action={{ label: 'Book a visit', onClick: () => navigate('/appointments/new'), icon: Plus }}
        />
      ) : (
        <div className="space-y-1.5 flex-1">
          {mine.slice(0, 6).map((apt, i) => {
            const TypeIcon = TYPE_ICON[apt.type] ?? UserRound;
            const status = STATUS_STYLE[apt.status];
            const isNext = nextUp?.id === apt.id;
            const patient = db.patients.find(p => p.id === apt.patientId);

            return (
              <div
                key={apt.id}
                className={cn(
                  'reveal flex items-center gap-3 p-2.5 rounded-xl border transition-colors',
                  isNext
                    ? 'bg-primary/[0.08] border-primary/30'
                    : 'bg-[var(--surface-2)] border-transparent hover:border-[var(--border)]',
                  apt.status !== 'Scheduled' && 'opacity-60'
                )}
                style={{ animationDelay: `${140 + i * 50}ms` }}
              >
                <div className="text-center flex-shrink-0 w-11">
                  <p className={cn('text-sm font-bold tabular-nums leading-none', isNext ? 'text-app' : 'text-app-muted')}>
                    {apt.time}
                  </p>
                  {isNext && (
                    <span className="text-[9px] font-bold text-primary-light uppercase tracking-wide">Next</span>
                  )}
                </div>

                <div className="w-px h-8 bg-[var(--border)] flex-shrink-0" />

                <button
                  onClick={() => navigate(`/patients/${apt.patientId}`)}
                  className="flex items-center gap-2 min-w-0 flex-1 text-left focus-ring rounded-lg"
                >
                  {patient?.avatar && (
                    <img src={patient.avatar} alt="" className="w-7 h-7 rounded-lg object-cover flex-shrink-0" />
                  )}
                  <div className="min-w-0">
                    <p className="text-xs font-semibold text-app truncate">{apt.patientName}</p>
                    <p className="text-[11px] text-app-subtle truncate flex items-center gap-1">
                      <TypeIcon className="w-2.5 h-2.5 flex-shrink-0" />
                      {apt.notes || apt.type}
                    </p>
                  </div>
                </button>

                {apt.status === 'Scheduled' ? (
                  <GlassButton
                    variant={isNext ? 'primary' : 'default'}
                    size="sm"
                    className="flex-shrink-0 h-8 px-2.5"
                    onClick={() =>
                      toast(apt.type === 'Video' ? 'Joining video visit' : 'Visit started', {
                        description: `${apt.patientName} · ${apt.time}`,
                        variant: 'info',
                      })
                    }
                  >
                    {apt.type === 'Video'
                      ? <><Video className="w-3 h-3" /> Join</>
                      : <><Play className="w-3 h-3" /> Start</>}
                  </GlassButton>
                ) : (
                  <span className={cn('flex items-center gap-1 text-[11px] font-semibold flex-shrink-0 px-2', status.tint)}>
                    {status.icon} {status.label}
                  </span>
                )}
              </div>
            );
          })}

          {mine.length > 6 && (
            <button
              onClick={() => navigate('/appointments')}
              className="w-full text-center text-[11px] text-app-subtle hover:text-app transition-colors py-1.5 focus-ring rounded-lg"
            >
              +{mine.length - 6} more today
            </button>
          )}
        </div>
      )}
    </GlassCard>
  );
};
