const CACHE = 'le-mie-rate-shell-v3';
const APP_SCOPE = self.registration.scope;
const APP_HOME = new URL('index.html', APP_SCOPE).href;
const ICON_192 = new URL('icon-192.png', APP_SCOPE).href;
const ICON_512 = new URL('icon-512.png', APP_SCOPE).href;

self.addEventListener('install', (event) => {
  event.waitUntil((async () => {
    const cache = await caches.open(CACHE);
    try {
      const response = await fetch(APP_HOME, { cache: 'reload' });
      if (response.ok) await cache.put(APP_HOME, response.clone());
    } catch (_) {}
    await self.skipWaiting();
  })());
});

self.addEventListener('activate', (event) => {
  event.waitUntil((async () => {
    const keys = await caches.keys();
    await Promise.all(keys.filter((key) => key.startsWith('le-mie-rate-shell-') && key !== CACHE).map((key) => caches.delete(key)));
    await self.clients.claim();
  })());
});

self.addEventListener('fetch', (event) => {
  const request = event.request;
  const url = new URL(request.url);
  if (request.method !== 'GET' || url.origin !== self.location.origin || url.pathname.includes('/api/')) return;
  event.respondWith((async () => {
    const cache = await caches.open(CACHE);
    try {
      const response = await fetch(request);
      if (response.ok) await cache.put(request, response.clone());
      return response;
    } catch (_) {
      return (await cache.match(request)) || (url.mode === 'navigate' ? await cache.match(APP_HOME) : undefined) || Response.error();
    }
  })());
});

self.addEventListener('push', (event) => {
  let data = { title: 'Le mie rate', body: 'Hai una rata in scadenza.', url: APP_HOME };
  try { if (event.data) data = { ...data, ...event.data.json() }; }
  catch (_) { if (event.data) data.body = event.data.text(); }
  const target = new URL(data.url || APP_HOME, APP_SCOPE).href;
  event.waitUntil(self.registration.showNotification(data.title, {
    body: data.body,
    icon: ICON_192,
    badge: ICON_192,
    tag: 'le-mie-rate-due',
    renotify: true,
    data: { url: target }
  }));
});

self.addEventListener('notificationclick', (event) => {
  event.notification.close();
  event.waitUntil((async () => {
    const target = new URL(event.notification.data?.url || APP_HOME, APP_SCOPE).href;
    const windows = await self.clients.matchAll({ type: 'window', includeUncontrolled: true });
    for (const client of windows) {
      if (client.url.startsWith(APP_SCOPE) && 'focus' in client) { await client.focus(); return; }
    }
    if (self.clients.openWindow) await self.clients.openWindow(target);
  })());
});
