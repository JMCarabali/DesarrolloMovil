// public/service-worker.js

const CACHE_NAME = "proyecto-temporal-pwa-v1";

const APP_SHELL = [
  "/",
  "/index.html",
  "/manifest.json"
];

// Instalación: guardamos el App Shell (igual que en la diapositiva 8)
self.addEventListener("install", event => {
  event.waitUntil(
    caches.open(CACHE_NAME).then(cache => cache.addAll(APP_SHELL))
  );
});

// Activación: borramos caches viejos (igual que en la diapositiva 8)
self.addEventListener("activate", event => {
  event.waitUntil(
    caches.keys().then(keys =>
      Promise.all(
        keys
          .filter(key => key !== CACHE_NAME)
          .map(key => caches.delete(key))
      )
    )
  );
});

// Fetch: aquí decidimos la estrategia según el tipo de recurso
self.addEventListener("fetch", event => {
  const request = event.request;

  if (request.method !== "GET") return;

  // 1) HTML -> Network First (para evitar versiones viejas del index)
  if (request.mode === "navigate" || request.destination === "document") {
    event.respondWith(networkFirst(request));
    return;
  }

  // 2) JS y CSS -> Cache First (porque tienen hash en el nombre)
  if (request.destination === "script" || request.destination === "style") {
    event.respondWith(cacheFirst(request));
    return;
  }

  // 3) Imágenes -> Cache First + Stale While Revalidate
  if (request.destination === "image") {
    event.respondWith(staleWhileRevalidate(request));
    return;
  }

  // 4) Todo lo demás (por ejemplo, llamadas a una API) -> Network First
  event.respondWith(networkFirst(request));
});

// --- Estrategia: Network First ---
function networkFirst(request) {
  return fetch(request)
    .then(response => {
      const clone = response.clone();
      caches.open(CACHE_NAME).then(cache => cache.put(request, clone));
      return response;
    })
    .catch(() => caches.match(request));
}

// --- Estrategia: Cache First ---
function cacheFirst(request) {
  return caches.match(request).then(cachedResponse => {
    return cachedResponse || fetch(request).then(response => {
      const clone = response.clone();
      caches.open(CACHE_NAME).then(cache => cache.put(request, clone));
      return response;
    });
  });
}

// --- Estrategia: Stale While Revalidate ---
function staleWhileRevalidate(request) {
  return caches.open(CACHE_NAME).then(cache => {
    return cache.match(request).then(cachedResponse => {
      const fetchPromise = fetch(request).then(networkResponse => {
        cache.put(request, networkResponse.clone());
        return networkResponse;
      });

      // Devolvemos lo que haya en cache de inmediato (si existe),
      // y en paralelo actualizamos el cache con la versión nueva
      return cachedResponse || fetchPromise;
    });
  });
}