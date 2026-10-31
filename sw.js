// Alexis's Adventure offline cache, written by tools/pwa.ts. Build 90ba720ce609c007.
const SCOPE = self.registration.scope;
const PREFIX = 'alexis-adventure|' + SCOPE + '|';
const CACHE = PREFIX + "90ba720ce609c007";
const FILES = ["assets/main-cchC4cgv.js","assets/speech-DKQpKyoK.js","assets/voices-AlgCLvGW.js","icons/apple-touch-icon.png","icons/icon-192.png","icons/icon-512.png","index.html","manifest.webmanifest","voices.html"];
const URLS = new Set(FILES.map((f) => new URL(f, SCOPE).href));
const INDEX = new URL('index.html', SCOPE).href;

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches
      .open(CACHE)
      .then((cache) => cache.addAll([...URLS].map((url) => new Request(url, { cache: 'reload' }))))
      .then(() => self.skipWaiting()),
  );
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches
      .keys()
      .then((keys) => Promise.all(keys.filter((k) => k.startsWith(PREFIX) && k !== CACHE).map((k) => caches.delete(k))))
      .then(() => self.clients.claim()),
  );
});

// Only this build's own files: anything else (another origin, another path,
// a POST) goes to the network untouched and is never stored.
self.addEventListener('fetch', (event) => {
  const req = event.request;
  if (req.method !== 'GET') return;
  const url = new URL(req.url);
  if (url.origin !== self.location.origin) return;
  const href = url.origin + url.pathname;
  if (req.mode === 'navigate') {
    // A page: the network first, so a new deploy shows at once, and this build's copy offline.
    const page = href === SCOPE ? INDEX : href;
    if (!URLS.has(page)) return;
    event.respondWith(fetch(req).catch(() => caches.open(CACHE).then((c) => c.match(page)).then((r) => r || Response.error())));
    return;
  }
  if (!URLS.has(href)) return;
  // A hashed build file never changes, so the cached copy wins.
  event.respondWith(caches.open(CACHE).then((c) => c.match(href)).then((r) => r || fetch(req)));
});
