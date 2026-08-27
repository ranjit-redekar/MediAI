import React from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Command, Search, Sparkles, ArrowRight, CornerDownLeft, Users, UserRound,
  LayoutDashboard, Calendar, CreditCard, Pill, FlaskConical, FileText,
  Settings as SettingsIcon, Brain, Shield, Route, UserCog, Plus,
} from 'lucide-react';
import { db } from '../../../data';
import { cn } from '../../../utils/cn';

interface CommandPaletteProps {
  isOpen: boolean;
  onClose: () => void;
}

type Group = 'Actions' | 'Pages' | 'Patients' | 'Doctors' | 'AI Agents';

interface CommandAction {
  id: string;
  label: string;
  description: string;
  group: Group;
  icon: React.ReactNode;
  /** Extra text matched against the query but not displayed. */
  keywords?: string;
  onSelect: () => void;
}

const GROUP_ORDER: Group[] = ['Actions', 'Pages', 'Patients', 'Doctors', 'AI Agents'];

export const CommandPalette: React.FC<CommandPaletteProps> = ({ isOpen, onClose }) => {
  const navigate = useNavigate();
  const inputRef = React.useRef<HTMLInputElement>(null);
  const listRef = React.useRef<HTMLDivElement>(null);
  const [query, setQuery] = React.useState('');
  const [activeIndex, setActiveIndex] = React.useState(0);

  const go = React.useCallback((path: string) => () => navigate(path), [navigate]);

  const actions: CommandAction[] = React.useMemo(() => {
    const quickActions: CommandAction[] = [
      { id: 'new-patient', label: 'Add new patient', description: 'Create a patient record', group: 'Actions', keywords: 'create register admit', icon: <Plus className="w-4 h-4 text-emerald-400" />, onSelect: go('/patients/new') },
      { id: 'new-appointment', label: 'Book an appointment', description: 'Schedule a new visit', group: 'Actions', keywords: 'create schedule booking', icon: <Plus className="w-4 h-4 text-emerald-400" />, onSelect: go('/appointments/new') },
      { id: 'new-doctor', label: 'Add a doctor', description: 'Onboard a clinician', group: 'Actions', keywords: 'create hire staff', icon: <Plus className="w-4 h-4 text-emerald-400" />, onSelect: go('/doctors/new') },
      { id: 'run-scan', label: 'Run AI scan', description: 'Re-run triage across all patients', group: 'Actions', keywords: 'ai analyze triage risk', icon: <Sparkles className="w-4 h-4 text-violet-400" />, onSelect: go('/ai-insights') },
    ];

    const pages: CommandAction[] = [
      { id: 'p-dash', label: 'Dashboard', description: 'Executive overview', group: 'Pages', icon: <LayoutDashboard className="w-4 h-4 text-app-subtle" />, onSelect: go('/') },
      { id: 'p-patients', label: 'Patients', description: 'Patient roster', group: 'Pages', icon: <Users className="w-4 h-4 text-app-subtle" />, onSelect: go('/patients') },
      { id: 'p-doctors', label: 'Doctors', description: 'Clinician directory', group: 'Pages', icon: <UserRound className="w-4 h-4 text-app-subtle" />, onSelect: go('/doctors') },
      { id: 'p-appts', label: "Today's Schedule", description: 'Calendar and agenda', group: 'Pages', keywords: 'appointments calendar', icon: <Calendar className="w-4 h-4 text-app-subtle" />, onSelect: go('/appointments') },
      { id: 'p-journey', label: 'Patient Journey', description: 'End-to-end visit flow', group: 'Pages', icon: <Route className="w-4 h-4 text-app-subtle" />, onSelect: go('/journey') },
      { id: 'p-staff', label: 'Staff Management', description: 'Workforce directory', group: 'Pages', icon: <UserCog className="w-4 h-4 text-app-subtle" />, onSelect: go('/staff') },
      { id: 'p-billing', label: 'Billing', description: 'Invoices and payments', group: 'Pages', keywords: 'invoice finance revenue', icon: <CreditCard className="w-4 h-4 text-app-subtle" />, onSelect: go('/billing') },
      { id: 'p-pharmacy', label: 'Pharmacy', description: 'Medicine inventory', group: 'Pages', keywords: 'stock medicine drugs', icon: <Pill className="w-4 h-4 text-app-subtle" />, onSelect: go('/pharmacy') },
      { id: 'p-lab', label: 'Laboratory', description: 'Lab orders and results', group: 'Pages', keywords: 'tests results', icon: <FlaskConical className="w-4 h-4 text-app-subtle" />, onSelect: go('/laboratory') },
      { id: 'p-reports', label: 'Reports', description: 'Export and analytics', group: 'Pages', icon: <FileText className="w-4 h-4 text-app-subtle" />, onSelect: go('/reports') },
      { id: 'p-insights', label: 'AI Insights', description: 'Risk alerts and recommendations', group: 'Pages', icon: <Brain className="w-4 h-4 text-violet-400" />, onSelect: go('/ai-insights') },
      { id: 'p-roles', label: 'Role Workspaces', description: 'Receptionist, doctor, pharmacy views', group: 'Pages', icon: <Shield className="w-4 h-4 text-app-subtle" />, onSelect: go('/roles') },
      { id: 'p-settings', label: 'Settings', description: 'Profile, theme, notifications', group: 'Pages', keywords: 'preferences theme appearance', icon: <SettingsIcon className="w-4 h-4 text-app-subtle" />, onSelect: go('/settings') },
    ];

    const patients: CommandAction[] = db.patients.map(p => ({
      id: `patient-${p.id}`,
      label: p.name,
      description: `${p.id} · ${p.age} yrs · ${p.status}`,
      group: 'Patients',
      keywords: `${p.id} ${p.phone} ${p.email}`,
      icon: <Users className="w-4 h-4 text-cyan-400" />,
      onSelect: go(`/patients/${p.id}`),
    }));

    const doctors: CommandAction[] = db.doctors.map(d => ({
      id: `doctor-${d.id}`,
      label: d.name,
      description: `${d.specialty} · ${d.department}`,
      group: 'Doctors',
      keywords: `${d.id} ${d.specialty} ${d.department}`,
      icon: <UserRound className="w-4 h-4 text-indigo-400" />,
      onSelect: go(`/doctors/${d.id}`),
    }));

    const agents: CommandAction[] = db.aiAgents.map(a => ({
      id: `agent-${a.id}`,
      label: a.name,
      description: a.focus,
      group: 'AI Agents',
      icon: <Sparkles className="w-4 h-4 text-violet-400" />,
      onSelect: go(`/agents/${a.id}`),
    }));

    return [...quickActions, ...pages, ...patients, ...doctors, ...agents];
  }, [go]);

  const q = query.trim().toLowerCase();
  const filtered = React.useMemo(() => {
    if (!q) {
      // With no query, show a useful starting set rather than 100+ records.
      return actions.filter(a => a.group === 'Actions' || a.group === 'Pages').slice(0, 12);
    }
    return actions
      .filter(a =>
        a.label.toLowerCase().includes(q) ||
        a.description.toLowerCase().includes(q) ||
        a.keywords?.toLowerCase().includes(q)
      )
      .slice(0, 30);
  }, [actions, q]);

  // Ordered groups, preserving GROUP_ORDER, used for rendering headers.
  const grouped = React.useMemo(() => {
    const map = new Map<Group, CommandAction[]>();
    for (const action of filtered) {
      const list = map.get(action.group) ?? [];
      list.push(action);
      map.set(action.group, list);
    }
    return GROUP_ORDER.filter(g => map.has(g)).map(g => [g, map.get(g)!] as const);
  }, [filtered]);

  // Flat order matching what's rendered, so arrow keys track the visible list.
  const flat = React.useMemo(() => grouped.flatMap(([, items]) => items), [grouped]);

  React.useEffect(() => {
    if (isOpen) {
      inputRef.current?.focus();
    } else {
      setQuery('');
    }
    setActiveIndex(0);
  }, [isOpen]);

  React.useEffect(() => setActiveIndex(0), [q]);

  React.useEffect(() => {
    if (!isOpen) return;
    const handler = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        event.preventDefault();
        onClose();
      } else if (event.key === 'ArrowDown') {
        event.preventDefault();
        setActiveIndex(i => (flat.length === 0 ? 0 : (i + 1) % flat.length));
      } else if (event.key === 'ArrowUp') {
        event.preventDefault();
        setActiveIndex(i => (flat.length === 0 ? 0 : (i - 1 + flat.length) % flat.length));
      } else if (event.key === 'Enter') {
        event.preventDefault();
        const action = flat[activeIndex];
        if (action) { action.onSelect(); onClose(); }
      }
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [isOpen, onClose, flat, activeIndex]);

  // Keep the highlighted row inside the scroll viewport.
  React.useEffect(() => {
    listRef.current
      ?.querySelector<HTMLElement>(`[data-index="${activeIndex}"]`)
      ?.scrollIntoView({ block: 'nearest' });
  }, [activeIndex]);

  let renderIndex = -1;

  return (
    <div
      className={cn(
        'fixed inset-0 z-50 transition-colors duration-200 p-4',
        isOpen ? 'bg-black/60 pointer-events-auto' : 'bg-transparent pointer-events-none'
      )}
      onClick={onClose}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-label="Command palette"
        onClick={e => e.stopPropagation()}
        className={cn(
          'mx-auto mt-[10vh] w-full max-w-2xl rounded-3xl border glass-modal backdrop-blur-2xl p-4 shadow-lifted transition-all duration-200',
          isOpen ? 'opacity-100 translate-y-0' : 'opacity-0 -translate-y-6'
        )}
      >
        <div className="flex items-center gap-3 border-b border-[var(--border)] pb-3">
          <div className="p-2 rounded-2xl bg-[var(--surface-2)]">
            <Search className="w-5 h-5 text-app-muted" />
          </div>
          <input
            ref={inputRef}
            value={query}
            onChange={e => setQuery(e.target.value)}
            placeholder="Search patients, doctors, actions…"
            aria-label="Search patients, doctors, and actions"
            aria-autocomplete="list"
            className="flex-1 bg-transparent text-app placeholder:text-app-subtle text-lg focus:outline-none min-w-0"
          />
          <div className="hidden sm:flex items-center gap-1 text-xs text-app-subtle border border-[var(--border)] rounded-lg px-2 py-1 flex-shrink-0">
            <Command className="w-3 h-3" />K
          </div>
        </div>

        <div ref={listRef} role="listbox" aria-label="Results" className="max-h-[55vh] overflow-y-auto mt-3 -mx-1 px-1">
          {flat.length === 0 ? (
            <div className="text-center py-10">
              <p className="text-app-muted">No results for “{query}”</p>
              <p className="text-app-subtle text-sm mt-1">Try a patient name, a doctor, or a module.</p>
            </div>
          ) : (
            grouped.map(([group, items]) => (
              <div key={group} className="mb-2 last:mb-0">
                <p className="px-3 pt-2 pb-1 text-[11px] uppercase tracking-wider font-semibold text-app-subtle">
                  {group}
                </p>
                {items.map(action => {
                  renderIndex += 1;
                  const index = renderIndex;
                  const isActive = index === activeIndex;
                  return (
                    <button
                      key={action.id}
                      data-index={index}
                      role="option"
                      aria-selected={isActive}
                      onMouseEnter={() => setActiveIndex(index)}
                      onClick={() => { action.onSelect(); onClose(); }}
                      className={cn(
                        'w-full text-left px-3 py-2.5 rounded-xl flex items-center gap-3 transition-colors',
                        isActive ? 'bg-primary/15' : 'hover:bg-[var(--surface-2)]'
                      )}
                    >
                      <div className="p-2 rounded-lg bg-[var(--surface-2)] flex-shrink-0">{action.icon}</div>
                      <div className="min-w-0 flex-1">
                        <p className="text-app font-medium truncate">{action.label}</p>
                        <p className="text-sm text-app-subtle truncate">{action.description}</p>
                      </div>
                      {isActive && <CornerDownLeft className="w-4 h-4 text-app-subtle flex-shrink-0" />}
                    </button>
                  );
                })}
              </div>
            ))
          )}
        </div>

        <div className="flex items-center gap-4 pt-3 mt-1 border-t border-[var(--border)] text-[11px] text-app-subtle">
          <span className="flex items-center gap-1.5"><kbd className="px-1.5 py-0.5 rounded border border-[var(--border)]">↑↓</kbd> navigate</span>
          <span className="flex items-center gap-1.5"><kbd className="px-1.5 py-0.5 rounded border border-[var(--border)]">↵</kbd> open</span>
          <span className="flex items-center gap-1.5"><kbd className="px-1.5 py-0.5 rounded border border-[var(--border)]">esc</kbd> close</span>
          <span className="ml-auto flex items-center gap-1.5">
            <ArrowRight className="w-3 h-3" />
            {flat.length} result{flat.length === 1 ? '' : 's'}
          </span>
        </div>
      </div>
    </div>
  );
};
