// Lembretes de revisão. Com o app aberto ou em segundo plano, o próprio navegador avisa (`notifyDue`).
// Com o app fechado, o servidor envia um aviso push (`/api/cron/remind`) para as subscrições guardadas aqui.
import { supabase } from "./supabase";

const VAPID = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY;
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

const toBytes = (b64: string) => Uint8Array.from(atob(b64.replace(/-/g, "+").replace(/_/g, "/").padEnd(Math.ceil(b64.length / 4) * 4, "=")), (c) => c.charCodeAt(0));

/** No iPhone os avisos só funcionam com o app instalado no ecrã principal. */
export const needsInstall = () => typeof window !== "undefined" && /iPhone|iPad|iPod/.test(navigator.userAgent) && !window.matchMedia("(display-mode: standalone)").matches;

/** Subscreve o aparelho ao push e guarda a subscrição na conta. Se falhar, ficam só os avisos locais. */
async function subscribePush(reg: ServiceWorkerRegistration) {
  if (!VAPID || !supabase) return;
  const { data } = await supabase.auth.getSession();
  const uid = data.session?.user.id;
  if (!uid) return;
  const sub = (await reg.pushManager.getSubscription()) ?? (await reg.pushManager.subscribe({ userVisibleOnly: true, applicationServerKey: toBytes(VAPID) }));
  const j = sub.toJSON();
  await supabase.from("push_subscriptions").upsert({
    endpoint: sub.endpoint, user_id: uid, p256dh: j.keys?.p256dh ?? "", auth: j.keys?.auth ?? "", tz: Intl.DateTimeFormat().resolvedOptions().timeZone,
  });
}

export async function enable(): Promise<boolean> {
  if (!supported()) return false;
  if ((await Notification.requestPermission()) !== "granted") { emit(); return false; }
  const reg = await navigator.serviceWorker.register("/sw.js");
  try { await subscribePush(await navigator.serviceWorker.ready.then(() => reg)); } catch { /* sem push: ficam os avisos locais */ }
  try { localStorage.setItem(ON, "1"); } catch { /* sem armazenamento */ }
  emit();
  return true;
}

export async function disable() {
  try { localStorage.removeItem(ON); } catch { /* sem armazenamento */ }
  emit();
  try {
    const reg = await navigator.serviceWorker.getRegistration();
    const sub = await reg?.pushManager.getSubscription();
    if (!sub) return;
    await supabase?.from("push_subscriptions").delete().eq("endpoint", sub.endpoint);
    await sub.unsubscribe();
  } catch { /* nada a limpar */ }
}

/** Mostra o lembrete se estiver ligado, houver cartões vencidos e a pessoa não estiver olhando o app. */
export async function notifyDue(count: number) {
  if (count < 1 || snapshot() !== "on" || !document.hidden) return;
  try {
    const last = Number(localStorage.getItem(LAST) ?? 0);
    if (Date.now() - last < EVERY) return;
    localStorage.setItem(LAST, String(Date.now()));
    const reg = await navigator.serviceWorker.ready;
    await reg.showNotification("Hora de rever", {
      body: count === 1 ? "1 cartão está à tua espera." : `${count} cartões estão à tua espera.`,
      tag: "noobrain-due",
    });
  } catch { /* sem permissão ou sem service worker */ }
}
