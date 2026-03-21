import React, { useState } from 'react';
import { Brain, Lock, Mail, Sparkles, Moon, Sun } from 'lucide-react';
import { GlassCard } from '../components/ui/GlassCard';
import { GlassButton } from '../components/ui/GlassButton';
import { GlassInput } from '../components/ui/GlassInput';
import { useNavigate } from 'react-router-dom';
import { useTheme } from '../context/ThemeContext';

export const Login: React.FC = () => {
  const navigate = useNavigate();
  const { theme, toggleTheme } = useTheme();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      navigate('/');
    }, 800);
  };

  return (
    <div
      className="relative min-h-screen flex items-center justify-center p-4"
      style={{ background: 'var(--app-bg)' }}
    >
      <GlassButton
        type="button"
        variant="ghost"
        size="sm"
        onClick={toggleTheme}
        className="absolute top-6 right-6 flex items-center gap-2"
      >
        {theme === 'dark' ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
        <span>{theme === 'dark' ? 'Light mode' : 'Dark mode'}</span>
      </GlassButton>
      <div className="max-w-5xl w-full grid grid-cols-1 lg:grid-cols-2 gap-6">
        <GlassCard className="bg-white/5 border-white/10">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-3 rounded-2xl bg-gradient-to-br from-primary to-accent">
              <Brain className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-white flex items-center gap-2">
                MediAI
                <Sparkles className="w-4 h-4 text-violet-300" />
              </h1>
              <p className="text-white/60 text-sm">AI-powered hospital admin suite</p>
            </div>
          </div>
          <p className="text-white/70 text-sm leading-relaxed">
            Stay on top of clinical insights, billing, staffing, and operational AI agents in one unified workspace.
            Log in to continue managing your hospital dashboard in real time.
          </p>
          <div className="mt-8 space-y-4 text-white/70 text-sm">
            <div className="flex items-center gap-3">
              <span className="w-2 h-2 rounded-full bg-emerald-400" />
              Live AI alerts synced
            </div>
            <div className="flex items-center gap-3">
              <span className="w-2 h-2 rounded-full bg-cyan-400" />
              Patient + staff data updated hourly
            </div>
            <div className="flex items-center gap-3">
              <span className="w-2 h-2 rounded-full bg-amber-400" />
              Secure SSO ready
            </div>
          </div>
        </GlassCard>

        <GlassCard className="bg-white/5 border-white/10">
          <h2 className="text-xl font-semibold text-white mb-2">Welcome back</h2>
          <p className="text-white/50 text-sm mb-6">Sign in to continue to MediAI Console</p>
          <form className="space-y-4" onSubmit={handleSubmit}>
            <GlassInput
              label="Email"
              type="email"
              placeholder="you@hospital.com"
              icon={<Mail className="w-4 h-4" />}
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
            <GlassInput
              label="Password"
              type="password"
              placeholder="••••••••"
              icon={<Lock className="w-4 h-4" />}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
            <div className="flex items-center justify-between text-xs text-white/50">
              <label className="flex items-center gap-2">
                <input type="checkbox" className="accent-primary" />
                Remember me
              </label>
              <button type="button" className="text-primary-light hover:underline">Forgot password?</button>
            </div>
            <GlassButton variant="primary" className="w-full" disabled={loading}>
              {loading ? 'Signing in...' : 'Sign In'}
            </GlassButton>
          </form>
          <p className="text-xs text-white/40 mt-6 text-center">
            By continuing you agree to MediAI's Privacy Policy and Terms of Service
          </p>
        </GlassCard>
      </div>
    </div>
  );
};

export default Login;
