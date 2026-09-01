const CACHE = "izin-v2";
const DOSYALAR = ["./", "./index.html", "./manifest.webmanifest", "./icon.png"];

self.addEventListener("install", e => {
  e.waitUntil(caches.open(CACHE).then(c => c.addAll(DOSYALAR)).then(() => self.skipWaiting()));
});

self.addEventListener("activate", e => {
  e.waitUntil(caches.keys().then(ks =>
    Promise.all(ks.filter(k => k !== CACHE).map(k => caches.delete(k)))
  ).then(() => self.clients.claim()));
});

// Sayfanin kendisi: once agdan al (guncelleme hemen gelsin), yoksa onbellekten
self.addEventListener("fetch", e => {
  if (e.request.method !== "GET") return;
  const sayfaMi = e.request.mode === "navigate" || e.request.destination === "document";
  if (sayfaMi) {
    e.respondWith(
      fetch(e.request).then(r => {
        const kopya = r.clone();
        caches.open(CACHE).then(c => c.put(e.request, kopya));
        return r;
      }).catch(() => caches.match(e.request).then(r => r || caches.match("./index.html")))
    );
  } else {
    e.respondWith(caches.match(e.request).then(r => r || fetch(e.request)));
  }
});
