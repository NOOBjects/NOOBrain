import { admin } from "./admin";
import { userFrom, isSeed } from "./auth";

// Cotas diárias da IA gratuita: por pessoa e no total do app (o banco conta, ver `consume_ai`).
const LIMITS = { trail: 5, lesson: 25, tutor: 40 } as const;
const GLOBAL_MAX = Number(process.env.AI_DAILY_MAX) || 2500; // abaixo dos ~3000 pedidos/dia que somam os modelos gratuitos

const fail = (error: string, status: number) => Response.json({ error }, { status });

/** Quem pede. Sem sessão: `Response` 401. O script de sementes (local) passa sem conta e sem cota. */
export async function requireUser(request: Request) {
  if (isSeed(request)) return { uid: null as string | null };
  const user = await userFrom(request);
  return user ? { uid: user.id as string | null } : fail("Inicia sessão para usar a IA.", 401);
}

/** Gasta 1 da cota do dia. Chamar só quando o pedido vai mesmo à IA. Devolve a resposta de erro se a cota acabou. */
export async function spend(uid: string | null, kind: keyof typeof LIMITS): Promise<Response | null> {
  if (!uid) return null;
  const { data, error } = await admin!.rpc("consume_ai", { p_user: uid, p_kind: kind, p_user_max: LIMITS[kind], p_global_max: GLOBAL_MAX });
  if (error) { console.error("consume_ai", error.message); return null; } // se o contador falhar, não bloqueamos a pessoa
  if (data === "user") return fail("Chegaste ao limite de hoje. Amanhã há mais.", 429);
  if (data === "global") return fail("A IA gratuita do NOOBrain esgotou por hoje. Volta amanhã.", 429);
  return null;
}
