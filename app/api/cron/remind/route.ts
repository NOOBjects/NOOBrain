import { admin } from "@/lib/admin";
import { LATEST } from "@/lib/changelog";
import { pushReady, sendPush } from "@/lib/push";
import { dueCards, wants } from "@/lib/store";
import type { State } from "@/lib/types";

export const maxDuration = 60;

const SECRET = process.env.CRON_SECRET;
const hourIn = (tz: string) => Number(new Intl.DateTimeFormat("en-GB", { hour: "numeric", hourCycle: "h23", timeZone: tz }).format(new Date()));

// Chamada de hora a hora pelo Supabase (pg_cron). Envia o lembrete a quem está entre as 9h e as 21h locais
// e ainda não recebeu nenhum nas últimas 20 h.
export async function POST(request: Request) {
  if (!SECRET || request.headers.get("authorization") !== `Bearer ${SECRET}`) return new Response(null, { status: 401 });
  if (!pushReady || !admin) return Response.json({ error: "push não configurado" }, { status: 503 });

  const { data: subs } = await admin.from("push_subscriptions").select("endpoint,p256dh,auth,tz,user_id,last_sent_at,news_sent").limit(500);
  const now = Date.now();
  const gone: string[] = [];
  const sent: string[] = [];
  const told: string[] = []; // receberam o aviso de novidades desta versão

  await Promise.all((subs ?? []).map(async (s) => {
    let hour: number;
    try { hour = hourIn(s.tz); } catch { return; }
    if (hour < 9 || hour >= 21) return;
    const { data: row } = await admin!.from("progress").select("data").eq("user_id", s.user_id).maybeSingle();
    const state = row?.data as State | undefined;
    if (!state) return;
    // Novidades: uma vez por versão marcada com `aviso`, a quem disse que sim. Um aviso de cada vez: o lembrete fica para a hora seguinte.
    if (LATEST.aviso && wants(state, "news") && s.news_sent !== LATEST.version) {
      const r = await sendPush(s, { title: "Novidades no NOOBrain", body: LATEST.title, tag: "noobrain-news", url: "/?v=novidades" });
      if (r === "gone") gone.push(s.endpoint);
      if (r === "ok") told.push(s.endpoint);
      return;
    }
    if (!wants(state, "reviews")) return;
    if (s.last_sent_at && now - new Date(s.last_sent_at).getTime() < 20 * 3600_000) return;
    const due = dueCards(state).length;
    const today = new Date().toLocaleDateString("sv", { timeZone: s.tz });
    const atRisk = hour >= 19 && state.streak > 0 && state.lastDay !== today;
    const body = due > 0 ? `Tens ${due} ${due === 1 ? "cartão" : "cartões"} para rever.` : atRisk ? `A tua sequência de ${state.streak} ${state.streak === 1 ? "dia" : "dias"} acaba hoje.` : null;
    if (!body) return;
    const r = await sendPush(s, { title: "Hora de rever", body, tag: "noobrain-due" });
    if (r === "gone") gone.push(s.endpoint);
    if (r === "ok") sent.push(s.endpoint);
  }));

  if (gone.length) await admin.from("push_subscriptions").delete().in("endpoint", gone);
  if (sent.length) await admin.from("push_subscriptions").update({ last_sent_at: new Date().toISOString() }).in("endpoint", sent);
  if (told.length) await admin.from("push_subscriptions").update({ news_sent: LATEST.version }).in("endpoint", told);
  return Response.json({ sent: sent.length, news: told.length, removed: gone.length });
}
