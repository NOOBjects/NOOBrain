import type { State, Trail } from "./types";

/** Nada feito ainda: sem XP, sem cartões avaliados e só a trilha de exemplo. */
export function isBlank(s: State) {
  return s.xp === 0 && Object.keys(s.cards).length === 0 && s.trails.every((t) => t.example);
}

/** Mesmo progresso? Ignora a ordem das chaves (o banco reordena o JSON) e a hora da última mudança. */
export function sameProgress(a: State, b: State) {
  const print = (s: State) =>
    JSON.stringify([
      s.xp,
      s.streak,
      s.trails.map((t) => `${t.key}:${t.done}`).sort(),
      Object.keys(s.cards).sort().map((k) => `${k}:${s.cards[k].box}`),
    ]);
  return print(a) === print(b);
}

/**
 * Junta o progresso deste aparelho (a) com o da conta (b).
 * Trilhas do mesmo tema: fica a mais avançada. Cartões: fica a caixa mais alta.
 * XP: fica o maior. Sequência: fica a maior, com o dia correspondente.
 */
export function merge(a: State, b: State): State {
  const trails = new Map<string, Trail>();
  for (const t of [...b.trails, ...a.trails]) {
    const old = trails.get(t.key);
    if (!old || t.done > old.done) trails.set(t.key, t);
  }
  const cards = { ...b.cards };
  for (const [k, c] of Object.entries(a.cards)) if (!cards[k] || c.box > cards[k].box) cards[k] = c;
  const list = [...trails.values()];
  const open = b.trails.find((t) => t.id === b.active)?.key ?? ""; // o tema aberto na conta continua aberto
  const best = a.streak >= b.streak ? a : b;
  return {
    trails: list,
    active: trails.get(open)?.id ?? list[0].id,
    xp: Math.max(a.xp, b.xp),
    streak: best.streak,
    lastDay: best.lastDay,
    cards,
    updatedAt: Date.now(),
  };
}
