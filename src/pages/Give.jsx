import { Heart, Copy, Check } from 'lucide-react';
import { useState } from 'react';

const accounts = [
  { bank: 'FirstBank', number: '2018457003' },
  { bank: 'Stanbic IBTC', number: '0015067615' },
  { bank: 'FCMB', number: '0320413015' },
  { bank: 'Zenith', number: '1010342016' },
  { bank: 'GTCO (NGN)', number: '0016453101' },
  { bank: 'GTCO (USD)', number: '0016453118' },
  { bank: 'GTCO (GBP)', number: '0016453132' },
];

function AccountRow({ bank, number }) {
  const [copied, setCopied] = useState(false);

  async function handleCopy() {
    try {
      await navigator.clipboard.writeText(number);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch {
      // clipboard unavailable, ignore
    }
  }

  return (
    <button
      onClick={handleCopy}
      className="w-full flex items-center justify-between rounded-xl border border-black/10 dark:border-white/10 bg-base-light dark:bg-base-dark px-4 py-3 text-left transition-all duration-200 hover:border-accent/40 hover:-translate-y-0.5 active:scale-[0.98]"
    >
      <div>
        <p className="text-xs text-muted-light dark:text-muted-dark">{bank}</p>
        <p className="text-base font-semibold tracking-wide">{number}</p>
      </div>
      <span className="text-accent transition-transform duration-200">
        {copied ? <Check size={16} /> : <Copy size={16} />}
      </span>
    </button>
  );
}

export default function Give() {
  return (
    <div className="max-w-3xl mx-auto pt-2">
      <p className="text-[11px] font-bold uppercase tracking-[2px] text-accent mb-3">
        Tithes &amp; offerings
      </p>
      <h1 className="font-display text-5xl tracking-wide mb-8">Give</h1>

      <div className="relative overflow-hidden rounded-2xl border border-black/10 dark:border-white/10 bg-surface-light dark:bg-surface-dark p-7 max-w-lg mb-6">
        <Heart size={28} className="text-accent mb-4" />
        <p className="text-sm leading-relaxed mb-2">
          Online giving isn't switched on yet — for now, give directly using the account details
          below, or see a coordinator.
        </p>
        <p className="text-xs text-muted-light dark:text-muted-dark">
          Kindly issue all cheques in favour of <span className="font-semibold">"Truth of Calvary Ministries"</span>.
        </p>
      </div>

      <div className="max-w-lg flex flex-col gap-2.5">
        {accounts.map((a) => (
          <AccountRow key={a.bank} bank={a.bank} number={a.number} />
        ))}
      </div>

      <p className="text-[11px] text-muted-light dark:text-muted-dark mt-5 max-w-lg italic">
        All donations to Calvary Bible Church are freewill and non-refundable.
      </p>
    </div>
  );
}