import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Command, Search, Sparkles, ArrowRight } from 'lucide-react';
import { db } from '../../../data';
import { cn } from '../../../utils/cn';

interface CommandPaletteProps {
  isOpen: boolean;
  onClose: () => void;
}

interface CommandAction {
  id: string;
  label: string;
  description: string;
  onSelect: () => void;
  icon: React.ReactNode;
  shortcut?: string;
}

export const CommandPalette: React.FC<CommandPaletteProps> = ({ isOpen, onClose }) => {
  const navigate = useNavigate();
  const inputRef = React.useRef<HTMLInputElement>(null);
  const [query, setQuery] = React.useState('');

  const baseActions: CommandAction[] = React.useMemo(() => [
    {
      id: 'goto-dashboard',
      label: 'Go to Dashboard',
      description: 'Open executive overview',
      icon: <ArrowRight className="w-4 h-4 text-white/60" />,
      onSelect: () => navigate('/')
    },
    {
      id: 'goto-patients',
      label: 'Open Patients',
      description: 'Browse patient roster',
      icon: <ArrowRight className="w-4 h-4 text-white/60" />,
      onSelect: () => navigate('/patients')
    },
    {
      id: 'new-appointment',
      label: 'Schedule Appointment',
      description: 'Jump to appointments page',
      icon: <ArrowRight className="w-4 h-4 text-white/60" />,
      onSelect: () => navigate('/appointments')
    },
    {
      id: 'goto-roles',
      label: 'Open Role Workspaces',
      description: 'Browse receptionist, doctor, and pharma-test views',
      icon: <ArrowRight className="w-4 h-4 text-white/60" />,
      onSelect: () => navigate('/roles')
    }
  ], [navigate]);

  const agentActions: CommandAction[] = React.useMemo(
    () =>
      db.aiAgents.map((agent) => ({
        id: `agent-${agent.id}`,
        label: `Open ${agent.name}`,
        description: agent.focus,
        icon: <Sparkles className="w-4 h-4 text-violet-300" />,
        onSelect: () => navigate(`/agents/${agent.id}`)
      })),
    [navigate]
  );

  const actions = [...baseActions, ...agentActions];

  const filtered = actions.filter(action =>
    action.label.toLowerCase().includes(query.toLowerCase()) ||
    action.description.toLowerCase().includes(query.toLowerCase())
  );

  React.useEffect(() => {
    if (isOpen) {
      inputRef.current?.focus();
    } else {
      setQuery('');
    }
  }, [isOpen]);

  React.useEffect(() => {
    const handler = (event: KeyboardEvent) => {
      if (event.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [isOpen, onClose]);

  return (
    <div
      className={cn(
        'fixed inset-0 z-50 transition-colors duration-200',
        isOpen ? 'bg-black/60 pointer-events-auto' : 'bg-transparent pointer-events-none'
      )}
      onClick={onClose}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className={cn(
          'mx-auto mt-20 w-full max-w-2xl rounded-3xl border glass-panel backdrop-blur-2xl p-4 transition-all duration-200',
          isOpen ? 'opacity-100 translate-y-0' : 'opacity-0 -translate-y-6'
        )}
      >
        <div className="flex items-center gap-3 border-b border-white/10 pb-3">
          <div className="p-2 rounded-2xl bg-white/5">
            <Search className="w-5 h-5 text-white/70" />
          </div>
          <input
            ref={inputRef}
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search actions, pages, or agents..."
            className="flex-1 bg-transparent text-white placeholder:text-white/40 text-lg focus:outline-none"
          />
          <div className="hidden sm:flex items-center gap-1 text-xs text-white/40 border border-white/20 rounded-lg px-2 py-1">
            <Command className="w-3 h-3" />+K
          </div>
        </div>
        <div className="max-h-80 overflow-y-auto mt-4 space-y-2">
          {filtered.length === 0 && (
            <p className="text-center text-white/40 py-6">No actions found</p>
          )}
          {filtered.map((action) => (
            <button
              key={action.id}
              className="w-full text-left px-3 py-3 rounded-2xl bg-white/5 hover:bg-white/10 transition-colors flex items-start gap-3"
              onClick={() => {
                action.onSelect();
                onClose();
              }}
            >
              <div className="p-2 rounded-xl bg-white/5">
                {action.icon}
              </div>
              <div>
                <p className="text-white font-medium">{action.label}</p>
                <p className="text-sm text-white/50">{action.description}</p>
              </div>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};
