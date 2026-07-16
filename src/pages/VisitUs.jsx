import { useEffect, useState } from 'react';
import { MapPin, Tent, Phone, Mail, Instagram } from 'lucide-react';
import { supabase } from '../lib/supabase';

export default function VisitUs() {
  const [info, setInfo] = useState(null);

  useEffect(() => {
    supabase.from('church_info').select('*').limit(1).single().then(({ data }) => setInfo(data));
  }, []);

  const mapsHref = info?.address
    ? `https://maps.google.com/?q=${encodeURIComponent(`${info.address} ${info.city || ''}`)}`
    : null;

  return (
    <div className="max-w-2xl mx-auto pt-2">
      <p className="text-[11px] font-bold uppercase tracking-[2px] text-accent mb-3">Come see us</p>
      <h1 className="font-display text-5xl tracking-wide mb-8">Visit Us</h1>

      <div className="flex flex-col gap-3">
        <div className="relative overflow-hidden rounded-2xl border border-black/10 dark:border-white/10 bg-surface-light dark:bg-surface-dark p-5">
          <span className="absolute left-0 top-0 bottom-0 w-[3px] bg-accent rounded-r" />
          <div className="flex items-start gap-3">
            <MapPin size={18} className="text-accent flex-shrink-0 mt-0.5" />
            <div>
              <p className="text-sm font-semibold mb-1">{info?.church_name || 'Da Nu Breed'}</p>
              {info?.address ? (
                <>
                  <p className="text-sm text-muted-light dark:text-muted-dark">{info.address}</p>
                  {info.city && <p className="text-sm text-muted-light dark:text-muted-dark">{info.city}</p>}
                  {mapsHref && (
                    <a href={mapsHref} target="_blank" rel="noreferrer" className="text-xs text-accent font-semibold mt-1.5 inline-block">
                      Get directions →
                    </a>
                  )}
                </>
              ) : (
                <p className="text-sm text-muted-light dark:text-muted-dark">Address coming soon.</p>
              )}
            </div>
          </div>
        </div>

        {info?.camp_location && (
          <div className="relative overflow-hidden rounded-2xl border border-black/10 dark:border-white/10 bg-surface-light dark:bg-surface-dark p-5">
            <span className="absolute left-0 top-0 bottom-0 w-[3px] bg-accent rounded-r" />
            <div className="flex items-start gap-3">
              <Tent size={18} className="text-accent flex-shrink-0 mt-0.5" />
              <div>
                <p className="text-sm font-semibold mb-1">Daniel's Camp location</p>
                <p className="text-sm text-muted-light dark:text-muted-dark">{info.camp_location}</p>
              </div>
            </div>
          </div>
        )}

        {(info?.phone || info?.email) && (
          <div className="rounded-2xl border border-black/10 dark:border-white/10 bg-surface-light dark:bg-surface-dark p-5 flex flex-col gap-3">
            {info.phone && (
              <a href={`tel:${info.phone}`} className="flex items-center gap-3 text-sm">
                <Phone size={16} className="text-accent" />
                {info.phone}
              </a>
            )}
            {info.email && (
              <a href={`mailto:${info.email}`} className="flex items-center gap-3 text-sm">
                <Mail size={16} className="text-accent" />
                {info.email}
              </a>
            )}
          </div>
        )}

        {(info?.instagram_url || info?.tiktok_url) && (
          <div className="flex gap-2">
            {info.instagram_url && (
              <a href={info.instagram_url} target="_blank" rel="noreferrer" className="flex-1 flex items-center justify-center gap-2 rounded-xl border border-black/10 dark:border-white/10 bg-surface-light dark:bg-surface-dark py-3 text-sm font-semibold transition-transform duration-200 hover:scale-[1.02] active:scale-95">
                <Instagram size={16} className="text-accent" />
                Instagram
              </a>
            )}
            {info.tiktok_url && (
              <a href={info.tiktok_url} target="_blank" rel="noreferrer" className="flex-1 flex items-center justify-center gap-2 rounded-xl border border-black/10 dark:border-white/10 bg-surface-light dark:bg-surface-dark py-3 text-sm font-semibold transition-transform duration-200 hover:scale-[1.02] active:scale-95">
                TikTok
              </a>
            )}
          </div>
        )}
      </div>
    </div>
  );
}