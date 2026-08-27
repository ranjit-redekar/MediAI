import React, { useEffect } from 'react';
import { Sparkles, CheckCircle2, Clock4, AlertTriangle, X, Inbox, ArrowRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { cn } from '../../../utils/cn';
import { useTasks } from '../../../context/TasksContext';
import { useToast } from '../../../context/ToastContext';
import { EmptyState } from '../../ui/EmptyState';

interface TaskInboxDrawerProps {
  isOpen: boolean;
  onClose: () => void;
}

const borderColor = {
  info: 'border-[var(--border)]',
  warning: 'border-amber-500/40',
  critical: 'border-red-500/40',
};

const badgeColor = {
  info: 'bg-cyan-500/15 text-cyan-300',
  warning: 'bg-amber-500/15 text-amber-300',
  critical: 'bg-red-500/15 text-red-300',
};

export const TaskInboxDrawer: React.FC<TaskInboxDrawerProps> = ({ isOpen, onClose }) => {
  const navigate = useNavigate();
  const { tasks, resolve, restoreAll } = useTasks();
  const { toast } = useToast();

  useEffect(() => {
    if (!isOpen) return;
    const onKeyDown = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose(); };
    document.addEventListener('keydown', onKeyDown);
    return () => document.removeEventListener('keydown', onKeyDown);
  }, [isOpen, onClose]);

  const handleResolve = (id: string, title: string) => {
    resolve(id);
    toast('Task resolved', {
      description: `"${title}" cleared from your inbox.`,
      action: { label: 'Undo', onClick: restoreAll },
    });
  };

  return (
    <>
      <div
        className={cn(
          'fixed inset-0 bg-black/60 backdrop-blur-sm z-40 transition-opacity duration-300',
          isOpen ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'
        )}
        onClick={onClose}
        aria-hidden="true"
      />
      <aside
        role="dialog"
        aria-modal="true"
        aria-label="Task inbox"
        className={cn(
          'fixed inset-y-0 right-0 z-50 w-full sm:w-[380px] glass-panel backdrop-blur-2xl border-l',
          'transition-transform duration-300 ease-in-out flex flex-col',
          isOpen ? 'translate-x-0' : 'translate-x-full'
        )}
      >
        <div className="p-5 border-b border-[var(--border)] flex items-start justify-between gap-3 flex-shrink-0">
          <div className="min-w-0">
            <p className="text-xs text-app-subtle uppercase tracking-wide flex items-center gap-2">
              <Sparkles className="w-3.5 h-3.5 text-violet-400" />
              Task Inbox
            </p>
            <h2 className="text-xl font-semibold text-app mt-1">AI alerts &amp; actions</h2>
            <p className="text-xs text-app-subtle mt-1">
              {tasks.length > 0
                ? `${tasks.length} item${tasks.length === 1 ? '' : 's'} waiting on you`
                : 'You are all caught up'}
            </p>
          </div>
          <button
            onClick={onClose}
            aria-label="Close task inbox"
            className="p-2 rounded-lg text-app-subtle hover:text-app hover:bg-[var(--surface-2)] transition-colors focus-ring flex-shrink-0"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-5">
          {tasks.length === 0 ? (
            <EmptyState
              icon={Inbox}
              title="Inbox zero"
              description="Every AI alert has been reviewed. New alerts appear here the moment an agent flags something."
              action={{ label: 'Replay demo alerts', onClick: restoreAll }}
            />
          ) : (
            <div className="space-y-3">
              {tasks.map((task, i) => (
                <div
                  key={task.id}
                  className={cn(
                    'reveal p-4 rounded-2xl bg-[var(--surface-2)] border transition-colors',
                    borderColor[task.severity]
                  )}
                  style={{ animationDelay: `${i * 60}ms` }}
                >
                  <div className="flex items-start justify-between gap-3 mb-2">
                    <p className="text-sm font-semibold text-app leading-snug">{task.title}</p>
                    <span className={cn('px-2 py-0.5 rounded-full text-xs capitalize flex-shrink-0', badgeColor[task.severity])}>
                      {task.badge}
                    </span>
                  </div>
                  <p className="text-sm text-app-muted leading-relaxed">{task.description}</p>

                  <div className="flex items-center gap-2 text-xs text-app-subtle mt-3">
                    {task.severity === 'critical'
                      ? <AlertTriangle className="w-3.5 h-3.5 text-red-400" />
                      : <Clock4 className="w-3.5 h-3.5" />}
                    <span>Agent ready</span>
                  </div>

                  <div className="flex items-center gap-2 mt-3 pt-3 border-t border-[var(--border)]">
                    <button
                      onClick={() => { navigate(`/agents/${task.agentId}`); onClose(); }}
                      className="flex-1 h-9 rounded-lg text-xs font-semibold bg-[var(--surface-3)] text-app-muted hover:text-app transition-colors focus-ring inline-flex items-center justify-center gap-1.5"
                    >
                      Review <ArrowRight className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => handleResolve(task.id, task.title)}
                      className="flex-1 h-9 rounded-lg text-xs font-semibold bg-emerald-500/15 text-emerald-300 hover:bg-emerald-500/25 transition-colors focus-ring inline-flex items-center justify-center gap-1.5"
                    >
                      <CheckCircle2 className="w-3.5 h-3.5" /> Resolve
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </aside>
    </>
  );
};
