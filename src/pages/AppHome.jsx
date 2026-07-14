import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { UserPlus, Phone, Tent, ArrowRight, Image as ImageIcon } from 'lucide-react';
import { supabase } from '../lib/supabase';

function useCountdown(targetDate) {
  const [timeLeft, setTimeLeft] = useState({});
  useEffect(() => {
    function calc() {
      const diff = new Date(targetDate) - new Date();
      if (diff <= 0) return setTimeLeft({ days: 0 });
      setTimeLeft({ days: Math.floor(diff / (1000 * 60 * 60 * 24)) });
    }
    calc();
    const t = setInterval(calc, 1000 * 60);
    return () => clearInterval(t);
  }, [targetDate]);
  return timeLeft;
}

const quickActions = [
  { to: '/signup', label: 'Sign up', icon: UserPlus },
  { to: '/contact', label: 'Coordinators', icon: Phone },
  { to: '/camp', label: "Daniel's Camp", icon: Tent },
  { to: '/gallery', label: 'Gallery', icon: ImageIcon },
];

export default function AppHome() {
  const countdown = useCountdown('2026-08-27T00:00:00');
  const [serviceTimes, setServiceTimes] = useState([]);
  const [nextEvent, setNextEvent] = useState(null);
  const [photos, setPhotos] = useState([]);

  useEffect(() => {
    supabase.from('service_times').select('*').order('sort_order').then(({ data }) => setServiceTimes(data || []));
    supabase
      .from('events')
      .select('id, title, event_date')
      .gte('event_date', new Date().toISOString().slice(0, 10))
      .order('event_date', { ascending: true })
      .limit(1)
      .then(({ data }) => setNextEvent(data?.[0] || null));
    supabase
      .from('gallery_photos')
      .select('id, image_url')
      .order('sort_order', { ascending: false })
      .limit(4)
      .then(({ data }) => setPhotos(data || []));
  }, []);

  const hour = new Date().getHours();
  const greeting = hour < 12 ? 'Good morning' : hour < 18 ? 'Good afternoon' : 'Good evening';

  return (
    <div className="px-4 pt-4 pb-4 max-w-lg mx-auto">
      <p className="text-xs text-muted-light dark:text-muted-dark mb-1">{greeting}</p>
      <h1 className="font-display text-3xl tracking-wide mb-5">Welcome back</h1>

      <Link
        to="/camp"
        className="relative overflow-hidden rounded-2xl p-4 mb-4 flex items-center justify-between bg-cover bg-center transition-transform duration-200 active:scale-[0.98]"
        style={{ backgroundImage: "linear-gradient(120deg, rgba(10,5,0,0.6), rgba(10,5,0,0.85)), url('/mount-up-banner.jpg')" }}
      >
        <div>
          <p className="text-[10px] font-bold uppercase tracking-wide text-accent mb-1">Daniel's Camp · Mount Up</p>
          <p className="font-display text-2xl text-white tracking-wide">{countdown.days ?? '—'} days to go</p>
        </div>
        <div className="w-9 h-9 rounded-full bg-accent/20 flex items-center justify-center flex-shrink-0">
          <Tent size={16} className="text-accent" />
        </div>
      </Link>

      {nextEvent && (
        <Link to="/events" className="rounded-2xl border border-black/10 dark:border-white/10 bg-surface-light dark:bg-surface-dark p-4 mb-4 flex items-center justify-between transition-all duration-200 active:scale-[0.98]">
          <div>
            <p className="text-[10px] font-bold uppercase tracking-wide text-accent mb-1">Next event</p>
            <p className="text-sm font-semibold">{nextEvent.title}</p>
            <p className="text-xs text-muted-light dark:text-muted-dark">{new Date(nextEvent.event_date).toLocaleDateString()}</p>
          </div>
          <ArrowRight size={16} className="text-muted-light dark:text-muted-dark flex-shrink-0" />
        </Link>
      )}

      <div className="rounded-2xl border border-black/10 dark:border-white/10 bg-surface-light dark:bg-surface-dark p-4 mb-4">
        <p className="text-[10px] font-bold uppercase tracking-wide text-accent mb-2">This sunday</p>
        {serviceTimes.map((s) => (
          <div key={s.id} className="flex justify-between py-1 text-sm">
            <span>{s.label}</span>
            <span className="text-accent font-semibold">{s.time_text}</span>
          </div>
        ))}
      </div>

      {photos.length > 0 && (
        <Link to="/gallery" className="block mb-4">
          <div className="flex items-center justify-between mb-2">
            <p className="text-[10px] font-bold uppercase tracking-wide text-accent">Gallery</p>
            <ArrowRight size={13} className="text-muted-light dark:text-muted-dark" />
          </div>
          <div className="grid grid-cols-4 gap-1.5">
            {photos.map((p) => (
              <div key={p.id} className="aspect-square rounded-lg overflow-hidden">
                <img src={p.image_url} alt="" className="w-full h-full object-cover" />
              </div>
            ))}
          </div>
        </Link>
      )}

      <div className="grid grid-cols-2 gap-2.5">
        {quickActions.map(({ to, label, icon: Icon }) => (
          <Link key={to} to={to} className="rounded-2xl border border-black/10 dark:border-white/10 bg-surface-light dark:bg-surface-dark p-4 text-center transition-transform duration-200 active:scale-95">
            <Icon size={20} className="text-accent mx-auto mb-1.5" />
            <p className="text-xs font-semibold">{label}</p>
          </Link>
        ))}
      </div>
    </div>
  );
}