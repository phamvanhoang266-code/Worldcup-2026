const CACHE_NAME = "worldcup2026-v1";

const urlsToCache = [
  "./",
  "./index.html",
  "./manifest.json",
  "./icon-192.png",
  "./icon-512.png"
];

// Cài đặt Service Worker
self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => {
        console.log("Cache opened");
        return cache.addAll(urlsToCache);
      })
  );

  self.skipWaiting();
});

// Kích hoạt
self.addEventListener("activate", (event) => {
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

// Bắt request
self.addEventListener("fetch", (event) => {
  event.respondWith(
    caches.match(event.request)
      .then((response) => {

        // Có trong cache thì trả về cache
        if (response) {
          return response;
        }

        // Không có thì lấy từ mạng
        return fetch(event.request)
          .then((networkResponse) => {

            if (
              !networkResponse ||
              networkResponse.status !== 200 ||
              networkResponse.type !== "basic"
            ) {
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
