# Plano do NOOBrain (roteiro + beta)

Executar **uma fase de cada vez, por ordem**. No fim de cada fase:
1. `npm run build` e `npm run lint`;
2. commit em português e push na `main`;
3. confirmar no site (linhas da fase na tabela "Verificação");
4. **apagar a secção da fase deste ficheiro** e acrescentar uma linha em "Já feito". A partir da Fase 11, o que muda para quem usa vai também para `lib/changelog.ts`.

As regras gerais estão no `CLAUDE.md`.

**Como aplicar o código das Fases 9 a 11.** Cada uma traz um diff já testado numa cópia do projeto (TypeScript, ESLint e `next build` sem erros; `git apply` funciona neste repositório com os fins de linha do Windows). Copiar o bloco para um ficheiro fora do projeto (ex.: `%TEMP%\fase9.diff`), correr `git apply --check <ficheiro>` e depois `git apply <ficheiro>`. Se o `--check` falhar (o código mudou entretanto), aplicar à mão: o diff diz linha a linha o que sai (`-`) e o que entra (`+`). Os diffs dependem uns dos outros: 9 → 10 → 11.

## Já feito
Identidade e mascote · tema → trilha com IA (Groq gratuito) e fontes abertas · lição guiada com tutor · revisão espaçada com selo, contador e lembretes push com o app fechado · temas parecidos, cache e catálogo partilhado (9 temas, 72 lições) · conta Supabase (Paris) com e-mail e Google, e-mails PT-PT, captcha, idade mínima de 13 anos · perfil com @nome e avatar, definições, apagar conta · Explorar, landing e páginas de tema para o Google (sitemap enviado) · IA só com conta, cotas diárias, cabeçalhos de segurança · ranking semanal e perfil público · mural de ideias com votos · animações leves · ilha de menu, responsivo, tema claro e escuro · privacidade e termos · ícones, manifesto, robots e sitemap · funções em Paris (`cdg1`) · aviso no login quando o app abre dentro de outra app · Novidades, boas-vindas à beta e avisos de atualização (Fase 11) · ensinar de facto I (Fase 12: corrigir o erro, domínio 2/3, perguntas falhadas na revisão, revisão intercalada, retenção aos 7 dias) · cada ecrã com endereço e "voltar" sem passar pelo login (Fase 10) · correções da auditoria (Fase 9: Rever no iOS 16, temas impróprios recusados, lição partilhada protegida).

## Registo de alterações (changelog)
Vive em `lib/changelog.ts` e aparece no app em Novidades.

## Decisões tomadas pelo Rodrigo (não voltar a perguntar)
- Login obrigatório para tudo. Sem conta, só o ecrã de entrada, que mostra os temas disponíveis. Quem entra começa do zero.
- Social: perfis com @nome e ranking semanal. Sem seguir, sem feed, sem comentários.
- Sugestões: mural público com votos. O Rodrigo responde e muda o estado no painel do Supabase.
- Push com o app fechado: aprovado o pacote `web-push`.
- O "Sobre" diz que o app é feito quase 100% com IA e que as ideias, o design e as decisões são do Rodrigo (NOOBjects).
- Sempre dentro dos planos gratuitos, **incluindo a IA** (sem faturação).
- A IA passa do Gemini para o **Groq** (Fase A): é gratuito, não treina com os dados e permite apps usados por menores.
- Idade mínima: **13 anos**. Em Portugal, abaixo disso o RGPD exige consentimento dos pais (Lei 58/2019, art. 16.º).
- Sem domínio próprio por agora: fica `noobrain.vercel.app`.
- Doações com **Ko-fi**: o Rodrigo cria a conta e dá o link.
- Entre os temas iniciais tem de haver uma língua (**Inglês**): o NOOBrain inspira-se no Duolingo, mas quer ser melhor.

## Por decidir ou fazer (Rodrigo)
1. **Antes de publicar a Fase 10**: confirmar que as Redirect URLs do Supabase (Authentication → URL Configuration) aceitam `/entrar`: `https://noobrain.vercel.app/**` e `http://localhost:3000/**` (com `/**`). Se só lá estiver o endereço sem `/**`, o login funciona, mas a janela do Google não se fecha sozinha.
2. **Testar no telemóvel**: depois da Fase 10, o login do Google no Android (Chrome), no iPhone (Safari) e no app instalado; e o que ficou da Fase 8 (CPU 4x mais lenta).
3. **Ko-fi**: criar a conta e dar o link. Vai para `lib/config.ts` → `KOFI_URL` e substitui o "Fundraising em breve" (Sobre, Novidades e boas-vindas da beta).
4. **Desenhos** (para as Fases 15 e 16): ícones das categorias do Explorar, olhos e acessórios do mascote, emblema "Feito com IA · NOOBjects".
5. Se ainda não fizeste: pôr a chave do Groq no `.env.local` (`AI_API_KEY=`) e apagar a chave antiga do Gemini no Google AI Studio.
6. Dinheiro e alojamento: ver a última secção. Nada a fazer até ao fim da beta.

## Regras de execução
- Textos novos em PT-PT, tratando por "tu".
- Migrações com `apply_migration` do Supabase (projeto `klrgitkxdhofsqwyisvn`), seguidas de `get_advisors` (security).
- Variáveis na Vercel e segredos no Vault: quem os põe é o Rodrigo. Diz-lhe o nome e onde; no computador, `.env.local` + o nome em `.env.example`.
- Next 16: ler `node_modules/next/dist/docs/` antes de usar `params`, metadata, headers ou scripts no layout.
- A partir da Fase 11: cada publicação com mudanças visíveis acrescenta uma entrada no topo de `lib/changelog.ts` (PT-PT, para quem usa, sem "Fase N"); `aviso: true` só nas atualizações maiores.

---

## Auditoria de 04/10/2026
Verificado: publicação na Vercel, erros do servidor dos últimos 7 dias, base de dados (tabelas, RLS, permissões e funções), avisos de segurança e desempenho do Supabase, agendamentos, `build`, `lint` e o código das rotas, do login e da revisão.

**Está bem**
- O último commit (`e665760`) está publicado. Não há erros do servidor desde a troca para o Groq (os únicos são de 04/10 à tarde, ainda com o Gemini).
- RLS ligado em todas as tabelas; cada pessoa só lê e escreve o que é seu; o XP do perfil não se muda à mão; as funções internas não estão abertas a quem usa o app.
- O agendamento de hora a hora já corre com sucesso (o Vault está configurado: as respostas passaram de 401 para 200 às 21h de 04/10).
- IA só com sessão, com cota diária por pessoa e global, limite por IP e fila de 25 pedidos por minuto.
- `build` e `lint` sem erros.

**O aviso do WhatsApp**: está publicado e a funcionar. No WhatsApp, os links de conversas normais abrem no navegador do telemóvel (Chrome ou Safari), onde o Google deixa entrar; por isso o aviso não aparece lá, e está certo. Aparece no Instagram, Facebook, TikTok, LinkedIn e noutras apps com navegador embutido. Para testar: mandar o link numa mensagem do Instagram e abri-lo lá. O texto do aviso dava o WhatsApp como exemplo e aparecia por engano no app instalado no iPhone: corrigido na Fase 9.

**O "voltar" depois do Google**: o app é uma página só, por isso os ecrãs não entram no histórico do navegador e "voltar" salta para a página anterior ao app, que é a do Google. Resolvido na Fase 10.

**A corrigir (Fase 9)**
| # | Problema | Efeito | Gravidade |
|---|---|---|---|
| 9.1 | `Object.groupBy` na página Rever | Em iPhones com iOS 16 (o iPhone 8 e o X não passam daí) a página Rever rebenta quando há cartões | alta |
| 9.2 | Aviso de "outra app" | Aparece por engano no app instalado no iPhone; o texto falava do WhatsApp; sem saída fácil no Android | média |
| 9.3 | Texto antigo no "Criar conta" | Diz que a conta é opcional (deixou de ser na Fase 1) | baixa |
| 9.4 | Temas impróprios | Qualquer tema escrito entra no catálogo público (landing, `/temas` e Google). A IA passa a recusar o que não é adequado a 13+ | média |
| 9.5 | Lição partilhada adulterável | Quem chamasse a API à mão podia mandar um resumo falso e criar, para toda a gente, a lição de um conceito com conteúdo errado | média |
| 9.6 | `.env.example` incompleto | Faltam os nomes das variáveis dos avisos e da cota global | baixa |
| 9.7 | Sem índice em `reports.user_id` | Aviso de desempenho do Supabase | baixa |

**Riscos aceites na beta** (sem mudança agora)
- Ranking: cada gravação do progresso pode subir até 1000 XP, por isso quem mexer no navegador consegue subir no ranking. `ponytail:` validar o XP no servidor (por lição concluída) se o ranking ganhar peso.
- `bump_catalog_use` pode ser chamado muitas vezes (aviso do Supabase): só mexe na ordem do Explorar.
- O limite por IP é em memória e aproximado com várias instâncias da Vercel; o limite real são as cotas no banco.
- Sem `Content-Security-Policy`: no Next exigiria nonces e páginas dinâmicas. Rever se entrar código de terceiros.
- Proteção de palavras-passe vazadas: não existe no plano gratuito do Supabase.
- O agendamento lê o progresso de cada aparelho com avisos, um a um (até 500): chega para a beta.
- Supabase gratuito: pausa o projeto após 7 dias sem atividade (com utilizadores não acontece). O Gmail envia ~500 e-mails por dia: se as contas novas crescerem, ver a Fase 18 (e-mails).
- No `.gitignore`, a linha `.env*` aparece outra vez depois de `!.env.example`; como o `.env.example` já está no Git, as mudanças continuam a ser seguidas.

---

## Roteiro: Fases 12 a 18
Tudo o que estava em "Ideias para depois" e nas ideias de didática, organizado por ordem de impacto: primeiro o que faz o app ensinar melhor, depois o hábito, depois o resto. **Antes de executar cada uma, o Opus detalha-a com código testado, como as Fases 9 a 11.** O Rodrigo pode mudar a ordem.

### Fase 13: ensinar de facto II (recordar primeiro, mais tipos de pergunta, nível certo)
Os campos novos da lição são opcionais: as lições antigas continuam a funcionar. No fim, acrescentar `--refresh` ao `scripts/seed-catalog.mjs` e refazer as lições dos 9 temas iniciais.
1. **Aquecimento** (`app/api/lesson`, `LessonView.tsx`): `warmup: { q, options[4], answer }`. Antes da explicação, "Antes de começar: o que achas?", sem nota; a certa aparece no fim da explicação. É uma hipótese: comparar a retenção (Fase 12, ponto 5) antes e depois.
2. **Completar a frase e ordenar passos**: `cloze: [{ text, answer, accept[] }]` (1 por lição) e `order: [{ prompt, steps[3 a 5] }]` (0 ou 1, só quando o conceito tem passos). `Quiz.tsx` passa a receber itens de tipos diferentes (`kind: "mc" | "cloze" | "order"`); o cloze compara sem acentos nem maiúsculas e aceita as variantes de `accept`.
3. **Resposta curta avaliada pela IA** (1 por lição, opcional): `/api/tutor` ganha o modo `avaliar` → `{ correct, feedback }`, com o que faltou e porquê, sem elogios vazios (pesquisa, ponto 6). Conta na cota do tutor.
4. **Exemplos que se apagam** (`app/api/lesson`): o pedido leva a posição do conceito na trilha. 1.º conceito: exemplo resolvido completo; 2.º e 3.º: exemplo com um passo em falta (vira um cloze); a partir do 4.º: só o problema, com a solução atrás de "Mostrar".
5. **Nível certo** (`app/api/trail`, `NewTopic.tsx`): a trilha traz `diagnostic` (3 perguntas), na mesma chamada à IA. Ao criar o tema, "Queres um teste rápido para escolher o nível?" (opcional); 3 de 3 no Iniciante → sugere o Intermédio.
6. **Prompts em PT-PT** (`app/api/trail`, `lesson`, `tutor`): as instruções internas ainda estão em português do Brasil ("Você é um professor…"); passá-las para PT-PT a tratar por tu, já que esta fase mexe nos prompts. Não muda o que a pessoa lê, mas reduz o risco de brasileirismos nas lições.

### Fase 14: hábito (meta diária, conquistas, celebrações, arquivo, 404, sem ligação)
1. **Meta diária de XP** (`lib/types.ts`, `App.tsx`, `Settings.tsx`): `State.goal` (10, 30 ou 50; por omissão 30) e `State.today: { day, xp }`, somado em cada ganho e reiniciado noutro dia. No cabeçalho, anel de progresso à volta do XP (SVG, `--brand`; `--ok` só quando cumprida). Ao cumprir: celebração e "Meta de hoje cumprida". Definições → "Meta diária". O lembrete das 19h diz quanto falta.
2. **Conquistas** (novo `lib/badges.ts`, `ProfileView.tsx`): lista fixa (`id`, nome, descrição, ícone, `test(state)`): primeiro conceito, primeira trilha concluída, 3, 7 e 30 dias seguidos, 100 cartões revistos (novo contador `State.reviewed`), 5 temas, 1000 XP. `State.badges: Record<id, data>`. O `App` verifica depois de cada mudança e mostra a conquista nova numa janela (`<dialog>`, como as boas-vindas). Perfil: grelha com as ganhas e as por ganhar (cinzentas, com a dica).
3. **Celebrações** (`globals.css`): confettis só com CSS (pseudo-elementos, `transform` e `opacity`; cores `--brand`, `--sun`, `--brand-soft`) ao concluir conceito, trilha, meta e conquista. Desligados com "reduzir movimento".
4. **Arquivar trilhas** (`App.tsx`, `lib/store.ts`): `Trail.archived?: boolean`; "Arquivar" ao lado de "Apagar esta trilha". As arquivadas saem dos chips e da revisão; "Arquivadas (N)" no fim dos chips para as reabrir.
5. **Página 404** (`app/not-found.tsx`; ler o guia do Next 16): mascote triste, "Esta página não existe", botão "Ir para o início".
6. **Sem ligação e modo offline** (`public/sw.js`, `App.tsx`, `lib/useSync.ts`): registar o service worker sempre (hoje só com lembretes). Páginas: rede primeiro e cópia guardada se falhar; `/_next/static/`: cache primeiro (os nomes já mudam a cada versão). Aviso "Sem ligação: o progresso fica guardado e sobe quando voltares" (`online`/`offline`); botões da IA desativados sem ligação; ao voltar, sincronizar logo. Teste: modo avião, abrir o app, rever cartões, voltar online e ver o progresso na nuvem.
7. **Desempenho da página inicial**: o Lighthouse (telemóvel) dá 83 e a meta é 90. Medir de novo depois das Fases 10 e 11 e, se faltar, carregar só quando são precisos os ecrãs que quem chega não usa (`next/dynamic` para `Account`, `Ideas`, `Ranking`, `Settings` e `News`).

### Fase 15: Explorar e criação de temas
1. **Categorias** (migração, `app/api/trail`, `Explore.tsx`): `alter table public.catalog_trails add column category text not null default 'outros' check (category in ('ciencias','historia','linguas','artes','tecnologia','saude','dinheiro','outros'));`. A IA escolhe a categoria (`enum` no esquema); os 9 temas atuais acertam-se com `update`. Explorar: chips por categoria, filtro de nível, "Populares" / "Novos" e ícone por categoria (desenhos do Rodrigo, 24 px, traço como os do `Icons.tsx`).
2. **Desambiguação com escolhas** (`app/api/trail`, `NewTopic.tsx`): com `needs_context`, a IA devolve também `options` (2 a 4 significados, ex.: "Mercúrio (planeta)", "Mercúrio (elemento químico)"), mostrados como chips "Querias dizer…"; tocar gera essa trilha.
3. **"Já existe"** (`NewTopic.tsx`): ao escrever, procurar no catálogo (lista carregada uma vez) com `sameTopic` e mostrar "Já existe: X. Começar já", sem IA e instantâneo.
4. **Mais fontes** (`lib/sources.ts`): Open Library (gratuita, sem chave) quando o tema é um livro ou autor: `https://openlibrary.org/search.json?q=<tema>&limit=1` → fonte com título, autor e link. Pesquisa na web citada só se houver um serviço gratuito sem cartão: pesquisar antes de prometer.
5. **Mapa dos temas** (Perfil): todas as trilhas como nós (concluídas, em curso, cartões por rever), para ver de relance o que se sabe. Um mapa de dependências entre conceitos só se a IA o der com qualidade: testar com 3 temas antes.

### Fase 16: identidade (criador de personagem, emblema, animações)
1. **Criador de personagem** (migração, `Mascot.tsx`, `lib/mascot-paths.ts`, `ProfileForm.tsx`): `alter table public.profiles add column look jsonb not null default '{}'` com `check` dos campos `c` (cor, 0 a 7), `e` (olhos, 0 a 3) e `a` (acessório, 0 a 5), e `grant update (look) on public.profiles to authenticated`. O Rodrigo desenha os olhos e os acessórios em SVG, no `viewBox` do mascote. Editor com separadores Cor / Olhos / Acessório e pré-visualização. Os acessórios desbloqueiam com XP (100, 500, 1000, 2500, 5000) ou conquistas (Fase 14); os bloqueados mostram um cadeado e a dica.
2. **Emblema "Feito com IA · NOOBjects"** (novo `components/MadeWithAI.tsx`): desenho do Rodrigo (SVG, claro e escuro); substitui o chip do Sobre e a linha do rodapé e liga a "Como é feito" no Sobre.
3. **Animações sofisticadas**: transições entre ecrãs com a View Transitions API (`document.startViewTransition` dentro do `navigate` da Fase 10, só se existir e sem "reduzir movimento"); o nó da trilha "voa" para o título da lição (`view-transition-name`); mascote reativo (pisca, olha para o botão em foco, salta nas celebrações); micro-interações em cartões e respostas. Só `transform` e `opacity`; testar com a CPU 4x mais lenta.

### Fase 17: línguas com voz e esquemas nas lições
1. **Ouvir** (novo `lib/speech.ts`): `speechSynthesis` do navegador (gratuito, sem chave), voz `en-GB` ou `en-US`. A trilha ganha `lang` (a IA indica a língua estudada). Botão de altifalante nos cartões e frases dessa língua; pergunta "Ouve e escolhe".
2. **Repetir a frase**: `SpeechRecognition` (Chrome, Edge e Safari) compara o que disseste com a frase (sem pontuação nem maiúsculas, até 20% de diferença); onde não existir, o botão não aparece. Exige mudar `microphone=()` para `microphone=(self)` em `next.config.ts` e acrescentar à Privacidade que, no Chrome, o reconhecimento de voz é feito por servidores da Google (confirmar a documentação antes; há menores no app).
3. **Conversa guiada** (`/api/tutor`, modo `conversa`): diálogo curto em inglês sobre a lição, com correções. Conta na cota do tutor.
4. **Esquemas** (novo `components/Figure.tsx`): a lição pode trazer `diagram: { kind: "passos" | "ciclo" | "comparar", labels: string[] }` e o app desenha-o com modelos SVG fixos, na identidade do app. A IA não gera SVG; o esquema não repete o texto por baixo (Mayer).

### Fase 18: bastidores (administração, opinião, tutorial, e-mails)
1. **Painel de administração** (vista `admin`, só para os ids em `ADMIN_IDS`, variável só do servidor; o app pergunta a `/api/admin/me`). Rotas `/api/admin/*` com a chave secreta:
   - Ideias: todas, com estado e resposta editáveis; ao mudar o estado, aviso push ao autor ("A tua ideia «X» passou a Planeada"), se tiver avisos ligados (novo tipo `ideas` em `notify`, ligado por omissão);
   - Erros reportados: lista e "resolvido" (`alter table public.reports add column resolved boolean not null default false`);
   - Números: contas, ativas nos últimos 7 dias, pedidos à IA hoje e por tipo, temas e lições no catálogo, aparelhos com avisos, média da opinião, retenção aos 7 dias (Fase 12);
   - Catálogo: apagar um tema impróprio.
2. **Opinião dentro do app**: depois da 3.ª lição e de cada trilha concluída, cartão "Como está a correr?" (1 a 5 e texto opcional) → tabela `feedback` (RLS: inserir só o próprio; ler só pela rota de admin).
3. **Tutorial**: depois de criar o perfil, 3 passos numa janela (Trilha, Lição, Rever), com "Saltar"; `State.tour = true`.
4. **E-mail de boas-vindas e Resend**: em espera. O Resend só envia para outras pessoas com um domínio próprio verificado (confirmar nos termos atuais) e a decisão é não ter domínio. Alternativa: o SMTP do Gmail que o Supabase já usa, com o pacote `nodemailer` (pacote novo: pedir ok ao Rodrigo).

## Notas de pesquisa: didática (ensinar DE FACTO)
Pesquisa feita a 04/10/2026; é a base das Fases 12, 13 e 17. Cada ponto tem a fonte; o que não tem fonte é hipótese e está marcado.

### O que a investigação diz (resumo)
1. **Recordar vale mais do que reler.** Praticar o teste e a distribuição no tempo foram as técnicas com maior utilidade em 10 analisadas, por funcionarem em várias idades e matérias ([Dunlosky et al., 2013](https://www.whz.de/fileadmin/lehre/hochschuldidaktik/docs/dunloskiimprovingstudentlearning.pdf)). Em Roediger e Karpicke (2006), quem praticou recordação reteve 61% de um texto após uma semana contra 40% de quem releu ([resumo](https://yukaichou.com/gamification-analysis/retrieval-practice-testing-effect-roediger-karpicke-learning/)); a vantagem aparece sobretudo a prazo, e é maior quando há feedback depois do teste ([Roediger e Karpicke, 2006](http://psychnet.wustl.edu/memory/wp-content/uploads/2018/04/Roediger-Karpicke-2006_PPS.pdf)).
2. **Dificuldades desejáveis** (Bjork, 1994): espaçar, misturar temas (intercalar), testar e fazer a pessoa gerar a resposta tornam a aprendizagem mais lenta no momento e mais duradoura ([síntese](https://www.structural-learning.com/post/robert-bjork-teachers-guide-desirable)).
3. **Rosenshine, 10 princípios:** rever o que se aprendeu, apresentar em passos pequenos, fazer perguntas, dar modelos, guiar a prática, verificar a compreensão, obter uma taxa de sucesso alta, dar apoios em tarefas difíceis, treinar a autonomia e rever todas as semanas e meses ([American Educator](https://www.aft.org/sites/default/files/Rosenshine.pdf)).
4. **Carga cognitiva:** quem sabe pouco aprende mais com exemplos resolvidos do que a resolver problemas, e o efeito inverte-se com a experiência (efeito de inversão da perícia); a solução é ir retirando o apoio aos poucos ([síntese](https://education.nsw.gov.au/content/dam/main-education/about-us/educational-data/cese/2017-cognitive-load-theory.pdf)).
5. **Multimédia (Mayer):** palavras mais imagens ensinam melhor do que só palavras; menos enfeites (coerência); narração com imagem sem repetir o mesmo texto no ecrã ([12 princípios](https://lucidea.com/blog/mayers-12-principles-of-multimedia-learning/)).
6. **Feedback (Hattie e Timperley, 2007):** é mais útil ao nível da tarefa, do processo e da autorregulação; o elogio pessoal ("és ótimo!") ajuda pouco ([PDF](https://conselhopedagogico.tecnico.ulisboa.pt/files/sites/32/hattie-and-timperley-2007.pdf)).
7. **Domínio antes de avançar (Bloom):** a aprendizagem por domínio (teste, feedback, correção antes de seguir) teve um grande efeito em grupo; o famoso "2 sigma" do tutor individual é contestado, mas o domínio em si aguenta ([análise](https://www.educationnext.org/two-sigma-tutoring-separating-science-fiction-from-science-fact/)).
8. **Estilos de aprendizagem não têm base:** não há prova de que ensinar no "estilo" preferido ajude ([Pashler et al., 2008](https://digitalcommons.usf.edu/psy_facpub/1765/)). **Não pôr** escolha "visual/auditivo/..." no app.
9. **Línguas:** as apps vão bem para vocabulário e compreensão (ler e ouvir), mas pouco para falar ([estudo](https://www.researchgate.net/publication/341904580_The_effectiveness_of_app-based_language_instruction_for_developing_receptive_linguistic_knowledge_and_oral_communicative_ability)); o reconhecimento de voz por IA ajuda na pronúncia ([ERIC](https://files.eric.ed.gov/fulltext/EJ1440171.pdf)).

### Limites desta pesquisa
Os resumos vêm de artigos e sínteses, não li os livros completos (Make It Stick, Visible Learning, Cognitive Load Theory de Sweller). Antes de ler como lei, ler os originais dos pontos 1, 2 e 7.

## Verificação
| Fase | Verificar | Esperado |
|---|---|---|
| todas | `npm run build` e `npm run lint` | sem `error` |
| todas | `get_advisors` security | só os aceites: palavras-passe vazadas, `bump_catalog_use` e "RLS sem política" em `ai_daily`, `ai_usage` e `reports` (tabelas internas) |
| 9 | Rever com cartões em Safari 16 (iPhone com iOS 16 ou simulador) | abre a lista e a sessão |
| 9 | ecrã de entrada no app instalado no iPhone | sem aviso de "outra app" |
| 9 | link aberto numa mensagem do Instagram (Android) | aviso; "Abrir no Chrome" abre o Chrome |
| 9 | tema "insulto qualquer" | "Esse tema não é adequado ao NOOBrain…"; nada novo em `catalog_trails` |
| 9 | `POST /api/lesson` com um resumo inventado para um conceito que já está no catálogo | a lição usa o resumo do catálogo |
| 10 | Trilha → Explorar → Rever, depois "voltar" duas vezes | Explorar, depois Trilha (sem recarregar) |
| 10 | recarregar em `/?v=licao&c=1` | abre o 2.º conceito |
| 10 | `/?v=licao&c=9` com 2 conceitos concluídos | abre o conceito atual, nunca um fechado |
| 10 | Google no Chrome do computador e do Android | janela à parte fecha-se; app com sessão e toast; "voltar" não leva ao Google |
| 10 | Google no app instalado e no Instagram | método antigo; entra (ou mostra o aviso) |
| 10 | terminar sessão e carregar em "voltar" | ecrã de entrada |
| 11 | conta nova | boas-vindas da beta com a pergunta; Esc não fecha |
| 11 | conta que já existia | cartão da pergunta; depois as novidades 0.9.1 |
| 11 | "Sim, avisa-me" com os lembretes desligados | novidades ligadas; lembretes de revisão continuam desligados |
| 11 | selo Beta | abre Novidades; o cartão de novidades deixa de aparecer |
| 11 | agendamento com a versão `aviso: true` | um aviso "Novidades no NOOBrain" por aparelho; tocar abre Novidades; `news_sent` = versão |
| 11 | iPhone sem o app instalado → "Sim, avisa-me" | toast a explicar "Adicionar ao ecrã principal" |
| sempre | janela anónima no site | só o ecrã de entrada, com Beta e temas |
| sempre | conta nova | 0 XP, sem trilhas, "Cria o teu perfil" com a caixa dos 13 anos |
| sempre | `update profiles set xp = 999` pelo navegador | recusado |
| sempre | `curl -X POST /api/trail` sem token | 401 |
| sempre | `cron.job_run_details` | `succeeded` de hora a hora |
| sempre | apagar conta de teste | as linhas desaparecem em todas as tabelas |
| sempre | tema Escuro com o sistema em claro | escuro, sem flash |
| sempre | CPU 4x mais lenta e "reduzir movimento" | fluido; parado quando reduzido |

---

## Dinheiro e alojamento (decidir depois da beta)
O que a pesquisa encontrou (outubro de 2026):
- **Vercel Hobby** ([regras](https://vercel.com/docs/limits/fair-use-guidelines)): só uso não comercial. **Pedir doações é permitido** ("Asking for Donations does not fall under commercial usage"). Anúncios (incluindo AdSense) e qualquer pagamento obrigam ao **Pro: $20 por mês**, com $20 de crédito de uso incluído.
- **Doações**: o Ko-fi não cobra comissão sobre doações (só as taxas do Stripe/PayPal, ~2,9% + $0,30). O Buy Me a Coffee cobra 5%. O GitHub Sponsors cobra 0% a contas pessoais.
- **Plano "Apoiante"** (mais cota de IA, avatares, selo): usar um *merchant of record*, que vende em nome do Rodrigo e trata do IVA de todos os países da UE.
  - O Paddle cobra 5% + $0,50, tudo incluído.
  - O Lemon Squeezy cobra 5% + $0,50, mais extras internacionais e de subscrição.
  - O Stripe sozinho é mais barato, mas o IVA e as faturas ficam com o Rodrigo. Em Portugal, faturar exige software certificado: confirmar com um contabilista.
- **Alternativa de alojamento**: o Cloudflare Workers gratuito permite uso comercial (100 000 pedidos por dia), mas tem 10 ms de CPU por pedido e 3 MiB por worker, e o Next 16 precisaria do adaptador OpenNext. É arriscado; só com uma prova antes.
- **Anúncios**: último recurso. Na UE exigem banner de consentimento, quebram o tom acolhedor e rendem pouco com poucos utilizadores.

**Recomendação** (o Rodrigo já escolheu o Ko-fi para a beta):
1. Na beta, Ko-fi no "Sobre" e no aviso da beta (permitido no Hobby, custo zero).
2. Com utilizadores fiéis, plano Apoiante via Paddle + Vercel Pro ($20 por mês).
3. Anúncios só se nada mais resultar.

## Ideias para depois
Vazio: tudo o que estava aqui entrou nas Fases 11 a 18. Ideias novas entram aqui numa linha; o Opus planeia-as depois.
