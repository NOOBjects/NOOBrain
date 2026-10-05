// Service worker: avisos (locais e do servidor) e o app a abrir sem ligação.
// Páginas: rede primeiro; sem rede, a última cópia guardada. Ficheiros do Next (/_next/static/): cache primeiro
// (os nomes mudam a cada versão, por isso nunca ficam velhos). Nada de /api nem de outros sites passa por aqui.
const PAGES = "noobrain-pages-v1";
const STATIC = "noobrain-static-v1";
const MAX_STATIC = 150;

self.addEventListener("install", () => self.skipWaiting());
self.addEventListener("activate", (e) =>
  e.waitUntil(
    caches.keys()
      .then((keys) => Promise.all(keys.filter((k) => k.startsWith("noobrain-") && k !== PAGES && k !== STATIC).map((k) => caches.delete(k))))
      .then(() => self.clients.claim()),
  ),
);

async function trim(name, max) {
  const c = await caches.open(name);
  const keys = await c.keys();
  await Promise.all(keys.slice(0, Math.max(0, keys.length - max)).map((k) => c.delete(k)));
}

self.addEventListener("fetch", (e) => {
  const req = e.request;
  if (req.method !== "GET") return;
  const url = new URL(req.url);
  if (url.origin !== self.location.origin || url.pathname.startsWith("/api/")) return;

  if (url.pathname.startsWith("/_next/static/")) {
    e.respondWith(
      caches.match(req).then((hit) => hit || fetch(req).then((res) => {
        if (res.ok) { const copy = res.clone(); caches.open(STATIC).then((c) => c.put(req, copy)).then(() => trim(STATIC, MAX_STATIC)); }
        return res;
      })),
    );
    return;
  }

  if (req.mode === "navigate") {
    e.respondWith(
      fetch(req).then((res) => {
        if (res.ok) { const copy = res.clone(); caches.open(PAGES).then((c) => c.put(url.pathname, copy)); }
        return res;
      }).catch(() => caches.open(PAGES).then((c) => c.match(url.pathname).then((hit) => hit || c.match("/")))),
    );
  }
});

// Aviso enviado pelo servidor (web push), mesmo com o app fechado.
self.addEventListener("push", (e) => {
  let d = {};
  try { d = e.data ? e.data.json() : {}; } catch { /* sem corpo */ }
  e.waitUntil(
    self.registration.showNotification(d.title || "NOOBrain", {
      body: d.body || "",
      icon: "/icon-192.png",
      badge: "/icon-192.png",
      tag: d.tag || "noobrain",
      data: { url: d.url || "/" },
    }),
  );
});

self.addEventListener("notificationclick", (e) => {
  e.notification.close();
  const url = (e.notification.data && e.notification.data.url) || "/";
  e.waitUntil(
    self.clients.matchAll({ type: "window", includeUncontrolled: true }).then((all) => {
      const c = all.find((w) => "focus" in w);
      if (!c) return self.clients.openWindow(url);
      return c.focus().then((w) => (url !== "/" && w && "navigate" in w ? w.navigate(url).catch(() => w) : w));
    }),
  );
});
