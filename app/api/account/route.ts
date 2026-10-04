import { admin } from "@/lib/admin";
import { userFrom } from "@/lib/auth";

// Apaga a conta de quem pede. O progresso, o perfil e o resto apagam em cascata no banco.
export async function DELETE(request: Request) {
  const user = await userFrom(request);
  if (!user) return Response.json({ error: "Sessão inválida." }, { status: 401 });
  const { error } = await admin!.auth.admin.deleteUser(user.id);
  if (error) return Response.json({ error: "Não consegui apagar a conta. Tenta outra vez." }, { status: 500 });
  return Response.json({ ok: true });
}
