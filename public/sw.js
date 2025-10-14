// Advanced Service Worker for PWA with optimized caching strategies
const CACHE_VERSION = 'v2';
const CACHE_NAME = `nym-static-${CACHE_VERSION}`;
const RUNTIME_CACHE = `nym-runtime-${CACHE_VERSION}`;
const IMAGE_CACHE = `nym-images-${CACHE_VERSION}`;
const API_CACHE = `nym-api-${CACHE_VERSION}`;

// Cache durations (in seconds)
const CACHE_DURATION = {
  images: 7 * 24 * 60 * 60, // 7 days
  api: 5 * 60, // 5 minutes
  static: 30 * 24 * 60 * 60, // 30 days
};

// Assets to cache on install
const PRECACHE_URLS = [
  '/',
  '/index.html',
  '/manifest.json',
];

// Install event - cache essential assets
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => cache.addAll(PRECACHE_URLS))
      .then(() => self.skipWaiting())
  );
});

// Activate event - clean up old caches
self.addEventListener('activate', (event) => {
  const currentCaches = [CACHE_NAME, RUNTIME_CACHE, IMAGE_CACHE, API_CACHE];
  event.waitUntil(
    caches.keys()
      .then((cacheNames) => {
        return cacheNames.filter((cacheName) => !currentCaches.includes(cacheName));
      })
      .then((cachesToDelete) => {
        return Promise.all(cachesToDelete.map((cacheToDelete) => {
          return caches.delete(cacheToDelete);
        }));
      })
      .then(() => self.clients.claim())
  );
});

// Helper: Check if cache entry is expired
function isCacheExpired(cachedResponse, maxAge) {
  const cachedDate = new Date(cachedResponse.headers.get('date'));
  const now = new Date();
  const age = (now - cachedDate) / 1000;
  return age > maxAge;
}

// Fetch event - optimized caching strategies
self.addEventListener('fetch', (event) => {
  if (event.request.method !== 'GET') return;
  if (event.request.url.startsWith('chrome-extension://')) return;

  const url = new URL(event.request.url);

  // Network first with cache fallback for API calls
  if (url.pathname.includes('/rest/v1/') || url.pathname.includes('/functions/v1/')) {
    event.respondWith(
      fetch(event.request)
        .then((response) => {
          if (response.status === 200) {
            const responseClone = response.clone();
            caches.open(API_CACHE).then((cache) => {
              cache.put(event.request, responseClone);
            });
          }
          return response;
        })
        .catch(() => {
          return caches.match(event.request).then((cached) => {
            if (cached && !isCacheExpired(cached, CACHE_DURATION.api)) {
              return cached;
            }
            return new Response('Offline', { status: 503 });
          });
        })
    );
    return;
  }

  // Stale-while-revalidate for images
  if (event.request.destination === 'image') {
    event.respondWith(
      caches.open(IMAGE_CACHE).then((cache) => {
        return cache.match(event.request).then((cached) => {
          const fetchPromise = fetch(event.request).then((response) => {
            if (response.status === 200) {
              cache.put(event.request, response.clone());
            }
            return response;
          });

          // Return cached version immediately, update in background
          return cached || fetchPromise;
        });
      })
    );
    return;
  }

  // Cache first for static assets (JS, CSS)
  if (event.request.destination === 'script' || event.request.destination === 'style') {
    event.respondWith(
      caches.match(event.request).then((cached) => {
        if (cached && !isCacheExpired(cached, CACHE_DURATION.static)) {
          return cached;
        }
        return fetch(event.request).then((response) => {
          if (response.status === 200) {
            caches.open(CACHE_NAME).then((cache) => {
              cache.put(event.request, response.clone());
            });
          }
          return response;
        });
      })
    );
    return;
  }

  // Network first for everything else
  event.respondWith(
    fetch(event.request)
      .then((response) => {
        if (response.status === 200) {
          const responseClone = response.clone();
          caches.open(RUNTIME_CACHE).then((cache) => {
            cache.put(event.request, responseClone);
          });
        }
        return response;
      })
      .catch(() => caches.match(event.request))
  );
});
