// Os três níveis de uma trilha (partilhado entre servidor e navegador). "Intermediário" é a grafia brasileira: em Portugal é "Intermédio".
export const LEVELS = [
  { id: "Iniciante", hint: "Nunca estudaste isto." },
  { id: "Intermédio", hint: "Já sabes o básico e queres perceber como funciona." },
  { id: "Avançado", hint: "Já dominas o essencial e queres ir ao detalhe." },
] as const;
export type Level = (typeof LEVELS)[number]["id"];

export const normLevel = (x: unknown): Level =>
  x === "Intermediário" ? "Intermédio" : LEVELS.some((l) => l.id === x) ? (x as Level) : "Iniciante";
export const lowerLevel = (l: Level): Level | null => (l === "Avançado" ? "Intermédio" : l === "Intermédio" ? "Iniciante" : null);
export const nextLevel = (l: Level): Level | null => (l === "Iniciante" ? "Intermédio" : l === "Intermédio" ? "Avançado" : null);

/** O que muda em cada nível, para os prompts (só servidor). `trail` = conceitos da trilha; `lesson` = a lição de um conceito. */
export const LEVEL_GUIDE: Record<Level, { trail: string; lesson: string }> = {
  Iniciante: {
    trail: "Assume zero conhecimento. Os conceitos são o vocabulário essencial, as peças principais, para que serve e os primeiros passos; o 1.º conceito apresenta o tema. Os resumos usam analogias do dia a dia e nenhum termo técnico aparece sem explicação.",
    lesson: "Escreve 2 parágrafos curtos com exemplos do quotidiano. As perguntas testam lembrar e compreender.",
  },
  Intermédio: {
    trail: "Assume que o aluno já domina a trilha Iniciante deste tema. Os conceitos são como funciona por dentro, procedimentos passo a passo, diagnóstico de problemas, erros comuns e como evitá-los, escolher entre opções. É PROIBIDO um conceito \"O que é…\" ou de introdução. Usa o vocabulário técnico correto, com definição curta.",
    lesson: "Explica o mecanismo e o porquê. O exemplo é resolvido com números ou com uma situação real. As perguntas pedem aplicar e analisar, e as opções erradas são enganos comuns.",
  },
  Avançado: {
    trail: "Assume que o aluno domina os níveis Iniciante e Intermédio deste tema. Os conceitos são casos-limite, compromissos (trade-offs), otimização, prática de especialista e limites do conhecimento atual. Nada do que pertença aos níveis abaixo.",
    lesson: "Usa cenários com várias etapas. As perguntas pedem avaliar e justificar, e a resposta curta exige um argumento.",
  },
};
