// Service worker mínimo: serve só para mostrar lembretes de revisão e abrir o app ao tocar neles.
self.addEventListener("install", () => self.skipWaiting());
self.addEventListener("activate", (e) => e.waitUntil(self.clients.claim()));
self.addEventListener("notificationclick", (e) => {
  e.notification.close();
  e.waitUntil(
    self.clients.matchAll({ type: "window", includeUncontrolled: true }).then((all) => {
      for (const c of all) if ("focus" in c) return c.focus();
      return self.clients.openWindow("/");
    }),
  );
});
