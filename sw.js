const CACHE = 'msk8-v9';
const SHELL = ['./index.html', './manifest.json', './icon.svg', './caprasimo.ttf',
  './rasters/raster%201.png', './rasters/raster%202.png', './rasters/raster%203.png', './rasters/raster%204.png',
  './rasters/sliders.svg', './rasters/tool.svg', './rasters/diagonal.png'];

self.addEventListener('message', e => {
  if (e.data && e.data.type === 'SKIP_WAITING') self.skipWaiting();
});

self.addEventListener('install', e => {
  e.waitUntil(caches.open(CACHE).then(c => c.addAll(SHELL).catch(() => {})));
});

self.addEventListener('activate', e => {
  e.waitUntil(
    caches.keys()
      .then(keys => Promise.all(keys.filter(k => k !== CACHE).map(k => caches.delete(k))))
      .then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', e => {
  if (e.request.method !== 'GET') return;
  const url = new URL(e.request.url);
  // Pass through all cross-origin requests (weather APIs, geocoding, fonts)
  if (url.origin !== self.location.origin) return;
  e.respondWith(
    caches.match(e.request).then(cached => {
      const fresh = fetch(e.request).then(res => {
        if (res.ok) caches.open(CACHE).then(c => c.put(e.request, res.clone()));
        return res;
      }).catch(() => cached);
      return cached || fresh;
    })
  );
});
