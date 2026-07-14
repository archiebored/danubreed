import { useEffect, useState } from 'react';
import { Search } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { useConfirm } from '../context/ConfirmContext';

export default function StaffMembers() {
  const confirm = useConfirm();
  const [members, setMembers] = useState([]);
  const [tribes, setTribes] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [memberDepts, setMemberDepts] = useState({});
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);

  async function loadAll() {
    setLoading(true);
    const [{ data: m }, { data: t }, { data: d }, { data: md }] = await Promise.all([
      supabase.from('members').select('*').order('full_name'),
      supabase.from('tribes').select('id, name').order('name'),
      supabase.from('departments').select('id, name').order('name'),
      supabase.from('member_departments').select('member_id, department_id'),
    ]);
    setMembers(m || []);
    setTribes(t || []);
    setDepartments(d || []);
    const grouped = {};
    (md || []).forEach((row) => {
      grouped[row.member_id] = grouped[row.member_id] || [];
      grouped[row.member_id].push(row.department_id);
    });
    setMemberDepts(grouped);
    setLoading(false);
  }

  useEffect(() => { loadAll(); }, []);

  async function assignTribe(memberId, tribeId) {
    setMembers((curr) => curr.map((m) => (m.id === memberId ? { ...m, tribe_id: tribeId } : m)));
    await supabase.from('members').update({ tribe_id: tribeId || null }).eq('id', memberId);
  }

  async function removeMember(memberId, name) {
    const ok = await confirm({ title: `Remove ${name}?`, message: 'This deletes their full record and cannot be undone.' });
    if (!ok) return;
    await supabase.from('members').delete().eq('id', memberId);
    setMembers((curr) => curr.filter((m) => m.id !== memberId));
  }

  function deptNames(memberId) {
    const ids = memberDepts[memberId] || [];
    return ids.map((id) => departments.find((d) => d.id === id)?.name.replace(' Department', '')).filter(Boolean).join(', ');
  }

  function age(dob) {
    if (!dob) return '—';
    const diff = Date.now() - new Date(dob).getTime();
    return Math.floor(diff / (1000 * 60 * 60 * 24 * 365.25));
  }

  const filtered = members.filter((m) => m.full_name.toLowerCase().includes(search.toLowerCase()));

  return (
    <div>
      <div className="flex items-center justify-between mb-6 flex-wrap gap-3">
        <div>
          <p className="text-[11px] font-bold uppercase tracking-[2px] text-accent mb-1.5">Directory</p>
          <p className="font-display text-4xl tracking-wide">Members ({members.length})</p>
        </div>
        <div className="relative">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-dark" />
          <input type="text" placeholder="Search by name..." value={search} onChange={(e) => setSearch(e.target.value)} className="rounded-full bg-surface-dark border border-white/10 pl-9 pr-4 py-2 text-sm outline-none w-52" />
        </div>
      </div>

      {loading && <p className="text-sm text-muted-dark">Loading...</p>}

      <div className="flex flex-col gap-2.5">
        {filtered.map((m) => (
          <div key={m.id} className="rounded-xl border border-white/10 bg-surface-dark p-4 flex flex-wrap items-center gap-4 transition-colors duration-200 hover:border-accent/20">
            <div className="min-w-[160px]">
              <p className="text-sm font-semibold">{m.full_name}</p>
              <p className="text-xs text-muted-dark">Age {age(m.date_of_birth)} · joined {new Date(m.join_date).toLocaleDateString()}</p>
            </div>
            <div className="text-xs text-muted-dark min-w-[140px]">{deptNames(m.id) || 'No departments'}</div>
            <select value={m.tribe_id || ''} onChange={(e) => assignTribe(m.id, e.target.value)} className="rounded-md bg-base-dark border border-white/10 px-2 py-1.5 text-xs outline-none">
              <option value="">No tribe</option>
              {tribes.map((t) => <option key={t.id} value={t.id}>{t.name}</option>)}
            </select>
            <button onClick={() => removeMember(m.id, m.full_name)} className="text-xs text-red-400 ml-auto font-medium">Remove</button>
          </div>
        ))}
        {!loading && filtered.length === 0 && <p className="text-sm text-muted-dark">No members match that search.</p>}
      </div>
    </div>
  );
}