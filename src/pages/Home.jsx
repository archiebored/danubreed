import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Heart, Calendar, Mail, Phone } from 'lucide-react';
import { supabase } from '../lib/supabase';

const quickActions = [
  { to: '/give', label: 'Give', icon: Heart },
  { to: '/events', label: 'Events', icon: Calendar },
  { to: '/confess', label: 'Confess / suggest', icon: Mail },
  { to: '/contact', label: 'Coordinators', icon: Phone },
];

export default function Home() {
  const [serviceTimes, setServiceTimes] = useState([]);
  const [featured, setFeatured] = useState(null);

  useEffect(() => {
    supabase
      .from('service_times')
      .select('*')
      .order('sort_order')
      .then(({ data }) => setServiceTimes(data || []));

    supabase
      .from('coordinators')
      .select('*')
      .order('sort_order')
      .limit(1)
      .then(({ data }) => setFeatured(data?.[0] || null));
  }, []);

  return (
    <div>
      {/* ── HERO ── */}
      <section
        className="relative -mx-4 sm:-mx-8 -mt-[104px] pt-[104px] min-h-[70vh] flex items-center overflow-hidden px-4 sm:px-8 pb-10 text-ink-light dark:text-white bg-[linear-gradient(135deg,#FFF8F2_0%,#FFCB94_55%,#FF9A4D_100%)] dark:bg-[linear-gradient(135deg,#0A0A0A_0%,#1a0800_60%,#2d0d00_100%)]"
      >
        <div
          className="absolute inset-0 opacity-40 dark:opacity-0"
          style={{
            backgroundImage:
              'linear-gradient(rgba(154,52,0,0.18) 1px, transparent 1px), linear-gradient(90deg, rgba(154,52,0,0.18) 1px, transparent 1px)',
            backgroundSize: '48px 48px',
          }}
        />
        <div
          className="absolute inset-0 opacity-0 dark:opacity-50"
          style={{
            backgroundImage:
              'linear-gradient(rgba(249,115,22,0.12) 1px, transparent 1px), linear-gradient(90deg, rgba(249,115,22,0.12) 1px, transparent 1px)',
            backgroundSize: '48px 48px',
          }}
        />
        <div
          className="absolute -top-24 -right-24 w-[420px] h-[420px] rounded-full opacity-90 dark:opacity-100"
          style={{ background: 'radial-gradient(circle, rgba(255,140,40,0.4) 0%, transparent 70%)' }}
        />

        <div className="relative max-w-3xl mx-auto w-full">
          <p className="flex items-center gap-2 text-[11px] font-bold uppercase tracking-[2px] text-accent mb-4">
            <span className="w-5 h-px bg-accent" />
            Calvary Bible Church — teen expression
          </p>
          <h1 className="font-display leading-[0.92] tracking-wide text-[clamp(48px,12vw,110px)] mb-5">
            DA NU <span className="text-accent">BREED</span>
          </h1>
          <p className="text-sm sm:text-base text-ink-light/70 dark:text-white/70 max-w-md leading-relaxed mb-7">
            Bible study, worship, real talk, and a place to belong — built for teens 13 to 19 at
            Calvary Bible Church.
          </p>
          <div className="flex flex-wrap gap-3">
            <Link to="/signup" className="px-6 py-3 rounded-full bg-accent text-[#1a0a00] text-sm font-bold">
              Join us
            </Link>
            <Link
              to="/events"
              className="px-6 py-3 rounded-full border border-black/20 dark:border-white/20 text-sm font-bold"
            >
              See events
            </Link>
          </div>
        </div>
      </section>

      {/* ── WELCOME ── */}
      <section className="-mx-4 sm:-mx-8 px-4 sm:px-8 py-14 bg-surface-light dark:bg-surface-dark">
        <div className="max-w-3xl mx-auto grid sm:grid-cols-2 gap-10 items-center">
          <div>
            <p className="text-[11px] font-bold uppercase tracking-[2px] text-accent mb-3">
              A word from us
            </p>
            <p className="text-lg italic leading-relaxed">
              "Da Nu Breed exists so no teenager in this church walks through these years alone.
              Whoever you are, however you found us — you're welcome here."
            </p>
            <p className="text-sm font-bold mt-4">{featured?.full_name || 'Your coordinators'}</p>
            <p className="text-xs text-accent font-semibold">{featured?.role_label || ''}</p>
          </div>
          <div className="aspect-[4/5] max-w-[260px] mx-auto w-full rounded-2xl bg-base-light dark:bg-base-dark border border-black/10 dark:border-white/10 flex items-center justify-center text-4xl">
            🙂
          </div>
        </div>
      </section>

      {/* ── SERVICE TIMES ── */}
      <section className="max-w-3xl mx-auto py-14">
        <p className="text-[11px] font-bold uppercase tracking-[2px] text-accent mb-3">
          This sunday
        </p>
        <div className="flex items-end justify-between flex-wrap gap-2 mb-7">
          <h2 className="font-display text-4xl tracking-wide">Service times</h2>
          <p className="text-xs italic text-muted-light dark:text-muted-dark">
            Times subject to change
          </p>
        </div>
        <div className="grid sm:grid-cols-2 gap-3.5">
          {serviceTimes.map((s) => (
            <div
              key={s.id}
              className="relative overflow-hidden rounded-2xl border border-black/10 dark:border-white/10 bg-surface-light dark:bg-surface-dark p-6 transition-transform hover:-translate-y-1"
            >
              <span className="absolute left-0 top-0 bottom-0 w-[3px] bg-accent rounded-r" />
              <p className="text-base font-semibold mb-1">{s.label}</p>
              <p className="text-2xl font-display tracking-wide text-accent">{s.time_text}</p>
            </div>
          ))}
          {serviceTimes.length === 0 && (
            <p className="text-sm text-muted-light dark:text-muted-dark">
              No service times set yet.
            </p>
          )}
        </div>
      </section>

      {/* ── EXPLORE ── */}
      <section className="max-w-3xl mx-auto pb-16">
        <p className="text-[11px] font-bold uppercase tracking-[2px] text-accent mb-3">
          Get involved
        </p>
        <h2 className="font-display text-4xl tracking-wide mb-7">Explore</h2>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {quickActions.map(({ to, label, icon: Icon }) => (
            <Link
              key={to}
              to={to}
              className="relative overflow-hidden rounded-2xl border border-black/10 dark:border-white/10 bg-surface-light dark:bg-surface-dark p-5 text-center transition-transform hover:-translate-y-1"
            >
              <Icon size={22} className="text-accent mx-auto" />
              <p className="text-xs font-semibold mt-2">{label}</p>
            </Link>
          ))}
        </div>
      </section>
    </div>
  );
}