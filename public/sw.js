const CACHE_NAME = "ceasa-pesquisa-v2";
const ASSETS_TO_CACHE = [
  "/",
  "/index.html",
  "/manifest.json",
  "/sw.js",
  "/favicon.png",
  "/apple-touch-icon.png",
  "/favicon-96x96.png",
  "/favicon.ico",
  "/web-app-manifest-192x192.png",
  "/web-app-manifest-512x512.png",
  "/icon.png",
  "/splash-icon.png",
  "/adaptative-icon.png",
];

// Instalação: Salva os arquivos essenciais no cache
self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      // Usamos um map para tentar adicionar um por um
      // Assim, se um falhar, ele apenas loga o erro mas não trava o SW
      return Promise.allSettled(
        ASSETS_TO_CACHE.map((url) => {
          return cache
            .add(url)
            .catch((err) => console.error("Falha ao cachear:", url, err));
        })
      );
    })
  );
});

// Ativação: Limpa caches antigos
self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys().then((keys) => {
      return Promise.all(
        keys
          .filter((key) => key !== CACHE_NAME)
          .map((key) => caches.delete(key))
      );
    })
  );
});

// Estratégia: Tenta carregar do cache primeiro, se falhar, vai na rede
self.addEventListener("fetch", (event) => {
  event.respondWith(
    caches.match(event.request).then((cachedResponse) => {
      if (cachedResponse) {
        return cachedResponse; // Retorna do cache se existir
      }
      return fetch(event.request).then((response) => {
        // Se for um arquivo do nosso site, salva uma cópia no cache para a próxima vez
        if (response.ok && event.request.url.startsWith(self.location.origin)) {
          const responseToCache = response.clone();
          caches.open(CACHE_NAME).then((cache) => {
            cache.put(event.request, responseToCache);
          });
        }
        return response;
      });
    })
  );
});
