import { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';
import { useConfirm } from '../context/ConfirmContext';

export default function StaffServiceTimes() {
  const confirm = useConfirm();
  const [items, setItems] = useState([]);
  const [form, setForm] = useState({ label: '', time_text: '' });
  const [editingId, setEditingId] = useState(null);
  const [saving, setSaving] = useState(false);

  async function load() {
    const { data } = await supabase.from('service_times').select('*').order('sort_order');
    setItems(data || []);
  }

  useEffect(() => { load(); }, []);

  function startEdit(item) {
    setEditingId(item.id);
    setForm({ label: item.label, time_text: item.time_text });
  }

  function resetForm() {
    setEditingId(null);
    setForm({ label: '', time_text: '' });
  }

  async function handleSubmit(e) {
    e.preventDefault();
    if (!form.label.trim() || !form.time_text.trim()) return;
    setSaving(true);
    if (editingId) {
      await supabase.from('service_times').update(form).eq('id', editingId);
    } else {
      await supabase.from('service_times').insert({ ...form, sort_order: items.length });
    }
    setSaving(false);
    resetForm();
    load();
  }

  async function remove(id, label) {
    const ok = await confirm({ title: `Remove "${label}"?` });
    if (!ok) return;
    await supabase.from('service_times').delete().eq('id', id);
    load();
  }

  return (
    <div>
      <p className="text-[11px] font-bold uppercase tracking-[2px] text-accent mb-1.5">{editingId ? 'Editing' : 'Schedule'}</p>
      <p className="font-display text-4xl tracking-wide mb-5">{editingId ? 'Edit service time' : 'Add service time'}</p>
      <form onSubmit={handleSubmit} className="flex flex-col gap-2.5 max-w-sm mb-10 rounded-2xl border border-white/10 bg-surface-dark p-5">
        <input type="text" required placeholder="Label, e.g. Bible study" value={form.label} onChange={(e) => setForm((f) => ({ ...f, label: e.target.value }))} className="rounded-md bg-base-dark border border-white/10 px-3 py-2 text-sm outline-none" />
        <input type="text" required placeholder="Time, e.g. 9:00 am" value={form.time_text} onChange={(e) => setForm((f) => ({ ...f, time_text: e.target.value }))} className="rounded-md bg-base-dark border border-white/10 px-3 py-2 text-sm outline-none" />
        <div className="flex gap-2">
          <button type="submit" disabled={saving} className="bg-accent text-[#1a0a00] rounded-md py-2 px-4 text-sm font-bold disabled:opacity-60">
            {saving ? 'Saving...' : editingId ? 'Save changes' : 'Add'}
          </button>
          {editingId && <button type="button" onClick={resetForm} className="text-sm text-muted-dark">Cancel</button>}
        </div>
      </form>

      <p className="font-display text-3xl tracking-wide mb-4">Current service times</p>
      <div className="flex flex-col gap-2.5 max-w-sm">
        {items.map((item) => (
          <div key={item.id} className="rounded-xl border border-white/10 bg-surface-dark p-4 flex justify-between items-center">
            <div>
              <p className="text-sm font-semibold">{item.label}</p>
              <p className="text-xs text-accent">{item.time_text}</p>
            </div>
            <div className="flex gap-3 text-xs font-medium">
              <button onClick={() => startEdit(item)} className="text-accent">Edit</button>
              <button onClick={() => remove(item.id, item.label)} className="text-red-400">Delete</button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}