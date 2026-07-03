import { Heart } from 'lucide-react';

export default function Give() {
  return (
    <div className="max-w-3xl mx-auto pt-2">
      <p className="text-[11px] font-bold uppercase tracking-[2px] text-accent mb-3">
        Tithes &amp; offerings
      </p>
      <h1 className="font-display text-5xl tracking-wide mb-8">Give</h1>

      <div className="relative overflow-hidden rounded-2xl border border-black/10 dark:border-white/10 bg-surface-light dark:bg-surface-dark p-7 max-w-lg">
        <Heart size={28} className="text-accent mb-4" />
        <p className="text-sm leading-relaxed mb-2">
          Online giving isn't switched on yet — this screen is reserved for tithes, offerings,
          and event fees once payment is connected.
        </p>
        <p className="text-xs text-muted-light dark:text-muted-dark">
          For now, see a coordinator to give in person.
        </p>
      </div>
    </div>
  );
}