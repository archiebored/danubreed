import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ArrowLeft, Lock } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export default function StaffLogin() {
  const { signIn } = useAuth();
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    setLoading(true);
    setError('');
    const { error } = await signIn(email, password);
    setLoading(false);
    if (error) {
      setError('Could not sign in — check the email and password.');
      return;
    }
    navigate('/staff/dashboard');
  }

  return (
    <div className="min-h-screen relative flex flex-col items-center justify-center bg-base-dark text-white px-4 overflow-hidden">
      <div
        className="pointer-events-none absolute inset-0 opacity-40"
        style={{
          backgroundImage: 'linear-gradient(rgba(249,115,22,0.1) 1px, transparent 1px), linear-gradient(90deg, rgba(249,115,22,0.1) 1px, transparent 1px)',
          backgroundSize: '48px 48px',
        }}
      />
      <div
        className="pointer-events-none absolute -top-40 left-1/2 -translate-x-1/2 w-[500px] h-[500px] rounded-full"
        style={{ background: 'radial-gradient(circle, rgba(249,115,22,0.15) 0%, transparent 70%)' }}
      />

      <Link
        to="/"
        className="absolute top-6 left-6 z-10 flex items-center gap-2 text-sm text-muted-dark hover:text-accent transition-colors"
      >
        <ArrowLeft size={16} />
        Back to home
      </Link>

      <form
        onSubmit={handleSubmit}
        className="relative z-10 w-full max-w-sm flex flex-col gap-3 rounded-2xl border border-white/10 bg-surface-dark p-7 animate-[fadeIn_0.3s_ease]"
      >
        <div className="w-11 h-11 rounded-full bg-accent/15 flex items-center justify-center mb-1">
          <Lock size={18} className="text-accent" />
        </div>
        <p className="font-display text-3xl tracking-wide text-accent mb-1">Staff login</p>
        <input
          type="email"
          required
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="rounded-md bg-base-dark border border-white/10 px-3 py-2.5 text-sm outline-none transition-colors duration-200 focus:border-accent/50 focus:ring-2 focus:ring-accent/20"
        />
        <input
          type="password"
          required
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="rounded-md bg-base-dark border border-white/10 px-3 py-2.5 text-sm outline-none transition-colors duration-200 focus:border-accent/50 focus:ring-2 focus:ring-accent/20"
        />
        <button
          type="submit"
          disabled={loading}
          className="bg-accent text-[#1a0a00] rounded-md py-2.5 text-sm font-bold disabled:opacity-60 transition-transform duration-200 hover:scale-[1.02] active:scale-95"
        >
          {loading ? 'Signing in...' : 'Sign in'}
        </button>
        {error && <p className="text-xs text-red-400">{error}</p>}
      </form>
    </div>
  );
}
