/// <reference lib="webworker" />
// Phase 12.1 — Serwist service worker + Phase 12.2 push handlers.
//
// This file is the entrypoint Serwist compiles into /sw.js. If Serwist plumbing
// is introduced in a later PR, keep the `push` / `notificationclick` handlers
// below untouched — they implement the Phase 12.2 unified payload contract.

declare const self: ServiceWorkerGlobalScope;

interface PushPayload {
  title: string;
  body: string;
  icon?: string;
  url?: string;
  badge?: string;
}

self.addEventListener("push", (event: PushEvent) => {
  if (!event.data) return;

  let payload: PushPayload;
  try {
    payload = event.data.json() as PushPayload;
  } catch {
    payload = { title: "Bozzart", body: event.data.text() };
  }

  const { title, body, icon, url, badge } = payload;

  event.waitUntil(
    self.registration.showNotification(title, {
      body,
      icon: icon ?? "/icon-192.png",
      badge: badge ?? "/icon-72.png",
      data: { url: url ?? "/" },
    }),
  );
});

self.addEventListener("notificationclick", (event: NotificationEvent) => {
  event.notification.close();
  const targetUrl = (event.notification.data as { url?: string } | null)?.url ?? "/";

  event.waitUntil(
    (async () => {
      const allClients = await self.clients.matchAll({
        type: "window",
        includeUncontrolled: true,
      });
      // Reuse an existing tab on the same origin when possible.
      for (const client of allClients) {
        if ("focus" in client && new URL(client.url).origin === self.location.origin) {
          await (client as WindowClient).focus();
          if ("navigate" in client) {
            try {
              await (client as WindowClient).navigate(targetUrl);
            } catch {
              /* cross-origin or unsupported — fall through */
            }
          }
          return;
        }
      }
      if (self.clients.openWindow) {
        await self.clients.openWindow(targetUrl);
      }
    })(),
  );
});

export {};
