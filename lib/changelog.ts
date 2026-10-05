// Novidades do app, da mais recente para a mais antiga. Aparecem em "Novidades" e no aviso de atualização.
// Regra: cada publicação com mudanças que se veem acrescenta uma entrada no topo, em PT-PT, a falar para quem usa (sem "Fase N").
// Cada mudança vai para uma lista: `novo` (funcionalidades), `melhorias` (o que já existia e ficou melhor), `corrigido` (erros).
// `aviso: true` manda também um aviso push a quem pediu avisos de atualização: usar só nas atualizações maiores.
export type Release = { version: string; date: string; title: string; aviso?: boolean; novo?: string[]; melhorias?: string[]; corrigido?: string[] };

export const CHANGELOG: Release[] = [
  {
    version: "0.10.2",
    date: "2026-10-05",
    title: "Menu novo, instalar o app e opinião",
    novo: [
      "Instalar o NOOBrain no telemóvel e no computador, a partir do menu ou das Definições.",
      "«Dar opinião» sempre à mão no menu.",
    ],
    melhorias: [
      "O menu tem agora os 4 ecrãs principais e uma gaveta com o resto (Ideias, Ranking, Novidades, Definições…).",
      "O menu deixa de se mexer quando mudas de ecrã.",
      "O Perfil mostra quem és e o que conseguiste; as Definições juntam tudo o que é configuração, por grupos.",
    ],
  },
  {
    version: "0.10.1",
    date: "2026-10-05",
    title: "Entrar e avisos a funcionar",
    corrigido: [
      "Entrar com e-mail volta a funcionar.",
      "Os lembretes chegam à conta certa depois de mudares de conta no mesmo aparelho.",
      "Deixou de aparecer texto estranho com «\\n» nas lições.",
    ],
  },
  {
    version: "0.10",
    date: "2026-10-05",
    title: "Hábitos, conquistas e um app mais polido",
    aviso: true,
    novo: [
      "Meta diária de XP: escolhe Leve, Normal ou Intensa nas Definições e acompanha-a no anel à volta do teu XP.",
      "Conquistas: 12 para ganhar, com celebração quando chegas lá. Vê-as no teu Perfil.",
      "Desafio do dia: 5 perguntas de tudo o que já aprendeste, com XP a dobrar.",
      "Novo exercício no teste: ligar cada termo à sua definição.",
      "Ouvir: a explicação lida em voz alta e, nos temas de línguas, a pronúncia nos cartões.",
      "Explorar por categorias, com ordem por populares ou novos.",
      "Ao criar um tema que já existe, começas logo, sem esperar. Num tema ambíguo, escolhes o que querias dizer com um toque.",
      "Arquivar trilhas que já não queres ver, sem perder o progresso.",
      "O Perfil mostra os teus temas de relance, com o progresso e os cartões por rever.",
      "Uma visita guiada para quem chega e um pedido rápido de opinião de vez em quando.",
      "O app abre mesmo sem internet e avisa quando estás sem ligação.",
    ],
    melhorias: [
      "A sequência tem um dia de folga por semana: falhar um dia já não a apaga.",
      "Rever cartões conta para a sequência e dá XP.",
      "Os avisos rápidos aparecem na cor da marca e nunca por cima do menu.",
      "A janela de boas-vindas tem margens certas e as cores da marca também no tema escuro.",
      "Transições suaves entre ecrãs e o app abre mais depressa.",
      "Correção automática da ortografia de Portugal nas lições.",
      "Repetir um teste já concluído só dá XP uma vez por dia.",
    ],
    corrigido: [
      "A correção de uma pergunta já não fica escondida por baixo do menu.",
      "Frases para completar com dois espaços mostram-se e corrigem-se bem.",
      "Recomeçar do zero já não volta a mostrar as boas-vindas.",
    ],
  },
  {
    version: "0.9.6",
    date: "2026-10-05",
    title: "Entrar mais depressa",
    melhorias: ["Entrar, criar conta e recuperar a palavra-passe já não pedem a verificação de «és uma pessoa»."],
  },
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
