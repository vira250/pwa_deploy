const CACHE_NAME = "pwa-cache-v2";

const urlsToCache = [
  "./",
  "./index.html",
  "./offline.html"
];

// Install
self.addEventListener("install", (event) => {
  console.log("Installing...");

  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => cache.addAll(urlsToCache))
      .catch(err => console.error("Cache failed:", err))
  );

  self.skipWaiting();
});

// Activate
self.addEventListener("activate", (event) => {
  console.log("Activated...");

  event.waitUntil(
    caches.keys().then(names =>
      Promise.all(
        names.map(name => {
          if (name !== CACHE_NAME) {
            return caches.delete(name);
          }
        })
      )
    )
  );

  self.clients.claim();
});

// Fetch
self.addEventListener("fetch", (event) => {
  event.respondWith(
    fetch(event.request)
      .catch(() =>
        caches.match(event.request)
          .then(res => res || caches.match("./offline.html"))
      )
  );
});

// Background Sync (safe version)
self.addEventListener("sync", (event) => {
  if (event.tag === "sync-data") {
    event.waitUntil(
      fetch("/api/sync-data", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: "Synced after offline" })
      }).catch(err => console.log("Sync failed:", err))
    );
  }
});