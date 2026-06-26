import React, { useState } from 'react';
import { Brain, Mail, Sparkles, Moon, Sun, ArrowLeft, CheckCircle } from 'lucide-react';
import { GlassCard } from '../components/ui/GlassCard';
import { GlassButton } from '../components/ui/GlassButton';
import { GlassInput } from '../components/ui/GlassInput';
import { useNavigate } from 'react-router-dom';
import { useTheme } from '../context/ThemeContext';

export const ForgotPassword: React.FC = () => {
  const navigate = useNavigate();
  const { theme, toggleTheme } = useTheme();
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      setSuccess(true);
    }, 1000);
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
      
      <div className="max-w-md w-full">
        <GlassCard className="bg-white/5 border-white/10">
          <div className="flex items-center gap-3 mb-6 justify-center">
            <div className="p-3 rounded-2xl bg-gradient-to-br from-primary to-accent">
              <Brain className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-white flex items-center gap-2">
                MediAI
                <Sparkles className="w-4 h-4 text-violet-300" />
              </h1>
              <p className="text-white/60 text-xs">Hospital admin suite</p>
            </div>
          </div>

          {!success ? (
            <>
              <h2 className="text-xl font-semibold text-white mb-2 text-center">Reset Password</h2>
              <p className="text-white/50 text-sm mb-6 text-center">
                Enter your email address and we'll send you instructions to reset your password.
              </p>
              
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
                
                <GlassButton variant="primary" className="w-full" disabled={loading}>
                  {loading ? 'Sending link...' : 'Send Reset Link'}
                </GlassButton>
              </form>
            </>
          ) : (
            <div className="text-center py-4">
              <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-emerald-500/10 text-emerald-400 mb-4 border border-emerald-500/20">
                <CheckCircle className="w-6 h-6" />
              </div>
              <h2 className="text-xl font-semibold text-white mb-2">Check your email</h2>
              <p className="text-white/50 text-sm mb-6 leading-relaxed">
                We have sent reset instructions to <br />
                <strong className="text-white font-medium">{email}</strong>
              </p>
              <GlassButton 
                variant="outline" 
                className="w-full text-white hover:text-white"
                onClick={() => setSuccess(false)}
              >
                Resend link
              </GlassButton>
            </div>
          )}

          <div className="mt-6 border-t border-white/5 pt-4 text-center">
            <button
              onClick={() => navigate('/login')}
              className="inline-flex items-center gap-2 text-xs text-white/50 hover:text-white transition-colors"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              Back to Sign In
            </button>
          </div>
        </GlassCard>
      </div>
    </div>
  );
};
