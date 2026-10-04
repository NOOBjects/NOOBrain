import { admin } from "./admin";

/** Quem faz o pedido, a partir do `authorization: Bearer <access_token>`. `null` se não houver sessão válida. */
export async function userFrom(request: Request) {
  const token = request.headers.get("authorization")?.replace(/^Bearer /i, "");
  if (!token || !admin) return null;
  const { data, error } = await admin.auth.getUser(token);
  return error ? null : data.user;
}

/** Pedido do script de sementes local (`scripts/seed-catalog.mjs`): `SEED_TOKEN` existe só no `.env.local`, nunca na Vercel. */
export const isSeed = (request: Request) => !!process.env.SEED_TOKEN && request.headers.get("x-seed-token") === process.env.SEED_TOKEN;
