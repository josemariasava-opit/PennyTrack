// Define a cache name for versioning
const CACHE_NAME = "pennytrack-v1";

// List of assets to cache (add all critical files here)
const ASSETS_TO_CACHE = [
  "/",
  "/index.html",
  "/tracker.html",
  "/about.html",
  "/styles.css", // Your main CSS file
  "/script.js",  // Your main JavaScript file
  "/sw.js",      // The service worker itself
  "images/icons/icon-100.png"
];

// Install Event: Cache all assets when the service worker is installed
self.addEventListener("install", (event) => {
  console.log("[Service Worker] Installing...");
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      console.log("[Service Worker] Caching assets...");
      return cache.addAll(ASSETS_TO_CACHE);
    })
  );
});

// Activate Event: Clean up old caches when the service worker is activated
self.addEventListener("activate", (event) => {
  console.log("[Service Worker] Activating...");
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cache) => {
          if (cache !== CACHE_NAME) {
            console.log(`[Service Worker] Deleting old cache: ${cache}`);
            return caches.delete(cache);
          }
        })
      );
    })
  );
});

// Fetch Event: Serve cached assets or fetch from the network
self.addEventListener("fetch", (event) => {
  event.respondWith(
    caches.match(event.request).then((cachedResponse) => {
      // If the asset is cached, return it
      if (cachedResponse) {
        console.log(`[Service Worker] Serving from cache: ${event.request.url}`);
        return cachedResponse;
      }

      // Otherwise, fetch from the network
      console.log(`[Service Worker] Fetching from network: ${event.request.url}`);
      return fetch(event.request).catch(() => {
        // If fetching fails (e.g., offline), return a fallback response
        console.log(`[Service Worker] Network request failed for: ${event.request.url}`);
        return new Response("You are offline. Please check your internet connection.", {
          status: 503,
          statusText: "Service Unavailable",
        });
      });
    })
  );
});