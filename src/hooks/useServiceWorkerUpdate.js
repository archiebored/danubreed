import { useEffect } from 'react';

export function useServiceWorkerUpdate() {
  useEffect(() => {
    if (!('serviceWorker' in navigator)) return;

    function checkForUpdate() {
      navigator.serviceWorker.getRegistration().then((reg) => reg?.update());
    }

    // Check right away, and again whenever the app comes back into focus
    checkForUpdate();
    document.addEventListener('visibilitychange', () => {
      if (document.visibilityState === 'visible') checkForUpdate();
    });
    window.addEventListener('focus', checkForUpdate);

    return () => {
      window.removeEventListener('focus', checkForUpdate);
    };
  }, []);
}