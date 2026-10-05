import { admin } from "@/lib/admin";
import { userFrom } from "@/lib/auth";
import { VERSION } from "@/lib/config";

// Regista, consulta e retira o aparelho desta conta. O endpoint é secreto (só o próprio navegador o conhece),
// por isso quem o envia pode "roubá-lo" a outra conta: é o que corrige o aparelho preso à conta errada.
const bad = (error: string, status = 400) => Response.json({ error }, { status });
const endpointOk = (v: unknown): v is string => typeof v === "string" && v.startsWith("https://") && v.length <= 1000;

export async function POST(request: Request) {
  const user = await userFrom(request);
  if (!user) return bad("Sessão inválida.", 401);
  const b = await request.json().catch(() => null);
  if (!b || !endpointOk(b.endpoint) || typeof b.p256dh !== "string" || b.p256dh.length > 200 || typeof b.auth !== "string" || b.auth.length > 100 || typeof b.tz !== "string" || b.tz.length > 60) return bad("Pedido inválido.");
  const { error } = await admin!.from("push_subscriptions").upsert({ endpoint: b.endpoint, user_id: user.id, p256dh: b.p256dh, auth: b.auth, tz: b.tz, news_sent: VERSION }); // um aparelho novo não recebe o aviso da versão que já está a ver
  if (error) return bad("Não consegui guardar o aparelho. Tenta outra vez.", 500);
  return Response.json({ ok: true });
}

export async function DELETE(request: Request) {
  const user = await userFrom(request);
  if (!user) return bad("Sessão inválida.", 401);
  const b = await request.json().catch(() => null);
  if (!b || !endpointOk(b.endpoint)) return bad("Pedido inválido.");
  await admin!.from("push_subscriptions").delete().eq("endpoint", b.endpoint).eq("user_id", user.id);
  return Response.json({ ok: true });
}

export async function GET(request: Request) {
  const user = await userFrom(request);
  if (!user) return bad("Sessão inválida.", 401);
  const endpoint = new URL(request.url).searchParams.get("endpoint");
  if (!endpointOk(endpoint)) return bad("Pedido inválido.");
  const { data } = await admin!.from("push_subscriptions").select("endpoint").eq("endpoint", endpoint).eq("user_id", user.id).maybeSingle();
  return Response.json({ mine: !!data });
}
