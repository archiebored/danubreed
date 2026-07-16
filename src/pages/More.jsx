import { Link } from 'react-router-dom';
import { Lock } from 'lucide-react';

export default function More() {
  return (
    <div className="max-w-lg mx-auto pt-2">
      <p className="text-[11px] font-bold uppercase tracking-[2px] text-accent mb-3">Team access</p>
      <h1 className="font-display text-5xl tracking-wide mb-8">More</h1>

      <Link
        to="/staff/login"
        className="flex items-center gap-3 rounded-2xl border border-black/10 dark:border-white/10 bg-surface-light dark:bg-surface-dark px-4 py-3.5 transition-all duration-200 hover:-translate-y-0.5 hover:border-accent/30 active:scale-95"
      >
        <Lock size={18} className="text-accent" />
        <span className="text-sm font-semibold">Staff login</span>
      </Link>
    </div>
  );
}