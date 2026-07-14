import { useEffect, useState } from 'react';
import { UserPlus } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../context/AuthContext';
import { useConfirm } from '../context/ConfirmContext';

export default function StaffRoles() {
  const { staff } = useAuth();
  const confirm = useConfirm();
  const [staffList, setStaffList] = useState([]);
  const [form, setForm] = useState({ uid: '', full_name: '', email: '', role: 'coordinator' });
  const [status, setStatus] = useState('idle');

  async function load() {
    const { data } = await supabase.from('staff').select('*').order('full_name');
    setStaffList(data || []);
  }

  useEffect(() => { load(); }, []);

  async function handleAdd(e) {
    e.preventDefault();
    setStatus('saving');
    const { error } = await supabase.from('staff').insert({
      id: form.uid.trim(), full_name: form.full_name.trim(),
      email: form.email.trim() || null, role: form.role,
    });
    setStatus(error ? 'error' : 'saved');
    if (!error) {
      setForm({ uid: '', full_name: '', email: '', role: 'coordinator' });
      load();
    }
  }

  async function removeStaff(id, name) {
    const ok = await confirm({ title: `Remove ${name}'s access?`, message: "Their Supabase login stays active — this only removes app permissions." });
    if (!ok) return;
    await supabase.from('staff').delete().eq('id', id);
    load();
  }

  if (staff?.role !== 'admin') {
    return <p className="text-sm text-muted-dark">Only admins can manage staff access.</p>;
  }

  return (
    <div>
      <p className="text-[11px] font-bold uppercase tracking-[2px] text-accent mb-1.5">Access</p>
      <p className="font-display text-4xl tracking-wide mb-6 flex items-center gap-3">
        <UserPlus size={28} className="text-accent" />
        Add a coordinator or admin
      </p>

      <div className="flex flex-col gap-3 mb-8 max-w-lg">
        <div className="flex gap-3 rounded-xl border border-white/10 bg-surface-dark p-4">
          <span className="w-6 h-6 rounded-full bg-accent/15 text-accent text-xs font-bold flex items-center justify-center flex-shrink-0">1</span>
          <p className="text-sm text-muted-dark">
            In Supabase, go to <span className="text-white font-medium">Authentication → Users → Add user</span>, and turn on <span className="text-white font-medium">"Auto Confirm User"</span>.
          </p>
        </div>
        <div className="flex gap-3 rounded-xl border border-white/10 bg-surface-dark p-4">
          <span className="w-6 h-6 rounded-full bg-accent/15 text-accent text-xs font-bold flex items-center justify-center flex-shrink-0">2</span>
          <p className="text-sm text-muted-dark">
            Copy that person's <span className="text-white font-medium">User UID</span> from the users list.
          </p>
        </div>
        <div className="flex gap-3 rounded-xl border border-white/10 bg-surface-dark p-4">
          <span className="w-6 h-6 rounded-full bg-accent/15 text-accent text-xs font-bold flex items-center justify-center flex-shrink-0">3</span>
          <p className="text-sm text-muted-dark">
            Paste it into the form below — this is the step that actually gives them access inside the app.
          </p>
        </div>
      </div>

      <form onSubmit={handleAdd} className="flex flex-col gap-2.5 max-w-sm mb-10 rounded-2xl border border-white/10 bg-surface-dark p-5">
        <input type="text" required placeholder="User UID (from Supabase Auth)" value={form.uid} onChange={(e) => setForm((f) => ({ ...f, uid: e.target.value }))} className="rounded-md bg-base-dark border border-white/10 px-3 py-2 text-sm outline-none" />
        <input type="text" required placeholder="Full name" value={form.full_name} onChange={(e) => setForm((f) => ({ ...f, full_name: e.target.value }))} className="rounded-md bg-base-dark border border-white/10 px-3 py-2 text-sm outline-none" />
        <input type="email" placeholder="Email (just for your own reference)" value={form.email} onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))} className="rounded-md bg-base-dark border border-white/10 px-3 py-2 text-sm outline-none" />
        <select value={form.role} onChange={(e) => setForm((f) => ({ ...f, role: e.target.value }))} className="rounded-md bg-base-dark border border-white/10 px-3 py-2 text-sm outline-none">
          <option value="coordinator">Coordinator</option>
          <option value="admin">Admin</option>
        </select>
        <button type="submit" disabled={status === 'saving'} className="bg-accent text-[#1a0a00] rounded-md py-2 text-sm font-bold disabled:opacity-60">
          {status === 'saving' ? 'Adding...' : 'Grant access'}
        </button>
        {status === 'error' && <p className="text-xs text-red-400">Couldn't add — check the UID is correct and not already in use.</p>}
      </form>

      <p className="font-display text-3xl tracking-wide mb-4">Current staff</p>
      <div className="flex flex-col gap-2.5 max-w-md">
        {staffList.map((s) => (
          <div key={s.id} className="rounded-xl border border-white/10 bg-surface-dark p-4 flex justify-between items-center">
            <div>
              <p className="text-sm font-semibold">{s.full_name}</p>
              <p className="text-xs text-muted-dark capitalize">{s.role}{s.email ? ` · ${s.email}` : ''}</p>
            </div>
            {s.id !== staff.id && <button onClick={() => removeStaff(s.id, s.full_name)} className="text-xs text-red-400 font-medium">Remove</button>}
          </div>
        ))}
      </div>
    </div>
  );
}