import React from 'react';
import { Sparkles, CheckCircle2, Clock4, AlertTriangle, X } from 'lucide-react';
import { db } from '../../../data';
import { cn } from '../../../utils/cn';
import { useNavigate } from 'react-router-dom';

interface TaskInboxDrawerProps {
  isOpen: boolean;
  onClose: () => void;
}

interface TaskItem {
  id: string;
  title: string;
  description: string;
  badge: string;
  severity: 'info' | 'warning' | 'critical';
  action: () => void;
}

export const TaskInboxDrawer: React.FC<TaskInboxDrawerProps> = ({ isOpen, onClose }) => {
  const navigate = useNavigate();
  const insights = db.aiInsights.slice(0, 3);
  const tasks: TaskItem[] = insights.map((insight) => ({
    id: insight.id,
    title: insight.type,
    description: insight.description,
    badge: insight.severity,
    severity: insight.severity === 'Critical'
      ? 'critical'
      : insight.severity === 'High'
      ? 'warning'
      : 'info',
    action: () => navigate(`/agents/${insight.agentId ?? 'quickcheck-agent'}`)
  }));

  const borderColor = {
    info: 'border-white/10',
    warning: 'border-amber-500/40',
    critical: 'border-red-500/40'
  };

  const badgeColor = {
    info: 'bg-cyan-500/20 text-cyan-200',
    warning: 'bg-amber-500/20 text-amber-200',
    critical: 'bg-red-500/20 text-red-200'
  };

  return (
    <>
      <div
        className={cn(
          'fixed inset-0 bg-black/60 backdrop-blur-sm z-40 transition-opacity duration-300',
          isOpen ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'
        )}
        onClick={onClose}
      />
      <aside
        className={cn(
          'fixed inset-y-0 right-0 z-50 w-full sm:w-[360px] bg-slate-950/95 backdrop-blur-2xl border-l border-white/10',
          'transition-transform duration-300 ease-in-out overflow-y-auto',
          isOpen ? 'translate-x-0' : 'translate-x-full'
        )}
      >
        <div className="p-5 border-b border-white/10 flex items-center justify-between">
          <div>
            <p className="text-xs text-white/50 uppercase tracking-wide flex items-center gap-2">
              <Sparkles className="w-3.5 h-3.5 text-violet-300" />
              Task Inbox
            </p>
            <h2 className="text-xl font-semibold text-white mt-1">AI alerts & actions</h2>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-lg hover:bg-white/10 transition-colors"
          >
            <X className="w-5 h-5 text-white/60" />
          </button>
        </div>

        <div className="p-5 space-y-4">
          {tasks.map((task) => (
            <button
              key={task.id}
              className={cn(
                'w-full text-left p-4 rounded-2xl bg-white/5 hover:bg-white/10 transition-colors border',
                borderColor[task.severity]
              )}
              onClick={() => {
                task.action();
                onClose();
              }}
            >
              <div className="flex items-center justify-between mb-2">
                <p className="text-sm font-semibold text-white">{task.title}</p>
                <span className={cn('px-2 py-0.5 rounded-full text-xs capitalize', badgeColor[task.severity])}>
                  {task.badge}
                </span>
              </div>
              <p className="text-sm text-white/60">{task.description}</p>
              <div className="flex items-center gap-2 text-xs text-white/40 mt-3">
                {task.severity === 'critical' ? (
                  <AlertTriangle className="w-3.5 h-3.5 text-red-400" />
                ) : (
                  <Clock4 className="w-3.5 h-3.5 text-white/40" />
                )}
                <span>Agent ready · tap to resolve</span>
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 ml-auto" />
              </div>
            </button>
          ))}
        </div>
      </aside>
    </>
  );
};
