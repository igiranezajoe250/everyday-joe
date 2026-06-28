// service-worker.js — offline support for Ingoga Invest
// Network-first for app code (so updates land when online), falling back to
// cache when offline. Bump CACHE to force a clean slate.
const CACHE = 'everyday-v17';

const SHELL = [
  './',
  './Everyday.html',
  './manifest.webmanifest',
  './ui.jsx',
  './data.jsx',
  './ios-frame.jsx',
  './tweaks-panel.jsx',
  './screens.jsx',
  './native.jsx',
  './app.jsx',
  './icons/icon-32.png',
  './icons/icon-180.png',
  './icons/icon-192.png',
  './icons/icon-512.png',
  // CDN libraries (opaque cross-origin responses are cacheable)
  'https://unpkg.com/react@18.3.1/umd/react.development.js',
  'https://unpkg.com/react-dom@18.3.1/umd/react-dom.development.js',
  'https://unpkg.com/@babel/standalone@7.29.0/babel.min.js',
];

self.addEventListener('install', (e) => {
  e.waitUntil(
    caches.open(CACHE).then((c) =>
      // addAll fails the whole install if one request fails; add resiliently.
      Promise.all(SHELL.map((u) => c.add(u).catch(() => null)))
    ).then(() => self.skipWaiting())
  );
});

self.addEventListener('activate', (e) => {
  e.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(keys.filter((k) => k !== CACHE).map((k) => caches.delete(k)))
    ).then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', (e) => {
  const req = e.request;
  if (req.method !== 'GET') return;
  // Network-first: fetch fresh, cache a copy, fall back to cache offline.
  e.respondWith(
    fetch(req).then((res) => {
      const copy = res.clone();
      caches.open(CACHE).then((c) => c.put(req, copy)).catch(() => {});
      return res;
    }).catch(() =>
      caches.match(req).then((hit) =>
        hit || (req.mode === 'navigate' ? caches.match('./Everyday.html') : undefined)
      )
    )
  );
});
