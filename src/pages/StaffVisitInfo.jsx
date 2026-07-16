import { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';

export default function StaffVisitInfo() {
  const [id, setId] = useState(null);
  const [form, setForm] = useState({
    church_name: '', address: '', city: '', camp_location: '',
    phone: '', email: '', instagram_url: '', tiktok_url: '',
  });
  const [status, setStatus] = useState('idle');

  useEffect(() => {
    supabase.from('church_info').select('*').limit(1).single().then(({ data }) => {
      if (data) {
        setId(data.id);
        setForm({
          church_name: data.church_name || '', address: data.address || '', city: data.city || '',
          camp_location: data.camp_location || '', phone: data.phone || '', email: data.email || '',
          instagram_url: data.instagram_url || '', tiktok_url: data.tiktok_url || '',
        });
      }
    });
  }, []);

  async function handleSubmit(e) {
    e.preventDefault();
    setStatus('saving');
    const { error } = await supabase.from('church_info').update(form).eq('id', id);
    setStatus(error ? 'error' : 'saved');
    setTimeout(() => setStatus('idle'), 2000);
  }

  const fieldClass = 'rounded-md bg-base-dark border border-white/10 px-3 py-2 text-sm outline-none transition-colors duration-200 focus:border-accent/50 focus:ring-2 focus:ring-accent/20';

  return (
    <div>
      <p className="text-[11px] font-bold uppercase tracking-[2px] text-accent mb-1.5">Public info</p>
      <p className="font-display text-4xl tracking-wide mb-2">Visit Us</p>
      <p className="text-xs text-muted-dark mb-6 max-w-md">
        This shows on the public "Visit Us" page. Leave anything blank to hide that section from visitors.
      </p>

      <form onSubmit={handleSubmit} className="flex flex-col gap-3 max-w-sm rounded-2xl border border-white/10 bg-surface-dark p-5">
        <p className="text-xs font-bold uppercase tracking-wide text-accent -mb-1">Location</p>
        <input type="text" placeholder="Church name" value={form.church_name} onChange={(e) => setForm((f) => ({ ...f, church_name: e.target.value }))} className={fieldClass} />
        <input type="text" placeholder="Street address" value={form.address} onChange={(e) => setForm((f) => ({ ...f, address: e.target.value }))} className={fieldClass} />
        <input type="text" placeholder="City" value={form.city} onChange={(e) => setForm((f) => ({ ...f, city: e.target.value }))} className={fieldClass} />
        <input type="text" placeholder="Daniel's Camp location" value={form.camp_location} onChange={(e) => setForm((f) => ({ ...f, camp_location: e.target.value }))} className={fieldClass} />

        <p className="text-xs font-bold uppercase tracking-wide text-accent -mb-1 mt-2">Contact</p>
        <input type="tel" placeholder="Phone number" value={form.phone} onChange={(e) => setForm((f) => ({ ...f, phone: e.target.value }))} className={fieldClass} />
        <input type="email" placeholder="Email" value={form.email} onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))} className={fieldClass} />

        <p className="text-xs font-bold uppercase tracking-wide text-accent -mb-1 mt-2">Social</p>
        <input type="text" placeholder="Instagram URL" value={form.instagram_url} onChange={(e) => setForm((f) => ({ ...f, instagram_url: e.target.value }))} className={fieldClass} />
        <input type="text" placeholder="TikTok URL" value={form.tiktok_url} onChange={(e) => setForm((f) => ({ ...f, tiktok_url: e.target.value }))} className={fieldClass} />

        <button type="submit" disabled={status === 'saving'} className="bg-accent text-[#1a0a00] rounded-md py-2.5 text-sm font-bold disabled:opacity-60 mt-2">
          {status === 'saving' ? 'Saving...' : status === 'saved' ? 'Saved ✓' : 'Save changes'}
        </button>
      </form>
    </div>
  );
}