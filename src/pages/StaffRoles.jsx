import { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../context/AuthContext';

export default function StaffRoles() {
  const { staff } = useAuth();
  const [staffList, setStaffList] = useState([]);
  const [form, setForm] = useState({ uid: '', full_name: '', email: '', role: 'coordinator' });
  const [status, setStatus] = useState('idle');

  async function load() {
    const { data } = await supabase.from('staff').select('*').order('full_name');
    setStaffList(data || []);
  }

  useEffect(() => {
    load();
  }, []);

  async function handleAdd(e) {
    e.preventDefault();
    setStatus('saving');
    const { error } = await supabase.from('staff').insert({
      id: form.uid.trim(),
      full_name: form.full_name.trim(),
      email: form.email.trim() || null,
      role: form.role,
    });
    setStatus(error ? 'error' : 'saved');
    if (!error) {
      setForm({ uid: '', full_name: '', email: '', role: 'coordinator' });
      load();
    }
  }

  async function removeStaff(id) {
    if (!confirm("Remove this person's app access? Their Supabase login stays — this only removes permissions.")) return;
    await supabase.from('staff').delete().eq('id', id);
    load();
  }

  if (staff?.role !== 'admin') {
    return <p className="text-sm text-muted-dark">Only admins can manage staff access.</p>;
  }

  return (
    <div>
      <p className="text-[11px] font-bold uppercase tracking-[2px] text-accent mb-1.5">Access</p>
      <p className="font-display text-4xl tracking-wide mb-2">Add a coordinator or admin</p>
      <p className="text-xs text-muted-dark mb-5 max-w-md leading-relaxed">
        First create their login in Supabase: Authentication → Users → Add user (turn on
        "Auto Confirm User"). Then copy their User UID from that list and paste it below —
        this is the step that actually gives them access inside the app.
      </p>

      <form
        onSubmit={handleAdd}
        className="flex flex-col gap-2.5 max-w-sm mb-10 rounded-2xl border border-white/10 bg-surface-dark p-5"
      >
        <input
          type="text"
          required
          placeholder="User UID (from Supabase Auth)"
          value={form.uid}
          onChange={(e) => setForm((f) => ({ ...f, uid: e.target.value }))}
          className="rounded-md bg-base-dark border border-white/10 px-3 py-2 text-sm outline-none"
        />
        <input
          type="text"
          required
          placeholder="Full name"
          value={form.full_name}
          onChange={(e) => setForm((f) => ({ ...f, full_name: e.target.value }))}
          className="rounded-md bg-base-dark border border-white/10 px-3 py-2 text-sm outline-none"
        />
        <input
          type="email"
          placeholder="Email (just for your own reference)"
          value={form.email}
          onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))}
          className="rounded-md bg-base-dark border border-white/10 px-3 py-2 text-sm outline-none"
        />
        <select
          value={form.role}
          onChange={(e) => setForm((f) => ({ ...f, role: e.target.value }))}
          className="rounded-md bg-base-dark border border-white/10 px-3 py-2 text-sm outline-none"
        >
          <option value="coordinator">Coordinator</option>
          <option value="admin">Admin</option>
        </select>
        <button
          type="submit"
          disabled={status === 'saving'}
          className="bg-accent text-[#1a0a00] rounded-md py-2 text-sm font-bold disabled:opacity-60"
        >
          {status === 'saving' ? 'Adding...' : 'Grant access'}
        </button>
        {status === 'error' && (
          <p className="text-xs text-red-400">
            Couldn't add — check the UID is correct and not already in use.
          </p>
        )}
      </form>

      <p className="font-display text-3xl tracking-wide mb-4">Current staff</p>
      <div className="flex flex-col gap-2.5 max-w-md">
        {staffList.map((s) => (
          <div
            key={s.id}
            className="rounded-xl border border-white/10 bg-surface-dark p-4 flex justify-between items-center"
          >
            <div>
              <p className="text-sm font-semibold">{s.full_name}</p>
              <p className="text-xs text-muted-dark capitalize">
                {s.role}
                {s.email ? ` · ${s.email}` : ''}
              </p>
            </div>
            {s.id !== staff.id && (
              <button onClick={() => removeStaff(s.id)} className="text-xs text-red-400 font-medium">
                Remove
              </button>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}