import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Brain, Sparkles, Moon, Sun, Building2, Mail, Lock, User, ArrowRight, ArrowLeft,
  Check, AlertCircle, Globe,
} from 'lucide-react';
import { GlassButton } from '../components/ui/GlassButton';
import { GlassInput } from '../components/ui/GlassInput';
import { GlassSelect } from '../components/ui/GlassSelect';
import { useTheme } from '../context/ThemeContext';
import { useSession } from '../context/SessionContext';
import { saveWorkspace, slugify } from '../data/workspace';
import { cn } from '../utils/cn';

const STEPS = ['Workspace', 'Your account', 'Plan'] as const;

const FACILITY_TYPES = [
  { value: 'hospital', label: 'Hospital' },
  { value: 'clinic', label: 'Multi-speciality clinic' },
  { value: 'diagnostic', label: 'Diagnostic centre' },
  { value: 'chain', label: 'Hospital group' },
];

const TEAM_SIZES = [
  { value: '1-25', label: '1–25 staff' },
  { value: '26-150', label: '26–150 staff' },
  { value: '151-500', label: '151–500 staff' },
  { value: '500+', label: '500+ staff' },
];

const PLANS = [
  { id: 'starter', name: 'Starter', price: '$99', per: '/month', blurb: 'Up to 25 staff, 2 AI agents, core scheduling and records.' },
  { id: 'growth', name: 'Growth', price: '$299', per: '/month', blurb: 'Up to 150 staff, every AI agent, billing, pharmacy and labs.' },
  { id: 'enterprise', name: 'Enterprise', price: 'Custom', per: '', blurb: 'Unlimited staff, SSO, audit exports, dedicated onboarding.' },
];

export const Register: React.FC = () => {
  const navigate = useNavigate();
  const { isDark, toggleTheme } = useTheme();
  const { signInAs } = useSession();

  const [step, setStep] = useState(0);
  const [creating, setCreating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [org, setOrg] = useState('');
  const [facility, setFacility] = useState(FACILITY_TYPES[0].value);
  const [size, setSize] = useState(TEAM_SIZES[0].value);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [planId, setPlanId] = useState(PLANS[1].id);

  const slug = slugify(org) || 'your-hospital';

  // Each step is its own form, so the browser's own validation gates every
  // "Continue" and nothing hand-written duplicates `required` or `type=email`.
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (step === 1 && password !== confirm) {
      setError('Those two passwords don’t match.');
      return;
    }
    setError(null);

    if (step < STEPS.length - 1) {
      setStep(step + 1);
      return;
    }

    setCreating(true);
    window.setTimeout(() => {
      saveWorkspace({
        name: org.trim(),
        slug,
        facilityType: facility,
        teamSize: size,
        planId,
        adminName: name.trim(),
        adminEmail: email.trim(),
        createdAt: new Date().toISOString(),
      });
      // Whoever signs the hospital up owns it — they land as the administrator.
      signInAs('admin', email.trim());
      navigate('/', { replace: true });
    }, 700);
  };

  return (
    <div
      className="relative min-h-screen flex items-center justify-center p-4 sm:p-6 overflow-hidden"
      style={{ background: 'var(--app-bg)' }}
    >
      <div className="absolute inset-0 pointer-events-none" aria-hidden="true">
        <div className="auth-orb w-[38rem] h-[38rem] -top-40 -left-40 bg-primary/25" />
        <div className="auth-orb w-[30rem] h-[30rem] -bottom-32 -right-24 bg-accent/20" style={{ animationDelay: '-8s' }} />
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

      <div className="relative w-full max-w-lg reveal">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-primary to-accent flex items-center justify-center flex-shrink-0">
            <Brain className="w-6 h-6 text-white" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-app flex items-center gap-1.5">
              MediAI <Sparkles className="w-3.5 h-3.5 text-violet-400" />
            </h1>
            <p className="text-app-muted text-sm">Set your hospital up in three steps</p>
          </div>
        </div>

        {/* Step rail */}
        <ol className="flex items-center gap-2 mb-6">
          {STEPS.map((label, i) => (
            <li key={label} className="flex-1">
              <div className={cn(
                'h-1 rounded-full transition-colors duration-300',
                i <= step ? 'bg-primary' : 'bg-[var(--border)]'
              )} />
              <p className={cn(
                'mt-2 text-[11px] font-semibold flex items-center gap-1',
                i === step ? 'text-app' : 'text-app-subtle'
              )}>
                {i < step ? <Check className="w-3 h-3 text-primary" /> : `${i + 1}.`} {label}
              </p>
            </li>
          ))}
        </ol>

        <form key={step} onSubmit={handleSubmit} className="space-y-4">
          {step === 0 && (
            <>
              <GlassInput
                label="Hospital or clinic name"
                value={org}
                onChange={e => setOrg(e.target.value)}
                placeholder="St. Mary's Medical Centre"
                icon={<Building2 className="w-4 h-4" />}
                autoFocus
                required
              />
              <p className="flex items-center gap-1.5 text-xs text-app-subtle -mt-1">
                <Globe className="w-3 h-3" /> Your workspace: <span className="text-app-muted font-medium">{slug}.mediai.app</span>
              </p>
              <GlassSelect
                label="Facility type"
                options={FACILITY_TYPES}
                value={facility}
                onChange={e => setFacility(e.target.value)}
              />
              <GlassSelect
                label="Team size"
                options={TEAM_SIZES}
                value={size}
                onChange={e => setSize(e.target.value)}
              />
            </>
          )}

          {step === 1 && (
            <>
              <GlassInput
                label="Your full name"
                value={name}
                onChange={e => setName(e.target.value)}
                placeholder="Dr. Ananya Rao"
                icon={<User className="w-4 h-4" />}
                autoComplete="name"
                autoFocus
                required
              />
              <GlassInput
                label="Work email"
                type="email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                placeholder={`you@${slug}.com`}
                icon={<Mail className="w-4 h-4" />}
                autoComplete="email"
                required
              />
              <GlassInput
                label="Password"
                type="password"
                value={password}
                onChange={e => { setPassword(e.target.value); setError(null); }}
                icon={<Lock className="w-4 h-4" />}
                autoComplete="new-password"
                minLength={8}
                required
              />
              <GlassInput
                label="Confirm password"
                type="password"
                value={confirm}
                onChange={e => { setConfirm(e.target.value); setError(null); }}
                icon={<Lock className="w-4 h-4" />}
                autoComplete="new-password"
                minLength={8}
                required
              />
              <p className="text-xs text-app-subtle">
                This account becomes the workspace administrator — everyone else is invited from Staff.
              </p>
            </>
          )}

          {step === 2 && (
            <div role="radiogroup" aria-label="Choose a plan" className="space-y-2.5">
              {PLANS.map(plan => {
                const active = planId === plan.id;
                return (
                  <button
                    key={plan.id}
                    type="button"
                    role="radio"
                    aria-checked={active}
                    onClick={() => setPlanId(plan.id)}
                    className={cn(
                      'w-full text-left p-4 rounded-xl border transition-all duration-200 focus-ring',
                      active
                        ? 'border-transparent ring-2 ring-primary bg-primary/10'
                        : 'bg-[var(--surface-2)] border-[var(--border)] hover:border-[var(--border-strong)]'
                    )}
                  >
                    <div className="flex items-baseline justify-between gap-3">
                      <span className="text-sm font-semibold text-app flex items-center gap-1.5">
                        {plan.name}
                        {active && <Check className="w-3.5 h-3.5 text-primary" />}
                      </span>
                      <span className="text-sm font-semibold text-app">
                        {plan.price}<span className="text-app-subtle font-normal">{plan.per}</span>
                      </span>
                    </div>
                    <p className="mt-1 text-xs text-app-muted leading-relaxed">{plan.blurb}</p>
                  </button>
                );
              })}
              <p className="text-xs text-app-subtle pt-1">
                14 days free. No card needed until the trial ends.
              </p>
            </div>
          )}

          {error && (
            <p role="alert" className="hint-in flex items-start gap-1.5 text-sm text-[color:var(--danger)]">
              <AlertCircle className="w-4 h-4 flex-shrink-0 mt-px" /> {error}
            </p>
          )}

          <div className="flex items-center gap-3 pt-1">
            {step > 0 && (
              <GlassButton
                type="button"
                variant="outline"
                size="lg"
                onClick={() => { setError(null); setStep(step - 1); }}
              >
                <ArrowLeft className="w-4 h-4" /> Back
              </GlassButton>
            )}
            <GlassButton type="submit" variant="primary" size="lg" className="flex-1" disabled={creating}>
              {creating
                ? <><span className="w-4 h-4 rounded-full border-2 border-white/30 border-t-white animate-spin" /> Creating workspace…</>
                : step === STEPS.length - 1
                  ? <>Start free trial <ArrowRight className="w-4 h-4" /></>
                  : <>Continue <ArrowRight className="w-4 h-4" /></>}
            </GlassButton>
          </div>
        </form>

        <p className="mt-5 text-center text-xs text-app-muted">
          Already have a workspace?{' '}
          <button
            type="button"
            onClick={() => navigate('/login')}
            className="font-semibold text-app hover:underline focus-ring rounded"
          >
            Sign in
          </button>
        </p>
      </div>
    </div>
  );
};
