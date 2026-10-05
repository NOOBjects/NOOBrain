import { admin } from "@/lib/admin";
import { userFrom } from "@/lib/auth";

// Pedir revisão de uma ideia recusada: só o autor, só uma vez, de 10 a 300 letras. (Rota em vez de função do Supabase: não expõe nada ao navegador.)
const fail = (error: string, status: number) => Response.json({ error }, { status });

export async function POST(request: Request) {
  const user = await userFrom(request);
  if (!user) return fail("Sessão inválida.", 401);
  const b = await request.json().catch(() => null);
  const id = Number(b?.id);
  const text = typeof b?.text === "string" ? b.text.trim() : "";
  if (!id || text.length < 10 || text.length > 300) return fail("Explica em 10 a 300 letras.", 400);
  const { data, error } = await admin!.from("suggestions")
    .update({ appeal: text, appeal_at: new Date().toISOString(), status: "recurso" })
    .eq("id", id).eq("user_id", user.id).eq("status", "recusada").is("appeal", null)
    .select("id");
  if (error) return fail("Não consegui enviar. Tenta outra vez.", 500);
  if (!data?.length) return fail("Não é possível pedir revisão desta ideia (já pediste, ou não está recusada).", 409);
  return Response.json({ ok: true });
}
