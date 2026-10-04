// Novidades do app, da mais recente para a mais antiga. Aparecem em "Novidades" e no aviso de atualização.
// Regra: cada publicação com mudanças que se veem acrescenta uma entrada no topo, em PT-PT, a falar para quem usa (sem "Fase N").
// Cada mudança vai para uma lista: `novo` (funcionalidades), `melhorias` (o que já existia e ficou melhor), `corrigido` (erros).
// `aviso: true` manda também um aviso push a quem pediu avisos de atualização: usar só nas atualizações maiores.
export type Release = { version: string; date: string; title: string; aviso?: boolean; novo?: string[]; melhorias?: string[]; corrigido?: string[] };

export const CHANGELOG: Release[] = [
  {
    version: "0.9.5",
    date: "2026-10-05",
    title: "Perguntas mais claras",
    novo: ["No teste, ordenas os passos arrastando-os pela pega (ou com as setas do teclado)."],
    melhorias: [
      "A correção ficou mais fácil de ler: ícone de certo ou errado, a resposta certa em destaque e o porquê num bloco à parte.",
      "O aquecimento diz logo se acertaste e qual era a resposta certa.",
    ],
  },
  {
    version: "0.9.4",
    date: "2026-10-05",
    title: "Lições mais ativas",
    novo: [
      "Antes de cada explicação, uma pergunta de aquecimento: pensar primeiro ajuda a lembrar depois.",
      "Novos tipos de pergunta no teste: completar a frase, ordenar passos e responder numa frase, com correção e explicação.",
      "Ao criar um tema, um teste rápido de 3 perguntas ajuda a escolher o nível.",
    ],
    melhorias: ["Os exemplos vão perdendo ajudas ao longo da trilha: primeiro vês a resolução, depois completas um passo, por fim resolves tu.", "Lições dos temas iniciais refeitas com tudo isto."],
  },
  {
    version: "0.9.3",
    date: "2026-10-04",
    title: "Aprender de verdade: corrigir, dominar e rever",
    novo: [
      "No teste, a pergunta que erras volta ao fim até acertares, com a explicação à vista.",
      "As perguntas que falhaste entram na revisão, junto com os cartões.",
      "No Perfil, vês a tua retenção aos 7 dias: quanto ainda sabes uma semana depois.",
    ],
    melhorias: [
      "Um conceito só fica concluído com pelo menos 2 de cada 3 perguntas certas à primeira. Se não chegares lá, revês a explicação e repetes o teste.",
      "A revisão mistura temas e conceitos, o que ajuda a fixar.",
    ],
  },
  {
    version: "0.9.2",
    date: "2026-10-04",
    title: "Boas-vindas renovadas e Novidades organizadas",
    novo: [
      "Janela de boas-vindas da beta com a cor da marca e ícones.",
      "As Novidades passam a separar o que é novo, o que melhorou e o que foi corrigido.",
    ],
    melhorias: ["O mascote já não aparece em todos os ecrãs: onde só repetia, entrou um ícone."],
    corrigido: [
      "Depois de entrares, o botão «voltar» já não te leva de volta ao ecrã de entrada nem ao do perfil.",
    ],
  },
  {
    version: "0.9.1",
    date: "2026-10-04",
    title: "Novidades à vista e um «voltar» que funciona",
    aviso: true,
    novo: [
      "O botão «voltar» do telemóvel passa a andar entre os ecrãs do NOOBrain, como num site.",
      "Nova página de Novidades: toca no selo Beta. Se quiseres, avisamos-te das atualizações.",
    ],
    melhorias: ["Entrar com o Google abre numa janela à parte e já não fica no caminho do «voltar»."],
    corrigido: ["A revisão volta a abrir em iPhones mais antigos e o aviso de «outra app» já não aparece por engano no app instalado."],
  },
  {
    version: "0.9",
    date: "2026-10-04",
    title: "Abertura da beta",
    novo: [
      "Contas com e-mail ou Google, perfil com @nome e avatar.",
      "Explorar: temas prontos a começar, incluindo Inglês.",
      "Lições guiadas em três passos (Aprender, Memorizar, Testar), com tutor.",
      "Revisão espaçada com lembretes no telemóvel, mesmo com o app fechado.",
      "Ranking semanal, perfil público e mural de ideias com votos.",
      "Tema claro ou escuro e animações leves.",
    ],
  },
];

export const LATEST = CHANGELOG[0];

/** Primeiros pontos de uma versão, por ordem de importância (para o cartão da Trilha). */
export const highlights = (r: Release, n = 3) => [...(r.novo ?? []), ...(r.melhorias ?? []), ...(r.corrigido ?? [])].slice(0, n);
