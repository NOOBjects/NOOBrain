import { allow, clientKey } from "@/lib/limit";

// Recebe "Reportar erro" do tutor e do quiz. Sem Supabase, só registra no log do servidor;
// com o Supabase configurado grava na tabela `reports`, que só o dono do projeto lê, pelo painel.
export async function POST(request: Request) {
  if (!allow(`report:${clientKey(request)}`, 10)) return new Response(null, { status: 429 });
  const body = await request.json().catch(() => null);
  const what = String(body?.what ?? "").slice(0, 20);
  const detail = String(body?.detail ?? "").slice(0, 1000);
  if (!what || !detail) return new Response(null, { status: 400 });
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_KEY;
  if (!url || !key) {
    console.log("[report]", what, detail);
    return new Response(null, { status: 204 });
  }
  const res = await fetch(`${url}/rest/v1/reports`, {
    method: "POST",
    headers: { apikey: key, authorization: `Bearer ${key}`, "content-type": "application/json", prefer: "return=minimal" },
    body: JSON.stringify({ what, detail }),
  });
  return new Response(null, { status: res.ok ? 204 : 502 });
}
