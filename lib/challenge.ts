import type { Question, State } from "./types";

// Desafio do dia: 5 perguntas de escolha múltipla de conceitos já concluídos, de vários temas (intercalar ajuda a fixar).
export type ChallengeItem = Question & { topic: string };

const pool = (s: State): ChallengeItem[] =>
  s.trails.filter((t) => !t.archived).flatMap((t) => t.concepts.slice(0, t.done).flatMap((c) => (c.lesson?.quiz ?? []).map((q) => ({ ...q, topic: t.topic }))));

/** Só aparece com material suficiente: pelo menos 2 conceitos concluídos (6 perguntas). */
export const canChallenge = (s: State) => pool(s).length >= 6;

/** Escolhe 5 perguntas ao acaso, sem repetir o tema seguido quando dá. */
export function buildChallenge(s: State, n = 5): ChallengeItem[] {
  const all = pool(s);
  for (let i = all.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [all[i], all[j]] = [all[j], all[i]]; }
  const out: ChallengeItem[] = [];
  while (out.length < n && all.length) {
    const k = all.findIndex((q) => q.topic !== out[out.length - 1]?.topic);
    out.push(...all.splice(k >= 0 ? k : 0, 1));
  }
  return out;
}

/** XP do desafio: o dobro dos 5 XP por certa. */
export const challengeXp = (right: number) => right * 10;
