import { admin } from "@/lib/admin";
import { userFrom } from "@/lib/auth";
import { LIMITS, isOwner } from "@/lib/quota";

// Quanto da cota de hoje já foi gasto (para as barras). Os donos (ADMIN_IDS) não têm limite.
export async function GET(request: Request) {
  const user = await userFrom(request);
  if (!user) return Response.json({ error: "Sessão inválida." }, { status: 401 });
  if (isOwner(user.id)) return Response.json({ unlimited: true });
  const { data } = await admin!.from("ai_usage").select("kind,n").eq("user_id", user.id).eq("day", new Date().toISOString().slice(0, 10));
  const used = (kind: "trail" | "lesson") => Math.min(LIMITS[kind], data?.find((r: { kind: string; n: number }) => r.kind === kind)?.n ?? 0);
  return Response.json({ trail: { used: used("trail"), max: LIMITS.trail }, lesson: { used: used("lesson"), max: LIMITS.lesson } });
}
