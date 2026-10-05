import { currentStreak, goalOf, todayXp } from "./store";
import type { State } from "./types";

// Conquistas: lista fixa. Cada uma diz como se ganha (`how`) e o teste sobre o estado.
// O ícone de cada uma está em components/Badges.tsx (pelo `icon`).
export type Badge = { id: string; name: string; how: string; icon: "spark" | "route" | "flame" | "sync" | "compass" | "bolt" | "target" | "star" | "trophy"; test: (s: State) => boolean };

const concepts = (s: State) => s.trails.reduce((n, t) => n + t.done, 0);
const finished = (s: State) => s.trails.filter((t) => t.concepts.length > 0 && t.done >= t.concepts.length).length;

export const BADGES: Badge[] = [
  { id: "primeiro", name: "Primeiro passo", how: "Domina o teu primeiro conceito.", icon: "spark", test: (s) => concepts(s) >= 1 },
  { id: "perfeito", name: "Sem falhas", how: "Acerta todas as perguntas de um teste à primeira.", icon: "star", test: (s) => Object.values(s.stats ?? {}).some((c) => c.n > 0 && c.t >= c.n) },
  { id: "meta", name: "Meta cumprida", how: "Cumpre a tua meta diária de XP.", icon: "target", test: (s) => todayXp(s) >= goalOf(s) },
  { id: "seq3", name: "Três seguidos", how: "Estuda 3 dias seguidos.", icon: "flame", test: (s) => currentStreak(s) >= 3 },
  { id: "seq7", name: "Uma semana", how: "Estuda 7 dias seguidos.", icon: "flame", test: (s) => currentStreak(s) >= 7 },
  { id: "trilha", name: "Trilha completa", how: "Conclui todos os conceitos de uma trilha.", icon: "route", test: (s) => finished(s) >= 1 },
  { id: "desafio", name: "Desafiante", how: "Faz o desafio do dia.", icon: "bolt", test: (s) => !!s.challenge },
  { id: "rever50", name: "Memória fresca", how: "Acerta 50 cartões na revisão.", icon: "sync", test: (s) => (s.reviewed ?? 0) >= 50 },
  { id: "temas5", name: "Curiosidade", how: "Começa 5 temas diferentes.", icon: "compass", test: (s) => s.trails.length >= 5 },
  { id: "xp1000", name: "Mil pontos", how: "Junta 1000 XP.", icon: "bolt", test: (s) => s.xp >= 1000 },
  { id: "seq30", name: "Um mês", how: "Estuda 30 dias seguidos.", icon: "flame", test: (s) => currentStreak(s) >= 30 },
  { id: "rever300", name: "Memória de elefante", how: "Acerta 300 cartões na revisão.", icon: "trophy", test: (s) => (s.reviewed ?? 0) >= 300 },
];

/** Conquistas que o estado já merece mas ainda não estão registadas. */
export const newBadges = (s: State) => BADGES.filter((b) => !s.badges?.[b.id] && b.test(s));
