import { useState } from 'react';
import { AuthDecorPanel } from '@/components/AuthDecorPanel';
import { Spinner } from '@/components/Spinner';
import { useAppToast } from '@/components/Toast';
import { apiLogin } from '@/lib/api';
import { setToken, setUser } from '@/lib/store';

interface Props {
  onLogin: () => void;
  onGoRegister: () => void;
}

export default function Login({ onLogin, onGoRegister }: Props) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const { showToast } = useAppToast();

  const handleLogin = async () => {
    setLoading(true);
    try {
      const data = await apiLogin(email, password);
      setToken(data.token);
      setUser(data.user);
      showToast('Welcome back!', 'success');
      onLogin();
    } catch (e: any) {
      showToast(e.message, 'error');
    } finally {
      setLoading(false);
    }
  };

  const quickDemo = () => {
    setEmail('demo@voicebot.in');
    setPassword('demo123');
  };

  return (
    <div className="min-h-screen grid md:grid-cols-2">
      <div className="flex flex-col items-center justify-center p-8 md:p-16">
        <div className="w-full max-w-sm">
          <h1 className="font-heading text-3xl font-extrabold text-foreground mb-1">VoiceBot</h1>
          <p className="text-muted-foreground text-sm mb-10 italic">Your voice. Your soil. Your harvest.</p>

          <label className="text-xs font-medium uppercase tracking-wider text-muted-foreground mb-1 block">Email</label>
          <input type="email" className="vb-input w-full mb-4" value={email} onChange={e => setEmail(e.target.value)} placeholder="you@example.com" />

          <label className="text-xs font-medium uppercase tracking-wider text-muted-foreground mb-1 block">Password</label>
          <input type="password" className="vb-input w-full mb-6" value={password} onChange={e => setPassword(e.target.value)} placeholder="••••••••" />

          <button onClick={handleLogin} disabled={loading} className="vb-btn-primary w-full">
            {loading ? <Spinner /> : 'Sign In'}
          </button>

          <div className="flex justify-between mt-4 text-sm">
            <button onClick={onGoRegister} className="text-accent hover:underline">Create account</button>
            <button onClick={quickDemo} className="text-muted-foreground hover:underline">Quick Demo</button>
          </div>

          <button
            onClick={() => {
              setToken('demo-token');
              setUser({ name: 'Demo Farmer', email: 'demo@voicebot.in', state: 'Maharashtra' });
              onLogin();
            }}
            className="mt-6 w-full h-12 rounded-xl border border-border text-foreground font-medium transition-all duration-200 hover:bg-muted"
          >
            Skip to App →
          </button>
        </div>
      </div>
      <AuthDecorPanel />
    </div>
  );
}
