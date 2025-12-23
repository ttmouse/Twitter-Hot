const CACHE_NAME = 'banana-hot-v11';
const MEDIA_CACHE_NAME = 'banana-media-v11';

// Assets to cache immediately on install
const PRE_CACHE_ASSETS = [
    '/',
    '/index.html',
    '/styles.css',
    '/script.js',
    '/tweet-detail-modal.js',
    '/tweet-detail-modal.css',
    '/custom-tweet-card.js',
    '/custom-tweet-card.css',
    '/libs/html2canvas.min.js',
    '/libs/jszip.min.js'
    // External libraries will be cached on first request, not pre-cached
];

self.addEventListener('install', event => {
    event.waitUntil(
        caches.open(CACHE_NAME).then(cache => {
            return cache.addAll(PRE_CACHE_ASSETS);
        })
    );
    self.skipWaiting();
});

self.addEventListener('activate', event => {
    event.waitUntil(
        caches.keys().then(cacheNames => {
            return Promise.all(
                cacheNames.map(cacheName => {
                    if (cacheName !== CACHE_NAME && cacheName !== MEDIA_CACHE_NAME) {
                        return caches.delete(cacheName);
                    }
                })
            );
        })
    );
    self.clients.claim();
});

self.addEventListener('fetch', event => {
    const url = new URL(event.request.url);

    // 0. External Libraries Caching Strategy (Network First for fresh libraries)
    if (url.hostname.includes('cdn.jsdelivr.net') || 
        url.hostname.includes('unpkg.com') ||
        (url.pathname.includes('html2canvas') || url.pathname.includes('jszip'))) {
        event.respondWith(
            caches.open(CACHE_NAME).then(cache => {
                return fetch(event.request).then(networkResponse => {
                    if (networkResponse.ok) {
                        cache.put(event.request, networkResponse.clone());
                        return networkResponse;
                    }
                    
                    // If network fails, try cache as fallback
                    return cache.match(event.request);
                }).catch(() => {
                    // Network failed completely, try cache
                    return cache.match(event.request);
                });
            })
        );
        return;
    }

    // 1. Media Caching Strategy
    const isImage =
        (url.hostname.includes('twimg.com') || url.hostname.includes('abs.twimg.com')) &&
        (url.pathname.match(/\.(jpg|jpeg|png|webp|gif|svg)$/i) || url.search.includes('format='));

    const isVideo =
        url.hostname.includes('video.twimg.com') ||
        url.pathname.endsWith('.mp4');

    if (isImage) {
        event.respondWith(
            caches.open(MEDIA_CACHE_NAME).then(cache => {
                return cache.match(event.request).then(response => {
                    // Check if we have a valid cached response
                    if (response) {
                        // If request requires CORS but cached response is opaque, ignore cache
                        // This prevents "opaque response ... not no-cors" errors
                        if (event.request.mode === 'cors' && response.type === 'opaque') {
                            // Fall through to network to get a fresh CORS response
                        } else {
                            return response;
                        }
                    }

                    return fetch(event.request).then(networkResponse => {
                        // Cache opaque responses (for cross-origin images)
                        // Note: networkResponse.ok is false for opaque responses (type === 'opaque')
                        if (networkResponse.status === 200 || networkResponse.type === 'opaque') {
                            cache.put(event.request, networkResponse.clone()).catch(() => { });
                        }
                        return networkResponse;
                    }).catch(() => null);
                });
            })
        );
        return;
    }

    if (isVideo) {
        // Videos are typically large and use Range requests (206) which Cache API doesn't handle well
        // Let the browser handle these normally via network.
        return;
    }

    // 2. Application Logic/Scripts (Stale-While-Revalidate)
    // This makes the UI feel instant even on slow connections
    if (PRE_CACHE_ASSETS.some(asset => url.pathname.endsWith(asset) || url.pathname === '/')) {
        event.respondWith(
            caches.open(CACHE_NAME).then(cache => {
                // Use ignoreSearch: true to match requests like styles.css?v=10 against styles.css
                return cache.match(event.request, { ignoreSearch: true }).then(cachedResponse => {
                    const fetchPromise = fetch(event.request).then(networkResponse => {
                        if (networkResponse.ok) {
                            cache.put(event.request, networkResponse.clone());
                        }
                        return networkResponse;
                    }).catch(err => {
                        // Swallow background fetch errors if we have a cache
                        if (cachedResponse) {
                            console.warn('[SW] Background fetch failed for ' + url.pathname, err);
                            return cachedResponse; // Keep promise chain valid
                        }
                        throw err;
                    });
                    
                    return cachedResponse || fetchPromise;
                });
            })
        );
        return;
    }

    // 3. Default (Network Only for API calls to ensure fresh data)
    // We don't cache /api/* here because we handle that via IndexedDB in script.js
});
