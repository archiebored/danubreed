import { useEffect, useState } from 'react';
import { Upload, Trash2 } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { useConfirm } from '../context/ConfirmContext';

export default function StaffGallery() {
  const confirm = useConfirm();
  const [photos, setPhotos] = useState([]);
  const [file, setFile] = useState(null);
  const [caption, setCaption] = useState('');
  const [uploading, setUploading] = useState(false);

  async function load() {
    const { data } = await supabase.from('gallery_photos').select('*').order('sort_order', { ascending: false });
    setPhotos(data || []);
  }

  useEffect(() => { load(); }, []);

  async function handleUpload(e) {
    e.preventDefault();
    if (!file) return;
    setUploading(true);
    const ext = file.name.split('.').pop();
    const path = `${Date.now()}.${ext}`;
    const { error: uploadError } = await supabase.storage.from('gallery').upload(path, file);
    if (!uploadError) {
      const url = supabase.storage.from('gallery').getPublicUrl(path).data.publicUrl;
      await supabase.from('gallery_photos').insert({
        image_url: url,
        caption: caption.trim() || null,
        sort_order: Date.now(),
      });
    }
    setUploading(false);
    setFile(null);
    setCaption('');
    load();
  }

  async function remove(id) {
    const ok = await confirm({ title: 'Delete this photo?' });
    if (!ok) return;
    await supabase.from('gallery_photos').delete().eq('id', id);
    load();
  }

  return (
    <div>
      <p className="text-[11px] font-bold uppercase tracking-[2px] text-accent mb-1.5">Moments</p>
      <p className="font-display text-4xl tracking-wide mb-5">Gallery</p>

      <form onSubmit={handleUpload} className="flex flex-col gap-3 max-w-sm mb-10 rounded-2xl border border-white/10 bg-surface-dark p-5">
        <label className="rounded-xl border-2 border-dashed border-white/15 bg-base-dark p-6 text-center cursor-pointer flex flex-col items-center gap-2 transition-colors duration-200 hover:border-accent/40">
          <Upload size={20} className="text-accent" />
          <p className="text-xs font-medium">{file ? file.name : 'Tap to upload a photo'}</p>
          <input type="file" accept="image/*" className="hidden" onChange={(e) => setFile(e.target.files[0])} />
        </label>
        <input type="text" placeholder="Caption (optional)" value={caption} onChange={(e) => setCaption(e.target.value)} className="rounded-md bg-base-dark border border-white/10 px-3 py-2 text-sm outline-none" />
        <button type="submit" disabled={!file || uploading} className="bg-accent text-[#1a0a00] rounded-md py-2 text-sm font-bold disabled:opacity-60">
          {uploading ? 'Uploading...' : 'Add to gallery'}
        </button>
      </form>

      <p className="font-display text-3xl tracking-wide mb-4">{photos.length} photo{photos.length === 1 ? '' : 's'}</p>
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 max-w-2xl">
        {photos.map((p) => (
          <div key={p.id} className="relative group rounded-xl overflow-hidden border border-white/10 aspect-square">
            <img src={p.image_url} alt={p.caption || ''} className="w-full h-full object-cover" />
            <button
              onClick={() => remove(p.id)}
              aria-label="Delete photo"
              className="absolute top-1.5 right-1.5 w-7 h-7 rounded-full bg-black/60 flex items-center justify-center text-red-400 opacity-0 group-hover:opacity-100 transition-opacity duration-200"
            >
              <Trash2 size={13} />
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}