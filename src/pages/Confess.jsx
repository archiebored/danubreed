import { useState } from 'react';
import { Lock } from 'lucide-react';
import { supabase } from '../lib/supabase';

export default function Confess() {
  const [type, setType] = useState('confession');
  const [content, setContent] = useState('');
  const [contactInfo, setContactInfo] = useState('');
  const [status, setStatus] = useState('idle');

  async function handleSubmit(e) {
    e.preventDefault();
    if (!content.trim()) return;
    setStatus('sending');
    const { error } = await supabase.from('anonymous_submissions').insert({
      type,
      content: content.trim(),
      contact_info: contactInfo.trim() || null,
    });
    setStatus(error ? 'error' : 'sent');
    if (!error) {
      setContent('');
      setContactInfo('');
    }
  }

  return (
    <div className="max-w-lg mx-auto pt-2">
      <p className="text-[11px] font-bold uppercase tracking-[2px] text-accent mb-3">
        Anonymous
      </p>
      <h1 className="font-display text-5xl tracking-wide mb-6">Confess or suggest</h1>

      <div className="flex items-center gap-2 rounded-lg bg-surface-light dark:bg-surface-dark border border-black/10 dark:border-white/10 px-3 py-2.5 mb-4">
        <Lock size={14} className="text-muted-light dark:text-muted-dark" />
        <span className="text-[11px] text-muted-light dark:text-muted-dark">
          Anonymous — only coordinators can read this
        </span>
      </div>

      <div className="flex gap-2 mb-4">
        {['confession', 'suggestion'].map((option) => (
          <button
            key={option}
            onClick={() => setType(option)}
            className={`flex-1 text-center py-2.5 rounded-lg text-sm font-semibold capitalize border ${
              type === option
                ? 'bg-accent/15 text-accent border-accent/30'
                : 'bg-surface-light dark:bg-surface-dark text-muted-light dark:text-muted-dark border-black/10 dark:border-white/10'
            }`}
          >
            {option}
          </button>
        ))}
      </div>

      <form onSubmit={handleSubmit}>
        <textarea
          value={content}
          onChange={(e) => setContent(e.target.value)}
          placeholder="Write what's on your mind..."
          rows={5}
          className="w-full rounded-xl bg-surface-light dark:bg-surface-dark border border-black/10 dark:border-white/10 p-3.5 text-sm outline-none mb-3 resize-none"
        />

        <input
          type="text"
          value={contactInfo}
          onChange={(e) => setContactInfo(e.target.value)}
          placeholder="Your name or number (optional)"
          className="w-full rounded-xl bg-surface-light dark:bg-surface-dark border border-black/10 dark:border-white/10 px-3.5 py-3 text-sm outline-none mb-1.5"
        />
        <p className="text-[11px] text-muted-light dark:text-muted-dark mb-4">
          Only fill this in if you want a coordinator to reach out to you. Leave blank to stay fully anonymous.
        </p>

        <button
          type="submit"
          disabled={status === 'sending' || !content.trim()}
          className="w-full bg-accent text-[#1a0a00] rounded-xl py-3 text-sm font-bold disabled:opacity-60"
        >
          {status === 'sending' ? 'Sending...' : 'Submit anonymously'}
        </button>
      </form>

      {status === 'sent' && (
        <p className="text-[11px] text-center text-accent font-medium mt-3">
          Sent. Thank you for sharing.
        </p>
      )}
      {status === 'error' && (
        <p className="text-[11px] text-center text-red-500 mt-3">
          Something went wrong sending that — please try again.
        </p>
      )}
    </div>
  );
}