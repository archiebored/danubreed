import { useState } from 'react';
import { supabase } from '../lib/supabase';

export default function Login() {
  const [code, setCode] = useState('');
  const [profile, setProfile] = useState(null);
  const [status, setStatus] = useState('idle');

  async function handleSubmit(e) {
    e.preventDefault();
    setStatus('checking');
    const cleaned = code.trim().toUpperCase();
    const formatted = cleaned.startsWith('#') ? cleaned : `#${cleaned}`;
    const { data, error } = await supabase.rpc('get_member_by_code', { p_code: formatted });

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
      <p className="text-[11px] font-bold uppercase tracking-[2px] text-accent mb-3">
        Already a member?
      </p>
      <h1 className="font-display text-5xl tracking-wide mb-3">Log in</h1>
      <p className="text-xs text-muted-light dark:text-muted-dark mb-5">
        Enter the code you got when you signed up — something like #DNB4F2K.
      </p>

      <form onSubmit={handleSubmit} className="flex gap-2 mb-6">
        <input
          type="text"
          required
          placeholder="#DNB4F2K"
          value={code}
          onChange={(e) => setCode(e.target.value)}
          className="flex-1 rounded-xl bg-surface-light dark:bg-surface-dark border border-black/10 dark:border-white/10 px-4 py-3 text-sm outline-none uppercase"
        />
        <button
          type="submit"
          disabled={status === 'checking'}
          className="bg-accent text-[#1a0a00] rounded-xl px-6 text-sm font-bold disabled:opacity-60"
        >
          {status === 'checking' ? '...' : 'Go'}
        </button>
      </form>

      {status === 'error' && (
        <p className="text-sm text-red-500 mb-4">No member found with that code — double check it.</p>
      )}

      {profile && (
        <div className="relative overflow-hidden rounded-2xl border border-black/10 dark:border-white/10 bg-surface-light dark:bg-surface-dark p-6">
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