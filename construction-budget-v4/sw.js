
const CACHE_NAME = 'construction-budget-v1';
const URLS_TO_CACHE = [
  '/',
  '/index.html',
  '/index.tsx',
  '/styles.css',
  // External Dependencies (CDNs)
  'https://cdn.tailwindcss.com',
  'https://cdn.jsdelivr.net/npm/shepherd.js@10.0.1/dist/css/shepherd.css',
  'https://fonts.googleapis.com/css2?family=Inter:wght@100..900&display=swap',
  'https://cdnjs.cloudflare.com/ajax/libs/xlsx/0.18.5/xlsx.full.min.js'
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => {
        // We try to cache what we can, but don't fail if one fails (like external CDNs sometimes)
        return cache.addAll(URLS_TO_CACHE).catch(err => console.warn('Some assets failed to cache:', err));
      })
  );
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (cacheName !== CACHE_NAME) {
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
  self.clients.claim();
});

self.addEventListener('fetch', (event) => {
  // Navigation requests: Network first, then cache (to ensure fresh app logic)
  if (event.request.mode === 'navigate') {
    event.respondWith(
      fetch(event.request).catch(() => {
        return caches.match(event.request);
      })
    );
    return;
  }

  // API calls or Gemini: Network only (handled by app logic if offline)
  if (event.request.url.includes('generativelanguage.googleapis.com')) {
    return;
  }

  // Static Assets: Cache First, then Network
  event.respondWith(
    caches.match(event.request).then((response) => {
      return response || fetch(event.request);
    })
  );
});
