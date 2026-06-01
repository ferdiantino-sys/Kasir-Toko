const CACHE_NAME = "kasir-pos-v1";
const ASSETS = [
  "./",
  "./index.html",
  "./style.css",
  "./db.js",
  "./app.js",
  "./manifest.json",
  "./icon-512.png"
];

// Event Install - Menyimpan aset ke cache
self.addEventListener("install", (e) => {
  e.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => {
        return cache.addAll(ASSETS);
      })
      .then(() => self.skipWaiting())
  );
});

// Event Aktifkan - Membersihkan cache lama
self.addEventListener("activate", (e) => {
  e.waitUntil(
    caches.keys().then((keys) => {
      return Promise.all(
        keys.map((key) => {
          if (key !== CACHE_NAME) {
            return caches.delete(key);
          }
        })
      );
    }).then(() => self.clients.claim())
  );
});

// Event Fetch - Mengambil dari cache (cache-first)
self.addEventListener("fetch", (e) => {
  e.respondWith(
    caches.match(e.request).then((cachedResponse) => {
      if (cachedResponse) {
        return cachedResponse;
      }
      return fetch(e.request).then((networkResponse) => {
        return networkResponse;
      });
    }).catch(() => {
      if (e.request.mode === "navigate") {
        return caches.match("./index.html");
      }
    })
  );
});
