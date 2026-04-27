// Production Service Worker
// - HTML: network-first  (always serve fresh app shell when online)
// - /assets/*: cache-first (Vite hashes filenames, so they are immutable)
// - other same-origin: stale-while-revalidate
// - cross-origin (Firebase, Gemini, fonts CDN): bypassed entirely
//
// Migration: on activate, deletes all caches that don't match the current
// CACHE name AND force-navigates every open tab so users stuck on a stale
// or broken previous bundle recover automatically on first visit after deploy.
//
// Bump CACHE on every release to invalidate previously cached assets.
const CACHE = 'fridgeshare-v5';

self.addEventListener('install', () => {
  self.skipWaiting();
});

self.addEventListener('activate', (e) => {
  e.waitUntil((async () => {
    const keys = await caches.keys();
    await Promise.all(keys.filter(k => k !== CACHE).map(k => caches.delete(k)));
    await self.clients.claim();
    const wins = await self.clients.matchAll({ type: 'window' });
    for (const w of wins) { try { w.navigate(w.url); } catch (_) {} }
  })());
});

self.addEventListener('message', (e) => {
  if (e.data === 'SKIP_WAITING') self.skipWaiting();
});

self.addEventListener('fetch', (e) => {
  const { request } = e;
  if (request.method !== 'GET') return;

  const url = new URL(request.url);
  if (url.origin !== self.location.origin) return;

  const accept = request.headers.get('accept') || '';
  const isHTML = request.mode === 'navigate' || accept.includes('text/html');

  if (isHTML) {
    e.respondWith((async () => {
      try {
        const res = await fetch(request, { cache: 'no-store' });
        const cache = await caches.open(CACHE);
        cache.put(request, res.clone());
        return res;
      } catch (_) {
        const cached = await caches.match(request);
        return cached || (await caches.match('/index.html')) || Response.error();
      }
    })());
    return;
  }

  if (url.pathname.startsWith('/assets/')) {
    e.respondWith((async () => {
      const cached = await caches.match(request);
      if (cached) return cached;
      const res = await fetch(request);
      const cache = await caches.open(CACHE);
      cache.put(request, res.clone());
      return res;
    })());
    return;
  }

  e.respondWith((async () => {
    const cached = await caches.match(request);
    const fetched = fetch(request).then((res) => {
      caches.open(CACHE).then((c) => c.put(request, res.clone()));
      return res;
    }).catch(() => cached);
    return cached || fetched;
  })());
});
