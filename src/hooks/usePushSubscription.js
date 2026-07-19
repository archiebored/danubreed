import { useState, useEffect, useCallback } from 'react';
import { supabase } from '../lib/supabase';

const VAPID_PUBLIC_KEY = 'BBF9j0pe0Bk4C8vH-bi09qguuL1I_56X2f-5XrbpNN2426fQkD3fBYGhBerjJcnCJNJJhcu5iPK4AMOiz-pdZMc';

function urlBase64ToUint8Array(base64String) {
  const padding = '='.repeat((4 - (base64String.length % 4)) % 4);
  const base64 = (base64String + padding).replace(/-/g, '+').replace(/_/g, '/');
  const rawData = atob(base64);
  return Uint8Array.from([...rawData].map((c) => c.charCodeAt(0)));
}

export function usePushSubscription() {
  const [status, setStatus] = useState('idle'); // idle | subscribing | subscribed | denied | unsupported | error

  useEffect(() => {
    if (!('serviceWorker' in navigator) || !('PushManager' in window)) {
      setStatus('unsupported');
      return;
    }
    if (Notification.permission === 'granted') {
      navigator.serviceWorker.ready.then((reg) =>
        reg.pushManager.getSubscription().then((sub) => {
          if (sub) setStatus('subscribed');
        })
      );
    } else if (Notification.permission === 'denied') {
      setStatus('denied');
    }
  }, []);

  const subscribe = useCallback(async () => {
    if (!('serviceWorker' in navigator) || !('PushManager' in window)) {
      setStatus('unsupported');
      return;
    }
    setStatus('subscribing');
    const permission = await Notification.requestPermission();
    if (permission !== 'granted') {
      setStatus('denied');
      return;
    }
    const reg = await navigator.serviceWorker.ready;
    const sub = await reg.pushManager.subscribe({
      userVisibleOnly: true,
      applicationServerKey: urlBase64ToUint8Array(VAPID_PUBLIC_KEY),
    });
    const json = sub.toJSON();
    const { error } = await supabase.from('push_subscriptions').insert({
      endpoint: json.endpoint,
      p256dh: json.keys.p256dh,
      auth: json.keys.auth,
    });
    setStatus(error ? 'error' : 'subscribed');
  }, []);

  return { status, subscribe };
}