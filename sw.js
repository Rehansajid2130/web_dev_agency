/**
 * @fileoverview bit3labs Service Worker (PWA Offline Reliability & Fast Caching)
 * Implements Stale-While-Revalidate for static assets and Network-First for HTML navigation.
 */

const CACHE_NAME = 'bit3labs-v1.1';

const PRECACHE_ASSETS = [
  './',
  './index.html',
  './services.html',
  './process.html',
  './projects.html',
  './about.html',
  './contact.html',
  './privacy.html',
  './terms.html',
  './styles.css',
  './services.css',
  './process.css',
  './projects.css',
  './about.css',
  './contact.css',
  './legal.css',
  './main.js',
  './js/router.js',
  './js/telemetry.js',
  './js/theme.js',
  './js/cursor.js',
  './js/components.js',
  './js/typewriter.js',
  './manifest.json',
  './favicon.svg',
  './assets/og-image.svg',
  './assets/icon-192.svg',
  './assets/icon-512.svg'
];

// Install: Cache essential app shell
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(PRECACHE_ASSETS).catch((err) => {
        console.warn('[ServiceWorker] Pre-cache partial warning:', err);
      });
    }).then(() => self.skipWaiting())
  );
});

// Activate: Prune outdated caches
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) => {
      return Promise.all(
        keys.map((key) => {
          if (key !== CACHE_NAME) {
            console.log('[ServiceWorker] Removing legacy cache:', key);
            return caches.delete(key);
          }
        })
      );
    }).then(() => self.clients.claim())
  );
});

// Fetch: Strategy depending on request type
self.addEventListener('fetch', (event) => {
  const request = event.request;
  const url = new URL(request.url);

  // Skip non-GET requests and internal /api/ endpoints (e.g. POST /api/contact)
  if (request.method !== 'GET' || url.pathname.startsWith('/api/')) {
    return;
  }

  // 1. Navigation requests (HTML pages): Network-First, falling back to cache
  if (request.mode === 'navigate') {
    event.respondWith(
      fetch(request)
        .then((networkResponse) => {
          if (networkResponse && networkResponse.status === 200) {
            const responseClone = networkResponse.clone();
            caches.open(CACHE_NAME).then((cache) => cache.put(request, responseClone));
          }
          return networkResponse;
        })
        .catch(async () => {
          const cachedResponse = await caches.match(request);
          if (cachedResponse) return cachedResponse;
          // Fallback to cached index.html if offline
          return caches.match('./index.html');
        })
    );
    return;
  }

  // 2. Static assets (CSS, JS, Fonts, Images): Stale-While-Revalidate
  event.respondWith(
    caches.match(request).then((cachedResponse) => {
      const fetchPromise = fetch(request)
        .then((networkResponse) => {
          if (networkResponse && networkResponse.status === 200) {
            const responseClone = networkResponse.clone();
            caches.open(CACHE_NAME).then((cache) => cache.put(request, responseClone));
          }
          return networkResponse;
        })
        .catch(() => null);

      return cachedResponse || fetchPromise;
    })
  );
});
