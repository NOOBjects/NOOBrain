import { admin } from "./admin";

/** Quem faz o pedido, a partir do `authorization: Bearer <access_token>`. `null` se não houver sessão válida. */
export async function userFrom(request: Request) {
  const token = request.headers.get("authorization")?.replace(/^Bearer /i, "");
  if (!token || !admin) return null;
  const { data, error } = await admin.auth.getUser(token);
  return error ? null : data.user;
}
