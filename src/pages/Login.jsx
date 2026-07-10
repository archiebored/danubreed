import { useState } from 'react';
import { supabase } from '../lib/supabase';

export default function Login() {
  const [name, setName] = useState('');
  const [profile, setProfile] = useState(null);
  const [status, setStatus] = useState('idle');

  async function handleSubmit(e) {
    e.preventDefault();
    setStatus('checking');
    const { data, error } = await supabase.rpc('get_member_by_name', { p_full_name: name.trim() });

    if (error || !data || data.length === 0) {
      setStatus('error');
      setProfile(null);
      return;
    }
    setProfile(data[0]);
    setStatus('found');
  }

  return (
    <div className="max-w-lg mx-auto pt-2">
      <p className="text-[11px] font-bold uppercase tracking-[2px] text-accent mb-3">Already a member?</p>
      <h1 className="font-display text-5xl tracking-wide mb-3">Log in</h1>
      <p className="text-xs text-muted-light dark:text-muted-dark mb-5">
        Enter the full name you signed up with.
      </p>

      <form onSubmit={handleSubmit} className="flex gap-2 mb-6">
        <input
          type="text"
          required
          placeholder="Full name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          className="flex-1 rounded-xl bg-surface-light dark:bg-surface-dark border border-black/10 dark:border-white/10 px-4 py-3 text-sm outline-none transition-colors duration-200 focus:border-accent/50 focus:ring-2 focus:ring-accent/20"
        />
        <button
          type="submit"
          disabled={status === 'checking'}
          className="bg-accent text-[#1a0a00] rounded-xl px-6 text-sm font-bold disabled:opacity-60 transition-all duration-200 hover:scale-[1.03] active:scale-95"
        >
          {status === 'checking' ? '...' : 'Go'}
        </button>
      </form>

      {status === 'error' && (
        <p className="text-sm text-red-500 mb-4">No member found with that name — double check the spelling.</p>
      )}

      {profile && (
        <div className="relative overflow-hidden rounded-2xl border border-black/10 dark:border-white/10 bg-surface-light dark:bg-surface-dark p-6 animate-[fadeIn_0.3s_ease] transition-all duration-300 hover:shadow-lg hover:shadow-accent/10">
          <span className="absolute left-0 top-0 bottom-0 w-[3px] bg-accent rounded-r" />
          <p className="font-display text-3xl tracking-wide mb-4">{profile.full_name}</p>
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <p className="text-xs text-muted-light dark:text-muted-dark mb-0.5">Age</p>
              <p className="font-medium">{profile.age ?? '—'}</p>
            </div>
            <div>
              <p className="text-xs text-muted-light dark:text-muted-dark mb-0.5">Joined</p>
              <p className="font-medium">{new Date(profile.join_date).toLocaleDateString()}</p>
            </div>
            <div>
              <p className="text-xs text-muted-light dark:text-muted-dark mb-0.5">Tribe</p>
              <p className="font-medium">{profile.tribe_name || 'Not assigned yet'}</p>
            </div>
            <div>
              <p className="text-xs text-muted-light dark:text-muted-dark mb-0.5">Departments</p>
              <p className="font-medium">
                {profile.department_names?.length ? profile.department_names.join(', ') : 'None yet'}
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}