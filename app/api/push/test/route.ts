import { admin } from "@/lib/admin";
import { userFrom } from "@/lib/auth";
import { pushReady, sendPush } from "@/lib/push";

// "Enviar aviso de teste" nas Definições: manda um aviso a todos os aparelhos desta conta.
export async function POST(request: Request) {
  const user = await userFrom(request);
  if (!user) return Response.json({ error: "Sessão inválida." }, { status: 401 });
  if (!pushReady) return Response.json({ error: "Os avisos ainda não estão configurados no servidor." }, { status: 503 });
  const { data } = await admin!.from("push_subscriptions").select("endpoint,p256dh,auth").eq("user_id", user.id);
  if (!data?.length) return Response.json({ error: "Este aparelho ainda não tem os lembretes ligados." }, { status: 404 });
  const results = await Promise.all(data.map((s) => sendPush(s, { title: "NOOBrain", body: "Os avisos estão a funcionar.", tag: "noobrain-test" })));
  const gone = data.filter((_, i) => results[i] === "gone").map((s) => s.endpoint);
  if (gone.length) await admin!.from("push_subscriptions").delete().in("endpoint", gone);
  return Response.json({ sent: results.filter((r) => r === "ok").length });
}
