const CACHE_NAME = 'cine-ark-v4';
const ASSETS = [
  './',
  './index.html',
  './manifest.json',
  'https://unpkg.com/vue@3/dist/vue.global.js',
  'https://cdn.tailwindcss.com'
];
self.addEventListener('install', (e) => {
  e.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      // Usamos o addAll mas capturamos erros para não quebrar o SW
      return cache.addAll(ASSETS).catch(err => console.warn("Aviso: Alguns assets falharam no cache inicial", err));
    })
  );
  self.skipWaiting();
});

self.addEventListener('fetch', (e) => {
  // Estratégia para Imagens: Cache First (Poupamos dados e garantimos offline)
  if (e.request.destination === 'image') {
    e.respondWith(
      caches.open('cine-ark-images').then((cache) => {
        return cache.match(e.request).then((res) => {
          return res || fetch(e.request).then((networkRes) => {
            cache.put(e.request, networkRes.clone());
            return networkRes;
          });
        });
      })
    );
    return;
  }

  // Estratégia para o resto: Network First com fallback para Cache
  e.respondWith(
    fetch(e.request).catch(() => caches.match(e.request))
  );
});