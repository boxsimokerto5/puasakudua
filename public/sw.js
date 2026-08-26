const CACHE_NAME = 'puasaku-cache-v2';
const STATIC_ASSETS = [
  '/manifest.json',
  '/assets/logo.svg',
  '/android-chrome-192x192.png',
  '/android-chrome-512x512.png',
  '/apple-touch-icon.png',
  '/pwa-icon.png',
  '/favicon-32x32.png',
  '/favicon-16x16.png'
];

// Install stage - prefetch only non-HTML static assets
self.addEventListener('install', (event) => {
  self.skipWaiting();
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(STATIC_ASSETS).catch((err) => {
        console.warn('[SW] Pre-caching static assets notice:', err);
      });
    })
  );
});

// Activate stage - immediately claim clients & purge old caches
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames
          .filter((name) => name !== CACHE_NAME)
          .map((name) => caches.delete(name))
      );
    }).then(() => self.clients.claim())
  );
});

// Listen for messages from client
self.addEventListener('message', (event) => {
  if (event.data && event.data.type === 'SKIP_WAITING') {
    self.skipWaiting();
  }
  if (event.data && event.data.type === 'CLEAR_CACHE') {
    caches.keys().then((keys) => {
      keys.forEach((k) => caches.delete(k));
    });
  }
});

// Fetch stage
self.addEventListener('fetch', (event) => {
  // Only handle GET requests
  if (event.request.method !== 'GET') return;

  const url = new URL(event.request.url);

  // Exclude external APIs, Supabase, and dynamic API endpoints from caching
  if (url.pathname.startsWith('/api') || url.hostname.includes('supabase.co') || url.hostname.includes('googleapis.com')) {
    return;
  }

  // ALWAYS Network-First for HTML/Navigation, sw.js, and version.json
  const isNavigation = event.request.mode === 'navigate';
  const isHtml = event.request.headers.get('accept')?.includes('text/html');
  const isVersionCheck = url.pathname.includes('version.json') || url.pathname.includes('sw.js');

  if (isNavigation || isHtml || isVersionCheck) {
    event.respondWith(
      fetch(event.request)
        .then((networkResponse) => {
          if (networkResponse && networkResponse.status === 200 && !isVersionCheck) {
            const responseClone = networkResponse.clone();
            caches.open(CACHE_NAME).then((cache) => {
              cache.put(event.request, responseClone);
            });
          }
          return networkResponse;
        })
        .catch(async () => {
          // If network fails (offline), fall back to cached index.html or match
          const cachedResponse = await caches.match(event.request);
          if (cachedResponse) return cachedResponse;
          return caches.match('/index.html');
        })
    );
    return;
  }

  // Stale-While-Revalidate for other static assets (images, icons, etc.)
  event.respondWith(
    caches.match(event.request).then((cachedResponse) => {
      const fetchPromise = fetch(event.request)
        .then((networkResponse) => {
          if (networkResponse && networkResponse.status === 200 && networkResponse.type === 'basic') {
            const responseClone = networkResponse.clone();
            caches.open(CACHE_NAME).then((cache) => {
              cache.put(event.request, responseClone);
            });
          }
          return networkResponse;
        })
        .catch(() => cachedResponse);

      return cachedResponse || fetchPromise;
    })
  );
});
