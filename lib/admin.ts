import { createClient } from "@supabase/supabase-js";

// Cliente com a chave secreta: ignora o RLS. Só pode ser usado em `app/api`, nunca no navegador.
const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const key = process.env.SUPABASE_SECRET_KEY;

export const admin = url && key ? createClient(url, key, { auth: { persistSession: false, autoRefreshToken: false } }) : null;
