import { useEffect, useState } from 'react';
import { Search, ExternalLink } from 'lucide-react';
import { supabase } from '../lib/supabase';

export default function StaffCamp() {
  const [registrations, setRegistrations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');
  const [search, setSearch] = useState('');

  async function load() {
    setLoading(true);
    let query = supabase
      .from('camp_registrations')
      .select('*, departments(name)')
      .order('created_at', { ascending: false });
    if (filter !== 'all') query = query.eq('payment_status', filter);
    const { data } = await query;
    setRegistrations(data || []);
    setLoading(false);
  }

  useEffect(() => { load(); }, [filter]);

  const filtered = registrations.filter((r) =>
    r.full_name.toLowerCase().includes(search.toLowerCase())
  );

  const paidCount = registrations.filter((r) => r.payment_status === 'paid').length;
  const unpaidCount = registrations.filter((r) => r.payment_status === 'unpaid').length;

  return (
    <div>
      <p className="text-[11px] font-bold uppercase tracking-[2px] text-accent mb-1.5">August 27–30, 2026</p>
      <p className="font-display text-4xl tracking-wide mb-1">Daniel's Camp</p>
      <p className="font-display text-xl tracking-wide text-accent mb-6">Mount Up</p>

      <div className="grid grid-cols-3 gap-3 mb-7 max-w-sm">
        <div className="rounded-xl border border-white/10 bg-surface-dark p-3 text-center">
          <p className="font-display text-2xl">{registrations.length}</p>
          <p className="text-[11px] text-muted-dark">Total</p>
        </div>
        <div className="rounded-xl border border-green-400/20 bg-green-400/5 p-3 text-center">
          <p className="font-display text-2xl text-green-400">{paidCount}</p>
          <p className="text-[11px] text-muted-dark">Paid</p>
        </div>
        <div className="rounded-xl border border-accent/20 bg-accent/5 p-3 text-center">
          <p className="font-display text-2xl text-accent">{unpaidCount}</p>
          <p className="text-[11px] text-muted-dark">Unpaid</p>
        </div>
      </div>

      <div className="flex items-center justify-between mb-4 flex-wrap gap-3">
        <div className="flex gap-1.5">
          {['all', 'paid', 'unpaid'].map((f) => (
            <button key={f} onClick={() => setFilter(f)} className={`text-xs font-medium px-3.5 py-1.5 rounded-full capitalize border ${filter === f ? 'bg-accent/15 text-accent border-accent/30' : 'bg-surface-dark text-muted-dark border-white/10'}`}>
              {f}
            </button>
          ))}
        </div>
        <div className="relative">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-dark" />
          <input type="text" placeholder="Search by name..." value={search} onChange={(e) => setSearch(e.target.value)} className="rounded-full bg-surface-dark border border-white/10 pl-9 pr-4 py-2 text-sm outline-none w-48" />
        </div>
      </div>

      {loading && <p className="text-sm text-muted-dark">Loading...</p>}

      <div className="flex flex-col gap-2 max-w-2xl">
        {filtered.map((r) => (
          <div key={r.id} className="rounded-xl border border-white/10 bg-surface-dark p-4 flex flex-wrap items-center gap-3">
            <div className="min-w-[160px]">
              <p className="text-sm font-semibold">{r.full_name}</p>
              <p className="text-xs text-muted-dark">
                Age {r.age}{r.departments?.name ? ` · ${r.departments.name.replace(' Department', '')}` : ''}
              </p>
            </div>
            <span className={`text-[11px] font-bold px-2.5 py-1 rounded-full ${r.payment_status === 'paid' ? 'text-green-400 bg-green-400/10' : 'text-accent bg-accent/10'}`}>
              {r.payment_status === 'paid' ? 'Paid ✓' : 'Unpaid'}
            </span>
            {r.receipt_url && (
              <a href={r.receipt_url} target="_blank" rel="noreferrer" className="flex items-center gap-1 text-xs text-accent ml-auto">
                <ExternalLink size={12} />
                Receipt
              </a>
            )}
            {r.team_color && (
  <span className="text-[11px] font-bold px-2.5 py-1 rounded-full text-white"
    style={{ backgroundColor: r.team_color === 'yellow' ? '#EAB308' : r.team_color === 'blue' ? '#3B82F6' : r.team_color === 'red' ? '#EF4444' : '#22C55E' }}
  >
    {r.team_color}
  </span>
)}
          </div>
        ))}
        {!loading && filtered.length === 0 && <p className="text-sm text-muted-dark">No registrations yet.</p>}
      </div>
    </div>
  );
}