import { createClient } from "@supabase/supabase-js";

// Cliente do navegador. Usa a "publishable key", que é pública por natureza: quem protege os dados são as
// regras de segurança por linha (RLS) criadas no banco, onde cada pessoa só enxerga o próprio progresso.
const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const key = process.env.NEXT_PUBLIC_SUPABASE_KEY;

export const supabase = url && key ? createClient(url, key) : null;
