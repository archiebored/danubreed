import { useEffect, useState } from 'react';
import { X, Play } from 'lucide-react';
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
            className="relative aspect-square rounded-xl overflow-hidden border border-black/10 dark:border-white/10 transition-transform duration-200 hover:scale-[1.02] active:scale-95 group"
          >
            {p.media_type === 'video' ? (
              <>
                <video src={p.image_url} className="w-full h-full object-cover" muted preload="metadata" />
                <div className="absolute inset-0 bg-black/20 flex items-center justify-center">
                  <div className="w-9 h-9 rounded-full bg-black/50 flex items-center justify-center">
                    <Play size={16} className="text-white ml-0.5" fill="white" />
                  </div>
                </div>
              </>
            ) : (
              <img src={p.image_url} alt={p.title || ''} className="w-full h-full object-cover" />
            )}
            {p.title && (
              <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/70 to-transparent px-2.5 py-2 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                <p className="text-white text-xs font-semibold truncate">{p.title}</p>
              </div>
            )}
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
            className="absolute top-5 right-5 w-10 h-10 rounded-full bg-white/10 flex items-center justify-center text-white z-10"
          >
            <X size={18} />
          </button>

          <div
            className="max-w-4xl w-full flex flex-col sm:flex-row gap-6 items-center"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="w-full sm:w-3/5 animate-[popIn_0.35s_ease]">
              {active.media_type === 'video' ? (
                <video src={active.image_url} className="w-full rounded-2xl" controls autoPlay />
              ) : (
                <img src={active.image_url} alt={active.title || ''} className="w-full rounded-2xl" />
              )}
            </div>

            {(active.title || active.description) && (
              <div
                className="w-full sm:w-2/5 animate-[fadeIn_0.4s_ease_both]"
                style={{ animationDelay: '150ms' }}
              >
                {active.title && (
                  <p className="font-display text-2xl sm:text-3xl tracking-wide text-white mb-2">{active.title}</p>
                )}
                {active.description && (
                  <p className="text-sm text-white/70 leading-relaxed">{active.description}</p>
                )}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}