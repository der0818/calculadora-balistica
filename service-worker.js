// service-worker.js
const CACHE_NAME = 'calculadora-balistica-v1';
const ASSETS = [
  '/',
  '/index.html',
  '/app.js',
  '/styles.css',
  '/manifest.json',
  '/icons/icon-192x192.png',
  '/icons/icon-512x512.png',
  '/favicon.ico'
];

// Instalación del Service Worker y caché de recursos
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => {
        return cache.addAll(ASSETS);
      })
      .then(() => self.skipWaiting())
  );
});

// Activación y limpieza de caches antiguos
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keyList) => {
      return Promise.all(
        keyList.map((key) => {
          if (key !== CACHE_NAME) {
            return caches.delete(key);
          }
        })
      );
    })
    .then(() => self.clients.claim())
  );
});

// Estrategia de caché: Cache First, luego red
self.addEventListener('fetch', (event) => {
  event.respondWith(
    caches.match(event.request)
      .then((response) => {
        // Si se encuentra en caché, devolver desde la caché
        if (response) {
          return response;
        }
        // De lo contrario, fetch desde la red
        return fetch(event.request)
          .then((netResponse) => {
            // No cachear respuestas de terceros o errores
            if (!netResponse || netResponse.status !== 200 || netResponse.type !== 'basic') {
              return netResponse;
            }
            
            // Clonar la respuesta para caché y para el navegador
            const responseToCache = netResponse.clone();
            
            caches.open(CACHE_NAME)
              .then((cache) => {
                cache.put(event.request, responseToCache);
              });
              
            return netResponse;
          });
      })
      .catch(() => {
        // Si todo falla, puede devolver una página offline personalizada
        // Para simplificar, aquí no implementamos esta funcionalidad
      })
  );
});
