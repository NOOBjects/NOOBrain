import { admin } from "@/lib/admin";
import { userFrom } from "@/lib/auth";
import { allow, clientKey } from "@/lib/limit";

// Recebe "Reportar erro" do tutor e do quiz. Só com sessão; grava na tabela `reports`, que só o dono do projeto lê, pelo painel.
export async function POST(request: Request) {
  if (!allow(`report:${clientKey(request)}`, 10)) return new Response(null, { status: 429 });
  const user = await userFrom(request);
  if (!user) return new Response(null, { status: 401 });
  const body = await request.json().catch(() => null);
  const what = String(body?.what ?? "").slice(0, 20);
  const detail = String(body?.detail ?? "").slice(0, 1000);
  if (!what || !detail) return new Response(null, { status: 400 });
  const { error } = await admin!.from("reports").insert({ what, detail, user_id: user.id });
  return new Response(null, { status: error ? 502 : 204 });
}
