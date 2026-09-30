import React, { useState } from 'react';
import { Brain, Mail, Lock, User, ArrowLeft, CheckCircle } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { GlassCard } from '../components/ui/GlassCard';
import { GlassButton } from '../components/ui/GlassButton';
import { GlassInput } from '../components/ui/GlassInput';
import { useSession } from '../context/SessionContext';

/**
 * For staff an administrator invited. Registering creates a hospital; this only
 * creates an account, and the invite (matched on the confirmed email) decides
 * which hospital and role they land in.
 */
export const JoinHospital: React.FC = () => {
  const navigate = useNavigate();
  const { joinHospital } = useSession();
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [checkEmail, setCheckEmail] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    const result = await joinHospital(fullName, email, password);
    setLoading(false);
    if (result.error) setError(result.error);
    else if (result.needsConfirmation) setCheckEmail(true);
    // Every invitable role starts on the dashboard (patients aren't invited).
    else navigate('/');
  };

  return (
    <div className="relative min-h-screen flex items-center justify-center p-4" style={{ background: 'var(--app-bg)' }}>
      <div className="max-w-md w-full">
        <GlassCard>
          <div className="flex items-center gap-3 mb-6 justify-center">
            <div className="p-3 rounded-2xl bg-gradient-to-br from-primary to-accent">
              <Brain className="w-6 h-6 text-white" />
            </div>
            <h1 className="text-2xl font-bold text-app">MediAI</h1>
          </div>

          {checkEmail ? (
            <div className="text-center py-4">
              <CheckCircle className="w-10 h-10 mx-auto mb-4 text-emerald-500" />
              <h2 className="text-xl font-semibold text-app mb-2">Confirm your email</h2>
              <p className="text-app-muted text-sm leading-relaxed">
                We sent a link to <strong className="text-app">{email}</strong>. Open it, then sign in — you'll land
                straight in the hospital that invited you.
              </p>
            </div>
          ) : (
            <>
              <h2 className="text-xl font-semibold text-app mb-2 text-center">Join your hospital</h2>
              <p className="text-app-muted text-sm mb-6 text-center">
                Use the email your administrator invited. Your role comes from the invite.
              </p>
              <form className="space-y-4" onSubmit={handleSubmit}>
                <GlassInput label="Full name" icon={<User className="w-4 h-4" />} value={fullName} onChange={e => setFullName(e.target.value)} required autoComplete="name" />
                <GlassInput label="Work email" type="email" icon={<Mail className="w-4 h-4" />} value={email} onChange={e => setEmail(e.target.value)} required autoComplete="email" />
                <GlassInput label="Password" type="password" icon={<Lock className="w-4 h-4" />} value={password} onChange={e => setPassword(e.target.value)} required minLength={8} autoComplete="new-password" />
                {error && <p role="alert" className="text-sm text-red-400">{error}</p>}
                <GlassButton type="submit" variant="primary" className="w-full" disabled={loading}>
                  {loading ? 'Joining…' : 'Create account and join'}
                </GlassButton>
              </form>
            </>
          )}

          <div className="mt-6 border-t border-[var(--border)] pt-4 text-center">
            <button onClick={() => navigate('/login')} className="inline-flex items-center gap-2 text-xs text-app-muted hover:text-app transition-colors focus-ring rounded">
              <ArrowLeft className="w-3.5 h-3.5" /> Back to sign in
            </button>
          </div>
        </GlassCard>
      </div>
    </div>
  );
};
