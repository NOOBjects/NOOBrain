// Lembretes de revisão. Funcionam enquanto o app está aberto ou instalado em segundo plano.
// Lembrete com o app totalmente fechado exige "push" no servidor e fica no roteiro (ROADMAP.md).
const ON = "noobrain:remind";
const LAST = "noobrain:lastnotify";
const EVERY = 4 * 3600_000; // no máximo um lembrete a cada 4 horas

const listeners = new Set<() => void>();
export const subscribe = (cb: () => void) => { listeners.add(cb); return () => { listeners.delete(cb); }; };
const emit = () => listeners.forEach((l) => l());

export const supported = () => typeof window !== "undefined" && "Notification" in window && "serviceWorker" in navigator;

/** "na" = sem suporte ou bloqueado, "off" = desligado, "on" = ligado. */
export function snapshot(): "na" | "off" | "on" {
  if (!supported() || Notification.permission === "denied") return "na";
  try { return localStorage.getItem(ON) === "1" && Notification.permission === "granted" ? "on" : "off"; } catch { return "off"; }
}
export const serverSnapshot = () => "na" as const;

export async function enable(): Promise<boolean> {
  if (!supported()) return false;
  if ((await Notification.requestPermission()) !== "granted") { emit(); return false; }
  await navigator.serviceWorker.register("/sw.js");
  try { localStorage.setItem(ON, "1"); } catch { /* sem armazenamento */ }
  emit();
  return true;
}

export function disable() {
  try { localStorage.removeItem(ON); } catch { /* sem armazenamento */ }
  emit();
}

/** Mostra o lembrete se estiver ligado, houver cartões vencidos e a pessoa não estiver olhando o app. */
export async function notifyDue(count: number) {
  if (count < 1 || snapshot() !== "on" || !document.hidden) return;
  try {
    const last = Number(localStorage.getItem(LAST) ?? 0);
    if (Date.now() - last < EVERY) return;
    localStorage.setItem(LAST, String(Date.now()));
    const reg = await navigator.serviceWorker.ready;
    await reg.showNotification("Hora de revisar", {
      body: count === 1 ? "1 cartão está esperando por você." : `${count} cartões estão esperando por você.`,
      tag: "noobrain-due",
    });
  } catch { /* sem permissão ou sem service worker */ }
}
