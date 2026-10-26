import webpush from "npm:web-push@3.6.7";

const VAPID_PUBLIC_KEY = Deno.env.get("VAPID_PUBLIC_KEY")!;
const VAPID_PRIVATE_KEY = Deno.env.get("VAPID_PRIVATE_KEY")!;
const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
const SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;

webpush.setVapidDetails("mailto:admin@danubreedz.app", VAPID_PUBLIC_KEY, VAPID_PRIVATE_KEY);

const restHeaders = {
  apikey: SERVICE_ROLE_KEY,
  Authorization: `Bearer ${SERVICE_ROLE_KEY}`,
};

// Expo accepts at most 100 messages per request.
const EXPO_BATCH_SIZE = 100;

type ExpoTicket = {
  status: "ok" | "error";
  details?: { error?: string };
};

// Web push (PWA): browser push subscriptions.
async function sendWebPush(title: string, body: string, url?: string) {
  const subsRes = await fetch(`${SUPABASE_URL}/rest/v1/push_subscriptions?select=*`, {
    headers: restHeaders,
  });
  const subs = await subsRes.json();

  let sent = 0;
  await Promise.allSettled(
    subs.map(async (s: { id: string; endpoint: string; p256dh: string; auth: string }) => {
      try {
        await webpush.sendNotification(
          { endpoint: s.endpoint, keys: { p256dh: s.p256dh, auth: s.auth } },
          JSON.stringify({ title, body, url: url || "/" })
        );
        sent++;
      } catch (err) {
        // Stale subscription (device unsubscribed / uninstalled) — clean it up
        const statusCode = (err as { statusCode?: number } | null)?.statusCode;
        if (statusCode === 410 || statusCode === 404) {
          await fetch(`${SUPABASE_URL}/rest/v1/push_subscriptions?id=eq.${s.id}`, {
            method: "DELETE",
            headers: restHeaders,
          });
        }
      }
    })
  );

  return { sent, total: subs.length };
}

// Expo push (native app): Expo push tokens registered by mobile/.
async function sendExpoPush(title: string, body: string, url?: string) {
  const tokensRes = await fetch(`${SUPABASE_URL}/rest/v1/expo_push_tokens?select=token`, {
    headers: restHeaders,
  });
  const rows = await tokensRes.json();
  const tokens: string[] = (rows ?? [])
    .map((r: { token: string }) => r.token)
    .filter((t: string) => typeof t === "string" && t.startsWith("ExponentPushToken"));

  let sent = 0;
  const stale: string[] = [];

  for (let i = 0; i < tokens.length; i += EXPO_BATCH_SIZE) {
    const batch = tokens.slice(i, i + EXPO_BATCH_SIZE);
    const messages = batch.map((to) => ({
      to,
      title,
      body,
      sound: "default",
      data: { url: url || "/" },
    }));

    try {
      const res = await fetch("https://exp.host/--/api/v2/push/send", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
          "Accept-Encoding": "gzip, deflate",
        },
        body: JSON.stringify(messages),
      });
      const payload = await res.json();
      const tickets: ExpoTicket[] = payload?.data ?? [];

      tickets.forEach((ticket, idx) => {
        if (ticket?.status === "ok") {
          sent++;
        } else if (ticket?.details?.error === "DeviceNotRegistered") {
          // App uninstalled or token revoked — drop it.
          stale.push(batch[idx]);
        }
      });
    } catch {
      // Network/Expo outage: leave these tokens alone so a later send can retry.
    }
  }

  // Remove tokens Expo told us are dead.
  await Promise.allSettled(
    stale.map((token) =>
      fetch(`${SUPABASE_URL}/rest/v1/expo_push_tokens?token=eq.${encodeURIComponent(token)}`, {
        method: "DELETE",
        headers: restHeaders,
      })
    )
  );

  return { sent, total: tokens.length, removed: stale.length };
}

Deno.serve(async (req) => {
  if (req.method !== "POST") {
    return new Response("Method not allowed", { status: 405 });
  }

  const { title, body, url } = await req.json();
  if (!title || !body) {
    return new Response(JSON.stringify({ error: "title and body are required" }), { status: 400 });
  }

  const [web, expo] = await Promise.all([
    sendWebPush(title, body, url),
    sendExpoPush(title, body, url),
  ]);

  return new Response(
    JSON.stringify({
      sent: web.sent + expo.sent,
      total: web.total + expo.total,
      web,
      expo,
    }),
    { headers: { "Content-Type": "application/json" } }
  );
});
