// Novidades do app, da mais recente para a mais antiga. Aparecem em "Novidades" e no aviso de atualização.
// Regra: cada publicação com mudanças que se veem acrescenta uma entrada no topo, em PT-PT, a falar para quem usa (sem "Fase N").
// Cada mudança vai para uma lista: `novo` (funcionalidades), `melhorias` (o que já existia e ficou melhor), `corrigido` (erros).
// `aviso: true` manda também um aviso push a quem pediu avisos de atualização: usar só nas atualizações maiores.
export type Release = { version: string; date: string; title: string; aviso?: boolean; novo?: string[]; melhorias?: string[]; corrigido?: string[] };

export const CHANGELOG: Release[] = [
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
