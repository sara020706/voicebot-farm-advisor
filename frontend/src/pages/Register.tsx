import { useState } from 'react';
import { AuthDecorPanel } from '@/components/AuthDecorPanel';
import { Spinner } from '@/components/Spinner';
import { useAppToast } from '@/components/Toast';
import { apiRegister } from '@/lib/api';
import { setToken, setUser } from '@/lib/store';

interface Props {
  onRegister: () => void;
  onGoLogin: () => void;
}

export default function Register({ onRegister, onGoLogin }: Props) {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [state, setState] = useState('');
  const [acres, setAcres] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const { showToast } = useAppToast();

  const handleRegister = async () => {
    setLoading(true);
    try {
      const data = await apiRegister(name, email, password, state, parseFloat(acres) || 0);
      setToken(data.token);
      setUser(data.user);
      showToast('Account created!', 'success');
      onRegister();
    } catch (e: any) {
      showToast(e.message, 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen grid md:grid-cols-2">
      <AuthDecorPanel />
      <div className="flex flex-col items-center justify-center p-8 md:p-16">
        <div className="w-full max-w-sm">
          <h1 className="font-heading text-3xl font-extrabold text-foreground mb-1">VoiceBot</h1>
          <p className="text-muted-foreground text-sm mb-8 italic">Create your account</p>

          <label className="text-xs font-medium uppercase tracking-wider text-muted-foreground mb-1 block">Full Name</label>
          <input className="vb-input w-full mb-3" value={name} onChange={e => setName(e.target.value)} placeholder="Ravi Kumar" />

          <label className="text-xs font-medium uppercase tracking-wider text-muted-foreground mb-1 block">Email</label>
          <input type="email" className="vb-input w-full mb-3" value={email} onChange={e => setEmail(e.target.value)} placeholder="you@example.com" />

          <label className="text-xs font-medium uppercase tracking-wider text-muted-foreground mb-1 block">State</label>
          <input className="vb-input w-full mb-3" value={state} onChange={e => setState(e.target.value)} placeholder="Maharashtra" />

          <label className="text-xs font-medium uppercase tracking-wider text-muted-foreground mb-1 block">Land Size (acres)</label>
          <input type="number" className="vb-input w-full mb-3" value={acres} onChange={e => setAcres(e.target.value)} placeholder="5" />

          <label className="text-xs font-medium uppercase tracking-wider text-muted-foreground mb-1 block">Password</label>
          <input type="password" className="vb-input w-full mb-6" value={password} onChange={e => setPassword(e.target.value)} placeholder="••••••••" />

          <button onClick={handleRegister} disabled={loading} className="vb-btn-primary w-full">
            {loading ? <Spinner /> : 'Create Account'}
          </button>

          <div className="mt-4 text-sm text-center">
            <button onClick={onGoLogin} className="text-accent hover:underline">Back to login</button>
          </div>
        </div>
      </div>
    </div>
  );
}
