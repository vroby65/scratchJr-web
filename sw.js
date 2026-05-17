const SHELL_CACHE = "scratchjr-shell-v3";
const RUNTIME_CACHE = "scratchjr-runtime-v3";
const SHELL_FILES = ["./", "./index.html", "./styles.css", "./app.js"];

self.addEventListener("install", (event) => {
  self.skipWaiting();
  event.waitUntil(
    caches.open(SHELL_CACHE).then((cache) => {
      return cache.addAll(SHELL_FILES);
    })
  );
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    (async () => {
      const names = await caches.keys();
      await Promise.all(names.filter((name) => name !== SHELL_CACHE && name !== RUNTIME_CACHE).map((name) => caches.delete(name)));
      await self.clients.claim();
    })()
  );
});

self.addEventListener("fetch", (event) => {
  if (event.request.method !== "GET") {
    return;
  }

  const url = new URL(event.request.url);
  if (url.origin !== self.location.origin) {
    return;
  }

  if (url.pathname.endsWith("/sync-assets.php") || url.pathname.endsWith("sync-assets.php")) {
    return;
  }

  if (event.request.mode === "navigate") {
    event.respondWith(networkFirst(event.request, SHELL_CACHE));
    return;
  }

  if (isRuntimeAsset(url.pathname)) {
    event.respondWith(cacheFirst(event.request, RUNTIME_CACHE));
    return;
  }

  event.respondWith(networkFirst(event.request, RUNTIME_CACHE));
});

function isRuntimeAsset(pathname) {
  return /\/assets\/|\.json$|\.mp3$|\.wav$|\.svg$|\.png$|\.jpg$|\.jpeg$|\.gif$|\.webp$/i.test(pathname);
}

async function cacheFirst(request, cacheName) {
  const cache = await caches.open(cacheName);
  const cached = await cache.match(request);
  if (cached) {
    return cached;
  }
  const response = await fetch(request);
  if (response.ok) {
    cache.put(request, response.clone());
  }
  return response;
}

async function networkFirst(request, cacheName) {
  const cache = await caches.open(cacheName);
  try {
    const response = await fetch(request);
    if (response.ok) {
      cache.put(request, response.clone());
    }
    return response;
  } catch (error) {
    const cached = await cache.match(request);
    if (cached) {
      return cached;
    }
    throw error;
  }
}
