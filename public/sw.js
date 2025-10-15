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

// Push notification handler
self.addEventListener('push', (event) => {
  console.log('Push notification received:', event);
  
  let data = {};
  try {
    data = event.data ? event.data.json() : {};
  } catch (e) {
    console.error('Error parsing push data:', e);
    data = { title: 'New Notification', body: event.data?.text() || '' };
  }

  const options = {
    body: data.body || 'You have a new notification',
    icon: '/placeholder.svg',
    badge: '/placeholder.svg',
    vibrate: [200, 100, 200, 100, 200],
    data: {
      orderId: data.orderId,
      type: data.type,
      url: data.url || '/courier/dashboard'
    },
    tag: data.tag || 'default',
    requireInteraction: data.requireInteraction || false,
    actions: data.actions || []
  };

  // Add action buttons for delivery requests
  if (data.type === 'delivery_request') {
    options.requireInteraction = true;
    options.actions = [
      { action: 'accept', title: '✓ Accept', icon: '/placeholder.svg' },
      { action: 'decline', title: '✗ Decline', icon: '/placeholder.svg' }
    ];
  }

  event.waitUntil(
    self.registration.showNotification(data.title || 'BudDash Courier', options)
  );
});

// Notification click handler
self.addEventListener('notificationclick', (event) => {
  console.log('Notification clicked:', event.action);
  event.notification.close();

  const data = event.notification.data;

  if (event.action === 'accept' || event.action === 'view') {
    // Accept/view delivery
    event.waitUntil(
      clients.openWindow(data.url || '/courier-dashboard')
    );
  } else if (event.action === 'decline' || event.action === 'dismiss') {
    // Just dismiss
    return;
  } else {
    // Default click - open or focus app
    event.waitUntil(
      clients.matchAll({ type: 'window', includeUncontrolled: true }).then(clientList => {
        // Check if app is already open
        for (let client of clientList) {
          if (client.url.includes(self.location.origin) && 'focus' in client) {
            if (data.url) {
              client.postMessage({ type: 'NAVIGATE', url: data.url });
            }
            return client.focus();
          }
        }
        // Open new window
        return clients.openWindow(data.url || '/courier-dashboard');
      })
    );
  }
});

// Background sync for offline actions
self.addEventListener('sync', (event) => {
  console.log('Background sync:', event.tag);
  
  if (event.tag === 'sync-location') {
    event.waitUntil(syncLocationData());
  } else if (event.tag === 'sync-order-status') {
    event.waitUntil(syncOrderStatus());
  }
});

async function syncLocationData() {
  try {
    const cache = await caches.open('location-queue');
    const requests = await cache.keys();
    
    for (const request of requests) {
      const response = await cache.match(request);
      const data = await response.json();
      
      await fetch(request.url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      });
      
      await cache.delete(request);
    }
  } catch (error) {
    console.error('Location sync failed:', error);
  }
}

async function syncOrderStatus() {
  try {
    const cache = await caches.open('order-queue');
    const requests = await cache.keys();
    
    for (const request of requests) {
      const response = await cache.match(request);
      const data = await response.json();
      
      await fetch(request.url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      });
      
      await cache.delete(request);
    }
  } catch (error) {
    console.error('Order status sync failed:', error);
  }
}

// Message event - Handle messages from the app
self.addEventListener('message', (event) => {
  console.log('Service worker received message:', event.data);
  
  if (event.data && event.data.type === 'SKIP_WAITING') {
    self.skipWaiting();
  }
  
  // Handle notification requests from the app
  if (event.data && event.data.type === 'SHOW_NOTIFICATION') {
    const { title, body, tag, icon, badge, data, requireInteraction } = event.data;
    
    event.waitUntil(
      self.registration.showNotification(title, {
        body: body || '',
        tag: tag || 'default',
        icon: icon || '/nym-logo.svg',
        badge: badge || '/nym-logo.svg',
        vibrate: [200, 100, 200],
        data: data || {},
        requireInteraction: requireInteraction || false,
        silent: false
      })
    );
  }
});
