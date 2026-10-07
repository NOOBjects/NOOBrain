import { admin } from "@/lib/admin";
import { runAction } from "@/lib/admin-actions";
import * as read from "@/lib/admin-read";
import { can, staffFrom, type Action } from "@/lib/staff";

export const maxDuration = 60; // a procura de palavras com IA e a revisão do catálogo podem demorar

// Painel de administração. Donos: contas em ADMIN_IDS (variável só do servidor). Admins e moderadores: tabela `staff`.
// Usa a chave secreta: lê e muda o que o RLS esconde. Cada leitura e cada ação confere o papel de quem pede.
const fail = (error: string, status: number) => Response.json({ error }, { status });

/** ?o=me → { role, admin }; ?o=<separador> → os dados desse separador. */
export async function GET(request: Request) {
  const who = await staffFrom(request);
  const url = new URL(request.url);
  const o = url.searchParams.get("o") ?? "";
  if (o === "me") return Response.json({ role: who?.role ?? null, admin: !!who }); // `admin` fica por compatibilidade com versões antigas da app
  if (!who || !admin) return fail("Sem acesso.", 403);
  const { role, user } = who;
  const need = (a: Action) => (can(role, a) ? null : fail("Sem permissão para isto.", 403));
  const guard = async <T>(a: Action, run: () => Promise<T>) => need(a) ?? Response.json(await run());
  switch (o) {
    case "resumo": return guard("ver", () => read.resumo(user.id));
    case "ideias": return guard("ver", () => read.ideias());
    case "erros": return guard("ver", () => read.erros());
    case "opinioes": return guard("ver", () => read.opinioes());
    case "catalogo": return guard("ver", () => read.catalogo());
    case "qualidade": return guard("ver", () => read.qualidade());
    case "pessoas": return guard("pessoas", () => read.pessoas(url.searchParams.get("q") ?? "", role));
    case "pessoa": return guard("pessoas", async () => (await read.pessoa(url.searchParams.get("id") ?? "", role)) ?? { error: "Não encontrei." });
    case "ferramentas": return guard("ferramentas", () => read.ferramentas(user.id));
    case "equipa": return guard("equipa", () => read.equipa());
    case "registo": return guard("registo", () => read.registo());
    default: return fail("Secção desconhecida.", 404);
  }
}

export async function POST(request: Request) {
  const who = await staffFrom(request);
  if (!who || !admin) return fail("Sem acesso.", 403);
  const b = await request.json().catch(() => null);
  if (!b || typeof b !== "object") return fail("Pedido inválido.", 400);
  return runAction(b as Record<string, unknown>, who.user, who.role, request);
}
