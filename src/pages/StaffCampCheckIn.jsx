import { useState } from 'react';
import { Search } from 'lucide-react';
import { supabase } from '../lib/supabase';

const CAMP_START = new Date('2026-08-27T00:00:00');
const CAMP_END = new Date('2026-08-31T00:00:00'); // end of Aug 30

export default function StaffCampCheckIn() {
  const now = new Date();
  const isLive = now >= CAMP_START && now < CAMP_END;

  const [name, setName] = useState('');
  const [result, setResult] = useState(null); // 'paid' | 'unpaid' | 'unregistered' | null
  const [checking, setChecking] = useState(false);

  async function handleCheck(e) {
    e.preventDefault();
    setChecking(true);
    const { data, error } = await supabase.rpc('camp_checkin_lookup', { p_full_name: name.trim() });
    setChecking(false);
    if (error || !data || data.length === 0) { setResult('unregistered'); return; }
    setResult(data[0].payment_status);
  }

  if (!isLive) {
    return (
      <div>
        <p className="text-[11px] font-bold uppercase tracking-[2px] text-accent mb-1.5">Check-in</p>
        <p className="font-display text-4xl tracking-wide mb-4">Camp check-in</p>
        <div className="rounded-2xl border border-white/10 bg-surface-dark p-6 max-w-md">
          <p className="text-sm text-muted-dark">
            This opens automatically on August 27, 2026 — the first day of Daniel's Camp — and
            stays open through August 30.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div>
      <p className="text-[11px] font-bold uppercase tracking-[2px] text-accent mb-1.5">Live now</p>
      <p className="font-display text-4xl tracking-wide mb-5">Camp check-in</p>

      <form onSubmit={handleCheck} className="flex gap-2 max-w-md mb-6">
        <input
          type="text"
          required
          placeholder="Teen's full name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          className="flex-1 rounded-xl bg-surface-dark border border-white/10 px-4 py-3 text-sm outline-none"
        />
        <button
          type="submit"
          disabled={checking}
          className="bg-accent text-[#1a0a00] rounded-xl px-5 text-sm font-bold disabled:opacity-60 flex items-center gap-2"
        >
          <Search size={15} />
          {checking ? '...' : 'Check'}
        </button>
      </form>

      {result === 'paid' && (
        <div className="rounded-2xl border border-green-400/30 bg-green-400/10 p-6 max-w-md">
          <p className="font-display text-2xl text-green-400 tracking-wide">Registered &amp; Paid ✓</p>
        </div>
      )}
      {result === 'unpaid' && (
        <div className="rounded-2xl border border-accent/30 bg-accent/10 p-6 max-w-md">
          <p className="font-display text-2xl text-accent tracking-wide">Registered — Unpaid</p>
        </div>
      )}
      {result === 'unregistered' && (
        <div className="rounded-2xl border border-red-400/30 bg-red-400/10 p-6 max-w-md">
          <p className="font-display text-2xl text-red-400 tracking-wide">Not registered</p>
        </div>
      )}
    </div>
  );
}