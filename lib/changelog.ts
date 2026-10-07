// Novidades do app, da mais recente para a mais antiga. Aparecem em "Novidades" e no aviso de atualização.
// Regra: cada publicação com mudanças que se veem acrescenta uma entrada no topo, em PT-PT, a falar para quem usa (sem "Fase N").
// Cada mudança vai para uma lista: `novo` (funcionalidades), `melhorias` (o que já existia e ficou melhor), `corrigido` (erros).
// `kind`: marco (salto de dezena: 0.10, 0.11…, com `aviso: true` e até 3 `destaques`), novidades (há linhas em `novo` ou `melhorias`) ou correcoes (só `corrigido`).
// `aviso: true` manda também um aviso push a quem pediu avisos de atualização: usar só nas atualizações maiores.
export type Kind = "marco" | "novidades" | "correcoes";
export type Release = { version: string; date: string; title: string; kind: Kind; aviso?: boolean; destaques?: string[]; novo?: string[]; melhorias?: string[]; corrigido?: string[] };

/**
 * O cartão «Em breve» das Novidades: o que vem a seguir. Aparece uma vez no ecrã de cada conta (quando `id` muda, volta a aparecer a todos)
 * e fica sempre nas Novidades. Mudar `id` só quando a lista muda de verdade.
 */
export const SOON = {
  id: "2026-10-a",
  items: [
    { title: "O teu mascote, à tua maneira", text: "Variações do mascote e um criador de personagem para fazeres o teu avatar." },
    { title: "Línguas de volta", text: "Lições de línguas com pronúncia, feitas com mais cuidado." },
    { title: "Mais formas de entrar", text: "Entrar com Apple e com Discord." },
  ],
} as const;

export const CHANGELOG: Release[] = [
  {
    version: "0.10.10",
    date: "2026-10-07",
    title: "Troféus no ranking",
    kind: "novidades",
    novo: [
      "Quem acaba a semana nos 10 primeiros do ranking ganha um troféu: ouro, prata ou bronze nos 3 primeiros e uma medalha «Top 10» nos outros.",
      "O Ranking mostra o pódio da semana passada, e os teus troféus ficam no teu Perfil.",
      "Duas conquistas novas: Pódio e Top 10.",
    ],
    melhorias: [
      "O ranking passa a contar, no máximo, 1000 XP por dia.",
    ],
  },
  {
    version: "0.10.9",
    date: "2026-10-07",
    title: "Novidades mais claras",
    kind: "novidades",
    melhorias: [
      "As Novidades mostram as grandes atualizações em destaque, e podes filtrar por Marcos, Novidades e Correções.",
      "Antes de entrares, um aviso diz-te que o NOOBrain está em beta e que algumas coisas podem mudar.",
    ],
  },
  {
    version: "0.10.8",
    date: "2026-10-07",
    title: "A equipa à vista",
    kind: "novidades",
    novo: [
      "Quem faz parte da equipa do NOOBrain tem agora uma etiqueta «Equipa» ao lado do nome, no Ranking, nas Ideias e no perfil.",
    ],
  },
  {
    version: "0.10.7",
    date: "2026-10-05",
    title: "Notificações e testes mais justos",
    kind: "novidades",
    aviso: true,
    novo: [
      "Uma área de notificações (o sino lá em cima): fica lá o que a equipa te diz, quando uma ideia tua muda de estado ou recebe resposta, e quando um erro que reportaste é resolvido.",
      "A equipa pode agora enviar avisos a toda a gente ou a quem tiver de saber.",
      "Respostas «quase certas» nos testes: valem meio ponto, em vez de contarem como erradas.",
      "Nos espaços em branco aparece a tua resposta dentro da frase, e há um botão para ver a resposta quando não sabes.",
      "O cartão «Em breve», nas Novidades, mostra o que vem a seguir.",
    ],
    melhorias: [
      "A correção das respostas curtas ficou mais justa: o que conta é perceberes a ideia, não escreveres as mesmas palavras.",
      "Perguntas mais difíceis nos níveis Intermédio e Avançado, e menos perguntas sobre gostos ou hábitos que variam de pessoa para pessoa.",
      "Passámos a perguntar-te a opinião logo depois da tua primeira lição.",
    ],
    corrigido: [
      "Sair de uma lição a meio (por exemplo, para enviar uma ideia) já não te leva de volta ao início: continuas onde estavas.",
      "Nos espaços em branco, a palavra antes do espaço («o» ou «a») já não engana nem denuncia a resposta.",
      "No ranking, o avatar de cada pessoa passou a ser o que escolheu.",
    ],
  },
  {
    version: "0.10.6",
    date: "2026-10-05",
    title: "Ideias bem arrumadas",
    kind: "novidades",
    novo: [
      "Podes pedir uma revisão de uma ideia tua que foi recusada: explicas porque vale a pena e a equipa volta a olhar para ela.",
      "Novos separadores nas Ideias: A caminho e Recusadas, com cores para cada estado.",
    ],
    corrigido: [
      "As ideias já feitas deixaram de aparecer em Novas e em Populares.",
    ],
  },
  {
    version: "0.10.5",
    date: "2026-10-05",
    title: "Avisos de atualização",
    kind: "novidades",
    novo: [
      "Quando há uma versão nova do NOOBrain, aparece um aviso para atualizares com um toque, sem perderes o teu progresso.",
      "Se uma das tuas trilhas foi melhorada ou corrigida, também aparece um aviso para a atualizares. O teu progresso fica.",
    ],
    melhorias: [
      "O português de Portugal das lições é revisto com um glossário que vai crescendo.",
    ],
  },
  {
    version: "0.10.4",
    date: "2026-10-05",
    title: "Aprender aos poucos",
    kind: "novidades",
    novo: [
      "Limites diários com barras: até 6 lições novas e 3 temas novos por dia. Aprender com pausas fixa melhor, e assim a IA gratuita chega para toda a gente.",
      "Repetir lições, rever cartões e o desafio do dia não contam para o limite.",
    ],
    melhorias: [
      "Mais palavras de Portugal nas lições (feto, guiador, travão, partilhar…) e menos do Brasil.",
    ],
  },
  {
    version: "0.10.3",
    date: "2026-10-05",
    title: "Níveis a sério e português mais cuidado",
    kind: "novidades",
    melhorias: [
      "Iniciante, Intermédio e Avançado têm agora conteúdos mesmo diferentes, e no fim de uma trilha podes subir de nível com um toque.",
      "O português de Portugal está mais cuidado nas lições, no tutor e nas correções.",
      "Três categorias novas no Explorar: Mãos à obra, Sociedade e mente, e Desporto e jogos.",
    ],
    corrigido: [
      "«Intermediário» passa a «Intermédio».",
      "Os temas de línguas estão em pausa enquanto preparamos uma forma melhor de os ensinar. As trilhas que já tens continuam a funcionar.",
    ],
  },
  {
    version: "0.10.2",
    date: "2026-10-05",
    title: "Menu novo, instalar o app e opinião",
    kind: "novidades",
    novo: [
      "Instalar o NOOBrain no telemóvel e no computador, a partir do menu ou das Definições.",
      "«Dar opinião» sempre à mão no menu.",
    ],
    melhorias: [
      "O menu tem agora os 4 ecrãs principais e uma gaveta com o resto (Ideias, Ranking, Novidades, Definições…).",
      "O menu deixa de se mexer quando mudas de ecrã.",
      "O Perfil mostra quem és e o que conseguiste; as Definições juntam tudo o que é configuração, por grupos.",
    ],
    corrigido: [
      "Instalar o app já funciona no Chrome e noutros navegadores do iPhone, com os passos explicados.",
    ],
  },
  {
    version: "0.10.1",
    date: "2026-10-05",
    title: "Entrar e avisos a funcionar",
    kind: "correcoes",
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
    kind: "marco",
    destaques: ["Meta diária e conquistas, com celebração.", "Desafio do dia: 5 perguntas com XP a dobrar.", "O app abre mesmo sem internet."],
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
    kind: "novidades",
    melhorias: ["Entrar, criar conta e recuperar a palavra-passe já não pedem a verificação de «és uma pessoa»."],
  },
  {
    version: "0.9.5",
    date: "2026-10-05",
    title: "Perguntas mais claras",
    kind: "novidades",
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
    kind: "novidades",
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
    kind: "novidades",
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
    kind: "novidades",
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
    kind: "novidades",
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
    kind: "novidades",
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
/** A versão mais recente que merece interromper (marcos e novidades), se a pessoa ainda não a viu. As correções nunca interrompem. */
export function pendingRelease(seen: string | undefined): Release | null {
  const last = CHANGELOG.find((r) => r.kind !== "correcoes");
  if (!last) return null;
  const at = CHANGELOG.findIndex((r) => r.version === seen);
  return at === -1 || CHANGELOG.indexOf(last) < at ? last : null;
}

export const highlights = (r: Release, n = 3) => [...(r.novo ?? []), ...(r.melhorias ?? []), ...(r.corrigido ?? [])].slice(0, n);
