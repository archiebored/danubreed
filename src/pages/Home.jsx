// import { useEffect, useState, useCallback } from 'react';
// import { Link } from 'react-router-dom';
// import { Heart, Calendar, Mail, Phone, ChevronLeft, ChevronRight } from 'lucide-react';
// import { supabase } from '../lib/supabase';

// const quickActions = [
//   { to: '/give', label: 'Give', icon: Heart },
//   { to: '/events', label: 'Events', icon: Calendar },
//   { to: '/confess', label: 'Confess / suggest', icon: Mail },
//   { to: '/contact', label: 'Coordinators', icon: Phone },
// ];

// function useCountdown(targetDate) {
//   const [timeLeft, setTimeLeft] = useState({});
//   useEffect(() => {
//     function calc() {
//       const diff = new Date(targetDate) - new Date();
//       if (diff <= 0) return setTimeLeft({ days: 0, hours: 0, minutes: 0, seconds: 0 });
//       setTimeLeft({
//         days: Math.floor(diff / (1000 * 60 * 60 * 24)),
//         hours: Math.floor((diff / (1000 * 60 * 60)) % 24),
//         minutes: Math.floor((diff / (1000 * 60)) % 60),
//         seconds: Math.floor((diff / 1000) % 60),
//       });
//     }
//     calc();
//     const t = setInterval(calc, 1000);
//     return () => clearInterval(t);
//   }, [targetDate]);
//   return timeLeft;
// }

// function HeroMain() {
//   return (
//     <div className="relative max-w-3xl mx-auto w-full">
//       <p className="flex items-center gap-2 text-[11px] font-bold uppercase tracking-[2px] text-accent mb-4">
//         <span className="w-5 h-px bg-accent" />
//         Calvary Bible Church — teen expression
//       </p>
//       <h1 className="font-display leading-[0.92] tracking-wide text-[clamp(48px,12vw,110px)] mb-5">
//         DA NU <span className="text-accent">BREED</span>
//       </h1>
//       <p className="text-sm sm:text-base text-ink-light/70 dark:text-white/70 max-w-md leading-relaxed mb-7">
//         Bible study, worship, real talk, and a place to belong — built for teens 13 to 19 at
//         Calvary Bible Church.
//       </p>
//       <div className="flex flex-wrap gap-3">
//         <Link to="/signup" className="px-6 py-3 rounded-full bg-accent text-[#1a0a00] text-sm font-bold">
//           Join us
//         </Link>
//         <Link to="/events" className="px-6 py-3 rounded-full border border-black/20 dark:border-white/20 text-sm font-bold">
//           See events
//         </Link>
//       </div>
//     </div>
//   );
// }

// function HeroCamp() {
//   const countdown = useCountdown('2026-08-27T00:00:00');
//   return (
//     <div className="relative max-w-3xl mx-auto w-full">
//       <p className="flex items-center gap-2 text-[11px] font-bold uppercase tracking-[2px] text-accent mb-4">
//         <span className="w-5 h-px bg-accent" />
//         Annual camp · August 27–30, 2026
//       </p>
//       <h1 className="font-display leading-[0.92] tracking-wide text-[clamp(40px,10vw,90px)] mb-2">
//         DANIEL'S <span className="text-accent">CAMP</span>
//       </h1>
//       <p className="font-display text-[clamp(20px,5vw,40px)] tracking-wide text-ink-light/80 dark:text-white/80 mb-2">
//         MOUNT UP
//       </p>
//       <p className="text-xs sm:text-sm italic text-ink-light/60 dark:text-white/60 max-w-md mb-6">
//         "They shall mount up with wings as eagles; they shall run, and not be weary; and they shall walk, and not faint." — Isaiah 40:31
//       </p>
//       <div className="flex gap-4 mb-7">
//         {['days', 'hours', 'minutes', 'seconds'].map((unit) => (
//           <div key={unit} className="text-center">
//             <div className="font-display text-2xl sm:text-4xl tracking-wide text-accent leading-none">
//               {String(countdown[unit] ?? 0).padStart(2, '0')}
//             </div>
//             <div className="text-[10px] uppercase tracking-wider text-ink-light/50 dark:text-white/50 mt-1">
//               {unit}
//             </div>
//           </div>
//         ))}
//       </div>
//       <div className="flex flex-wrap gap-3">
//         <Link to="/camp" className="px-6 py-3 rounded-full bg-accent text-[#1a0a00] text-sm font-bold">
//           Register now
//         </Link>
//         <Link to="/events" className="px-6 py-3 rounded-full border border-black/20 dark:border-white/20 text-sm font-bold">
//           Learn more
//         </Link>
//       </div>
//     </div>
//   );
// }

// const slides = [
//   { id: 'main', component: HeroMain },
//   { id: 'camp', component: HeroCamp },
// ];

// export default function Home() {
//   const [serviceTimes, setServiceTimes] = useState([]);
//   const [featured, setFeatured] = useState(null);
//   const [current, setCurrent] = useState(0);

//   const next = useCallback(() => setCurrent((c) => (c + 1) % slides.length), []);
//   const prev = () => setCurrent((c) => (c - 1 + slides.length) % slides.length);

//   useEffect(() => {
//     const t = setInterval(next, 6000);
//     return () => clearInterval(t);
//   }, [next]);

//   useEffect(() => {
//     supabase.from('service_times').select('*').order('sort_order').then(({ data }) => setServiceTimes(data || []));
//     supabase.from('coordinators').select('*').order('sort_order').limit(1).then(({ data }) => setFeatured(data?.[0] || null));
//   }, []);

//   const Slide = slides[current].component;

//   return (
//     <div>
//       {/* ── HERO CAROUSEL ── */}
//       <section className="relative -mx-4 sm:-mx-8 -mt-[104px] pt-[104px] min-h-[70vh] flex items-center overflow-hidden px-4 sm:px-8 pb-16 text-ink-light dark:text-white bg-[linear-gradient(135deg,#FFF8F2_0%,#FFCB94_55%,#FF9A4D_100%)] dark:bg-[linear-gradient(135deg,#0A0A0A_0%,#1a0800_60%,#2d0d00_100%)]">
//         <div className="absolute inset-0 opacity-40 dark:opacity-0" style={{ backgroundImage: 'linear-gradient(rgba(154,52,0,0.18) 1px, transparent 1px), linear-gradient(90deg, rgba(154,52,0,0.18) 1px, transparent 1px)', backgroundSize: '48px 48px' }} />
//         <div className="absolute inset-0 opacity-0 dark:opacity-50" style={{ backgroundImage: 'linear-gradient(rgba(249,115,22,0.12) 1px, transparent 1px), linear-gradient(90deg, rgba(249,115,22,0.12) 1px, transparent 1px)', backgroundSize: '48px 48px' }} />
//         <div className="absolute -top-24 -right-24 w-[420px] h-[420px] rounded-full opacity-90 dark:opacity-100" style={{ background: 'radial-gradient(circle, rgba(255,140,40,0.4) 0%, transparent 70%)' }} />

//         <div className="relative w-full">
//           <Slide />
//         </div>

//         <button onClick={prev} aria-label="Previous slide" className="absolute left-3 bottom-5 w-8 h-8 rounded-full bg-black/20 dark:bg-white/10 flex items-center justify-center backdrop-blur-sm">
//           <ChevronLeft size={16} />
//         </button>
//         <div className="absolute bottom-5 left-1/2 -translate-x-1/2 flex gap-1.5">
//           {slides.map((_, i) => (
//             <button key={i} onClick={() => setCurrent(i)} aria-label={`Go to slide ${i + 1}`} className={`h-1.5 rounded-full transition-all ${i === current ? 'w-6 bg-accent' : 'w-1.5 bg-black/30 dark:bg-white/30'}`} />
//           ))}
//         </div>
//         <button onClick={next} aria-label="Next slide" className="absolute right-3 bottom-5 w-8 h-8 rounded-full bg-black/20 dark:bg-white/10 flex items-center justify-center backdrop-blur-sm">
//           <ChevronRight size={16} />
//         </button>
//       </section>

//       {/* ── WELCOME ── */}
//       <section className="-mx-4 sm:-mx-8 px-4 sm:px-8 py-14 bg-surface-light dark:bg-surface-dark">
//         <div className="max-w-3xl mx-auto grid sm:grid-cols-2 gap-10 items-center">
//           <div>
//             <p className="text-[11px] font-bold uppercase tracking-[2px] text-accent mb-3">A word from us</p>
//             <p className="text-lg italic leading-relaxed">
//               "Da Nu Breed exists so no teenager in this church walks through these years alone.
//               Whoever you are, however you found us — you're welcome here."
//             </p>
//             <p className="text-sm font-bold mt-4">{featured?.full_name || 'Your coordinators'}</p>
//             <p className="text-xs text-accent font-semibold">{featured?.role_label || ''}</p>
//           </div>
//           <div className="aspect-[4/5] max-w-[260px] mx-auto w-full rounded-2xl bg-base-light dark:bg-base-dark border border-black/10 dark:border-white/10 flex items-center justify-center text-4xl">
//             🙂
//           </div>
//         </div>
//       </section>

//       {/* ── SERVICE TIMES ── */}
//       <section className="max-w-3xl mx-auto py-14">
//         <p className="text-[11px] font-bold uppercase tracking-[2px] text-accent mb-3">This sunday</p>
//         <div className="flex items-end justify-between flex-wrap gap-2 mb-7">
//           <h2 className="font-display text-4xl tracking-wide">Service times</h2>
//           <p className="text-xs italic text-muted-light dark:text-muted-dark">Times subject to change</p>
//         </div>
//         <div className="grid sm:grid-cols-2 gap-3.5">
//           {serviceTimes.map((s) => (
//             <div key={s.id} className="relative overflow-hidden rounded-2xl border border-black/10 dark:border-white/10 bg-surface-light dark:bg-surface-dark p-6 transition-transform hover:-translate-y-1">
//               <span className="absolute left-0 top-0 bottom-0 w-[3px] bg-accent rounded-r" />
//               <p className="text-base font-semibold mb-1">{s.label}</p>
//               <p className="text-2xl font-display tracking-wide text-accent">{s.time_text}</p>
//             </div>
//           ))}
//         </div>
//       </section>

//       {/* ── EXPLORE ── */}
//       <section className="max-w-3xl mx-auto pb-16">
//         <p className="text-[11px] font-bold uppercase tracking-[2px] text-accent mb-3">Get involved</p>
//         <h2 className="font-display text-4xl tracking-wide mb-7">Explore</h2>
//         <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
//           {quickActions.map(({ to, label, icon: Icon }) => (
//             <Link key={to} to={to} className="relative overflow-hidden rounded-2xl border border-black/10 dark:border-white/10 bg-surface-light dark:bg-surface-dark p-5 text-center transition-transform hover:-translate-y-1">
//               <Icon size={22} className="text-accent mx-auto" />
//               <p className="text-xs font-semibold mt-2">{label}</p>
//             </Link>
//           ))}
//         </div>
//       </section>
//     </div>
//   );
// }

import { useEffect, useState, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { Heart, Calendar, Mail, Phone, ChevronLeft, ChevronRight } from 'lucide-react';
import { supabase } from '../lib/supabase';

const quickActions = [
  { to: '/give', label: 'Give', icon: Heart },
  { to: '/events', label: 'Events', icon: Calendar },
  { to: '/confess', label: 'Confess / suggest', icon: Mail },
  { to: '/contact', label: 'Coordinators', icon: Phone },
];

function useCountdown(targetDate) {
  const [timeLeft, setTimeLeft] = useState({});
  useEffect(() => {
    function calc() {
      const diff = new Date(targetDate) - new Date();
      if (diff <= 0) return setTimeLeft({ days: 0, hours: 0, minutes: 0, seconds: 0 });
      setTimeLeft({
        days: Math.floor(diff / (1000 * 60 * 60 * 24)),
        hours: Math.floor((diff / (1000 * 60 * 60)) % 24),
        minutes: Math.floor((diff / (1000 * 60)) % 60),
        seconds: Math.floor((diff / 1000) % 60),
      });
    }
    calc();
    const t = setInterval(calc, 1000);
    return () => clearInterval(t);
  }, [targetDate]);
  return timeLeft;
}

function HeroMain() {
  return (
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
        <Link to="/events" className="px-6 py-3 rounded-full border border-black/20 dark:border-white/20 text-sm font-bold">
          See events
        </Link>
      </div>
    </div>
  );
}

function HeroCamp() {
  const countdown = useCountdown('2026-08-27T00:00:00');
  return (
    <div className="relative max-w-3xl mx-auto w-full text-white">
      <p className="flex items-center gap-2 text-[11px] font-bold uppercase tracking-[2px] text-accent mb-4">
        <span className="w-5 h-px bg-accent" />
        Annual camp · August 27–30, 2026
      </p>
      <h1 className="font-display leading-[0.92] tracking-wide text-[clamp(40px,10vw,90px)] mb-2">
        DANIEL'S <span className="text-accent">CAMP</span>
      </h1>
      <p className="font-display text-[clamp(20px,5vw,40px)] tracking-wide text-white/80 mb-2">
        MOUNT UP
      </p>
      <p className="text-xs sm:text-sm italic text-white/60 max-w-md mb-6">
        "They shall mount up with wings as eagles; they shall run, and not be weary; and they shall walk, and not faint." — Isaiah 40:31
      </p>
      <div className="flex gap-4 mb-7">
        {['days', 'hours', 'minutes', 'seconds'].map((unit) => (
          <div key={unit} className="text-center">
            <div className="font-display text-2xl sm:text-4xl tracking-wide text-accent leading-none">
              {String(countdown[unit] ?? 0).padStart(2, '0')}
            </div>
            <div className="text-[10px] uppercase tracking-wider text-white/50 mt-1">
              {unit}
            </div>
          </div>
        ))}
      </div>
      <div className="flex flex-wrap gap-3">
        <Link to="/camp" className="px-6 py-3 rounded-full bg-accent text-[#1a0a00] text-sm font-bold">
          Register now
        </Link>
        <Link to="/events" className="px-6 py-3 rounded-full border border-white/30 text-sm font-bold">
          Learn more
        </Link>
      </div>
    </div>
  );
}

const slides = [
  {
    id: 'main',
    component: HeroMain,
    bg: 'bg-[linear-gradient(135deg,#FFF8F2_0%,#FFCB94_55%,#FF9A4D_100%)] dark:bg-[linear-gradient(135deg,#0A0A0A_0%,#1a0800_60%,#2d0d00_100%)]',
  },
  {
    id: 'camp',
    component: HeroCamp,
    bg: null,
  },
];

export default function Home() {
  const [serviceTimes, setServiceTimes] = useState([]);
  const [featured, setFeatured] = useState(null);
  const [current, setCurrent] = useState(0);

  const next = useCallback(() => setCurrent((c) => (c + 1) % slides.length), []);
  const prev = () => setCurrent((c) => (c - 1 + slides.length) % slides.length);

  useEffect(() => {
    const t = setInterval(next, 6000);
    return () => clearInterval(t);
  }, [next]);

  useEffect(() => {
    supabase.from('service_times').select('*').order('sort_order').then(({ data }) => setServiceTimes(data || []));
    supabase.from('coordinators').select('*').order('sort_order').limit(1).then(({ data }) => setFeatured(data?.[0] || null));
  }, []);

  const activeSlide = slides[current];
  const Slide = activeSlide.component;
  const isCampSlide = activeSlide.id === 'camp';

  return (
    <div>
      <section
        className={`relative -mx-4 sm:-mx-8 -mt-[104px] pt-[104px] min-h-[70vh] flex items-center overflow-hidden px-4 sm:px-8 pb-16 text-ink-light dark:text-white ${activeSlide.bg || ''}`}
        style={
          isCampSlide
            ? {
                backgroundImage: "linear-gradient(135deg, rgba(10,5,0,0.55), rgba(10,5,0,0.88)), url('/mount-up-banner.jpg')",
                backgroundSize: 'cover',
                backgroundPosition: 'center',
              }
            : undefined
        }
      >
        {!isCampSlide && (
          <>
            <div className="absolute inset-0 opacity-40 dark:opacity-0" style={{ backgroundImage: 'linear-gradient(rgba(154,52,0,0.18) 1px, transparent 1px), linear-gradient(90deg, rgba(154,52,0,0.18) 1px, transparent 1px)', backgroundSize: '48px 48px' }} />
            <div className="absolute inset-0 opacity-0 dark:opacity-50" style={{ backgroundImage: 'linear-gradient(rgba(249,115,22,0.12) 1px, transparent 1px), linear-gradient(90deg, rgba(249,115,22,0.12) 1px, transparent 1px)', backgroundSize: '48px 48px' }} />
            <div className="absolute -top-24 -right-24 w-[420px] h-[420px] rounded-full opacity-90 dark:opacity-100" style={{ background: 'radial-gradient(circle, rgba(255,140,40,0.4) 0%, transparent 70%)' }} />
          </>
        )}

        <div className="relative w-full">
          <Slide />
        </div>

        <button onClick={prev} aria-label="Previous slide" className="absolute left-3 bottom-5 w-8 h-8 rounded-full bg-black/20 dark:bg-white/10 flex items-center justify-center backdrop-blur-sm text-white">
          <ChevronLeft size={16} />
        </button>
        <div className="absolute bottom-5 left-1/2 -translate-x-1/2 flex gap-1.5">
          {slides.map((_, i) => (
            <button key={i} onClick={() => setCurrent(i)} aria-label={`Go to slide ${i + 1}`} className={`h-1.5 rounded-full transition-all ${i === current ? 'w-6 bg-accent' : 'w-1.5 bg-white/30'}`} />
          ))}
        </div>
        <button onClick={next} aria-label="Next slide" className="absolute right-3 bottom-5 w-8 h-8 rounded-full bg-black/20 dark:bg-white/10 flex items-center justify-center backdrop-blur-sm text-white">
          <ChevronRight size={16} />
        </button>
      </section>

      <section className="-mx-4 sm:-mx-8 px-4 sm:px-8 py-14 bg-surface-light dark:bg-surface-dark">
        <div className="max-w-3xl mx-auto grid sm:grid-cols-2 gap-10 items-center">
          <div>
            <p className="text-[11px] font-bold uppercase tracking-[2px] text-accent mb-3">A word from us</p>
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

      <section className="max-w-3xl mx-auto py-14">
        <p className="text-[11px] font-bold uppercase tracking-[2px] text-accent mb-3">This sunday</p>
        <div className="flex items-end justify-between flex-wrap gap-2 mb-7">
          <h2 className="font-display text-4xl tracking-wide">Service times</h2>
          <p className="text-xs italic text-muted-light dark:text-muted-dark">Times subject to change</p>
        </div>
        <div className="grid sm:grid-cols-2 gap-3.5">
          {serviceTimes.map((s) => (
            <div key={s.id} className="relative overflow-hidden rounded-2xl border border-black/10 dark:border-white/10 bg-surface-light dark:bg-surface-dark p-6 transition-transform hover:-translate-y-1">
              <span className="absolute left-0 top-0 bottom-0 w-[3px] bg-accent rounded-r" />
              <p className="text-base font-semibold mb-1">{s.label}</p>
              <p className="text-2xl font-display tracking-wide text-accent">{s.time_text}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="max-w-3xl mx-auto pb-16">
        <p className="text-[11px] font-bold uppercase tracking-[2px] text-accent mb-3">Get involved</p>
        <h2 className="font-display text-4xl tracking-wide mb-7">Explore</h2>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {quickActions.map(({ to, label, icon: Icon }) => (
            <Link key={to} to={to} className="relative overflow-hidden rounded-2xl border border-black/10 dark:border-white/10 bg-surface-light dark:bg-surface-dark p-5 text-center transition-transform hover:-translate-y-1">
              <Icon size={22} className="text-accent mx-auto" />
              <p className="text-xs font-semibold mt-2">{label}</p>
            </Link>
          ))}
        </div>
      </section>
    </div>
  );
}