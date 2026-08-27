import React from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Sparkles, X, Send, Bot, User, Stethoscope, AlertTriangle,
  CalendarDays, Pill, RefreshCw, Check, ArrowRight,
} from 'lucide-react';
import { db } from '../../../data';
import { cn } from '../../../utils/cn';
import { useAIActions } from '../../../context/AIActionsContext';
import { useToast } from '../../../context/ToastContext';
import { todayKey } from '../../../utils/date';

interface AICopilotChatProps {
  isOpen: boolean;
  onToggle: () => void;
  onClose: () => void;
}

/** An action the Copilot can carry out itself, offered inline with its answer. */
interface ReplyAction {
  id: string;
  label: string;
  /** 'do' completes work; 'go' navigates somewhere useful. */
  mode: 'do' | 'go';
  run: (ctx: ReplyContext) => void;
}

interface ReplyContext {
  navigate: (path: string) => void;
  toast: ReturnType<typeof useToast>['toast'];
  approveMany: (ids: string[]) => void;
  resetAll: () => void;
  pendingIds: string[];
  safeIds: string[];
  safeMinutes: number;
}

interface Reply {
  text: string;
  actions?: ReplyAction[];
}

interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  ts: string;
  actions?: ReplyAction[];
  /** Ids of actions already run from this message, so buttons settle. */
  done?: string[];
}

const suggestions = [
  { label: 'Critical alerts', prompt: 'Show me the critical AI alerts right now', icon: <AlertTriangle className="w-3.5 h-3.5 text-red-400" /> },
  { label: "Today's schedule", prompt: "What's on today's appointment schedule?", icon: <CalendarDays className="w-3.5 h-3.5 text-indigo-400" /> },
  { label: 'Clear my queue', prompt: 'What needs my approval?', icon: <Check className="w-3.5 h-3.5 text-violet-400" /> },
  { label: 'Low pharmacy stock', prompt: 'Which medicines are running low on stock?', icon: <Pill className="w-3.5 h-3.5 text-emerald-400" /> },
];

/**
 * Mock "intelligence" that reads real db state so answers stay grounded, and —
 * more importantly — ends most answers in something the Copilot can do for you
 * rather than a paragraph you then have to act on yourself.
 * Replace with a real tool-calling model when the backend lands.
 */
function generateReply(raw: string, pendingCount: number, safeCount: number, safeMinutes: number): Reply {
  const q = raw.toLowerCase();

  if (/(approve|queue|pending|waiting|my work|to do|todo)/.test(q)) {
    if (pendingCount === 0) {
      return { text: 'Your approval queue is empty — everything I drafted has been actioned.' };
    }
    return {
      text: `You have ${pendingCount} drafted action${pendingCount === 1 ? '' : 's'} waiting. ${safeCount} of them are administrative and safe to approve in one go — that's about ${safeMinutes} minutes of manual work. The rest are clinical and need a prescriber to sign each one.`,
      actions: [
        {
          id: 'approve-safe',
          label: `Approve ${safeCount} safe actions`,
          mode: 'do',
          run: ({ approveMany, safeIds, toast, resetAll }) => {
            approveMany(safeIds);
            toast(`${safeIds.length} actions approved`, {
              description: `About ${safeMinutes} minutes of manual work avoided.`,
              variant: 'ai',
              action: { label: 'Undo all', onClick: resetAll },
            });
          },
        },
        { id: 'review', label: 'Review them individually', mode: 'go', run: ({ navigate }) => navigate('/ai-insights') },
      ],
    };
  }

  if (/(critical|alert|urgent|risk)/.test(q)) {
    const critical = db.aiInsights.filter(i => i.severity === 'Critical' || i.severity === 'High');
    if (critical.length === 0) return { text: 'Good news — no critical or high-severity alerts right now.' };
    const lines = critical.slice(0, 3).map(i => {
      const patient = db.patients.find(p => p.id === i.patientId)?.name ?? 'Unknown patient';
      return `• ${i.type} — ${patient} (${i.severity}, ${i.confidence}% confidence)`;
    });
    return {
      text: `${critical.length} alert${critical.length === 1 ? '' : 's'} need attention:\n${lines.join('\n')}\n\nI've already drafted the follow-up actions for each.`,
      actions: [{ id: 'open-insights', label: 'Open the drafted actions', mode: 'go', run: ({ navigate }) => navigate('/ai-insights') }],
    };
  }

  if (/(appointment|schedule|today|booking)/.test(q)) {
    const today = todayKey();
    const todays = db.appointments.filter(a => a.date === today);
    const scheduled = todays.filter(a => a.status === 'Scheduled').length;
    return {
      text: `You have ${todays.length} appointment${todays.length === 1 ? '' : 's'} today — ${scheduled} still scheduled.`,
      actions: [
        { id: 'open-sched', label: "Open today's schedule", mode: 'go', run: ({ navigate }) => navigate('/appointments') },
        { id: 'book', label: 'Book a new appointment', mode: 'go', run: ({ navigate }) => navigate('/appointments/new') },
      ],
    };
  }

  if (/(revenue|billing|invoice|payment|money)/.test(q)) {
    const pending = db.bills.filter(b => b.status !== 'Paid');
    const pendingTotal = pending.reduce((sum, b) => sum + (b.total ?? 0), 0);
    const overdue = db.bills.filter(b => b.status === 'Overdue').length;
    return {
      text: `Revenue is $${db.dashboardStats.monthlyRevenue.toLocaleString()} this month (+${db.dashboardStats.revenueGrowth}%). ${pending.length} invoice${pending.length === 1 ? '' : 's'} are open, worth about $${pendingTotal.toLocaleString()}${overdue > 0 ? `, and ${overdue} are overdue` : ''}.`,
      actions: [
        {
          id: 'chase',
          label: `Send reminders to ${pending.length} unpaid`,
          mode: 'do',
          run: ({ toast }) =>
            toast('Payment reminders queued', {
              description: `${pending.length} patients will receive an SMS and email reminder.`,
              variant: 'ai',
            }),
        },
        { id: 'open-billing', label: 'Open billing', mode: 'go', run: ({ navigate }) => navigate('/billing') },
      ],
    };
  }

  if (/(pharmacy|medicine|stock|drug|inventory)/.test(q)) {
    const low = db.medicines.filter(m => (m.stock ?? 0) < 50);
    if (low.length === 0) return { text: 'All medicines are comfortably stocked right now.' };
    const lines = low.slice(0, 4).map(m => `• ${m.name} — ${m.stock} units left`);
    return {
      text: `${low.length} medicine${low.length === 1 ? '' : 's'} below the 50-unit threshold:\n${lines.join('\n')}`,
      actions: [
        {
          id: 'reorder',
          label: `Draft reorder for all ${low.length}`,
          mode: 'do',
          run: ({ toast }) =>
            toast('Purchase orders drafted', {
              description: `${low.length} supplier orders are ready for your sign-off.`,
              variant: 'ai',
            }),
        },
        { id: 'open-pharm', label: 'Open pharmacy', mode: 'go', run: ({ navigate }) => navigate('/pharmacy') },
      ],
    };
  }

  if (/(doctor|specialist|available|staff)/.test(q)) {
    const available = db.doctors.filter(d => d.status === 'Available');
    return {
      text: `${available.length} of ${db.doctors.length} doctors are available now, across ${new Set(db.doctors.map(d => d.specialty)).size} specialties.`,
      actions: [{ id: 'open-docs', label: 'See live availability', mode: 'go', run: ({ navigate }) => navigate('/doctors') }],
    };
  }

  if (/(patient|admit|roster)/.test(q)) {
    const critical = db.patients.filter(p => p.status === 'Critical').length;
    return {
      text: `${db.patients.length.toLocaleString()} patients on record, ${critical} flagged Critical.`,
      actions: [{ id: 'open-pts', label: 'Open patient roster', mode: 'go', run: ({ navigate }) => navigate('/patients') }],
    };
  }

  if (/(hi|hello|hey|help|what can you)/.test(q)) {
    return {
      text: "Hi! I'm your MediAI Copilot. I don't just answer questions — I draft the work and you approve it. Ask me what needs your approval, check alerts, chase unpaid invoices, or reorder low stock.",
    };
  }

  return {
    text: "I'm running on mock data for now. Try asking what needs your approval, about alerts, today's schedule, billing, pharmacy stock, doctors, or patients — most answers come with actions I can carry out for you.",
  };
}

const timeNow = () => new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

let messageSeq = 0;
const nextId = () => `msg-${messageSeq++}`;

export const AICopilotChat: React.FC<AICopilotChatProps> = ({ isOpen, onToggle, onClose }) => {
  const [messages, setMessages] = React.useState<ChatMessage[]>([]);
  const [input, setInput] = React.useState('');
  const [isTyping, setIsTyping] = React.useState(false);
  const scrollRef = React.useRef<HTMLDivElement>(null);
  const inputRef = React.useRef<HTMLInputElement>(null);

  const navigate = useNavigate();
  const { toast } = useToast();
  const { pending, batchApprovable, approveMany, resetAll } = useAIActions();

  React.useEffect(() => {
    if (isOpen) {
      const id = window.setTimeout(() => inputRef.current?.focus(), 250);
      return () => window.clearTimeout(id);
    }
  }, [isOpen]);

  React.useEffect(() => {
    if (!isOpen) return;
    const onKeyDown = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose(); };
    document.addEventListener('keydown', onKeyDown);
    return () => document.removeEventListener('keydown', onKeyDown);
  }, [isOpen, onClose]);

  React.useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: 'smooth' });
  }, [messages, isTyping]);

  const send = (text: string) => {
    const trimmed = text.trim();
    if (!trimmed || isTyping) return;

    setMessages(prev => [...prev, { id: nextId(), role: 'user', content: trimmed, ts: timeNow() }]);
    setInput('');
    setIsTyping(true);

    const safeMinutes = batchApprovable.reduce((sum, a) => sum + a.minutesSaved, 0);
    const reply = generateReply(trimmed, pending.length, batchApprovable.length, safeMinutes);

    window.setTimeout(() => {
      setMessages(prev => [...prev, {
        id: nextId(), role: 'assistant', content: reply.text, ts: timeNow(), actions: reply.actions, done: [],
      }]);
      setIsTyping(false);
    }, 700);
  };

  const runAction = (messageId: string, action: ReplyAction) => {
    action.run({
      navigate,
      toast,
      approveMany,
      resetAll,
      pendingIds: pending.map(a => a.id),
      safeIds: batchApprovable.map(a => a.id),
      safeMinutes: batchApprovable.reduce((sum, a) => sum + a.minutesSaved, 0),
    });
    if (action.mode === 'do') {
      setMessages(prev => prev.map(m =>
        m.id === messageId ? { ...m, done: [...(m.done ?? []), action.id] } : m
      ));
    } else {
      onClose();
    }
  };

  const resetChat = () => {
    setMessages([]);
    setInput('');
    setIsTyping(false);
  };

  return (
    <>
      <button
        onClick={onToggle}
        aria-label={isOpen ? 'Close MediAI Copilot' : 'Open MediAI Copilot'}
        className={cn(
          'fixed bottom-6 right-6 z-40 flex items-center justify-center',
          'w-14 h-14 rounded-2xl shadow-lg shadow-violet-500/40',
          'bg-gradient-to-br from-violet-500 to-fuchsia-500 text-white focus-ring',
          'transition-all duration-300 hover:scale-105 active:scale-95',
          isOpen && 'opacity-0 pointer-events-none translate-y-3'
        )}
      >
        <Sparkles className="w-6 h-6" />
        {pending.length > 0 && (
          <span className="absolute -top-1 -right-1 min-w-[20px] h-5 px-1 bg-[color:var(--danger)] rounded-full text-[10px] font-bold flex items-center justify-center text-white border-2 border-[var(--app-bg)]">
            {pending.length > 9 ? '9+' : pending.length}
          </span>
        )}
      </button>

      <div
        role="dialog"
        aria-modal="false"
        aria-label="MediAI Copilot"
        className={cn(
          'fixed z-50 flex flex-col overflow-hidden',
          'bottom-0 right-0 w-full h-[85vh] rounded-t-3xl',
          'sm:bottom-6 sm:right-6 sm:w-[400px] sm:h-[620px] sm:max-h-[80vh] sm:rounded-3xl',
          'glass-panel backdrop-blur-2xl border shadow-lifted',
          'transition-all duration-300 ease-out origin-bottom-right',
          isOpen ? 'opacity-100 translate-y-0 scale-100 pointer-events-auto' : 'opacity-0 translate-y-6 scale-95 pointer-events-none'
        )}
      >
        {/* Header */}
        <div className="flex items-center justify-between gap-3 p-4 border-b border-[var(--border)] flex-shrink-0">
          <div className="flex items-center gap-3 min-w-0">
            <div className="relative w-10 h-10 rounded-2xl bg-gradient-to-br from-violet-500 to-fuchsia-500 flex items-center justify-center flex-shrink-0">
              <Bot className="w-5 h-5 text-white" />
              <span className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-emerald-400 rounded-full border-2 border-[var(--surface-panel)]" />
            </div>
            <div className="min-w-0">
              <h2 className="text-sm font-semibold text-app flex items-center gap-1.5">
                MediAI Copilot
                <Sparkles className="w-3.5 h-3.5 text-violet-400" />
              </h2>
              <p className="text-[11px] text-emerald-400">
                {pending.length > 0 ? `${pending.length} actions ready to approve` : 'Online · mock preview'}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-1 flex-shrink-0">
            {messages.length > 0 && (
              <button
                onClick={resetChat}
                aria-label="Start a new chat"
                className="p-2 rounded-lg text-app-subtle hover:text-app hover:bg-[var(--surface-2)] transition-colors focus-ring"
              >
                <RefreshCw className="w-4 h-4" />
              </button>
            )}
            <button
              onClick={onClose}
              aria-label="Close Copilot"
              className="p-2 rounded-lg text-app-subtle hover:text-app hover:bg-[var(--surface-2)] transition-colors focus-ring"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Messages */}
        <div ref={scrollRef} className="flex-1 overflow-y-auto p-4 space-y-4">
          {messages.length === 0 && (
            <div className="h-full flex flex-col items-center justify-center text-center px-4">
              <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-violet-500/30 to-fuchsia-500/20 border border-violet-500/30 flex items-center justify-center mb-4">
                <Stethoscope className="w-7 h-7 text-violet-300" />
              </div>
              <h3 className="text-base font-semibold text-app">I draft, you approve</h3>
              <p className="text-sm text-app-muted mt-1 max-w-[270px] leading-relaxed">
                Ask what needs your approval, and I'll clear the administrative work for you.
              </p>
            </div>
          )}

          {messages.map(message => (
            <div key={message.id} className={cn('flex gap-2.5', message.role === 'user' ? 'flex-row-reverse' : 'flex-row')}>
              <div
                className={cn(
                  'w-8 h-8 rounded-xl flex items-center justify-center flex-shrink-0',
                  message.role === 'user' ? 'bg-[var(--surface-3)]' : 'bg-gradient-to-br from-violet-500 to-fuchsia-500'
                )}
              >
                {message.role === 'user'
                  ? <User className="w-4 h-4 text-app-muted" />
                  : <Bot className="w-4 h-4 text-white" />}
              </div>

              <div className="max-w-[80%] min-w-0">
                <div
                  className={cn(
                    'rounded-2xl px-3.5 py-2.5 text-sm whitespace-pre-line leading-relaxed',
                    message.role === 'user'
                      ? 'bg-gradient-to-r from-primary to-accent text-white rounded-tr-sm'
                      : 'bg-[var(--surface-2)] border border-[var(--border)] text-app rounded-tl-sm'
                  )}
                >
                  {message.content}
                </div>

                {message.actions && message.actions.length > 0 && (
                  <div className="flex flex-wrap gap-1.5 mt-2">
                    {message.actions.map(action => {
                      const done = message.done?.includes(action.id);
                      return (
                        <button
                          key={action.id}
                          disabled={done}
                          onClick={() => runAction(message.id, action)}
                          className={cn(
                            'inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-semibold transition-colors focus-ring',
                            done
                              ? 'bg-emerald-500/15 text-emerald-300 cursor-default'
                              : action.mode === 'do'
                                ? 'bg-violet-500/20 text-violet-200 hover:bg-violet-500/30'
                                : 'bg-[var(--surface-3)] text-app-muted hover:text-app'
                          )}
                        >
                          {done
                            ? <><Check className="w-3 h-3" /> Done</>
                            : <>{action.label}{action.mode === 'go' && <ArrowRight className="w-3 h-3" />}</>}
                        </button>
                      );
                    })}
                  </div>
                )}

                <p className={cn('text-[10px] text-app-subtle mt-1', message.role === 'user' ? 'text-right' : 'text-left')}>
                  {message.ts}
                </p>
              </div>
            </div>
          ))}

          {isTyping && (
            <div className="flex gap-2.5">
              <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-violet-500 to-fuchsia-500 flex items-center justify-center flex-shrink-0">
                <Bot className="w-4 h-4 text-white" />
              </div>
              <div className="bg-[var(--surface-2)] border border-[var(--border)] rounded-2xl rounded-tl-sm px-4 py-3 flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-app-subtle animate-bounce" style={{ animationDelay: '0ms' }} />
                <span className="w-1.5 h-1.5 rounded-full bg-app-subtle animate-bounce" style={{ animationDelay: '150ms' }} />
                <span className="w-1.5 h-1.5 rounded-full bg-app-subtle animate-bounce" style={{ animationDelay: '300ms' }} />
              </div>
            </div>
          )}
        </div>

        {messages.length === 0 && (
          <div className="px-4 pb-2 flex flex-wrap gap-2 flex-shrink-0">
            {suggestions.map(s => (
              <button
                key={s.label}
                onClick={() => send(s.prompt)}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-[var(--surface-2)] border border-[var(--border)] text-xs text-app-muted hover:text-app hover:border-[var(--border-strong)] transition-colors focus-ring"
              >
                {s.icon}
                {s.label}
              </button>
            ))}
          </div>
        )}

        <form onSubmit={e => { e.preventDefault(); send(input); }} className="p-3 border-t border-[var(--border)] flex-shrink-0">
          <div className="flex items-center gap-2 rounded-2xl glass-input border px-3 py-2">
            <input
              ref={inputRef}
              value={input}
              onChange={e => setInput(e.target.value)}
              placeholder="Ask the Copilot anything…"
              aria-label="Message the Copilot"
              className="flex-1 bg-transparent text-sm text-app placeholder:text-app-subtle focus:outline-none min-w-0"
            />
            <button
              type="submit"
              disabled={!input.trim() || isTyping}
              aria-label="Send message"
              className="p-2 rounded-xl bg-gradient-to-r from-primary to-accent text-white transition-all hover:scale-105 active:scale-95 disabled:opacity-40 disabled:hover:scale-100 focus-ring flex-shrink-0"
            >
              <Send className="w-4 h-4" />
            </button>
          </div>
          <p className="text-[10px] text-app-subtle text-center mt-2">
            Mock responses · backend integration coming soon
          </p>
        </form>
      </div>
    </>
  );
};
