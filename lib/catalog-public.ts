import { supabase } from "./supabase";
import { topicKey } from "./topic";
import type { Concept, Source } from "./types";

// Leitura pública do catálogo (chave pública, RLS deixa ler), usada nas páginas que o Google vê.

export type PublicTopic = { topic: string; slug: string };
export type PublicTrail = { key: string; level: string; topic: string; concepts: Concept[]; sources: Source[] };

/** "Teoria das cores" → "teoria-das-cores". O mesmo slug dá sempre a mesma chave do catálogo (ver `topicKey`). */
export const slugify = (s: string) =>
  s.normalize("NFD").replace(/[̀-ͯ]/g, "").toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "");

/** Temas do catálogo, os mais usados primeiro. */
export async function listTopics(limit = 100): Promise<PublicTopic[]> {
  try {
    const { data } = await supabase!.from("catalog_trails").select("topic,uses").order("uses", { ascending: false }).limit(limit);
    const seen = new Set<string>();
    return (data ?? []).flatMap((r) => {
      const slug = slugify(r.topic);
      if (!slug || seen.has(slug)) return [];
      seen.add(slug);
      return [{ topic: r.topic as string, slug }];
    });
  } catch {
    return [];
  }
}

/** A trilha de um tema, pelo slug. Prefere o nível Iniciante. */
export async function getTheme(slug: string): Promise<PublicTrail | null> {
  try {
    const { data } = await supabase!.from("catalog_trails").select("key,level,topic,concepts,sources").eq("key", topicKey(slug.replace(/-/g, " ")));
    const rows = (data ?? []) as PublicTrail[];
    return rows.find((r) => r.level === "Iniciante") ?? rows[0] ?? null;
  } catch {
    return null;
  }
}
