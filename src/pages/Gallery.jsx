import { useEffect, useState } from 'react';
import { X } from 'lucide-react';
import { supabase } from '../lib/supabase';

export default function Gallery() {
  const [photos, setPhotos] = useState([]);
  const [active, setActive] = useState(null);

  useEffect(() => {
    supabase.from('gallery_photos').select('*').order('sort_order', { ascending: false }).then(({ data }) => setPhotos(data || []));
  }, []);

  return (
    <div className="max-w-4xl mx-auto pt-2">
      <p className="text-[11px] font-bold uppercase tracking-[2px] text-accent mb-3">Moments</p>
      <h1 className="font-display text-5xl tracking-wide mb-8">Gallery</h1>

      {photos.length === 0 && (
        <p className="text-sm text-muted-light dark:text-muted-dark">No photos yet — check back soon.</p>
      )}

      <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
        {photos.map((p) => (
          <button
            key={p.id}
            onClick={() => setActive(p)}
            className="aspect-square rounded-xl overflow-hidden border border-black/10 dark:border-white/10 transition-transform duration-200 hover:scale-[1.02] active:scale-95"
          >
            <img src={p.image_url} alt={p.caption || ''} className="w-full h-full object-cover" />
          </button>
        ))}
      </div>

      {active && (
        <div
          className="fixed inset-0 z-[100] bg-black/90 flex items-center justify-center p-4 animate-[fadeIn_0.2s_ease]"
          onClick={() => setActive(null)}
        >
          <button
            onClick={() => setActive(null)}
            aria-label="Close"
            className="absolute top-5 right-5 w-10 h-10 rounded-full bg-white/10 flex items-center justify-center text-white"
          >
            <X size={18} />
          </button>
          <div className="max-w-3xl w-full" onClick={(e) => e.stopPropagation()}>
            <img src={active.image_url} alt={active.caption || ''} className="w-full rounded-2xl" />
            {active.caption && <p className="text-white text-sm text-center mt-3">{active.caption}</p>}
          </div>
        </div>
      )}
    </div>
  );
}