// ==========================================
// PRAYOSHA SERVICE WORKER
// Handles offline caching and resource routing
// ==========================================

// BUMPED TO v2: This forces mobile devices to clear the old cache and download the new UI fixes
const CACHE_NAME = 'prayosha-app-cache-v2';
const ASSETS_TO_CACHE = [
    './',
    './index.html',
    './css/style.css',
    './css/login.css',
    './js/auth.js',
    './js/Director_Dashboard.js',
    './assets/logo.jpg',
    './assets/background.jpg',
    'https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css'
];

// 1. INSTALL EVENT - Caches all static assets immediately
self.addEventListener('install', (event) => {
    event.waitUntil(
        caches.open(CACHE_NAME)
            .then((cache) => {
                console.log('Opened cache and caching assets.');
                return cache.addAll(ASSETS_TO_CACHE);
            })
            .then(() => self.skipWaiting())
    );
});

// 2. ACTIVATE EVENT - Cleans up any old versions of the cache
self.addEventListener('activate', (event) => {
    event.waitUntil(
        caches.keys().then((cacheNames) => {
            return Promise.all(
                cacheNames.map((cacheName) => {
                    if (cacheName !== CACHE_NAME) {
                        console.log('Clearing old cache:', cacheName);
                        return caches.delete(cacheName);
                    }
                })
            );
        }).then(() => self.clients.claim())
    );
});

// 3. FETCH EVENT - Intercepts requests and serves from cache first, then network
self.addEventListener('fetch', (event) => {
    // We do NOT cache API calls (POST requests) to the Google Apps Script backend
    if (event.request.method !== 'GET') return;

    event.respondWith(
        caches.match(event.request)
            .then((cachedResponse) => {
                if (cachedResponse) {
                    return cachedResponse;
                }
                return fetch(event.request).then((networkResponse) => {
                    if (!networkResponse || networkResponse.status !== 200 || networkResponse.type !== 'basic') {
                        return networkResponse;
                    }
                    const responseToCache = networkResponse.clone();
                    caches.open(CACHE_NAME)
                        .then((cache) => {
                            cache.put(event.request, responseToCache);
                        });
                    return networkResponse;
                });
            })
    );
});
