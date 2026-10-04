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
  done: number; // quantos conceitos já foram concluídos
};

/** Estado de um cartão na revisão espaçada: caixa (0 a 4) e quando vence (ms desde 1970). */
export type CardState = { box: number; due: number };

/** Medição por conceito (chave `<trilha>:<conceito>`): t certas de n à primeira no 1.º teste; r7 = acertou a 1.ª revisão feita 7 ou mais dias depois. */
export type ConceptStats = { t: number; n: number; r7?: 0 | 1 };

export type State = {
  trails: Trail[];
  active: string; // id da trilha aberta
  xp: number;
  streak: number;
  lastDay: string | null;
  cards: Record<string, CardState>; // chave `<trilha>:<conceito>:<k>` (cartão) ou `<trilha>:<conceito>:q<k>` (pergunta falhada)
  stats?: Record<string, ConceptStats>;
  updatedAt: number;
  seenVersion?: string; // última versão cujas novidades já viu (sem valor = ainda não viu o aviso da beta)
  notify?: { reviews?: boolean; news?: boolean }; // avisos que quer: reviews sem valor = sim; news sem valor = ainda não respondeu
};
