import React, { useMemo } from 'react';
import { Sparkles, Check, Lock, CalendarDays, Receipt, FlaskConical } from 'lucide-react';
import { NAV_BY_ID } from '../../data/navigation';
import { buildAIActions } from '../../data/aiActions';
import { cn } from '../../utils/cn';
import type { AccessRole } from '../../types/access';

/** Built once: the same drafted actions the app itself will show after sign-in. */
const ALL_ACTIONS = buildAIActions();

/**
 * A miniature of the app the selected role actually gets, rendered from the
 * same nav and action data the real screens use. It exists so the login page
 * shows what a role means instead of describing it.
 */
export const RoleWorkspacePreview: React.FC<{ role: AccessRole }> = ({ role }) => {
  const actions = useMemo(() => {
    const kinds = new Set(role.actionKinds);
    return ALL_ACTIONS.filter(a => kinds.has(a.kind));
  }, [role]);

  const navItems = role.navIds.map(id => NAV_BY_ID[id]).filter(Boolean);
  const isPatient = role.shell === 'patient';

  return (
    <div className="relative">
      {/* Ambient glow keyed to the role's accent */}
      <div
        className={cn(
          'absolute -inset-6 rounded-[2rem] blur-3xl opacity-40 transition-all duration-700',
          role.accent.bg
        )}
        aria-hidden="true"
      />

      <div
        key={role.id}
        className="reveal relative rounded-2xl border border-[var(--border-strong)] bg-[var(--surface-solid)] overflow-hidden shadow-lifted"
      >
        {/* Window chrome */}
        <div className="flex items-center gap-1.5 px-3 py-2.5 border-b border-[var(--border)] bg-[var(--surface-2)]">
          <span className="w-2.5 h-2.5 rounded-full bg-red-400/70" />
          <span className="w-2.5 h-2.5 rounded-full bg-amber-400/70" />
          <span className="w-2.5 h-2.5 rounded-full bg-emerald-400/70" />
          <span className="ml-2 text-[10px] font-medium text-app-subtle truncate">
            mediai.app{isPatient ? '/portal' : role.home}
          </span>
        </div>

        {isPatient ? <PatientPreview role={role} /> : (
          <div className="flex h-[268px]">
            {/* Mini sidebar */}
            <div className="w-[38%] border-r border-[var(--border)] bg-[var(--surface-1)] p-2.5 space-y-1">
              <div className="flex items-center gap-1.5 px-1.5 pb-2">
                <div className="w-4 h-4 rounded-md bg-gradient-to-br from-primary to-accent flex-shrink-0" />
                <span className="text-[9px] font-bold text-app truncate">MediAI</span>
              </div>
              {navItems.map((item, i) => (
                <div
                  key={item.id}
                  className={cn(
                    'reveal flex items-center gap-1.5 px-1.5 py-1.5 rounded-md',
                    i === 0 ? cn(role.accent.bg) : ''
                  )}
                  style={{ animationDelay: `${100 + i * 55}ms` }}
                >
                  <item.icon className={cn('w-3 h-3 flex-shrink-0', i === 0 ? role.accent.text : 'text-app-subtle')} />
                  <span className={cn('text-[9px] font-medium truncate', i === 0 ? 'text-app' : 'text-app-muted')}>
                    {item.label}
                  </span>
                </div>
              ))}
            </div>

            {/* Mini content — the approval queue this role would land on */}
            <div className="flex-1 p-3 min-w-0">
              <div className="flex items-center justify-between gap-2 mb-2.5">
                <div className="min-w-0">
                  <p className="text-[10px] font-bold text-app truncate">{role.name}</p>
                  <p className="text-[8px] text-app-subtle truncate">{role.demoUser.name}</p>
                </div>
                {actions.length > 0 && (
                  <span className={cn('px-1.5 py-0.5 rounded-md text-[8px] font-bold flex-shrink-0', role.accent.bg, role.accent.text)}>
                    {actions.length}
                  </span>
                )}
              </div>

              {actions.length === 0 ? (
                <div className="h-[190px] flex items-center justify-center text-center px-2">
                  <p className="text-[9px] text-app-subtle leading-relaxed">
                    No approvals routed to this role
                  </p>
                </div>
              ) : (
                <>
                  <p className="text-[8px] uppercase tracking-wider font-semibold text-app-subtle mb-1.5 flex items-center gap-1">
                    <Sparkles className="w-2 h-2" /> Ready to approve
                  </p>
                  <div className="space-y-1.5">
                    {actions.slice(0, 3).map((action, i) => (
                      <div
                        key={action.id}
                        className="reveal rounded-lg border border-[var(--border)] bg-[var(--surface-1)] p-2"
                        style={{ animationDelay: `${260 + i * 90}ms` }}
                      >
                        <div className="flex items-center gap-1.5">
                          <p className="text-[9px] font-semibold text-app truncate flex-1">{action.label}</p>
                          {action.requiresClinician ? (
                            <Lock className="w-2 h-2 text-amber-400 flex-shrink-0" />
                          ) : (
                            <span className="px-1 py-px rounded bg-emerald-500/15 text-emerald-400 text-[7px] font-bold flex-shrink-0">
                              <Check className="w-2 h-2" />
                            </span>
                          )}
                        </div>
                        <p className="text-[8px] text-app-subtle truncate mt-0.5">{action.detail}</p>
                      </div>
                    ))}
                  </div>
                  {actions.length > 3 && (
                    <p className="text-[8px] text-app-subtle mt-1.5 text-center">
                      +{actions.length - 3} more
                    </p>
                  )}
                </>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

/** Patients get a different shell, so the preview shows a different shape too. */
const PatientPreview: React.FC<{ role: AccessRole }> = ({ role }) => (
  <div className="h-[268px] p-3.5">
    <div className="flex items-center gap-2 mb-3">
      <div className="w-4 h-4 rounded-md bg-gradient-to-br from-primary to-accent flex-shrink-0" />
      <span className="text-[9px] font-bold text-app">Patient portal</span>
      <img src={role.demoUser.avatar} alt="" className="w-4 h-4 rounded-md ml-auto" />
    </div>

    <div
      className="reveal rounded-lg border border-[var(--border)] bg-[var(--surface-1)] p-2.5 mb-2"
      style={{ animationDelay: '120ms' }}
    >
      <span className={cn('inline-block px-1.5 py-px rounded text-[7px] font-bold mb-1.5', role.accent.bg, role.accent.text)}>
        NEXT APPOINTMENT
      </span>
      <p className="text-[10px] font-bold text-app">Dr. James Wilson</p>
      <p className="text-[8px] text-app-subtle mt-0.5">Internal Medicine · Thu, 09:30</p>
      <div className="flex gap-1 mt-2">
        <span className="px-1.5 py-0.5 rounded bg-primary/20 text-primary-light text-[7px] font-bold">Join</span>
        <span className="px-1.5 py-0.5 rounded bg-[var(--surface-3)] text-app-muted text-[7px] font-bold">Reschedule</span>
      </div>
    </div>

    <div className="grid grid-cols-3 gap-1.5">
      {[
        { icon: FlaskConical, label: 'Results', value: '2' },
        { icon: Receipt, label: 'Due', value: '$0' },
        { icon: CalendarDays, label: 'Visits', value: '4' },
      ].map((tile, i) => (
        <div
          key={tile.label}
          className="reveal rounded-lg border border-[var(--border)] bg-[var(--surface-1)] p-2 text-center"
          style={{ animationDelay: `${200 + i * 80}ms` }}
        >
          <tile.icon className="w-2.5 h-2.5 text-app-subtle mx-auto mb-1" />
          <p className="text-[10px] font-bold text-app leading-none">{tile.value}</p>
          <p className="text-[7px] text-app-subtle mt-0.5">{tile.label}</p>
        </div>
      ))}
    </div>

    <p className="text-[8px] text-app-subtle text-center mt-3 leading-relaxed px-2">
      No sidebar, no admin tools — only their own care
    </p>
  </div>
);
