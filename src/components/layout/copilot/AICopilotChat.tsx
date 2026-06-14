import React from 'react';
import {
  Sparkles,
  X,
  Send,
  Bot,
  User,
  Stethoscope,
  AlertTriangle,
  CalendarDays,
  CreditCard,
  Pill,
  RefreshCw
} from 'lucide-react';
import { db } from '../../../data';
import { cn } from '../../../utils/cn';

interface AICopilotChatProps {
  isOpen: boolean;
  onToggle: () => void;
  onClose: () => void;
}

interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  ts: string;
}

interface Suggestion {
  label: string;
  prompt: string;
  icon: React.ReactNode;
}

const suggestions: Suggestion[] = [
  {
    label: 'Critical alerts',
    prompt: 'Show me the critical AI alerts right now',
    icon: <AlertTriangle className="w-3.5 h-3.5 text-red-300" />
  },
  {
    label: "Today's schedule",
    prompt: "What's on today's appointment schedule?",
    icon: <CalendarDays className="w-3.5 h-3.5 text-indigo-300" />
  },
  {
    label: 'Revenue snapshot',
    prompt: 'Give me a billing and revenue snapshot',
    icon: <CreditCard className="w-3.5 h-3.5 text-amber-300" />
  },
  {
    label: 'Low pharmacy stock',
    prompt: 'Which medicines are running low on stock?',
    icon: <Pill className="w-3.5 h-3.5 text-emerald-300" />
  }
];

// Lightweight mock "intelligence" — reads real db data so answers feel grounded.
// Replace this with a real API call when the backend is wired in.
function generateReply(raw: string): string {
  const q = raw.toLowerCase();

  if (/(critical|alert|urgent|risk)/.test(q)) {
    const critical = db.aiInsights.filter(i => i.severity === 'Critical' || i.severity === 'High');
    if (critical.length === 0) return 'Good news — there are no critical or high-severity AI alerts right now.';
    const lines = critical.slice(0, 3).map(i => {
      const patient = db.patients.find(p => p.id === i.patientId)?.name ?? 'Unknown patient';
      return `• ${i.type} — ${patient} (${i.severity}, ${i.confidence}% confidence)`;
    });
    return `There ${critical.length === 1 ? 'is' : 'are'} ${critical.length} alert${critical.length === 1 ? '' : 's'} needing attention:\n${lines.join('\n')}\n\nOpen AI Insights for the full triage view.`;
  }

  if (/(appointment|schedule|today|booking)/.test(q)) {
    const today = new Date().toISOString().split('T')[0];
    const todays = db.appointments.filter(a => a.date === today);
    const scheduled = todays.filter(a => a.status === 'Scheduled').length;
    return `You have ${todays.length} appointment${todays.length === 1 ? '' : 's'} on the books today — ${scheduled} still scheduled. Head to Today's Schedule to review the agenda or reschedule.`;
  }

  if (/(revenue|billing|invoice|payment|money)/.test(q)) {
    const pending = db.bills.filter(b => b.status !== 'Paid');
    const pendingTotal = pending.reduce((sum, b) => sum + (b.total ?? 0), 0);
    return `This month's revenue is $${db.dashboardStats.monthlyRevenue.toLocaleString()} (+${db.dashboardStats.revenueGrowth}% vs last month). ${pending.length} invoice${pending.length === 1 ? '' : 's'} are still open, totalling roughly $${pendingTotal.toLocaleString()}.`;
  }

  if (/(pharmacy|medicine|stock|drug|inventory)/.test(q)) {
    const low = db.medicines.filter(m => (m.stock ?? 0) < 50);
    if (low.length === 0) return 'All medicines are comfortably stocked right now.';
    const lines = low.slice(0, 4).map(m => `• ${m.name} — ${m.stock} units left`);
    return `${low.length} medicine${low.length === 1 ? '' : 's'} below the 50-unit threshold:\n${lines.join('\n')}\n\nConsider raising a restock order from the Pharmacy module.`;
  }

  if (/(doctor|specialist|available|staff)/.test(q)) {
    const available = db.doctors.filter(d => d.status === 'Available');
    return `${available.length} of ${db.doctors.length} doctors are currently available. The roster spans ${new Set(db.doctors.map(d => d.specialty)).size} specialties — open the Doctors page to see live availability.`;
  }

  if (/(patient|admit|roster)/.test(q)) {
    const critical = db.patients.filter(p => p.status === 'Critical').length;
    return `There are ${db.patients.length.toLocaleString()} patients on record, ${critical} flagged Critical. Ask me to summarize a specific patient by name and I'll pull their snapshot.`;
  }

  if (/(hi|hello|hey|help|what can you)/.test(q)) {
    return "Hi! I'm your MediAI Copilot. I can surface critical alerts, summarize today's schedule, check pharmacy stock, give a revenue snapshot, or look up doctors and patients. What would you like to know?";
  }

  return "I'm running on mock data for now, so I can help with alerts, appointments, billing, pharmacy stock, doctors, and patients. Try one of the suggested prompts above — once the backend is connected I'll answer free-form questions in full.";
}

function timeNow(): string {
  return new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
}

let messageSeq = 0;
const nextId = () => `msg-${messageSeq++}`;

export const AICopilotChat: React.FC<AICopilotChatProps> = ({ isOpen, onToggle, onClose }) => {
  const [messages, setMessages] = React.useState<ChatMessage[]>([]);
  const [input, setInput] = React.useState('');
  const [isTyping, setIsTyping] = React.useState(false);
  const scrollRef = React.useRef<HTMLDivElement>(null);
  const inputRef = React.useRef<HTMLInputElement>(null);

  React.useEffect(() => {
    if (isOpen) {
      const id = window.setTimeout(() => inputRef.current?.focus(), 250);
      return () => window.clearTimeout(id);
    }
  }, [isOpen]);

  React.useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: 'smooth' });
  }, [messages, isTyping]);

  const send = (text: string) => {
    const trimmed = text.trim();
    if (!trimmed || isTyping) return;

    const userMessage: ChatMessage = { id: nextId(), role: 'user', content: trimmed, ts: timeNow() };
    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setIsTyping(true);

    window.setTimeout(() => {
      const reply: ChatMessage = { id: nextId(), role: 'assistant', content: generateReply(trimmed), ts: timeNow() };
      setMessages(prev => [...prev, reply]);
      setIsTyping(false);
    }, 700);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    send(input);
  };

  const resetChat = () => {
    setMessages([]);
    setInput('');
    setIsTyping(false);
  };

  return (
    <>
      {/* Floating action button */}
      <button
        onClick={onToggle}
        aria-label={isOpen ? 'Close MediAI Copilot' : 'Open MediAI Copilot'}
        className={cn(
          'fixed bottom-6 right-6 z-50 flex items-center justify-center',
          'w-14 h-14 rounded-2xl shadow-lg shadow-violet-500/40',
          'bg-gradient-to-br from-violet-500 to-fuchsia-500 text-white',
          'transition-all duration-300 hover:scale-105 active:scale-95',
          isOpen && 'opacity-0 pointer-events-none translate-y-3'
        )}
      >
        <Sparkles className="w-6 h-6" />
        <span className="absolute -top-1 -right-1 w-3.5 h-3.5 bg-emerald-400 rounded-full border-2 border-slate-900 animate-pulse" />
      </button>

      {/* Chat panel */}
      <div
        className={cn(
          'fixed z-50 flex flex-col overflow-hidden',
          'bottom-0 right-0 w-full h-[85vh] rounded-t-3xl',
          'sm:bottom-6 sm:right-6 sm:w-[400px] sm:h-[600px] sm:max-h-[80vh] sm:rounded-3xl',
          'glass-panel backdrop-blur-2xl border shadow-2xl shadow-black/40',
          'transition-all duration-300 ease-out origin-bottom-right',
          isOpen ? 'opacity-100 translate-y-0 scale-100 pointer-events-auto' : 'opacity-0 translate-y-6 scale-95 pointer-events-none'
        )}
      >
        {/* Header */}
        <div className="flex items-center justify-between gap-3 p-4 border-b border-white/10">
          <div className="flex items-center gap-3">
            <div className="relative w-10 h-10 rounded-2xl bg-gradient-to-br from-violet-500 to-fuchsia-500 flex items-center justify-center">
              <Bot className="w-5 h-5 text-white" />
              <span className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-emerald-400 rounded-full border-2 border-slate-900" />
            </div>
            <div>
              <h2 className="text-sm font-semibold text-white flex items-center gap-1.5">
                MediAI Copilot
                <Sparkles className="w-3.5 h-3.5 text-violet-300" />
              </h2>
              <p className="text-[11px] text-emerald-300">Online · mock preview</p>
            </div>
          </div>
          <div className="flex items-center gap-1">
            {messages.length > 0 && (
              <button
                onClick={resetChat}
                title="New chat"
                className="p-2 rounded-lg hover:bg-white/10 transition-colors text-white/60 hover:text-white"
              >
                <RefreshCw className="w-4 h-4" />
              </button>
            )}
            <button
              onClick={onClose}
              title="Close"
              className="p-2 rounded-lg hover:bg-white/10 transition-colors text-white/60 hover:text-white"
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
                <Stethoscope className="w-7 h-7 text-violet-200" />
              </div>
              <h3 className="text-base font-semibold text-white">How can I help?</h3>
              <p className="text-sm text-white/50 mt-1 max-w-[260px]">
                Ask about alerts, schedules, billing, or your patient roster.
              </p>
            </div>
          )}

          {messages.map(message => (
            <div
              key={message.id}
              className={cn('flex gap-2.5', message.role === 'user' ? 'flex-row-reverse' : 'flex-row')}
            >
              <div
                className={cn(
                  'w-8 h-8 rounded-xl flex items-center justify-center flex-shrink-0',
                  message.role === 'user'
                    ? 'bg-white/10'
                    : 'bg-gradient-to-br from-violet-500 to-fuchsia-500'
                )}
              >
                {message.role === 'user' ? (
                  <User className="w-4 h-4 text-white/80" />
                ) : (
                  <Bot className="w-4 h-4 text-white" />
                )}
              </div>
              <div className={cn('max-w-[78%]', message.role === 'user' ? 'items-end' : 'items-start')}>
                <div
                  className={cn(
                    'rounded-2xl px-3.5 py-2.5 text-sm whitespace-pre-line leading-relaxed',
                    message.role === 'user'
                      ? 'bg-gradient-to-r from-primary to-accent text-white rounded-tr-sm'
                      : 'bg-white/5 border border-white/10 text-white rounded-tl-sm'
                  )}
                >
                  {message.content}
                </div>
                <p className={cn('text-[10px] text-white/30 mt-1', message.role === 'user' ? 'text-right' : 'text-left')}>
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
              <div className="bg-white/5 border border-white/10 rounded-2xl rounded-tl-sm px-4 py-3 flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-white/50 animate-bounce" style={{ animationDelay: '0ms' }} />
                <span className="w-1.5 h-1.5 rounded-full bg-white/50 animate-bounce" style={{ animationDelay: '150ms' }} />
                <span className="w-1.5 h-1.5 rounded-full bg-white/50 animate-bounce" style={{ animationDelay: '300ms' }} />
              </div>
            </div>
          )}
        </div>

        {/* Suggested prompts (only when empty) */}
        {messages.length === 0 && (
          <div className="px-4 pb-2 flex flex-wrap gap-2">
            {suggestions.map(s => (
              <button
                key={s.label}
                onClick={() => send(s.prompt)}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white/5 border border-white/10 text-xs text-white/80 hover:bg-white/10 transition-colors"
              >
                {s.icon}
                {s.label}
              </button>
            ))}
          </div>
        )}

        {/* Input */}
        <form onSubmit={handleSubmit} className="p-3 border-t border-white/10">
          <div className="flex items-center gap-2 rounded-2xl glass-input border px-3 py-2">
            <input
              ref={inputRef}
              value={input}
              onChange={e => setInput(e.target.value)}
              placeholder="Ask the Copilot anything…"
              className="flex-1 bg-transparent text-sm text-white placeholder:text-white/40 focus:outline-none"
            />
            <button
              type="submit"
              disabled={!input.trim() || isTyping}
              className="p-2 rounded-xl bg-gradient-to-r from-primary to-accent text-white transition-all hover:scale-105 active:scale-95 disabled:opacity-40 disabled:hover:scale-100"
            >
              <Send className="w-4 h-4" />
            </button>
          </div>
          <p className="text-[10px] text-white/30 text-center mt-2">
            Mock responses · backend integration coming soon
          </p>
        </form>
      </div>
    </>
  );
};
