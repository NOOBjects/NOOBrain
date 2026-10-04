@AGENTS.md

# NOOBrain (leia isto antes de abrir arquivos)

App web para aprender qualquer tema, estilo Duolingo com a identidade da NOOBjects (estúdio do usuário, que é designer e leigo em código). Responder em português, curto, explicando o essencial como a um cliente inteligente. O usuário decide o quê, eu decido o como.

## O que o app faz
1. **Tema → trilha**: a pessoa digita um tema; a IA monta 6 a 8 conceitos em ordem, a partir de fontes abertas (Wikipédia, Wikilivros, Wikiversidade, Wikisource).
2. **Lição guiada por conceito**: Aprender (explicação revelada por blocos) → Memorizar (cartões; "De novo" volta até acertar) → Testar (quiz de 3 perguntas). Tutor de chat disponível em qualquer passo.
3. **Revisão espaçada** dos cartões (caixas de 0 a 35 dias), com selo na ilha, aviso na trilha, contador no título da aba e notificação opcional.
4. **XP e sequência de dias**. Conta opcional (Supabase) sincroniza o progresso; sem conta tudo fica no navegador.
5. **Detecção de temas parecidos** (`lib/topic.ts`): "Fernando Pessoa" e "Fernando Pessoa poeta" abrem a mesma trilha em vez de gerar outra.

## Stack e onde está cada coisa
- Next.js 16 (App Router) + TypeScript, CSS puro em `app/globals.css` (tokens no topo). Sem Tailwind.
- `components/`: `App.tsx` (casca e navegação), `Island.tsx` (menu flutuante), `LessonView.tsx` (lição guiada), `Deck.tsx` (cartões), `Quiz.tsx`, `Tutor.tsx`, `ReviewView.tsx`, `NewTopic.tsx`, `Account.tsx`, `Mascot.tsx` (mascote SVG animado), `TrailNode.tsx`.
- `lib/store.ts`: estado inteiro no localStorage (`noobrain:v2`) + revisão espaçada + sequência. `lib/useSync.ts`: copia o estado para o Supabase quando há login (vence o `updatedAt` mais novo).
- `lib/ai.ts`: **único** ponto de contato com a IA (Google Gemini, plano gratuito, 10 pedidos/min). Fila de 9/min, modelos reserva, tentativas em 500/503. Trocar de provedor = editar só este arquivo.
- `lib/sources.ts` (busca nas wikis), `lib/cache.ts` (cache em memória do servidor), `lib/limit.ts` (limite por IP), `lib/topic.ts` (+ `topic.test.ts`, rodar `npm run check:topic`).
- Rotas: `app/api/trail`, `lesson`, `tutor`, `report`.
- Banco (Supabase, **Europa, Paris, projeto `noobrain-eu`**): tabelas `progress` e `reports`, ambas com RLS. Migração já aplicada.

## Regras do projeto
- Visual: azul NOOB, **cantos chanfrados a 45° (nunca arredondados)**, profundidade por sombra sólida de 4px sem blur. Cores, cantos e sombras só nos tokens. Verde/vermelho só para certo/errado.
- Nunca colocar chaves no código. `.env.local` está fora do Git; `.env.example` mostra as variáveis. A chave pública do Supabase é pública por natureza; a proteção é o RLS.
- Antes de dizer que terminou: `npm run build`, `npm run lint` e, se mexeu em `lib/topic.ts`, `npm run check:topic`.
- Ações irreversíveis ou públicas (apagar dados, publicar, mexer em contas) pedem confirmação.

## Estado e roteiro
Veja `ROADMAP.md`.

## Publicação
- No ar em https://noobrain.vercel.app (Vercel, equipe NOOBjects `noob-jects`, funções em Paris `cdg1`, ver `vercel.json`). Variáveis de produção já cadastradas na Vercel.
- Atualizar: `git commit` e depois `npx vercel deploy --prod --scope noob-jects` (o CLI já está logado).
- GitHub ainda **não** conectado (falta o usuário criar o repositório vazio ou autorizar). Quando conectar: `git remote add origin ...`, `git push`, e ligar o repositório ao projeto na Vercel para deploy automático.
- Supabase: projeto europeu `noobrain-eu` (Paris). O projeto de São Paulo `noobrain` foi pausado e deve ser apagado pelo usuário no painel.
