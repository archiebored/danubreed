import { useState } from 'react';
import { Download, X } from 'lucide-react';
import { useInstallPrompt } from '../hooks/useInstallPrompt';
import { useStandalone } from '../hooks/useStandalone';

export default function InstallBanner() {
  const isStandalone = useStandalone();
  const { canInstall, promptInstall } = useInstallPrompt();
  const [dismissed, setDismissed] = useState(
    () => sessionStorage.getItem('dnb-install-dismissed') === '1'
  );

  if (isStandalone || !canInstall || dismissed) return null;

  function dismiss() {
    sessionStorage.setItem('dnb-install-dismissed', '1');
    setDismissed(true);
  }

  return (
    <div className="fixed bottom-4 left-1/2 -translate-x-1/2 z-40 w-[calc(100%-28px)] max-w-sm flex items-center gap-3 rounded-2xl border border-accent/30 bg-base-light dark:bg-[#151515] px-4 py-3 shadow-xl shadow-black/20 animate-[fadeIn_0.3s_ease]">
      <div className="w-9 h-9 rounded-full bg-accent/15 flex items-center justify-center flex-shrink-0">
        <Download size={16} className="text-accent" />
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-semibold">Install Da Nu Breed</p>
        <p className="text-xs text-muted-light dark:text-muted-dark">Get the app experience on your home screen</p>
      </div>
      <button
        onClick={promptInstall}
        className="flex-shrink-0 bg-accent text-[#1a0a00] text-xs font-bold px-3 py-2 rounded-full transition-transform duration-200 hover:scale-105 active:scale-95"
      >
        Install
      </button>
      <button onClick={dismiss} aria-label="Dismiss" className="flex-shrink-0 text-muted-light dark:text-muted-dark">
        <X size={16} />
      </button>
    </div>
  );
}