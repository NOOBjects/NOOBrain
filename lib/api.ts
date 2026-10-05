import { getRaw, parse, update } from "./store";
import { supabase } from "./supabase";
import { topicKey } from "./topic";
import type { Concept, Lesson, Question, Source, Trail } from "./types";

// Chamadas às rotas do servidor. Aqui ficam os resultados guardados no estado para não gastar a cota gratuita da IA à toa.

/** Erro de uma rota do servidor: a mensagem para mostrar e o resto da resposta (ex.: `options` de um tema ambíguo). */
export class ApiError extends Error {
  constructor(message: string, public data: Record<string, unknown> = {}) {
    super(message);
  }
}

/** Dono a testar como pessoa normal (painel → Ferramentas): os limites diários valem também para esta conta. */
export const TEST_LIMITS = "noobrain:testlimits";
export const testLimits = () => { try { return localStorage.getItem(TEST_LIMITS) === "1"; } catch { return false; } };
export function setTestLimits(on: boolean) { try { if (on) localStorage.setItem(TEST_LIMITS, "1"); else localStorage.removeItem(TEST_LIMITS); } catch { /* sem armazenamento */ } }

/** Pedido a uma rota do app com a sessão da pessoa. */
export async function call<T>(url: string, body?: unknown): Promise<T> {
  const token = (await supabase?.auth.getSession())?.data.session?.access_token;
  let res: Response;
  try {
    res = await fetch(url, {
      method: body === undefined ? "GET" : "POST",
      headers: { ...(body !== undefined && { "content-type": "application/json" }), ...(token && { authorization: `Bearer ${token}` }), ...(testLimits() && { "x-noobrain-limits": "on" }) },
      body: body === undefined ? undefined : JSON.stringify(body),
    });
  } catch {
    throw new ApiError("Sem ligação. Verifica a internet e tenta outra vez.");
  }
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new ApiError(data.error ?? "Algo correu mal. Tenta outra vez.", data);
  return data as T;
}
const post = <T,>(url: string, body: unknown) => call<T>(url, body);

export const newId = () => `t${Date.now().toString(36)}${Math.random().toString(36).slice(2, 5)}`;

export async function createTrail(topic: string, level: string): Promise<Trail> {
  const d = await post<{ topic: string; level: string; category?: string; rev?: number; concepts: Concept[]; sources: Source[]; diagnostic?: Question[] | null }>("/api/trail", { topic, level });
  return { id: newId(), topic: d.topic, key: topicKey(d.topic), level: d.level, category: d.category, rev: d.rev ?? 0, concepts: d.concepts, sources: d.sources, done: 0, diagnostic: d.diagnostic ?? undefined };
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

/** Corrige uma resposta curta do teste. */
export async function judgeAnswer(args: { topic: string; title: string; question: string; ref: string; answer: string }) {
  return post<{ correct: boolean; partial?: boolean; feedback: string }>("/api/tutor", { ...args, mode: "avaliar", lesson: "" });
}

export function reportError(what: string, detail: string) {
  return post("/api/report", { what, detail }).catch(() => undefined);
}
