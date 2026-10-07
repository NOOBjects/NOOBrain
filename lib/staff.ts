import { admin } from "./admin";
import { userFrom } from "./auth";

// Equipa do NOOBrain. Donos = ADMIN_IDS (variável da Vercel; o painel não os altera). Admins e moderadores ficam na tabela `staff`.
export type Role = "dono" | "admin" | "moderador";
export const OWNERS = (process.env.ADMIN_IDS ?? "").split(",").map((s) => s.trim()).filter(Boolean);

// O que cada papel pode fazer (ver "6.1 Papéis" em PLANO-0.11.md).
const ALLOWED = {
  ver: ["dono", "admin", "moderador"], // números, ideias, erros, opiniões, catálogo, qualidade
  moderar: ["dono", "admin", "moderador"], // responder/apagar ideias, resolver erros, refazer/apagar catálogo, mudar categoria
  pessoas: ["dono", "admin", "moderador"], // pesquisar pessoas (moderador: só @nome e perfil público)
  emails: ["dono", "admin"], // ver e-mail e dados da conta
  conta: ["dono", "admin"], // ações na conta de alguém
  apagarConta: ["dono"],
  equipa: ["dono"], // gerir a equipa
  registo: ["dono", "admin"],
  ferramentas: ["dono", "admin"], // avisos, limites, glossário, revisão do catálogo
} as const satisfies Record<string, readonly Role[]>;
export type Action = keyof typeof ALLOWED;
export const can = (role: Role | null, action: Action): boolean => !!role && (ALLOWED[action] as readonly Role[]).includes(role);

export async function roleOf(uid: string | null | undefined): Promise<Role | null> {
  if (!uid) return null;
  if (OWNERS.includes(uid)) return "dono";
  if (!admin) return null;
  const { data } = await admin.from("staff").select("role").eq("user_id", uid).maybeSingle();
  return data?.role === "admin" || data?.role === "moderador" ? data.role : null;
}

/** Quem faz o pedido e o seu papel (`null` se não for da equipa). */
export async function staffFrom(request: Request) {
  const user = await userFrom(request);
  if (!user) return null;
  const role = await roleOf(user.id);
  return role ? { user, role } : null;
}

/** Todos os ids da equipa (donos incluídos), sem papéis: serve para a etiqueta «Equipa». */
export async function staffIds(): Promise<string[]> {
  const { data } = admin ? await admin.from("staff").select("user_id") : { data: [] as { user_id: string }[] };
  return [...new Set([...OWNERS, ...(data ?? []).map((r) => r.user_id)])];
}

/** Uma linha no registo de ações (só a chave secreta lê). */
export async function logAction(actor: string, action: string, target?: string, detail?: object) {
  await admin?.from("admin_log").insert({ actor, action: action.slice(0, 40), target: target?.slice(0, 200) ?? null, detail: detail ?? null });
}
