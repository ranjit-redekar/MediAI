import React, { useMemo, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Brain, Sparkles, Moon, Sun, Stethoscope, UserRound, HeartPulse, Pill,
  FlaskConical, ClipboardList, Shield, User, ArrowRight, Check, Lock, Mail,
  Eye, EyeOff, AlertCircle, Copy, ArrowUpDown,
} from 'lucide-react';
import type { LucideIcon } from 'lucide-react';
import { GlassButton } from '../components/ui/GlassButton';
import { GlassInput } from '../components/ui/GlassInput';
import { RoleWorkspacePreview } from '../components/auth/RoleWorkspacePreview';
import { useTheme } from '../context/ThemeContext';
import { useSession } from '../context/SessionContext';
import { useToast } from '../context/ToastContext';
import { cn } from '../utils/cn';
import type { RoleId } from '../types/access';

const ROLE_ICONS: Record<RoleId, LucideIcon> = {
  admin: Shield,
  doctor: Stethoscope,
  'assistant-doctor': UserRound,
  nurse: HeartPulse,
  pharmacist: Pill,
  'lab-technician': FlaskConical,
  receptionist: ClipboardList,
  patient: User,
};

export const Login: React.FC = () => {
  const navigate = useNavigate();
  const { isDark, toggleTheme } = useTheme();
  const { role, roles, signInAs } = useSession();
  const { toast } = useToast();

  const [selected, setSelected] = useState<RoleId>(role.id);
  const [username, setUsername] = useState(role.credentials.username);
  const [password, setPassword] = useState(role.credentials.password);
  const [revealed, setRevealed] = useState(false);
  const [capsOn, setCapsOn] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const gridRef = useRef<HTMLDivElement>(null);

  const active = useMemo(
    () => roles.find(r => r.id === selected) ?? roles[0],
    [roles, selected]
  );

  // Selecting a role fills its credentials, so the common path is one click
  // while the fields stay editable for anyone who wants to type them.
  const selectRole = (id: RoleId) => {
    const next = roles.find(r => r.id === id);
    if (!next) return;
    setSelected(id);
    setUsername(next.credentials.username);
    setPassword(next.credentials.password);
    setError(null);
  };

  // Arrow keys walk the role grid; the tile under the cursor takes focus.
  const onGridKeyDown = (e: React.KeyboardEvent) => {
    const keys = ['ArrowRight', 'ArrowLeft', 'ArrowDown', 'ArrowUp'];
    if (!keys.includes(e.key)) return;
    e.preventDefault();

    const index = roles.findIndex(r => r.id === selected);
    const step = e.key === 'ArrowRight' ? 1
      : e.key === 'ArrowLeft' ? -1
      : e.key === 'ArrowDown' ? 2
      : -2;
    const next = roles[(index + step + roles.length) % roles.length];
    selectRole(next.id);
    gridRef.current
      ?.querySelector<HTMLElement>(`[data-role="${next.id}"]`)
      ?.focus();
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (loading) return;

    // Credentials are the identity — the picker is only a shortcut, so the
    // username submitted decides which workspace you land in.
    const match = roles.find(
      r => r.credentials.username.toLowerCase() === username.trim().toLowerCase()
    );

    if (!match) {
      setError('We don’t recognise that username.');
      return;
    }
    if (match.credentials.password !== password) {
      setError(`Wrong password for ${match.name}.`);
      return;
    }

    setError(null);
    setLoading(true);
    window.setTimeout(() => {
      signInAs(match.id);
      navigate(match.home);
    }, 550);
  };

  const copyCredentials = async () => {
    try {
      await navigator.clipboard.writeText(
        `${active.credentials.username} / ${active.credentials.password}`
      );
      toast('Credentials copied', { description: `${active.name} sign-in details are on your clipboard.` });
    } catch {
      toast('Could not copy', { description: 'Your browser blocked clipboard access.', variant: 'warning' });
    }
  };

  return (
    <div
      className="relative min-h-screen flex items-center justify-center p-4 sm:p-6 overflow-hidden"
      style={{ background: 'var(--app-bg)' }}
    >
      {/* Ambient motion — drifts slowly, stops entirely for reduced-motion */}
      <div className="absolute inset-0 pointer-events-none" aria-hidden="true">
        <div className="auth-orb w-[38rem] h-[38rem] -top-40 -left-40 bg-primary/25" />
        <div className="auth-orb w-[30rem] h-[30rem] -bottom-32 -right-24 bg-accent/20" style={{ animationDelay: '-8s' }} />
        <div className="auth-orb w-[22rem] h-[22rem] top-1/3 right-1/4 bg-secondary/15" style={{ animationDelay: '-15s' }} />
      </div>

      <GlassButton
        type="button"
        variant="ghost"
        size="sm"
        onClick={toggleTheme}
        className="absolute top-5 right-5 w-9 px-0 z-10"
        aria-label={isDark ? 'Switch to light theme' : 'Switch to dark theme'}
      >
        {isDark ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
      </GlassButton>

      <div className="relative w-full max-w-5xl grid grid-cols-1 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.1fr)] gap-8 lg:gap-12 items-center">
        {/* Sign in */}
        <div className="reveal">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-primary to-accent flex items-center justify-center flex-shrink-0">
              <Brain className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-app flex items-center gap-1.5">
                MediAI <Sparkles className="w-3.5 h-3.5 text-violet-400" />
              </h1>
              <p className="text-app-muted text-sm">Every role gets a different app</p>
            </div>
          </div>

          {/* Role grid */}
          <div className="flex items-center justify-between gap-2 mb-2.5">
            <p className="text-[10px] uppercase tracking-wider font-semibold text-app-subtle">
              Sign in as
            </p>
            <span className="hidden sm:inline-flex items-center gap-1 text-[10px] text-app-subtle">
              <ArrowUpDown className="w-2.5 h-2.5" /> arrow keys
            </span>
          </div>

          <div
            ref={gridRef}
            role="radiogroup"
            aria-label="Choose a role"
            onKeyDown={onGridKeyDown}
            className="grid grid-cols-2 gap-2"
          >
            {roles.map((r, i) => {
              const Icon = ROLE_ICONS[r.id];
              const isActive = selected === r.id;
              return (
                <button
                  key={r.id}
                  type="button"
                  data-role={r.id}
                  role="radio"
                  aria-checked={isActive}
                  tabIndex={isActive ? 0 : -1}
                  onClick={() => selectRole(r.id)}
                  style={{ animationDelay: `${i * 40}ms` }}
                  className={cn(
                    'reveal group relative flex items-center gap-2.5 p-3 rounded-xl border text-left',
                    'transition-all duration-200 focus-ring',
                    isActive
                      ? cn('border-transparent ring-2 scale-[1.02]', r.accent.bg, r.accent.ring)
                      : 'bg-[var(--surface-2)] border-[var(--border)] hover:border-[var(--border-strong)] hover:-translate-y-0.5'
                  )}
                >
                  <Icon className={cn(
                    'w-4 h-4 flex-shrink-0 transition-transform duration-200',
                    isActive ? cn(r.accent.text, 'scale-110') : 'text-app-subtle group-hover:text-app-muted'
                  )} />
                  <span className={cn('text-xs font-semibold truncate', isActive ? 'text-app' : 'text-app-muted')}>
                    {r.name}
                  </span>
                  {isActive && <Check className={cn('w-3.5 h-3.5 ml-auto flex-shrink-0', r.accent.text)} />}
                </button>
              );
            })}
          </div>

          {/* Compact stand-in for the preview window on small screens */}
          <div key={active.id} className="reveal lg:hidden mt-4 flex items-center gap-3 p-3 rounded-xl border border-[var(--border)] bg-[var(--surface-1)]">
            <img src={active.demoUser.avatar} alt="" className="w-9 h-9 rounded-lg object-cover flex-shrink-0" />
            <div className="min-w-0 flex-1">
              <p className="text-xs font-semibold text-app truncate">{active.demoUser.name}</p>
              <p className="text-[11px] text-app-muted leading-snug line-clamp-2">{active.persona}</p>
            </div>
          </div>

          {/* Credentials */}
          <form onSubmit={handleSubmit} className="mt-5 space-y-3.5">
            <GlassInput
              label="Username"
              type="text"
              autoComplete="username"
              value={username}
              onChange={e => { setUsername(e.target.value); setError(null); }}
              icon={<Mail className="w-4 h-4" />}
            />

            <div>
              <div className="flex items-center justify-between gap-2 mb-1.5 min-h-[20px]">
                <label htmlFor="login-password" className="text-sm font-medium text-app-muted">
                  Password
                </label>
                {capsOn && (
                  <span className="hint-in inline-flex items-center gap-1 text-[10px] font-semibold text-amber-400">
                    <AlertCircle className="w-2.5 h-2.5" /> Caps Lock is on
                  </span>
                )}
              </div>
              <div className="relative">
                <Lock className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-app-subtle pointer-events-none" />
                <input
                  id="login-password"
                  type={revealed ? 'text' : 'password'}
                  autoComplete="current-password"
                  value={password}
                  onChange={e => { setPassword(e.target.value); setError(null); }}
                  onKeyUp={e => setCapsOn(e.getModifierState?.('CapsLock') ?? false)}
                  onBlur={() => setCapsOn(false)}
                  className={cn(
                    'w-full h-11 rounded-xl glass-input border pl-10 pr-11 text-sm text-app',
                    'outline-none transition-all duration-200 focus-ring focus:border-[var(--border-strong)]',
                    error && 'border-[color:var(--danger)]'
                  )}
                />
                <button
                  type="button"
                  onClick={() => setRevealed(v => !v)}
                  aria-label={revealed ? 'Hide password' : 'Show password'}
                  className="absolute right-3 top-1/2 -translate-y-1/2 p-1 rounded-md text-app-subtle hover:text-app transition-colors focus-ring"
                >
                  {revealed ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {error && (
              <p role="alert" className="hint-in flex items-start gap-1.5 text-sm text-[color:var(--danger)]">
                <AlertCircle className="w-4 h-4 flex-shrink-0 mt-px" />
                {error}
              </p>
            )}

            <GlassButton type="submit" variant="primary" size="lg" className="w-full" disabled={loading}>
              {loading
                ? <><span className="w-4 h-4 rounded-full border-2 border-white/30 border-t-white animate-spin" /> Signing in…</>
                : <>Sign in as {active.name} <ArrowRight className="w-4 h-4" /></>}
            </GlassButton>
          </form>

          <div className="flex items-center justify-between gap-3 mt-3.5">
            <button
              type="button"
              onClick={() => navigate('/forgot-password')}
              className="text-xs text-app-muted hover:text-app transition-colors focus-ring rounded"
            >
              Forgot password?
            </button>
            <button
              type="button"
              onClick={copyCredentials}
              className="inline-flex items-center gap-1 text-xs text-app-muted hover:text-app transition-colors focus-ring rounded"
            >
              <Copy className="w-3 h-3" /> Copy demo credentials
            </button>
          </div>
        </div>

        {/* Live preview of the workspace behind that sign-in */}
        <div className="hidden lg:block">
          <RoleWorkspacePreview role={active} />
          <p className="text-center text-xs text-app-subtle mt-6 leading-relaxed max-w-sm mx-auto">
            <span className={cn('font-semibold', active.accent.text)}>{active.name}</span> — {active.persona}
          </p>
        </div>
      </div>
    </div>
  );
};
