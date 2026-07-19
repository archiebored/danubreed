import { useState } from 'react';
import { Send, Bell } from 'lucide-react';
import { supabase } from '../lib/supabase';

export default function StaffNotifications() {
  const [title, setTitle] = useState('');
  const [body, setBody] = useState('');
  const [status, setStatus] = useState('idle');
  const [sentCount, setSentCount] = useState(null);

  async function handleSend(e) {
    e.preventDefault();
    if (!title.trim() || !body.trim()) return;
    setStatus('sending');

    const { data: session } = await supabase.auth.getSession();
    const res = await fetch(
      `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/send-notification`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${session.session?.access_token}`,
        },
        body: JSON.stringify({ title: title.trim(), body: body.trim() }),
      }
    );

    if (!res.ok) {
      setStatus('error');
      return;
    }
    const result = await res.json();
    setSentCount(result.sent ?? 0);
    setStatus('sent');
    setTitle('');
    setBody('');
  }

  return (
    <div>
      <p className="text-[11px] font-bold uppercase tracking-[2px] text-accent mb-1.5">Push</p>
      <p className="font-display text-4xl tracking-wide mb-2 flex items-center gap-3">
        <Bell size={28} className="text-accent" />
        Send notification
      </p>
      <p className="text-xs text-muted-dark mb-6 max-w-md">
        Goes out to everyone who's turned on notifications in the app. Use it for things that
        genuinely need attention now — camp reminders, urgent changes — not every small update.
      </p>

      <form onSubmit={handleSend} className="flex flex-col gap-3 max-w-sm rounded-2xl border border-white/10 bg-surface-dark p-5">
        <input
          type="text"
          required
          placeholder="Title, e.g. Daniel's Camp starts tomorrow!"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          className="rounded-md bg-base-dark border border-white/10 px-3 py-2 text-sm outline-none"
        />
        <textarea
          required
          rows={3}
          placeholder="Message"
          value={body}
          onChange={(e) => setBody(e.target.value)}
          className="rounded-md bg-base-dark border border-white/10 px-3 py-2 text-sm outline-none resize-none"
        />
        <button
          type="submit"
          disabled={status === 'sending'}
          className="bg-accent text-[#1a0a00] rounded-md py-2.5 text-sm font-bold disabled:opacity-60 flex items-center justify-center gap-2"
        >
          <Send size={14} />
          {status === 'sending' ? 'Sending...' : 'Send to everyone'}
        </button>
        {status === 'sent' && (
          <p className="text-xs text-green-400">Sent to {sentCount} device{sentCount === 1 ? '' : 's'}.</p>
        )}
        {status === 'error' && (
          <p className="text-xs text-red-400">Something went wrong sending that — check the function is deployed.</p>
        )}
      </form>
    </div>
  );
} 