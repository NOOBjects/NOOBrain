// Service worker: mostra os avisos (locais e do servidor) e abre o app ao tocar neles.
self.addEventListener("install", () => self.skipWaiting());
self.addEventListener("activate", (e) => e.waitUntil(self.clients.claim()));

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
