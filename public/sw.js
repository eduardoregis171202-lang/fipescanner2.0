const CACHE_NAME = 'fipe-scanner-v2';
const STATIC_CACHE = 'fipe-static-v2';
const API_CACHE = 'fipe-api-v2';

const STATIC_ASSETS = [
  '/',
  '/index.html',
  '/manifest.json'
];

const API_BASE = 'https://parallelum.com.br/fipe/api/v1';

// Install - cache static assets
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(STATIC_CACHE).then((cache) => {
      return cache.addAll(STATIC_ASSETS);
    })
  );
  self.skipWaiting();
});

// Activate - clean old caches
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) => {
      return Promise.all(
        keys
          .filter((key) => key !== STATIC_CACHE && key !== API_CACHE)
          .map((key) => caches.delete(key))
      );
    })
  );
  self.clients.claim();
});

// Fetch - Network First for API, Cache First for static
self.addEventListener('fetch', (event) => {
  const { request } = event;
  const url = new URL(request.url);

  // API requests - Network First with Cache Fallback
  // IMPORTANTE: sempre retornar uma Response válida (mesmo sem cache), senão o fetch do app falha.
  if (url.origin === 'https://parallelum.com.br') {
    event.respondWith(
      (async () => {
        try {
          const response = await fetch(request);

          // Clone and cache successful responses
          if (response && response.ok) {
            const clonedResponse = response.clone();
            try {
              const cache = await caches.open(API_CACHE);
              await cache.put(request, clonedResponse);
            } catch (e) {
              // Cache pode falhar (ex: resposta opaque) - não deve quebrar a navegação
              console.warn('API cache put failed:', e);
            }
          }

          return response;
        } catch (e) {
          // Fallback to cache when offline
          const cached = await caches.match(request);
          if (cached) return cached;

          // Sem cache: retornar erro JSON (evita Promise rejeitada/Response undefined)
          return new Response(JSON.stringify({ error: 'offline_or_blocked' }), {
            status: 503,
            headers: { 'Content-Type': 'application/json' },
          });
        }
      })()
    );
    return;
  }

  // Static assets - Cache First
  if (request.destination === 'document' || 
      request.destination === 'script' || 
      request.destination === 'style' ||
      request.destination === 'image') {
    event.respondWith(
      caches.match(request).then((cachedResponse) => {
        if (cachedResponse) {
          // Return cached, but also update cache in background
          fetch(request).then((response) => {
            if (response.ok) {
              caches.open(STATIC_CACHE).then((cache) => {
                cache.put(request, response);
              });
            }
          });
          return cachedResponse;
        }
        return fetch(request).then((response) => {
          if (response.ok) {
            const clonedResponse = response.clone();
            caches.open(STATIC_CACHE).then((cache) => {
              cache.put(request, clonedResponse);
            });
          }
          return response;
        });
      })
    );
    return;
  }

  // Default - Network First
  event.respondWith(
    fetch(request).catch(() => caches.match(request))
  );
});
