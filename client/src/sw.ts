/// <reference lib="webworker" />
/**
 * Custom service worker (vite-plugin-pwa injectManifest).
 * Precaches the app shell and handles Web Push notifications.
 */
import { precacheAndRoute } from 'workbox-precaching';

declare const self: ServiceWorkerGlobalScope & { __WB_MANIFEST: Array<unknown> };

// App-shell precache (list injected at build time).
precacheAndRoute(self.__WB_MANIFEST);

// Show a notification when a push arrives.
self.addEventListener('push', (event: PushEvent) => {
  let data: { title?: string; body?: string; url?: string } = {};
  try {
    data = event.data?.json() ?? {};
  } catch {
    /* payload wasn't JSON — ignore */
  }
  event.waitUntil(
    self.registration.showNotification(data.title || 'Estada', {
      body: data.body || '',
      icon: '/favicon.svg',
      badge: '/favicon.svg',
      data: { url: data.url || '/' },
    }),
  );
});

// Focus/open the app on the relevant page when a notification is clicked.
self.addEventListener('notificationclick', (event: NotificationEvent) => {
  event.notification.close();
  const url = (event.notification.data && event.notification.data.url) || '/';
  event.waitUntil(
    self.clients.matchAll({ type: 'window', includeUncontrolled: true }).then((clients) => {
      const client = clients.find((c) => 'focus' in c) as WindowClient | undefined;
      if (client) {
        client.focus();
        client.navigate(url);
      } else {
        self.clients.openWindow(url);
      }
    }),
  );
});
