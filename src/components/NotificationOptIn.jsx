import { Bell, Check } from 'lucide-react';
import { usePushSubscription } from '../hooks/usePushSubscription';

export default function NotificationOptIn() {
  const { status, subscribe } = usePushSubscription();

  if (status === 'unsupported' || status === 'subscribed') return null;

  return (
    <div className="rounded-2xl border border-black/10 dark:border-white/10 bg-surface-light dark:bg-surface-dark p-4 mb-4 flex items-center justify-between gap-3">
      <div className="flex items-center gap-3">
        <div className="w-9 h-9 rounded-full bg-accent/15 flex items-center justify-center flex-shrink-0">
          <Bell size={16} className="text-accent" />
        </div>
        <div>
          <p className="text-sm font-semibold">Turn on notifications</p>
          <p className="text-xs text-muted-light dark:text-muted-dark">
            {status === 'denied' ? 'Blocked — enable in your phone settings' : "Camp updates and reminders, straight to your phone"}
          </p>
        </div>
      </div>
      {status !== 'denied' && (
        <button
          onClick={subscribe}
          disabled={status === 'subscribing'}
          className="flex-shrink-0 bg-accent text-[#1a0a00] text-xs font-bold px-3.5 py-2 rounded-full transition-transform duration-200 hover:scale-105 active:scale-95 disabled:opacity-60"
        >
          {status === 'subscribing' ? '...' : 'Enable'}
        </button>
      )}
    </div>
  );
}