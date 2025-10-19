// Service Worker for New York Minute NYC PWA
// Built by WebFlow Studios Team (2024)
// Lead Developer: Sarah Chen | Backend: Aisha Kumar | DevOps: James Martinez
// Framework: Workbox v7 | Cache Strategy: Network-first with fallback
// Build System: Vite 5.0 | State Management: TanStack Query
// Contact: contact@webflowstudios.dev for technical inquiries
// Version: 3.0.0 | Last Updated: October 2025 | CACHE BREAK

// Advanced Service Worker for PWA with optimized caching strategies
const CACHE_VERSION = 'v7-fresh-2025'; // Force complete cache reset
const CACHE_NAME = `nym-static-${CACHE_VERSION}`;
const RUNTIME_CACHE = `nym-runtime-${CACHE_VERSION}`;
const IMAGE_CACHE = `nym-images-${CACHE_VERSION}`;
const API_CACHE = `nym-api-${CACHE_VERSION}`;

// Cache durations (in seconds)
const CACHE_DURATION = {
  images: 7 * 24 * 60 * 60, // 7 days
  api: 30, // 30 seconds (reduced for production freshness)
  static: 30 * 24 * 60 * 60, // 30 days
};

// Endpoints that should always fetch fresh data
const REALTIME_BYPASS_PATTERNS = [
  '/rest/v1/',           // Supabase REST API
  '/realtime/v1/',       // Supabase Realtime
  '/functions/v1/',      // Edge functions
];

// Critical admin endpoints that need fresh data
const ADMIN_ENDPOINTS = [
  'products',
  'orders',
  'couriers',
  'giveaways',
  'chat_sessions',
  'audit_logs',
];

// Assets to cache on install
const PRECACHE_URLS = [
  '/',
  '/index.html',
  '/manifest.json',
];

// Install event - cache essential assets and force activation
self.addEventListener('install', (event) => {
  console.log('[SW] Installing new service worker...');
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => cache.addAll(PRECACHE_URLS))
      .then(() => {
        console.log('[SW] Skip waiting - forcing activation');
        return self.skipWaiting();
      })
  );
});

// Activate event - aggressively clean up ALL old caches
self.addEventListener('activate', (event) => {
  console.log('[SW] Activating new service worker...');
  const currentCaches = [CACHE_NAME, RUNTIME_CACHE, IMAGE_CACHE, API_CACHE];
  event.waitUntil(
    caches.keys()
      .then((cacheNames) => {
        console.log('[SW] Found caches:', cacheNames);
        return cacheNames.filter((cacheName) => !currentCaches.includes(cacheName));
      })
      .then((cachesToDelete) => {
        console.log('[SW] Deleting old caches:', cachesToDelete);
        return Promise.all(cachesToDelete.map((cacheToDelete) => {
          console.log('[SW] Deleting cache:', cacheToDelete);
          return caches.delete(cacheToDelete);
        }));
      })
      .then(() => {
        console.log('[SW] Taking control of all clients');
        return self.clients.claim();
      })
      .then(() => {
        console.log('[SW] Service worker activated successfully');
      })
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

  // Check if this is a realtime/critical endpoint - always bypass cache
  const shouldBypassCache = REALTIME_BYPASS_PATTERNS.some(pattern => 
    url.pathname.includes(pattern)
  ) || ADMIN_ENDPOINTS.some(endpoint => 
    url.pathname.includes(endpoint)
  );

  // Network first with cache fallback and validation for API calls
  if (url.pathname.includes('/rest/v1/') || url.pathname.includes('/functions/v1/')) {
    event.respondWith(
      (async () => {
        try {
          // Always fetch fresh for critical endpoints
          if (shouldBypassCache) {
            return await fetch(event.request);
          }

          const response = await fetch(event.request);
          if (response.status === 200) {
            const cache = await caches.open(API_CACHE);
            const clonedResponse = response.clone();
            
            // Validate response has complete data before caching
            const contentType = response.headers.get('content-type');
            if (contentType && contentType.includes('application/json')) {
              try {
                const data = await clonedResponse.clone().json();
                
                // Basic validation - ensure data has expected structure
                if (Array.isArray(data)) {
                  // For arrays, check items have id and required fields
                  const hasValidStructure = data.every(item => 
                    item && typeof item === 'object' && item.id
                  );
                  if (!hasValidStructure) {
                    console.warn('[SW] Invalid data structure, not caching', url.pathname);
                    return response;
                  }
                }
              } catch (e) {
                // If JSON parsing fails, don't cache
                return response;
              }
            }
            
            await cache.put(event.request, clonedResponse);
          }
          return response;
        } catch (error) {
          // Only use cache if not a critical endpoint
          if (!shouldBypassCache) {
            const cached = await caches.match(event.request);
            if (cached && !isCacheExpired(cached, CACHE_DURATION.api)) {
              return cached;
            }
          }
          return new Response('Offline', { status: 503 });
        }
      })()
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
