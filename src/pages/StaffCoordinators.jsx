import { useEffect, useState } from 'react';
import { Upload, User } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { useConfirm } from '../context/ConfirmContext';

export default function StaffCoordinators() {
  const confirm = useConfirm();
  const [items, setItems] = useState([]);
  const [form, setForm] = useState({ full_name: '', role_label: '', phone: '', whatsapp_link: '' });
  const [photoFile, setPhotoFile] = useState(null);
  const [editingId, setEditingId] = useState(null);
  const [saving, setSaving] = useState(false);

  async function load() {
    const { data } = await supabase.from('coordinators').select('*').order('sort_order');
    setItems(data || []);
  }

  useEffect(() => { load(); }, []);

  function startEdit(item) {
    setEditingId(item.id);
    setForm({
      full_name: item.full_name, role_label: item.role_label || '',
      phone: item.phone || '', whatsapp_link: item.whatsapp_link || '',
    });
    setPhotoFile(null);
  }

  function resetForm() {
    setEditingId(null);
    setForm({ full_name: '', role_label: '', phone: '', whatsapp_link: '' });
    setPhotoFile(null);
  }

  async function handleSubmit(e) {
    e.preventDefault();
    if (!form.full_name.trim()) return;
    setSaving(true);

    let photo_url;
    if (photoFile) {
      const ext = photoFile.name.split('.').pop();
      const path = `${Date.now()}.${ext}`;
      const { error: uploadError } = await supabase.storage.from('coordinator-photos').upload(path, photoFile, { upsert: true });
      if (!uploadError) {
        photo_url = supabase.storage.from('coordinator-photos').getPublicUrl(path).data.publicUrl;
      }
    }

    const payload = { ...form, ...(photo_url ? { photo_url } : {}) };

    if (editingId) {
      await supabase.from('coordinators').update(payload).eq('id', editingId);
    } else {
      await supabase.from('coordinators').insert({ ...payload, sort_order: items.length });
    }
    setSaving(false);
    resetForm();
    load();
  }

  async function remove(id, name) {
    const ok = await confirm({ title: `Remove ${name}?`, message: 'They will disappear from the public Coordinators page.' });
    if (!ok) return;
    await supabase.from('coordinators').delete().eq('id', id);
    load();
  }

  return (
    <div>
      <p className="text-[11px] font-bold uppercase tracking-[2px] text-accent mb-1.5">{editingId ? 'Editing' : 'Directory'}</p>
      <p className="font-display text-4xl tracking-wide mb-2">{editingId ? 'Edit coordinator' : 'Add coordinator'}</p>
      <p className="text-xs text-muted-dark mb-5 max-w-md">
        This is the public directory shown on the Coordinators page — not staff login access
        (that's under Roles). The first one here also appears as the welcome message on Home.
      </p>

      <form onSubmit={handleSubmit} className="flex flex-col gap-3 max-w-sm mb-10 rounded-2xl border border-white/10 bg-surface-dark p-5">
        <label className="rounded-xl border-2 border-dashed border-white/15 bg-base-dark p-4 text-center cursor-pointer flex flex-col items-center gap-2 transition-colors duration-200 hover:border-accent/40">
          {photoFile ? (
            <img src={URL.createObjectURL(photoFile)} alt="Preview" className="w-14 h-14 rounded-full object-cover" />
          ) : (
            <div className="w-14 h-14 rounded-full bg-white/5 flex items-center justify-center">
              <User size={22} className="text-muted-dark" />
            </div>
          )}
          <p className="text-xs font-medium flex items-center gap-1.5 text-muted-dark">
            <Upload size={12} />
            {photoFile ? photoFile.name : 'Upload a photo'}
          </p>
          <input type="file" accept="image/*" className="hidden" onChange={(e) => setPhotoFile(e.target.files[0])} />
        </label>

        <input type="text" required placeholder="Full name" value={form.full_name} onChange={(e) => setForm((f) => ({ ...f, full_name: e.target.value }))} className="rounded-md bg-base-dark border border-white/10 px-3 py-2 text-sm outline-none" />
        <input type="text" placeholder="Role, e.g. Lead Coordinator" value={form.role_label} onChange={(e) => setForm((f) => ({ ...f, role_label: e.target.value }))} className="rounded-md bg-base-dark border border-white/10 px-3 py-2 text-sm outline-none" />
        <input type="tel" placeholder="Phone number" value={form.phone} onChange={(e) => setForm((f) => ({ ...f, phone: e.target.value }))} className="rounded-md bg-base-dark border border-white/10 px-3 py-2 text-sm outline-none" />
        <input type="text" placeholder="WhatsApp link (optional)" value={form.whatsapp_link} onChange={(e) => setForm((f) => ({ ...f, whatsapp_link: e.target.value }))} className="rounded-md bg-base-dark border border-white/10 px-3 py-2 text-sm outline-none" />

        <div className="flex gap-2">
          <button type="submit" disabled={saving} className="bg-accent text-[#1a0a00] rounded-md py-2 px-4 text-sm font-bold disabled:opacity-60">
            {saving ? 'Saving...' : editingId ? 'Save changes' : 'Add'}
          </button>
          {editingId && <button type="button" onClick={resetForm} className="text-sm text-muted-dark">Cancel</button>}
        </div>
      </form>

      <p className="font-display text-3xl tracking-wide mb-4">Current coordinators</p>
      <div className="flex flex-col gap-2.5 max-w-sm">
        {items.map((item) => (
          <div key={item.id} className="rounded-xl border border-white/10 bg-surface-dark p-4 flex items-center justify-between">
            <div className="flex items-center gap-3">
              {item.photo_url ? (
                <img src={item.photo_url} alt={item.full_name} className="w-10 h-10 rounded-full object-cover" />
              ) : (
                <div className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center">
                  <User size={16} className="text-muted-dark" />
                </div>
              )}
              <div>
                <p className="text-sm font-semibold">{item.full_name}</p>
                <p className="text-xs text-muted-dark">{item.role_label}{item.phone ? ` · ${item.phone}` : ''}</p>
              </div>
            </div>
            <div className="flex gap-3 text-xs font-medium">
              <button onClick={() => startEdit(item)} className="text-accent">Edit</button>
              <button onClick={() => remove(item.id, item.full_name)} className="text-red-400">Delete</button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}