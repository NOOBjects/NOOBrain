export type Source = { title: string; url: string; site?: string };
export type Card = { term: string; definition: string };
export type Question = { q: string; options: string[]; answer: number; why: string };
export type Lesson = { intro: string[]; example: string; cards: Card[]; quiz: Question[] };
export type Concept = { title: string; summary: string; lesson?: Lesson };

export type Trail = {
  id: string;
  topic: string;
  key: string; // chave canônica do tema (ver lib/topic.ts), usada para achar trilhas parecidas
  level: string;
  concepts: Concept[];
  sources: Source[];
  example: boolean;
  done: number; // quantos conceitos já foram concluídos
};

/** Estado de um cartão na revisão espaçada: caixa (0 a 4) e quando vence (ms desde 1970). */
export type CardState = { box: number; due: number };

export type State = {
  trails: Trail[];
  active: string; // id da trilha aberta
  xp: number;
  streak: number;
  lastDay: string | null;
  cards: Record<string, CardState>;
  updatedAt: number;
};
