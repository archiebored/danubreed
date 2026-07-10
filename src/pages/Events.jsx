import { useEffect, useState } from 'react';
import { Calendar, MapPin } from 'lucide-react';
import { supabase } from '../lib/supabase';

export default function Events() {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [openEventId, setOpenEventId] = useState(null);
  const [form, setForm] = useState({ full_name: '', phone_number: '' });
  const [status, setStatus] = useState('idle');

  useEffect(() => {
    supabase
      .from('events')
      .select('id, title, description, event_date, location')
      .order('event_date', { ascending: true })
      .then(({ data }) => {
        setEvents(data || []);
        setLoading(false);
      });
  }, []);

  async function handleRegister(e, eventId) {
    e.preventDefault();
    if (!form.full_name.trim()) return;
    setStatus('sending');
    const { error } = await supabase.from('event_registrations').insert({
      event_id: eventId,
      full_name: form.full_name.trim(),
      phone_number: form.phone_number.trim() || null,
    });
    setStatus(error ? 'error' : 'sent');
    if (!error) setForm({ full_name: '', phone_number: '' });
  }

  return (
    <div className="max-w-3xl mx-auto pt-2">
      <p className="text-[11px] font-bold uppercase tracking-[2px] text-accent mb-3">
        What's coming up
      </p>
      <h1 className="font-display text-5xl tracking-wide mb-8">Events</h1>

      {loading && <p className="text-sm text-muted-light dark:text-muted-dark">Loading...</p>}
      {!loading && events.length === 0 && (
        <p className="text-sm text-muted-light dark:text-muted-dark">
          Nothing on the calendar yet — check back soon.
        </p>
      )}

      <div className="flex flex-col gap-3.5">
        {events.map((ev) => (
          <div
            key={ev.id}
            className="relative overflow-hidden rounded-2xl border border-black/10 dark:border-white/10 bg-surface-light dark:bg-surface-dark p-5 transition-all duration-300 hover:-translate-y-1 hover:shadow-lg hover:shadow-accent/10 hover:border-accent/30"
          >
            <span className="absolute left-0 top-0 bottom-0 w-[3px] bg-accent rounded-r" />
            <div className="flex justify-between items-start flex-wrap gap-2 mb-1.5">
              <p className="font-display text-2xl tracking-wide">{ev.title}</p>
              {ev.event_date && (
                <span className="flex items-center gap-1.5 text-xs text-accent font-semibold">
                  <Calendar size={13} />
                  {new Date(ev.event_date).toLocaleDateString()}
                </span>
              )}
            </div>
            {ev.description && (
              <p className="text-sm text-muted-light dark:text-muted-dark mb-1">{ev.description}</p>
            )}
            {ev.location && (
              <p className="flex items-center gap-1.5 text-xs text-muted-light dark:text-muted-dark mb-3">
                <MapPin size={12} />
                {ev.location}
              </p>
            )}

            {openEventId !== ev.id ? (
              <button
                onClick={() => {
                  setOpenEventId(ev.id);
                  setStatus('idle');
                }}
                className="text-xs font-bold text-accent transition-transform duration-200 hover:translate-x-1 inline-block"
              >
                Register →
              </button>
            ) : (
              <form onSubmit={(e) => handleRegister(e, ev.id)} className="mt-2 flex flex-col gap-2 max-w-sm animate-[fadeIn_0.25s_ease]">
                <input
                  type="text"
                  required
                  placeholder="Full name"
                  value={form.full_name}
                  onChange={(e) => setForm((f) => ({ ...f, full_name: e.target.value }))}
                  className="rounded-md bg-base-light dark:bg-base-dark border border-black/10 dark:border-white/10 px-3 py-2 text-sm outline-none transition-colors duration-200 focus:border-accent/50 focus:ring-2 focus:ring-accent/20"
                />
                <input
                  type="tel"
                  placeholder="Phone number (optional)"
                  value={form.phone_number}
                  onChange={(e) => setForm((f) => ({ ...f, phone_number: e.target.value }))}
                  className="rounded-md bg-base-light dark:bg-base-dark border border-black/10 dark:border-white/10 px-3 py-2 text-sm outline-none transition-colors duration-200 focus:border-accent/50 focus:ring-2 focus:ring-accent/20"
                />
                <button
                  type="submit"
                  disabled={status === 'sending'}
                  className="bg-accent text-[#1a0a00] rounded-md py-2 text-sm font-bold disabled:opacity-60 transition-all duration-200 hover:scale-[1.02] active:scale-95"
                >
                  {status === 'sending' ? 'Registering...' : 'Confirm registration'}
                </button>
                {status === 'sent' && (
                  <p className="text-xs text-accent font-medium">You're registered for {ev.title}.</p>
                )}
                {status === 'error' && (
                  <p className="text-xs text-red-500">Something went wrong — try again.</p>
                )}
              </form>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}