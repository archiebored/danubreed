import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
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
    <div className="min-h-screen flex flex-col items-center justify-center bg-base-dark text-white px-4">
      <Link
        to="/"
        className="absolute top-6 left-6 flex items-center gap-2 text-sm text-muted-dark hover:text-accent transition-colors"
      >
        <ArrowLeft size={16} />
        Back to home
      </Link>

      <form
        onSubmit={handleSubmit}
        className="w-full max-w-sm flex flex-col gap-3 rounded-2xl border border-white/10 bg-surface-dark p-7"
      >
        <p className="font-display text-3xl tracking-wide text-accent mb-1">Staff login</p>
        <input
          type="email"
          required
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="rounded-md bg-base-dark border border-white/10 px-3 py-2.5 text-sm outline-none"
        />
        <input
          type="password"
          required
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="rounded-md bg-base-dark border border-white/10 px-3 py-2.5 text-sm outline-none"
        />
        <button
          type="submit"
          disabled={loading}
          className="bg-accent text-[#1a0a00] rounded-md py-2.5 text-sm font-bold disabled:opacity-60"
        >
          {loading ? 'Signing in...' : 'Sign in'}
        </button>
        {error && <p className="text-xs text-red-400">{error}</p>}
      </form>
    </div>
  );
}