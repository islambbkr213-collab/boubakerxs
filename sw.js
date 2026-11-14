/* Small service worker: repeat visits open instantly and the site still opens on a bad or dropped connection.
   It only touches files from this site. Uploaded thumbnails use the browser's own cache (they are
   stored with a one-year cache header and a unique file name). */
const CACHE = 'bx-v1';

self.addEventListener('install', () => self.skipWaiting());
self.addEventListener('activate', e => e.waitUntil((async () => {
  for (const k of await caches.keys()) if (k !== CACHE) await caches.delete(k);
  await self.clients.claim();
})()));

/* pages: try the network for 2.5 s, then fall back to the last good copy */
const networkFirst = async req => {
  const cache = await caches.open(CACHE);
  try {
    const res = await Promise.race([fetch(req), new Promise((_, no) => setTimeout(no, 2500))]);
    if (res.ok) cache.put(req, res.clone());
    return res;
  } catch (_) {
    return (await cache.match(req)) || (await cache.match('index.html')) || fetch(req);
  }
};

/* images, styles, fonts: show the saved copy at once, refresh it in the background */
const staleWhileRevalidate = async req => {
  const cache = await caches.open(CACHE), hit = await cache.match(req);
  const net = fetch(req).then(res => { if (res.ok) cache.put(req, res.clone()); return res; }).catch(() => hit);
  return hit || net;
};

self.addEventListener('fetch', e => {
  const req = e.request, url = new URL(req.url);
  if (req.method !== 'GET' || url.origin !== location.origin) return;
  if (/\/(admin|config\.js|sw\.js|supabase-upgrade)/.test(url.pathname)) return;   // never cache the admin or settings
  if (req.mode === 'navigate') return e.respondWith(networkFirst(req));
  if (/\.(webp|png|jpe?g|svg|css|woff2?)$/i.test(url.pathname)) e.respondWith(staleWhileRevalidate(req));
});
