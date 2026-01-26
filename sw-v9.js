// MBSinav Service Worker - NUCLEAR MODE (No Caching)
const CACHE_NAME = 'static-cache-v9.2.0-FORCE'; // Updated cache name-nuclear';

self.addEventListener('install', (event) => {
    self.skipWaiting();
    // Do not cache anything.
    console.log('[SW] Installed (Nuclear Mode)');
});

self.addEventListener('activate', (event) => {
    // Claim clients immediately
    event.waitUntil(
        Promise.all([
            self.clients.claim(),
            // Delete ALL caches
            caches.keys().then((keyList) => {
                return Promise.all(keyList.map((key) => {
                    console.log('[SW] Deleting cache:', key);
                    return caches.delete(key);
                }));
            })
        ])
    );
});

self.addEventListener('fetch', (event) => {
    // Network Only - No Cache
    event.respondWith(fetch(event.request));
});
