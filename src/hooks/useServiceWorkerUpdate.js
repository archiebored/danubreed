import { useEffect } from 'react';

export function useServiceWorkerUpdate() {
  useEffect(() => {
    if (!('serviceWorker' in navigator)) return;

    function checkForUpdate() {
      navigator.serviceWorker.getRegistration().then((reg) => reg?.update());
    }

    // Once a new service worker takes control, the page it's controlling
    // is still running the old JS bundle in memory — reload once so the
    // new version actually shows up instead of silently sitting there.
    let refreshing = false;
    navigator.serviceWorker.addEventListener('controllerchange', () => {
      if (refreshing) return;
      refreshing = true;
      window.location.reload();
    });

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
