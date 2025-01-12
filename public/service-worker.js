const CACHE_NAME = "pastas-aranda-cache-v1";
const urlsToCache = [
    "/login/login.html", // Página principal
    "/images/icons/icon-192x192.png", // Ícono para la PWA
    "/images/icons/icon-512x512.png", // Ícono para la PWA
];

self.addEventListener("install", (event) => {
    event.waitUntil(
        caches.open(CACHE_NAME).then((cache) => {
            return cache.addAll(urlsToCache);
        })
    );
    console.log("Service Worker instalado");
});

self.addEventListener("activate", (event) => {
    event.waitUntil(
        caches.keys().then((cacheNames) => {
            return Promise.all(
                cacheNames.map((cacheName) => {
                    if (cacheName !== CACHE_NAME) {
                        console.log("Borrando caché antigua", cacheName);
                        return caches.delete(cacheName);
                    }
                })
            );
        })
    );
    console.log("Service Worker activado");
});

self.addEventListener("fetch", (event) => {
    event.respondWith(
        caches.match(event.request).then((response) => {
            return response || fetch(event.request);
        })
    );
});
