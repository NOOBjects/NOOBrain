import webpush from "web-push";

// Envio de avisos push (só servidor). As chaves VAPID vêm do ambiente; sem elas, nada é enviado.
const subject = process.env.VAPID_SUBJECT;
const pub = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY;
const priv = process.env.VAPID_PRIVATE_KEY;
export const pushReady = !!(subject && pub && priv);
if (pushReady) webpush.setVapidDetails(subject!, pub!, priv!);

export type Sub = { endpoint: string; p256dh: string; auth: string };
export type Payload = { title: string; body: string; tag: string; url?: string };

/** "gone" = a subscrição já não existe (apagar da base de dados). */
export async function sendPush(sub: Sub, payload: Payload): Promise<"ok" | "gone" | "fail"> {
  try {
    await webpush.sendNotification({ endpoint: sub.endpoint, keys: { p256dh: sub.p256dh, auth: sub.auth } }, JSON.stringify(payload));
    return "ok";
  } catch (e) {
    const code = (e as { statusCode?: number }).statusCode;
    return code === 404 || code === 410 ? "gone" : "fail";
  }
}
