import { normLevel } from "./levels";
import { topicKey } from "./topic";
import type { Card, Question, State, Trail } from "./types";

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
    s.trails = s.trails.filter((t) => !(t as { example?: boolean }).example).map((t) => ({ ...t, level: normLevel(t.level), key: t.key ?? topicKey(t.topic), sources: t.sources ?? [] }));
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

/** Quer este tipo de aviso? Os lembretes de revisão estão ligados por omissão; as novidades só com um "sim". */
export const wants = (s: State, kind: "reviews" | "news") => (kind === "reviews" ? s.notify?.reviews !== false : s.notify?.news === true);

export const activeTrail = (s: State): Trail | undefined => s.trails.find((t) => t.id === s.active) ?? s.trails.find((t) => !t.archived) ?? s.trails[0];

// ---------- sequência de dias e meta diária ----------
export const day = (d = new Date()) => d.toLocaleDateString("sv"); // AAAA-MM-DD no fuso da pessoa
const ago = (n: number, from = new Date()) => { const d = new Date(from); d.setDate(d.getDate() - n); return day(d); };
/** Segunda-feira da semana de `d` (AAAA-MM-DD): cada semana tem um dia de folga para a sequência. */
export const weekOf = (d = new Date()) => { const x = new Date(d); x.setDate(x.getDate() - ((x.getDay() + 6) % 7)); return day(x); };

/**
 * Sequência de dias: sobe se estudou ontem, reinicia se falhou mais de um dia.
 * Falhar UM dia gasta o dia de folga da semana (se ainda não foi usado) e a sequência continua.
 */
export function bumpStreak(s: State): Pick<State, "streak" | "lastDay" | "freezeWeek"> {
  const today = day();
  if (s.lastDay === today) return { streak: s.streak, lastDay: today, freezeWeek: s.freezeWeek };
  if (s.lastDay === ago(1)) return { streak: s.streak + 1, lastDay: today, freezeWeek: s.freezeWeek };
  const week = weekOf(new Date(Date.now() - 86_400_000)); // o dia falhado foi ontem
  if (s.lastDay === ago(2) && s.streak > 0 && s.freezeWeek !== week) return { streak: s.streak + 1, lastDay: today, freezeWeek: week };
  return { streak: 1, lastDay: today, freezeWeek: s.freezeWeek };
}

/** Sequência a mostrar hoje: 0 se já se perdeu (mesmo que ainda não tenha estudado para a reiniciar). */
export function currentStreak(s: State) {
  if (!s.lastDay || s.streak <= 0) return 0;
  if (s.lastDay === day() || s.lastDay === ago(1)) return s.streak;
  if (s.lastDay === ago(2) && s.freezeWeek !== weekOf(new Date(Date.now() - 86_400_000))) return s.streak; // ontem foi o dia de folga
  return 0;
}

/** Ontem ficou sem estudo e foi coberto pelo dia de folga (para avisar a pessoa). */
export const frozeYesterday = (s: State) => s.streak > 0 && s.lastDay === ago(2) && currentStreak(s) > 0;

export const GOALS = [10, 30, 50] as const;
export const goalOf = (s: State) => s.goal ?? 30;
/** XP ganho hoje (0 se o registo é de outro dia). */
/** Lições novas abertas hoje (noutro dia, a lista está vazia). */
export const lessonsToday = (s: State) => (s.daily?.day === day() ? s.daily.lessons : []);
export const markLesson = (s: State, id: string): Pick<State, "daily"> => ({ daily: { day: day(), lessons: lessonsToday(s).includes(id) ? lessonsToday(s) : [...lessonsToday(s), id] } });
export const todayXp = (s: State) => (s.today?.day === day() ? s.today.xp : 0);

/** Soma XP ao total e ao de hoje. */
export function gainXp(s: State, n: number): Pick<State, "xp" | "today"> {
  return { xp: s.xp + n, today: { day: day(), xp: todayXp(s) + n } };
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

/** Avalia um cartão ou pergunta e, se for a 1.ª revisão feita depois de um intervalo de 7 dias ou mais, regista a retenção do conceito. */
export function applyRating(s: State, id: string, r: 0 | 1 | 2): State {
  const prev = s.cards[id];
  const key = id.slice(0, id.lastIndexOf(":")); // <trilha>:<conceito>
  const st = s.stats?.[key];
  const stats = prev && prev.box >= 3 && st && st.r7 === undefined ? { ...s.stats, [key]: { ...st, r7: r > 0 ? (1 as const) : (0 as const) } } : s.stats;
  return { ...s, cards: { ...s.cards, [id]: rate(prev, r) }, stats };
}

/** Revisão feita no ecrã Rever: avalia, conta para a sequência e, se acertou, dá 1 XP e soma ao contador de revistos. */
export function applyReview(s: State, id: string, r: 0 | 1 | 2): State {
  const next = applyRating(s, id, r);
  if (r === 0) return next;
  return { ...next, ...bumpStreak(next), ...gainXp(next, 1), reviewed: (next.reviewed ?? 0) + 1 };
}

/** Baralha e evita dois itens do mesmo conceito seguidos quando há alternativa (intercalar ajuda a fixar). */
export function interleave<T extends { topic: string; concept: string }>(list: T[]): T[] {
  const a = [...list];
  for (let i = a.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [a[i], a[j]] = [a[j], a[i]]; }
  const same = (x: T, y: T) => x.topic === y.topic && x.concept === y.concept;
  for (let i = 1; i < a.length; i++) {
    if (!same(a[i], a[i - 1])) continue;
    const j = a.findIndex((x, k) => k > i && !same(x, a[i - 1]));
    if (j > 0) [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

/** Cartão por rever; `q` existe quando é uma pergunta de teste que a pessoa falhou (o cartão é então a pergunta e a resposta). */
export type DueCard = { id: string; topic: string; concept: string; card: Card; q?: Question };

/** Cartões e perguntas falhadas de conceitos já concluídos que estão vencidos (ou nunca foram avaliados). */
export function dueCards(s: State, now = Date.now()): DueCard[] {
  const out: DueCard[] = [];
  const trails = s.trails.filter((t) => !t.archived);
  for (const t of trails)
    t.concepts.slice(0, t.done).forEach((c, ci) =>
      c.lesson?.cards.forEach((card, k) => {
        const id = `${t.id}:${ci}:${k}`;
        if (!s.cards[id] || s.cards[id].due <= now) out.push({ id, topic: t.topic, concept: c.title, card });
      }),
    );
  for (const t of trails)
    t.concepts.slice(0, t.done).forEach((c, ci) =>
      c.lesson?.quiz.forEach((q, k) => {
        const id = `${t.id}:${ci}:q${k}`;
        if (s.cards[id] && s.cards[id].due <= now) out.push({ id, topic: t.topic, concept: c.title, card: { term: q.q, definition: `${q.options[q.answer]}. ${q.why}` }, q });
      }),
    );
  return out;
}
