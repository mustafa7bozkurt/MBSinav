// MBSinav Service Worker - v10.0.0
const CACHE_NAME = 'static-cache-v10.0.0-FORCE';

self.addEventListener('install', (event) => {
    self.skipWaiting();
    console.log('[SW] Installed (v10.0.0)');
});

self.addEventListener('activate', (event) => {
    event.waitUntil(
        Promise.all([
            self.clients.claim(),
            // Delete ALL old caches
            caches.keys().then((keyList) => {
                return Promise.all(keyList.map((key) => {
                    if (key !== CACHE_NAME) {
                        console.log('[SW] Removing old cache', key);
                        return caches.delete(key);
                    }
                }));
            })
        ])
    );
});

self.addEventListener('fetch', (event) => {
    // Network First strategy to ensure fresh content
    event.respondWith(
        fetch(event.request).catch(() => {
            return caches.match(event.request);
        })
    );
});
