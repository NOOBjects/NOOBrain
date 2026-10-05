export type Source = { title: string; url: string; site?: string };
export type Card = { term: string; definition: string };
export type Question = { q: string; options: string[]; answer: number; why: string };
/** Pergunta de aquecimento: sem "porquê"; a resposta certa aparece no fim da explicação. */
export type Warmup = { q: string; options: string[]; answer: number };
/** Completar a frase: `text` traz "___" no lugar da resposta; `accept` são variantes aceites. */
export type Cloze = { text: string; answer: string; accept: string[] };
/** Ordenar passos: `steps` está na ordem certa; o app baralha. */
export type Order = { prompt: string; steps: string[] };
/** Resposta curta, avaliada pela IA; `ref` é o que uma boa resposta tem de dizer. */
export type Short = { q: string; ref: string };
// Os campos depois de `quiz` são opcionais: as lições antigas continuam a funcionar.
export type Lesson = { intro: string[]; example: string; solution?: string; cards: Card[]; quiz: Question[]; warmup?: Warmup; cloze?: Cloze[]; order?: Order[]; short?: Short[] };
export type Concept = { title: string; summary: string; lesson?: Lesson };

export type Trail = {
  id: string;
  topic: string;
  key: string; // chave canônica do tema (ver lib/topic.ts), usada para achar trilhas parecidas
  level: string;
  concepts: Concept[];
  sources: Source[];
  done: number; // quantos conceitos já foram concluídos
  diagnostic?: Question[]; // 3 perguntas para escolher o nível (só vêm da IA ao criar o tema)
  archived?: boolean; // arquivada: sai dos temas e da revisão até ser reaberta
  category?: string; // categoria do catálogo (ver lib/categories.ts)
};

/** Estado de um cartão na revisão espaçada: caixa (0 a 4) e quando vence (ms desde 1970). */
export type CardState = { box: number; due: number };

/** Medição por conceito (chave `<trilha>:<conceito>`): t certas de n à primeira no 1.º teste; r7 = acertou a 1.ª revisão feita 7 ou mais dias depois; x = último dia em que o teste deu XP. */
export type ConceptStats = { t: number; n: number; r7?: 0 | 1; x?: string };

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
  goal?: number; // meta diária de XP (10, 30 ou 50; sem valor = 30)
  today?: { day: string; xp: number }; // XP ganho hoje (AAAA-MM-DD no fuso da pessoa)
  freezeWeek?: string; // segunda-feira da semana em que o dia de folga da sequência já foi usado
  reviewed?: number; // cartões e perguntas revistos com acerto, desde sempre
  badges?: Record<string, number>; // conquistas ganhas (id → quando); sem valor = ainda não verificadas
  challenge?: string; // último dia (AAAA-MM-DD) em que fez o desafio do dia
  tour?: boolean; // já viu (ou saltou) a visita guiada
  asked?: string[]; // pedidos de opinião já respondidos ou fechados
};
