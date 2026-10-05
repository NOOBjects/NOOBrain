import { newId } from "./api";
import { LANGUAGES_ON, categoryOf, isLanguageTopic, type Category } from "./categories";
import { update } from "./store";
import { supabase } from "./supabase";
import type { Concept, Source, State, Trail } from "./types";

// Catálogo partilhado, lido no navegador (Explorar e "Já existe" no Novo tema). Carregado uma vez por visita.
export type CatalogRow = { key: string; level: string; topic: string; concepts: Concept[]; sources: Source[]; uses: number; created_at: string; category: Category };

let cache: Promise<CatalogRow[]> | null = null;
export function loadCatalog(): Promise<CatalogRow[]> {
  cache ??= Promise.resolve(supabase!.from("catalog_trails").select("key,level,topic,concepts,sources,uses,created_at,category").order("uses", { ascending: false }).limit(200))
    .then(({ data, error }) => {
      if (error) throw error;
      return ((data ?? []) as (Omit<CatalogRow, "category"> & { category?: string })[]).map((r) => ({ ...r, category: categoryOf(r.key, r.category) }))
        .filter((r) => LANGUAGES_ON || (r.category !== "linguas" && !isLanguageTopic(r.topic))); // línguas em pausa
    })
    .catch((e) => { cache = null; throw e; });
  return cache;
}

/** Começa (ou abre, se já existir) a trilha de um tema do catálogo. Instantâneo e sem IA. */
export function startFromCatalog(r: CatalogRow, state: State): Trail {
  const mine = state.trails.find((t) => t.key === r.key && t.level === r.level);
  if (mine) { update((s) => ({ ...s, active: mine.id, trails: s.trails.map((t) => (t.id === mine.id ? { ...t, archived: undefined } : t)) })); return mine; }
  const trail: Trail = { id: newId(), topic: r.topic, key: r.key, level: r.level, category: r.category, concepts: r.concepts.map(({ title, summary }) => ({ title, summary })), sources: r.sources, done: 0 };
  update((s) => ({ ...s, trails: [trail, ...s.trails], active: trail.id }));
  void supabase!.from("catalog_starts").insert({ key: r.key, level: r.level }).then(({ error }) => { if (error && error.code !== "23505") console.error("catalog_starts", error.message); }); // 23505: já tinhas começado
  return trail;
}
