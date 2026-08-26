const CACHE = "super8-v19";
const ARQUIVOS = ["./", "./index.html", "./manifest.webmanifest", "./icone-192.png", "./icone-512.png"];
self.addEventListener("install", e => {
  // busca ignorando o cache do navegador, senao a versao nova pode nem chegar
  e.waitUntil(caches.open(CACHE).then(c => Promise.all(
    ARQUIVOS.map(u => fetch(u, { cache: "reload" }).then(r => c.put(u, r)).catch(() => {}))
  )));
});
self.addEventListener("message", e => { if(e.data === "aplicar") self.skipWaiting(); });
self.addEventListener("activate", e => {
  e.waitUntil(caches.keys()
    .then(ks => Promise.all(ks.filter(k => k !== CACHE).map(k => caches.delete(k))))
    .then(() => self.clients.claim()));
});
self.addEventListener("fetch", e => {
  if(e.request.method !== "GET") return;
  e.respondWith(
    caches.match(e.request).then(r => r || fetch(e.request).then(resp => {
      if(resp && resp.status === 200 && resp.type === "basic"){
        const copia = resp.clone();
        caches.open(CACHE).then(c => c.put(e.request, copia));
      }
      return resp;
    }).catch(() => caches.match("./index.html")))
  );
});
