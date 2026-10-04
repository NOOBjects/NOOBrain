// Novidades do app, da mais recente para a mais antiga. Aparecem em "Novidades" e no aviso de atualização.
// Regra: cada publicação com mudanças que se veem acrescenta uma entrada no topo, em PT-PT, a falar para quem usa (sem "Fase N").
// `aviso: true` manda também um aviso push a quem pediu avisos de atualização: usar só nas atualizações maiores.
export type Release = { version: string; date: string; title: string; items: string[]; aviso?: boolean };

export const CHANGELOG: Release[] = [
  {
    version: "0.9.1",
    date: "2026-10-04",
    title: "Novidades à vista e um «voltar» que funciona",
    aviso: true,
    items: [
      "O botão «voltar» do telemóvel passa a andar entre os ecrãs do NOOBrain, como num site.",
      "Entrar com o Google abre numa janela à parte e já não fica no caminho do «voltar».",
      "Nova página de Novidades: toca no selo Beta. Se quiseres, avisamos-te das atualizações.",
      "Correções: a revisão volta a abrir em iPhones mais antigos e o aviso de «outra app» já não aparece por engano no app instalado.",
    ],
  },
  {
    version: "0.9",
    date: "2026-10-04",
    title: "Abertura da beta",
    items: [
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
