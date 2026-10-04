import { topicKey } from "./topic";
import type { Card, State, Trail } from "./types";

// Guarda tudo no navegador (localStorage). Com conta, o componente Sync copia o mesmo estado para o Supabase.
export const initial: State = { trails: [], active: "", xp: 0, streak: 0, lastDay: null, cards: {}, updatedAt: 0 };

const KEY = "noobrain:v2";
const listeners = new Set<() => void>();
let memory: string | null = null; // reserva para quando o navegador bloqueia o localStorage

export function subscribe(cb: () => void) {
  listeners.add(cb);
  window.addEventListener("storage", cb);
  return () => {
    listeners.delete(cb);
    window.removeEventListener("storage", cb);
  };
}

export function getRaw(): string | null {
  if (memory) return memory;
  try { return localStorage.getItem(KEY); } catch { return null; }
}

export const getServerRaw = () => null;

export function parse(raw: string | null): State {
  if (!raw) return initial;
  try {
    const s = { ...initial, ...JSON.parse(raw) } as State;
    if (!Array.isArray(s.trails)) return initial;
    // estados guardados por versões anteriores podem ter a trilha de exemplo e não ter `key` nem `sources`
    s.trails = s.trails.filter((t) => !(t as { example?: boolean }).example).map((t) => ({ ...t, key: t.key ?? topicKey(t.topic), sources: t.sources ?? [] }));
    return s;
  } catch {
    return initial;
  }
}

function write(s: State) {
  memory = JSON.stringify(s);
  try { localStorage.setItem(KEY, memory); } catch { /* segue só em memória */ }
  listeners.forEach((l) => l());
}

/** Aplica uma mudança ao estado atual e grava. */
export function update(fn: (s: State) => State) {
  write({ ...fn(parse(getRaw())), updatedAt: Date.now() });
}

/** Troca o estado inteiro (usado quando a conta traz um estado mais novo da nuvem). */
export function replace(s: State) {
  write(s);
}

export const activeTrail = (s: State): Trail | undefined => s.trails.find((t) => t.id === s.active) ?? s.trails[0];

// ---------- sequência de dias ----------
const day = (d: Date) => d.toLocaleDateString("sv"); // AAAA-MM-DD no fuso do usuário

/** Sequência de dias: sobe se concluiu algo ontem, reinicia se pulou um dia. */
export function bumpStreak(s: State): Pick<State, "streak" | "lastDay"> {
  const today = day(new Date());
  if (s.lastDay === today) return { streak: s.streak, lastDay: today };
  const y = new Date();
  y.setDate(y.getDate() - 1);
  return { streak: s.lastDay === day(y) ? s.streak + 1 : 1, lastDay: today };
}

// ---------- revisão espaçada ----------
const DAYS = [0, 1, 3, 7, 16, 35]; // intervalo de cada caixa, em dias
export const RATINGS = [
  { label: "De novo", hint: "volta em 10 min", cls: "bad" },
  { label: "Bom", hint: "volta em breve", cls: "" },
  { label: "Fácil", hint: "volta mais tarde", cls: "ok" },
] as const;

/** Próxima caixa e data de vencimento depois de avaliar um cartão (0 = De novo, 1 = Bom, 2 = Fácil). */
export function rate(prev: { box: number } | undefined, rating: 0 | 1 | 2, now = Date.now()) {
  const box = rating === 0 ? 0 : Math.min((prev?.box ?? 0) + rating, DAYS.length - 1);
  const due = rating === 0 ? now + 10 * 60_000 : now + DAYS[box] * 86_400_000;
  return { box, due };
}

/** Quando um cartão volta, em texto (para mostrar nos botões depois de avaliar). */
export function whenText(due: number, now = Date.now()) {
  const min = Math.round((due - now) / 60_000);
  if (min < 60) return `${min} min`;
  const d = Math.round(min / 1440);
  return d < 1 ? `${Math.round(min / 60)} h` : d === 1 ? "1 dia" : `${d} dias`;
}

export type DueCard = { id: string; topic: string; concept: string; card: Card };

/** Cartões de conceitos já concluídos que estão vencidos (ou nunca foram avaliados). */
export function dueCards(s: State, now = Date.now()): DueCard[] {
  const out: DueCard[] = [];
  for (const t of s.trails)
    t.concepts.slice(0, t.done).forEach((c, ci) =>
      c.lesson?.cards.forEach((card, k) => {
        const id = `${t.id}:${ci}:${k}`;
        if (!s.cards[id] || s.cards[id].due <= now) out.push({ id, topic: t.topic, concept: c.title, card });
      }),
    );
  return out;
}
