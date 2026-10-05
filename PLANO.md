# Plano do NOOBrain (roteiro + beta)

Executar **uma fase de cada vez, por ordem**. No fim de cada fase:
1. `npm run build` e `npm run lint`;
2. commit em português e push na `main`;
3. confirmar no site (linhas da fase na tabela "Verificação");
4. **apagar a secção da fase deste ficheiro** e acrescentar uma linha em "Já feito". A partir da Fase 11, o que muda para quem usa vai também para `lib/changelog.ts`.

As regras gerais estão no `CLAUDE.md`.

**Como aplicar o código das Fases 9 a 11.** Cada uma traz um diff já testado numa cópia do projeto (TypeScript, ESLint e `next build` sem erros; `git apply` funciona neste repositório com os fins de linha do Windows). Copiar o bloco para um ficheiro fora do projeto (ex.: `%TEMP%\fase9.diff`), correr `git apply --check <ficheiro>` e depois `git apply <ficheiro>`. Se o `--check` falhar (o código mudou entretanto), aplicar à mão: o diff diz linha a linha o que sai (`-`) e o que entra (`+`). Os diffs dependem uns dos outros: 9 → 10 → 11.

## Já feito
**0.10.4 (05/10/2026):** limites diários (6 lições novas e 3 temas novos com IA), barras na trilha, no Novo tema e no Perfil, ecrã de descanso, `/api/quota`; donos sem limite.
**0.10.3 (05/10/2026):** três níveis de verdade (Iniciante, Intermédio, Avançado), português de Portugal reforçado (`lib/prompt.ts`, `ptpt`), categorias novas, línguas em pausa.
**0.10.2 (05/10/2026):** menu com 4 ecrãs e gaveta "Mais opções" (sem botão Lição, sem movimento), instalar o app (`lib/install.ts`, manifesto completo com ícone maskable, capturas e atalhos), "Dar opinião" no menu, Perfil (identidade, hoje, números, conquistas, temas) e Definições em lista agrupada com subecrãs (`?v=definicoes&s=`).
**0.10.1 (05/10/2026):** login com e-mail explicado quando o captcha falha, lembretes ligados à conta certa (`/api/push/subscribe`), limpeza de `\n` nas lições, contador de temas por `catalog_starts` · (plano completo em `PLANO-0.11.md`).
**0.10 (05/10/2026):** meta diária com anel no cabeçalho, conquistas (12) com janela e confettis, desafio do dia, ligar pares no teste, dia de folga na sequência, revisão dá XP e conta para a sequência, arquivar trilhas, 404, modo sem ligação (service worker + faixa + sincroniza ao voltar), ecrãs carregados só quando abertos, transições entre ecrãs, mascote que pestaneja, Explorar com categorias/ordem/nível, "Já existe" e "Querias dizer…" no Novo tema, Open Library nas fontes, mapa dos temas e conquistas no Perfil, ouvir a explicação e a pronúncia (voz do aparelho), visita guiada, pedido de opinião (tabela `feedback`), painel de administração (`ADMIN_IDS`), revisão ortográfica PT-PT (`lib/ptpt.ts`), XP de repetição limitado a 1×/dia por conceito, toast e boas-vindas redesenhados · Identidade e mascote · tema → trilha com IA (Groq gratuito) e fontes abertas · lição guiada com tutor · revisão espaçada com selo, contador e lembretes push com o app fechado · temas parecidos, cache e catálogo partilhado (9 temas, 72 lições) · conta Supabase (Paris) com e-mail e Google, e-mails PT-PT, captcha, idade mínima de 13 anos · perfil com @nome e avatar, definições, apagar conta · Explorar, landing e páginas de tema para o Google (sitemap enviado) · IA só com conta, cotas diárias, cabeçalhos de segurança · ranking semanal e perfil público · mural de ideias com votos · animações leves · ilha de menu, responsivo, tema claro e escuro · privacidade e termos · ícones, manifesto, robots e sitemap · funções em Paris (`cdg1`) · aviso no login quando o app abre dentro de outra app · Novidades, boas-vindas à beta e avisos de atualização (Fase 11) · ensinar de facto II (Fase 13: aquecimento, completar frase, ordenar passos, resposta curta corrigida pela IA, exemplos que se apagam, teste de nível, prompts em PT-PT) · ensinar de facto I (Fase 12: corrigir o erro, domínio 2/3, perguntas falhadas na revisão, revisão intercalada, retenção aos 7 dias) · cada ecrã com endereço e "voltar" sem passar pelo login (Fase 10) · correções da auditoria (Fase 9: Rever no iOS 16, temas impróprios recusados, lição partilhada protegida).

## Estado atual e o que falta (atualizado a 05/10/2026, versão 0.10)
Quem continuar: ler esta secção primeiro.

**Próximo trabalho: `PLANO-0.11.md`** (diagnóstico de 05/10/2026 e 11 fases decididas, da 0.10.1 à 0.11, com testes e critérios de aceitação).
Testes no navegador sem contas reais: `tests/e2e/` (Supabase falso + Playwright; ver o README dessa pasta).

**Publicado** (versão 0.10 em `lib/changelog.ts`): Fases 14, 15 e quase todas as 16 a 18 (ver "Já feito"), mais a revisão visual pedida pelo Rodrigo (aviso rápido acima do menu e na cor da marca, boas-vindas com margens e cores certas também no escuro, botões pequenos que não existiam no CSS, hierarquia do Perfil).
- Migrações aplicadas no Supabase: `catalog_trails.category` (com `check`), tabela `feedback` (RLS: só inserir a própria), `reports.resolved`. As escritas de dados no catálogo foram bloqueadas a partir da sessão na nuvem; por isso a categoria dos 9 temas iniciais está no código (`lib/categories.ts`, `KNOWN`). Pode ficar assim.
- Testado num Supabase falso local (`/tmp`, não está no Git): entrar, boas-vindas, visita guiada, Explorar com categorias, lição inteira (aquecimento, cartões, 5 tipos de pergunta), resultado com confettis e conquistas, meta diária, desafio do dia, revisão, "Já existe", sem ligação, 404, Perfil, Definições, Admin, em claro/escuro, telemóvel e computador. **Não testado com a IA** (sem chave na sessão): "Querias dizer…", categoria escolhida pela IA, correção da resposta curta e tutor.

**Pendente: o que precisa do Rodrigo**
1. **Painel de administração**: pôr na Vercel a variável `ADMIN_IDS` (Settings → Environment Variables) com o id da conta dele (Supabase → Authentication → Users → copiar o UID), e publicar de novo. Aparece em Definições → Administração.
2. **Desenhos**: ícones das categorias (os atuais em `Icons.tsx` são provisórios: Flask, Column, Speech, Palette, Chip, Cross, Coin), olhos e acessórios do mascote (criador de personagem), emblema "Feito com IA · NOOBjects".
3. **Ko-fi**: o link vai para `lib/config.ts` → `KOFI_URL` e substitui o "Fundraising em breve".
4. **Catálogo**: refazer as lições de Teoria das cores e as 2 que faltam de Primeiros socorros (`npm run seed:catalog -- --refresh "--only=Primeiros socorros,Teoria das cores"` no computador dele). Enquanto não, funcionam como lições antigas.
5. **Voz a falar (repetir a frase)**: usa o reconhecimento de voz do Chrome, que envia o áudio para a Google. Há menores no app: decidir antes; exige mudar a Privacidade e `microphone=(self)` em `next.config.ts`.
6. **E-mail de boas-vindas**: precisa de `nodemailer` (pacote novo) ou de domínio próprio para o Resend.
7. **Testar no telemóvel**: ouvir (vozes pt-PT variam por aparelho), sem ligação (app instalado, modo avião), confettis com a CPU lenta.

**Pendente: código (sem bloqueio)**
- Conversa guiada em inglês no tutor (Fase 17.3) e esquemas desenhados nas lições (Fase 17.4, `Figure.tsx`): precisam de testar a IA com chave.
- Criador de personagem (Fase 16.1): espera pelos desenhos.
- Sem ligação: os ecrãs nunca abertos antes não estão guardados; e a sessão do Supabase expira ao fim de 1 h sem rede (o app pede para entrar). Aceite na beta.

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
- ~~Entre os temas iniciais tem de haver uma língua (Inglês)~~ → **Línguas em pausa desde 05/10/2026**: o formato atual não serve para línguas; voltam com um formato próprio.
- Ideias recusadas aparecem a vermelho (`--bad`), com pedido de revisão: exceção aceite à regra "`--bad` só para errado" (05/10/2026).
- Sem CAPTCHA no login (05/10/2026): também desligado no Supabase.

## Por decidir ou fazer (Rodrigo)
1. ~~Redirect URLs do Supabase~~ confirmadas a 05/10/2026.
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

## Roteiro
As Fases 12 a 18 estão feitas (ver "Já feito"), menos o que está em "Pendente". Próximas ideias em "Ideias para depois".

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
| todas | `npm run check:topic` e `npm run check:ptpt` | tudo `ok` |
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
| 12 | no teste, errar uma pergunta | mostra "Resposta certa" e "Porquê"; volta no fim da ronda até acertar; a barra só avança nas resolvidas |
| 12 | acertar menos de 2/3 à primeira | ecrã "Quase lá"; o conceito seguinte continua fechado; "Rever a explicação" e "Repetir o teste" funcionam |
| 12 | errar uma pergunta de escolha múltipla e abrir Rever | a pergunta aparece com as opções; certa = "Bom", errada volta em 10 min |
| 12 | Perfil depois de rever um cartão com intervalo de 7 dias ou mais | "Retenção aos 7 dias: X%" |
| 13 | abrir uma lição refeita | aquecimento com resposta imediata → explicação → cartões → teste com completar, ordenar e resposta curta |
| 13 | ordenar passos arrastando (rato e dedo) e com as setas do teclado na pega | a lista reordena-se ao arrastar; "Verificar" corrige |
| 13 | resposta curta sem ligação ou com a cota esgotada | "Sem correção" e conta como certa |
| 13 | criar tema novo no Iniciante | "Queres um teste rápido?"; 3 de 3 sugere o Intermediário |
| 13 | lição antiga (sem campos novos) | abre como antes, sem erros |
| 0.10 | ganhar XP até à meta | anel do cabeçalho enche; ao cumprir: toast, confettis e anel amarelo |
| 0.10 | primeiro conceito dominado | janela "Conquista nova"; Perfil mostra a conquista |
| 0.10 | 2 conceitos concluídos | cartão "Desafio do dia" na Trilha; 5 perguntas; XP a dobrar; uma vez por dia |
| 0.10 | falhar exatamente 1 dia | sequência continua e toast do dia de folga (1 por semana) |
| 0.10 | modo avião com o app aberto | faixa amarela "Sem ligação"; ao voltar, o progresso sobe |
| 0.10 | `/qualquer-coisa` | página 404 com o mascote triste |
| 0.10 | tema ambíguo ("Mercúrio") | mensagem e chips "Querias dizer…"; tocar cria essa trilha |
| 0.10 | Novo tema "sistema solar" | "Já existe uma trilha pronta" e "Começar já" |
| 0.10 | `ADMIN_IDS` com o id do Rodrigo | Definições → Administração abre o painel |
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
Ideias novas entram aqui numa linha; antes de as executar, detalhar com código testado. O Rodrigo decide a ordem.

**Pedidas pelo Rodrigo (05/10/2026)**
- **Imagens nas lições**: fotos e diagramas com licença livre (Wikimedia Commons tem API sem chave) com legenda, atribuição e texto alternativo; a IA só escolhe o termo de pesquisa, nunca gera nem copia imagens. Esquemas próprios em SVG estão na Fase 17.
- **Vídeo**: só ligações e incorporações de sítios com licença ou privacidade (YouTube no modo `youtube-nocookie`, Wikimedia), escolhidas à mão pelo Rodrigo por tema ou validadas (a IA não inventa links); nunca alojar vídeo (plano gratuito).
- **Voz além das línguas**: ler a lição em voz alta (`speechSynthesis`, grátis), ditar perguntas ao tutor (`SpeechRecognition`), modo "ouvir enquanto andas".

**Ensino**
- Mais exercícios de arrastar: etiquetar um esquema, agrupar por categoria (ligar pares já existe).
- Cartões próprios: criar e editar cartões; exportar para Anki.
- Trilha a partir de um texto, PDF ou ligação colados pela pessoa (com cota própria e verificação de adequação).
- Lição de "revisão final" com perguntas de todos os conceitos da trilha, ligada à retenção (Fase 12).
- Níveis além de Iniciante e Intermediário, e salto de nível sugerido pelo desempenho, não só pelo teste de entrada.

**Social e conteúdo**
- Partilhar uma trilha por ligação (cópia para outra pessoa); trilhas populares criadas por utilizadores no Explorar, com moderação.
- Metas semanais partilháveis no perfil público.

**Qualidade e confiança**
- Validar o XP no servidor (por lição concluída) se o ranking ganhar peso.
- Painel de qualidade: lições mais reportadas ("Reportar erro"), com botão para as refazer.
- Acessibilidade: tamanho da letra, fonte para dislexia, auditoria com leitor de ecrã, contraste em ambos os temas.
- Inglês da interface (i18n) se o app sair de Portugal.
