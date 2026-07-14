import { useEffect, useState } from 'react';
import { Calendar, MapPin, ChevronDown, ChevronUp, Search, Users, Type, FileText, Hash } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { useConfirm } from '../context/ConfirmContext';

function getStatus(dateStr) {
  if (!dateStr) return { label: 'No date', color: 'text-muted-dark bg-white/5' };
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const eventDate = new Date(dateStr);
  if (eventDate < today) return { label: 'Past', color: 'text-muted-dark bg-white/5' };
  if (eventDate.getTime() === today.getTime()) return { label: 'Today', color: 'text-accent bg-accent/15' };
  return { label: 'Upcoming', color: 'text-green-400 bg-green-400/10' };
}

const fieldClass = 'w-full rounded-lg bg-base-dark border border-white/10 pl-9 pr-3 py-2.5 text-sm outline-none transition-colors duration-200 focus:border-accent/50 focus:ring-2 focus:ring-accent/20';

export default function StaffEvents() {
  const confirm = useConfirm();
  const [events, setEvents] = useState([]);
  const [registrations, setRegistrations] = useState({});
  const [expandedId, setExpandedId] = useState(null);
  const [search, setSearch] = useState('');
  const [form, setForm] = useState({ title: '', description: '', event_date: '', location: '', capacity: '' });
  const [editingId, setEditingId] = useState(null);
  const [saving, setSaving] = useState(false);

  async function loadAll() {
    const { data: ev } = await supabase.from('events').select('*').order('event_date', { ascending: true });
    setEvents(ev || []);
    const { data: regs } = await supabase.from('event_registrations').select('event_id, full_name, phone_number');
    const grouped = {};
    (regs || []).forEach((r) => {
      grouped[r.event_id] = grouped[r.event_id] || [];
      grouped[r.event_id].push(r);
    });
    setRegistrations(grouped);
  }

  useEffect(() => { loadAll(); }, []);

  function startEdit(ev) {
    setEditingId(ev.id);
    setForm({
      title: ev.title, description: ev.description || '', event_date: ev.event_date || '',
      location: ev.location || '', capacity: ev.capacity ?? '',
    });
  }

  function resetForm() {
    setEditingId(null);
    setForm({ title: '', description: '', event_date: '', location: '', capacity: '' });
  }

  async function handleSubmit(e) {
    e.preventDefault();
    if (!form.title.trim()) return;
    setSaving(true);
    const payload = { ...form, capacity: form.capacity === '' ? null : Number(form.capacity) };
    if (editingId) {
      await supabase.from('events').update(payload).eq('id', editingId);
    } else {
      await supabase.from('events').insert(payload);
    }
    setSaving(false);
    resetForm();
    loadAll();
  }

  async function removeEvent(id, title) {
    const ok = await confirm({ title: 'Delete this event?', message: `"${title}" and all its registrations will be permanently removed.` });
    if (!ok) return;
    await supabase.from('events').delete().eq('id', id);
    loadAll();
  }

  const filtered = events.filter((e) => e.title.toLowerCase().includes(search.toLowerCase()));

  return (
    <div>
      <p className="text-[11px] font-bold uppercase tracking-[2px] text-accent mb-1.5">{editingId ? 'Editing' : 'Create'}</p>
      <p className="font-display text-4xl tracking-wide mb-5">{editingId ? 'Edit event' : 'New event'}</p>

      <form onSubmit={handleSubmit} className="flex flex-col gap-3 max-w-sm mb-10 rounded-2xl border border-white/10 bg-surface-dark p-5">
        <div className="relative">
          <Type size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-dark" />
          <input type="text" required placeholder="Title" value={form.title} onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))} className={fieldClass} />
        </div>
        <div className="relative">
          <FileText size={14} className="absolute left-3 top-3 text-muted-dark" />
          <textarea placeholder="Description" rows={2} value={form.description} onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))} className={`${fieldClass} resize-none pt-2.5`} />
        </div>
        <div className="flex gap-2">
          <div className="relative flex-1">
            <Calendar size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-dark" />
            <input type="date" value={form.event_date} onChange={(e) => setForm((f) => ({ ...f, event_date: e.target.value }))} className={fieldClass} />
          </div>
          <div className="relative w-28">
            <Hash size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-dark" />
            <input type="number" min="0" placeholder="Capacity" value={form.capacity} onChange={(e) => setForm((f) => ({ ...f, capacity: e.target.value }))} className={fieldClass} />
          </div>
        </div>
        <div className="relative">
          <MapPin size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-dark" />
          <input type="text" placeholder="Location" value={form.location} onChange={(e) => setForm((f) => ({ ...f, location: e.target.value }))} className={fieldClass} />
        </div>
        <div className="flex gap-2 mt-1">
          <button type="submit" disabled={saving} className="bg-accent text-[#1a0a00] rounded-lg py-2.5 px-5 text-sm font-bold disabled:opacity-60 transition-transform duration-200 hover:scale-[1.02] active:scale-95">
            {saving ? 'Saving...' : editingId ? 'Save changes' : 'Create event'}
          </button>
          {editingId && <button type="button" onClick={resetForm} className="text-sm text-muted-dark">Cancel</button>}
        </div>
      </form>

      <div className="flex items-center justify-between mb-4 flex-wrap gap-3">
        <p className="font-display text-3xl tracking-wide">All events ({events.length})</p>
        <div className="relative">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-dark" />
          <input type="text" placeholder="Search events..." value={search} onChange={(e) => setSearch(e.target.value)} className="rounded-full bg-surface-dark border border-white/10 pl-9 pr-4 py-2 text-sm outline-none w-52" />
        </div>
      </div>

      <div className="flex flex-col gap-2.5 max-w-2xl">
        {filtered.map((ev) => {
          const regs = registrations[ev.id] || [];
          const isOpen = expandedId === ev.id;
          const status = getStatus(ev.event_date);
          const pct = ev.capacity ? Math.min(100, Math.round((regs.length / ev.capacity) * 100)) : null;
          return (
            <div key={ev.id} className="rounded-xl border border-white/10 bg-surface-dark p-4 transition-all duration-300 hover:border-accent/20">
              <div className="flex justify-between items-start gap-3">
                <div className="min-w-0">
                  <div className="flex items-center gap-2 mb-1 flex-wrap">
                    <p className="text-sm font-semibold">{ev.title}</p>
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${status.color}`}>{status.label}</span>
                  </div>
                  {ev.description && <p className="text-xs text-muted-dark mb-1">{ev.description}</p>}
                  <div className="flex items-center gap-3 text-xs text-muted-dark">
                    {ev.event_date && <span className="flex items-center gap-1"><Calendar size={12} />{new Date(ev.event_date).toLocaleDateString()}</span>}
                    {ev.location && <span className="flex items-center gap-1"><MapPin size={12} />{ev.location}</span>}
                  </div>
                </div>
                <div className="flex gap-3 text-xs font-medium flex-shrink-0">
                  <button onClick={() => startEdit(ev)} className="text-accent">Edit</button>
                  <button onClick={() => removeEvent(ev.id, ev.title)} className="text-red-400">Delete</button>
                </div>
              </div>

              {ev.capacity ? (
                <div className="mt-3">
                  <div className="flex justify-between text-[11px] text-muted-dark mb-1">
                    <span>{regs.length} / {ev.capacity} registered</span>
                    <span>{pct}%</span>
                  </div>
                  <div className="h-1.5 rounded-full bg-white/10 overflow-hidden">
                    <div className={`h-full rounded-full transition-all duration-500 ${pct >= 100 ? 'bg-red-400' : 'bg-accent'}`} style={{ width: `${pct}%` }} />
                  </div>
                </div>
              ) : null}

              <button onClick={() => setExpandedId(isOpen ? null : ev.id)} className="flex items-center gap-1.5 text-xs font-semibold text-accent mt-3">
                {isOpen ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
                <Users size={12} />
                {regs.length} registered
              </button>

              {isOpen && (
                <div className="mt-2.5 flex flex-col gap-1.5 border-t border-white/10 pt-2.5 animate-[fadeIn_0.2s_ease]">
                  {regs.length === 0 && <p className="text-xs text-muted-dark">No one's registered yet.</p>}
                  {regs.map((r, i) => (
                    <div key={i} className="flex justify-between text-xs">
                      <span>{r.full_name}</span>
                      <span className="text-muted-dark">{r.phone_number || '—'}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          );
        })}
        {filtered.length === 0 && <p className="text-sm text-muted-dark">No events match.</p>}
      </div>
    </div>
  );
}