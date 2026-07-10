import { useEffect, useState } from 'react';
import { Phone, MessageCircle } from 'lucide-react';
import { supabase } from '../lib/supabase';

export default function Contact() {
  const [coordinators, setCoordinators] = useState([]);

  useEffect(() => {
    supabase
      .from('coordinators')
      .select('*')
      .order('sort_order')
      .then(({ data }) => setCoordinators(data || []));
  }, []);

  return (
    <div className="max-w-lg mx-auto pt-2">
      <p className="text-[11px] font-bold uppercase tracking-[2px] text-accent mb-3">Reach out</p>
      <h1 className="font-display text-5xl tracking-wide mb-7">Coordinators</h1>

      {coordinators.length === 0 && (
        <div className="rounded-2xl border border-black/10 dark:border-white/10 bg-surface-light dark:bg-surface-dark p-5">
          <p className="text-sm">Coordinator contact details haven't been added yet.</p>
        </div>
      )}

      <div className="flex flex-col gap-2.5">
        {coordinators.map((c) => (
          <div
            key={c.id}
            className="relative overflow-hidden rounded-2xl border border-black/10 dark:border-white/10 bg-surface-light dark:bg-surface-dark p-4 flex items-center justify-between transition-all duration-300 hover:-translate-y-1 hover:shadow-lg hover:shadow-accent/10 hover:border-accent/30"
          >
            <span className="absolute left-0 top-0 bottom-0 w-[3px] bg-accent rounded-r" />
            <div className="flex items-center gap-3">
              {c.photo_url && (
                <img src={c.photo_url} alt={c.full_name} className="w-10 h-10 rounded-full object-cover" />
              )}
              <div>
                <p className="text-sm font-semibold">{c.full_name}</p>
                {c.role_label && <p className="text-xs text-accent font-medium">{c.role_label}</p>}
              </div>
            </div>
            <div className="flex gap-2">
              {c.phone && (
                <a
                  href={`tel:${c.phone}`}
                  aria-label={`Call ${c.full_name}`}
                  className="w-9 h-9 rounded-full bg-base-light dark:bg-base-dark border border-black/10 dark:border-white/10 flex items-center justify-center text-accent transition-all duration-200 hover:scale-110 hover:border-accent/40 active:scale-90"
                >
                  <Phone size={15} />
                </a>
              )}
              {c.whatsapp_link && (
                <a
                  href={c.whatsapp_link}
                  target="_blank"
                  rel="noreferrer"
                  aria-label={`WhatsApp ${c.full_name}`}
                  className="w-9 h-9 rounded-full bg-base-light dark:bg-base-dark border border-black/10 dark:border-white/10 flex items-center justify-center text-accent transition-all duration-200 hover:scale-110 hover:border-accent/40 active:scale-90"
                >
                  <MessageCircle size={15} />
                </a>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}