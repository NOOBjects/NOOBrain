import { admin } from "./admin";
import type { Concept, Lesson, Question, Source } from "./types";

// Catálogo partilhado: cada trilha e lição gerada fica guardada uma vez e serve toda a gente (poupa a IA).
// Só servidor. Um erro aqui nunca bloqueia: sem catálogo, segue-se para a IA.

export type CatalogTrail = { topic: string; concepts: Concept[]; sources: Source[]; diagnostic?: Question[] | null };

export async function findTrail(key: string, level: string): Promise<CatalogTrail | null> {
  try {
    const { data } = await admin!.from("catalog_trails").select("topic,concepts,sources,diagnostic").eq("key", key).eq("level", level).maybeSingle();
    return (data as CatalogTrail | null) ?? null;
  } catch {
    return null;
  }
}

export async function saveTrail(key: string, level: string, t: CatalogTrail) {
  try {
    await admin!.from("catalog_trails").upsert({ key, level, ...t });
  } catch { /* o catálogo é um extra */ }
}

export async function findLesson(trailKey: string, level: string, conceptKey: string): Promise<Lesson | null> {
  try {
    const { data } = await admin!.from("catalog_lessons").select("lesson").eq("trail_key", trailKey).eq("level", level).eq("concept_key", conceptKey).maybeSingle();
    return (data?.lesson as Lesson | undefined) ?? null;
  } catch {
    return null;
  }
}

export async function saveLesson(trailKey: string, level: string, conceptKey: string, lesson: Lesson) {
  try {
    await admin!.from("catalog_lessons").upsert({ trail_key: trailKey, level, concept_key: conceptKey, lesson });
  } catch { /* o catálogo é um extra */ }
}
