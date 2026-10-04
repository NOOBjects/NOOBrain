import { getRaw, parse, update } from "./store";
import { topicKey } from "./topic";
import type { Concept, Lesson, Source, Trail } from "./types";

// Chamadas às rotas do servidor. Aqui ficam os resultados guardados no estado para não gastar a cota gratuita da IA à toa.

async function post<T>(url: string, body: unknown): Promise<T> {
  const res = await fetch(url, { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify(body) });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(data.error ?? "Algo deu errado. Tente de novo.");
  return data as T;
}

export const newId = () => `t${Date.now().toString(36)}${Math.random().toString(36).slice(2, 5)}`;

export async function createTrail(topic: string, level: string): Promise<Trail> {
  const d = await post<{ topic: string; level: string; concepts: Concept[]; sources: Source[] }>("/api/trail", { topic, level });
  return { id: newId(), topic: d.topic, key: topicKey(d.topic), level: d.level, concepts: d.concepts, sources: d.sources, example: false, done: 0 };
}

const pending = new Map<string, Promise<void>>();

/** Garante que o conceito tenha lição. Pedidos repetidos para o mesmo conceito viram uma só chamada. */
export function ensureLesson(trailId: string, index: number): Promise<void> {
  const key = `${trailId}:${index}`;
  const hit = pending.get(key);
  if (hit) return hit;
  const trail = parse(getRaw()).trails.find((t) => t.id === trailId);
  const concept = trail?.concepts[index];
  if (!trail || !concept || concept.lesson) return Promise.resolve();

  const p = post<{ lesson: Lesson }>("/api/lesson", { topic: trail.topic, level: trail.level, title: concept.title, summary: concept.summary })
    .then(({ lesson }) =>
      update((s) => ({
        ...s,
        trails: s.trails.map((t) => (t.id !== trailId ? t : { ...t, concepts: t.concepts.map((c, i) => (i === index ? { ...c, lesson } : c)) })),
      })),
    )
    .finally(() => pending.delete(key));
  pending.set(key, p);
  return p;
}

export async function askTutor(args: { topic: string; title: string; lesson: string; question: string; history: { role: string; text: string }[] }) {
  return (await post<{ answer: string }>("/api/tutor", args)).answer;
}

export function reportError(what: string, detail: string) {
  return post("/api/report", { what, detail }).catch(() => undefined);
}
