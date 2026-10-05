# Plano de execução: 0.10.1 → 0.11

Escrito a 05/10/2026 depois do diagnóstico em produção (registos da Vercel e do Supabase, base de dados, código).
Quem executa: ler **tudo** antes de começar. Está tudo decidido: não perguntar ao Rodrigo o que este ficheiro já responde.
Regras gerais: `CLAUDE.md` e `AGENTS.md` (PT-PT com "tu", chanfros, tokens de cor, sombra sólida, nada de pacotes novos).

---

## 0. Como trabalhar neste plano

### 0.1 Ordem e publicação
- As fases vão **por ordem** (1 → 11). Cada fase é uma publicação com versão própria (tabela abaixo).
- Fluxo por fase: ramo `fase-N-nome` a partir da `main` → commits → push do ramo (a Vercel cria uma pré-visualização) →
  testes (secção 0.3) → PR para a `main` com a lista do que foi testado → juntar (merge) → confirmar no site publicado.
  O Rodrigo autorizou publicar na `main` fase a fase, **só** quando a fase passou em todos os testes dela.
- No fim de cada fase: entrada no topo de `lib/changelog.ts` (se houver mudança visível), linha em "Já feito" do `PLANO.md`,
  e marcar a fase aqui como `✅ feita (versão, data)`. Não apagar as fases deste ficheiro até ao fim (servem de referência).
- Se uma permissão bloquear um passo (ex.: migração "cancelled"): tentar uma vez dividida em partes mais pequenas;
  se voltar a falhar, escrever o passo em "Pendências do Rodrigo" (fim deste ficheiro) e **seguir em frente**.

| Fase | Versão | Conteúdo | Changelog |
|---|---|---|---|
| 1 | 0.10.1 | Login com e-mail, lembretes que não chegam, texto "\n" nas lições, aviso de segurança do Supabase | corrigido |
| 2 | 0.10.2 | Ilha nova (4 botões + gaveta), sem botão "Lição", instalar o app, "Dar opinião", Perfil e Definições reorganizados | novo + melhorias |
| 3 | 0.10.3 | Níveis diferentes a sério, PT-PT, categorias novas, línguas em pausa | melhorias |
| 4 | 0.10.4 | Limites diários com barras (lições novas e temas novos) | novo |
| 5 | 0.10.5 | Ideias: separadores certos, recusadas a vermelho, pedir revisão | novo + corrigido |
| 6 | 0.10.6 | Painel de administração completo, equipa com níveis de acesso, etiqueta "Equipa" | novo |
| 7 | 0.10.7 | Novidades por tipo com destaques, aviso de beta antes de entrar | melhorias |
| 8 | 0.10.8 | Troféus do ranking semanal | novo |
| 9 | **0.11** (marco, `aviso: true`) | Mascote com variações + criador de personagem | novo |
| 10 | (sem versão até o Rodrigo ligar) | Login com Apple e Discord, preparado e desligado | — |
| 11 | (interno) | Segurança do GitHub | — |

### 0.2 Antes da Fase 1 (Rodrigo)
1. **Desligar o CAPTCHA no Supabase** (é a causa do login falhado; ver Fase 1.1): Supabase → projeto NOOBrain →
   Authentication → *Attack Protection* (nalgumas versões *Bot and Abuse Protection*) → desligar **Enable CAPTCHA protection** → Save.
2. **Conta de teste**: criar no site uma conta só para testes com `dev.noobjects+teste@gmail.com` (o e-mail de confirmação chega à
   caixa `dev.noobjects`), confirmar o e-mail, criar o perfil `@noobrain_teste`, e dar a palavra-passe ao agente **na conversa**.
   Nunca escrever essa palavra-passe em ficheiros do projeto.

### 0.3 Como testar (três camadas)
**A. Local com Supabase falso** (ecrãs, fluxos, claro/escuro, telemóvel/computador). Ver `tests/e2e/README.md`.
```bash
node tests/e2e/mock-supabase.cjs &
NEXT_PUBLIC_SUPABASE_URL=http://localhost:54321 NEXT_PUBLIC_SUPABASE_KEY=mock SUPABASE_SECRET_KEY=mock \
ADMIN_IDS=11111111-1111-4111-8111-111111111111 npx next dev -p 3000 &
node tests/e2e/flow.cjs claro && node tests/e2e/flow.cjs escuro dark && node tests/e2e/flow.cjs pc "" 1280
```
- Cada fase acrescenta o seu script em `tests/e2e/` (nome `faseN-*.cjs`) que prova os critérios de aceitação dela,
  e corre também o `flow.cjs` (não pode partir o que já funcionava). Ver capturas com a ferramenta de leitura de imagens.
- Tabelas novas: o falso aceita-as sem mudanças (começam vazias). Funções `rpc` novas: acrescentar o comportamento em `mock-supabase.cjs`.
- Atenção: `pkill -f` com um padrão que apanha a própria linha de comando mata a shell (código 144). Matar por PID.

**B. Pré-visualização da Vercel** (IA verdadeira, push verdadeiro, Supabase verdadeiro). Todas as variáveis estão em
"All Environments", por isso as pré-visualizações têm IA e base de dados. **A base de dados é a de produção**: usar só a conta de
teste, nunca apagar nem mudar dados de outras contas.
- As pré-visualizações estão protegidas (respondem 302). Para chamadas com `curl`: criar o segredo de automação com a ferramenta
  Vercel `update_project_protection_bypass` (projeto `prj_AjLHah9UxgrDvGBlebWJtrYigh8X`, equipa `team_wBcUxqt52xAsoMKzRrnGc9fs`)
  e mandar o cabeçalho `x-vercel-protection-bypass: <segredo>`. O segredo fica só na sessão (nunca em ficheiros).
  Se a ferramenta for recusada: pedir ao Rodrigo (Vercel → Settings → Deployment Protection → Protection Bypass for Automation).
- Sessão da conta de teste por `curl`:
  ```bash
  curl -s "https://klrgitkxdhofsqwyisvn.supabase.co/auth/v1/token?grant_type=password" -H "apikey: $PUBLISHABLE_KEY" \
    -H "content-type: application/json" -d '{"email":"dev.noobjects+teste@gmail.com","password":"<da conversa>"}'
  ```
  (`$PUBLISHABLE_KEY`: ferramenta Supabase `get_publishable_keys`.) Usar o `access_token` como `Authorization: Bearer …`.
- O navegador local **não** consegue abrir sites externos neste ambiente (tentativas de contornar foram recusadas pela segurança:
  não insistir). O que for visual testa-se em A; o que precisa de IA ou de serviços reais testa-se em B com `curl`.

**C. Depois de publicar**: `curl` às páginas principais (200), `get_runtime_errors` da Vercel (24 h) sem erros novos,
`get_advisors` (security) do Supabase sem avisos novos, registos de auth sem erros novos.

### 0.4 Cotas de IA da conta de teste
A conta de teste tem as cotas normais (hoje: 5 temas e 25 lições por dia). Se um teste precisar de mais no mesmo dia, pode apagar
**só as linhas dessa conta**: `delete from ai_usage where user_id = '<uid da conta de teste>';` (autorizado pelo Rodrigo neste plano).

---

## Diagnóstico (05/10/2026): o que está errado e porquê

| # | Problema | Causa encontrada | Fase |
|---|---|---|---|
| D1 | Login com e-mail dá "Não foi possível continuar" | O CAPTCHA continua **ligado no Supabase** (só foi tirado do código). Registos de auth: `400 captcha_failed: no captcha_token found` em todas as tentativas com palavra-passe. O Google funciona porque não passa pelo captcha. O registo e a recuperação da palavra-passe também estão bloqueados. | 0.2 + 1.1 |
| D2 | Lembretes "ligados" mas o teste diz "Este aparelho ainda não tem os lembretes ligados" | A subscrição de avisos deste navegador está guardada em nome de **outra conta tua** (a `orod…`, de 08:48). Ao ligar na conta `rron…`, o app tenta gravá-la com o teu id, o RLS recusa (`new row violates row-level security policy … push_subscriptions` nos registos do Postgres), o erro é ignorado em silêncio e o interruptor mostra "ligado" porque só olha para o aparelho. Também quer dizer que essa outra conta continua a receber os teus lembretes neste aparelho. | 1.2 |
| D3 | "Lição" na ilha não serve | Abre a lição atual ou, sem tema, o "Novo tema": duplica a trilha. | 2.1 |
| D4 | O fundo da ilha mexe-se | No telemóvel só o botão ativo mostra o nome: a largura muda a cada toque e a ilha (centrada) mexe-se. | 2.1 |
| D5 | Já não aparece "instalar" | Nunca houve botão: dependia do aviso automático do Chrome, que desaparece depois de recusado uma vez e que não existe no iPhone. O manifesto está certo, mas falta `id`, ícone "maskable" e capturas (o Chrome mostra uma janela de instalação mais rica com elas). | 2.3 |
| D6 | Iniciante e Intermediário quase iguais | O prompt só diz `Nível do aluno: X`, sem dizer o que muda. O teste de nível pergunta sempre o Iniciante. E "Intermediário" é brasileiro (PT-PT: **Intermédio**). | 3.1 |
| D7 | Temas não 100% PT-PT | O prompt pede PT-PT mas não dá exemplos do que evitar; a revisão automática (`lib/ptpt.ts`) só conhece ~70 palavras e não trata o gerúndio ("está fazendo"). | 3.2 |
| D8 | "Mecânico de bicicleta" foi para Tecnologia | Não há categoria para ofícios e trabalhos manuais; a IA escolhe a mais próxima. | 3.3 |
| D9 | Línguas fracas | A lição de inglês tem definições em inglês ("Word that describes a noun") e pronúncias à mistura; o formato do app não serve para línguas. | 3.4 |
| D10 | Ideias "Novas" mostram as feitas | O separador "Novas" ordena todas por data; "Populares" inclui feitas e recusadas. | 5 |
| D11 | Opinião só aparece por acaso | O cartão só surge depois do 3.º conceito dominado e ao concluir uma trilha (uma vez cada). Não há sítio fixo. | 2.4 |
| D12 | Batota no ranking possível | O XP vem do aparelho; o banco só limita a 1000 por gravação. Com troféus, isto passa a importar. | 8.1 |
| D13 | Texto com `\n` às vezes | A IA devolve por vezes a sequência literal `\n` dentro do texto; nada a limpa. | 1.3 |
| D14 | Aviso do Supabase "Signed-In Users Can Execute SECURITY DEFINER Function" (`bump_catalog_use`) | A função que conta quantas pessoas começaram um tema corre com permissões de administrador e qualquer conta a pode chamar quantas vezes quiser. Não expõe dados nem deixa mudar mais nada, mas deixa inflacionar o contador e pôr um tema no topo de "Populares". | 1.4 |
| D15 | Perfil e Definições confusos | O Perfil mistura identidade, números, atalhos (Ranking, Ideias) e "Terminar sessão". As Definições são 8 caixas iguais em fila, com ações perigosas (apagar conta) ao lado do tema claro/escuro, "Terminar sessão" repetido e o ranking separado do resto da privacidade. | 2.6 |

Verificado e **sem problema**: o painel de administração funciona (o `ADMIN_IDS` está certo; os registos mostram-te a usá-lo);
apagaste as duas trilhas da bicicleta no painel às 11:18 (por isso já não estão no catálogo); a gravação no catálogo funciona;
o aviso `url.parse()` nos registos vem do pacote `web-push` e é inofensivo; o login com Google junta as duas formas de entrar na
mesma conta quando o e-mail é o mesmo (a tua conta `rron…` tem `google,email`).

---

## Fase 1 · 0.10.1 · Correções críticas

> ✅ feita (0.10.1, 05/10/2026): publicada e testada (login por e-mail, push, contador). Só falta apagar `bump_catalog_use` (Pendências 1b).

### 1.1 Login com e-mail
Depende do Rodrigo desligar o CAPTCHA (0.2). No código:
- `components/Account.tsx`, função `explain`: novo caso `captcha_failed` →
  `"O início de sessão com e-mail está temporariamente indisponível. Usa o Google ou tenta daqui a pouco."`
  (para nunca mais aparecer a mensagem genérica se voltarem a ligar o captcha).
- No `default` de `explain`: `console.error("auth", error.code, error.message)` antes de devolver a mensagem genérica
  (aparece na consola do navegador para diagnóstico futuro).
- **Aceitação**: com o captcha desligado, `curl` de login com palavra-passe (0.3 B) devolve `access_token`. Pedir ao Rodrigo para
  confirmar no telemóvel que entra com e-mail. No falso: palavra-passe errada → "E-mail ou palavra-passe incorretos.".

### 1.2 Lembretes (push) presos a outra conta
Nova rota `app/api/push/subscribe/route.ts` (servidor, chave secreta):
- `POST { endpoint, p256dh, auth, tz }` com `Authorization: Bearer`: valida a sessão (`userFrom`), valida tamanhos (endpoint ≤ 1000,
  começa por `https://`; p256dh ≤ 200; auth ≤ 100; tz ≤ 60) e faz `upsert` em `push_subscriptions` com `user_id` = quem pede e
  `news_sent: VERSION`. Isto **transfere** o aparelho para a conta atual (o endpoint é secreto: só o próprio navegador o conhece).
  Devolve `{ ok: true }` ou erro 4xx/5xx com mensagem PT-PT.
- `DELETE { endpoint }`: apaga a linha desse endpoint **só se** for da conta que pede.
- `GET ?endpoint=…`: `{ mine: boolean }` (este aparelho está registado nesta conta?).

`lib/reminders.ts`:
- `subscribePush` passa a chamar `POST /api/push/subscribe` (com o token da sessão) em vez do `upsert` direto; se a resposta não for
  `ok`, lança erro.
- `enable()`: se o push falhar, **não** marca o aparelho como ligado e devolve `false`; o `ReminderToggle` mostra
  `"Não consegui ligar os avisos neste aparelho. Tenta outra vez."` (estado local de erro, `role="alert"`).
  Exceção: sem `VAPID` configurado (pré-visualização local), mantém o comportamento atual (avisos locais).
- `disable()`: usa `DELETE /api/push/subscribe` antes de `sub.unsubscribe()`.
- Nova `syncPush()`: se `snapshot() === "on"` e há sessão, lê a subscrição atual do navegador e faz `GET ?endpoint`; se `mine` for
  `false`, refaz o `POST` (autocorreção). Chamada uma vez por sessão em `App.tsx`, num `useEffect` quando `inApp` fica `true`.
- `app/api/push/test/route.ts`: a mensagem 404 passa a `"Este aparelho ainda não está registado nesta conta. Desliga e volta a ligar os lembretes."`.
- Terminar sessão já chama `disable()`; manter (agora apaga mesmo a linha certa).
- **Aceitação**: (B) com a conta de teste: `POST` regista; `GET` dá `mine: true`; `POST /api/push/test` dá `sent: 1` ou erro do serviço
  de push (não 404). (A) no falso: interruptor liga e desliga sem erros na consola. Pedir ao Rodrigo: Definições → desligar e ligar os
  lembretes → "Enviar aviso de teste" chega ao telemóvel/PC.

### 1.3 Limpeza de texto da IA
- `lib/ptpt.ts`, início de `ptpt()`: trocar a sequência literal barra-invertida + `n` (e `\t`) por espaço e juntar espaços repetidos.
  Teste novo em `lib/ptpt.test.ts`: `"Olá\\nmundo"` → `"Olá mundo"`.
- **Aceitação**: `npm run check:ptpt` passa.

### 1.4 Contador de temas sem função exposta (aviso de segurança D14)
Trocar a função `bump_catalog_use` (chamável por qualquer conta) por uma tabela onde cada pessoa só pode registar **uma vez** que
começou cada tema; um gatilho soma ao contador. Sem funções expostas e sem forma de inflacionar.
- Migração `catalog_starts`:
  ```sql
  create table public.catalog_starts (
    key text not null, level text not null,
    user_id uuid not null default auth.uid() references auth.users on delete cascade,
    created_at timestamptz not null default now(),
    primary key (key, level, user_id));
  alter table public.catalog_starts enable row level security;
  create policy "own starts insert" on public.catalog_starts for insert to authenticated
    with check (user_id = (select auth.uid()));
  create or replace function public.count_catalog_start() returns trigger
  language plpgsql security definer set search_path = '' as $$
  begin
    update public.catalog_trails set uses = uses + 1 where key = new.key and level = new.level;
    return null;
  end $$;
  revoke all on function public.count_catalog_start() from public, anon, authenticated;
  create trigger catalog_starts_count after insert on public.catalog_starts
    for each row execute function public.count_catalog_start();
  ```
- `lib/catalog-client.ts` (`startFromCatalog`): trocar `rpc("bump_catalog_use", …)` por
  `supabase.from("catalog_starts").insert({ key, level })`, ignorando o erro de duplicado (código `23505`: a pessoa já tinha começado).
- `tests/e2e/mock-supabase.cjs`: `PK.catalog_starts = ["key", "level", "user_id"]` e somar `uses` no catálogo do falso ao inserir.
- **Depois** de publicar (para os separadores antigos ainda abertos não darem erro antes disso), segunda migração
  `drop_bump_catalog_use`: `drop function public.bump_catalog_use(text, text);`.
- Os números antigos de `uses` ficam como estão (a partir daqui conta pessoas diferentes).
- **Aceitação**: `get_advisors` (security) sem o aviso `authenticated_security_definer_function_executable`; (A) começar um tema do
  Explorar duas vezes soma 1 só uma vez; (B) com a conta de teste, um `POST /rest/v1/rpc/bump_catalog_use` dá 404.
- Os outros avisos que ficam e porquê (anotar no PR): `rls_enabled_no_policy` em `ai_daily`, `ai_usage` e `reports` é
  intencional (só o servidor lê/escreve com a chave secreta); "Leaked Password Protection" (verificar palavras-passe roubadas)
  só existe nos planos pagos da Supabase: fica desligado.

### 1.5 Publicar 0.10.1
Changelog `corrigido`: entrar com e-mail volta a funcionar; os lembretes chegam à conta certa depois de mudares de conta no mesmo
aparelho; texto estranho com "\n" deixa de aparecer nas lições.

---

## Fase 2 · 0.10.2 · Navegação, instalar e opinião

> Estado: código e testes locais (A) feitos; falta confirmação na pré-visualização/produção e o Rodrigo instalar o app no PC e no telemóvel.

### 2.1 Ilha com 4 botões e gaveta
`components/Island.tsx` + `App.tsx` + `app/globals.css`.
- **Botões principais (sempre, por esta ordem)**: Trilha (`Route`), Explorar (`Compass`), Rever (`Sync`, com o número de cartões),
  Perfil (`User`). O botão **"Lição" sai** (a lição só se abre pela trilha). O ecrã `?v=licao` continua a existir.
- **Gaveta**: o botão da seta (onde hoje está "esconder o menu") passa a ser `Mais opções` (`aria-label`), com `ChevronUp` que roda
  180° quando aberta (`aria-expanded`, `aria-controls`). Abre **para cima**, colada à ilha e com a mesma largura: `pane` com lista
  `menu-list`/`menu-row` (os estilos do Perfil). Itens, por esta ordem:
  1. Ideias (`Idea`)
  2. Ranking (`Trophy`)
  3. Novidades (`Spark`, com ponto `--sun` quando há versão não vista: `s.seenVersion !== LATEST.version`)
  4. Dar opinião (`Speech`) → 2.4
  5. Instalar o app (ícone novo `Download`) → 2.3, só quando há forma de instalar e ainda não está instalado
  6. Definições (ícone novo `Gear`)
  7. Administração (`Shield`), só para quem tem acesso (hoje: `/api/admin?o=me`; depois da Fase 6: papel na equipa)
- Fecha ao tocar num item, fora dela, em `Escape`, ao rolar a página e ao mudar de ecrã. Ao abrir, o foco vai para o 1.º item; ao
  fechar com `Escape`, volta ao botão da seta. A seta mostra o ponto `--sun` se Novidades tiver ponto.
- O botão "esconder o menu" deixa de existir. O esconder ao rolar para baixo e a pílula para o trazer de volta ficam.
- Estado "atual": Trilha também em `licao` e `desafio`; Perfil em `perfil`; a seta fica com fundo `--brand-soft` em `ideias`,
  `ranking`, `novidades`, `definicoes`, `admin`. Em `novo`, nenhum.
- **Fim do movimento** (CSS): todos os botões principais com a **mesma largura** (`flex: 1 1 0; min-width: 0`) e a ilha com
  largura fixa: telemóvel `min(100% - 32px, 440px)`, computador (≥ 900 px) `560px`. No telemóvel, ícone por cima e nome por baixo
  em **todos** os botões (nome 10 px, maiúsculas, `--font-display`); no computador, ícone e nome lado a lado. O botão ativo muda
  **só** `background` e `color` (transição 0,2 s). Apagar as regras que mostram/escondem `.isl-l` conforme o estado
  (`.isl[aria-current] .isl-l`, e a de ecrãs estreitos que o esconde). Seta: 40 px fixos.
- Animação da gaveta: `opacity` + `translateY(8px → 0)`, 0,18 s; sem animação com `prefers-reduced-motion`.
- **Aceitação** (script `tests/e2e/fase2-ilha.cjs`): a 390 px e a 1280 px, a caixa da `.island` (`getBoundingClientRect`) é igual
  (±0,5 px) nos 4 ecrãs principais; não existe botão "Lição"; a gaveta abre, tem os itens certos para admin e não-admin, fecha com
  `Escape` e com toque fora, e cada item abre o ecrã certo. Capturas claro/escuro, telemóvel/computador.

### 2.2 Onde cada ecrã fica acessível (para nada ficar perdido)
- Ranking e Ideias saem do Perfil (estão na gaveta). O Perfil e as Definições são reorganizados em 2.6.
- Rodapé (`LegalLinks`): mantém-se como está.

### 2.3 Instalar o app (telemóvel e computador)
- Novo `lib/install.ts` (cliente): ouve `beforeinstallprompt` (guarda o evento, `preventDefault()`) e `appinstalled`, ao carregar o
  módulo; expõe `useInstall()` (com `useSyncExternalStore`) que devolve:
  `"installed"` (`display-mode: standalone` ou `navigator.standalone`), `"prompt"` (há evento guardado), `"ios"` (iPhone/iPad no
  Safari, sem standalone), `"none"` (o resto). E `install()`: chama `prompt()`, espera `userChoice`, limpa o evento.
- Importar `lib/install.ts` em `App.tsx` (para ouvir cedo, também no ecrã de entrada).
- Novo `components/InstallSheet.tsx`: `dialog.sheet` para o iPhone com 3 passos ilustrados com ícones: tocar em Partilhar (ícone
  novo `Share`, o quadrado com seta do iOS) → "Adicionar ao ecrã principal" → "Adicionar". Botão "Percebi".
- Onde aparece: gaveta (2.1, item 5); Definições, grupo "App" (2.6: linha "Instalar o app"; se `"installed"`, a linha mostra
  "Já instalado" sem ação; se `"none"`, a linha abre a explicação "Para instalar, abre o site no Chrome, no Edge ou no Safari do
  iPhone."); ecrã de entrada (sem sessão), por baixo dos blocos da landing: linha com botão `btn soft sm` "Instalar o app" quando
  `"prompt"` ou `"ios"`.
- Ao instalar (`appinstalled`): aviso rápido "NOOBrain instalado. Encontra-o no ecrã principal.".
- `app/manifest.ts`: acrescentar `id: "/"`, `scope: "/"`, `display_override: ["standalone"]`, `orientation: "portrait"`,
  `categories: ["education"]`, ícone `"/icon-maskable-512.png"` com `purpose: "maskable"`, `screenshots` (2: `"/shot-phone.png"`
  1080×1920 `form_factor: "narrow"` e `"/shot-wide.png"` 1920×1080 `form_factor: "wide"`, com `label` PT-PT) e `shortcuts`
  (Rever → `/?v=revisar`, Explorar → `/?v=explorar`, com o ícone 192).
- Gerar as imagens com o Playwright do ambiente (sem pacotes novos): o ícone maskable = `app/icon.svg` com 20 % de margem sobre
  fundo `#005fd9`, 512×512; as capturas = trilha e lição do Supabase falso (tema claro). Ficheiros em `public/`.
- **Aceitação**: `curl /manifest.webmanifest` mostra os campos novos; as 4 imagens respondem 200; (A) com Chromium, o script prova
  que `useInstall()` dá `"prompt"` depois de disparar um `beforeinstallprompt` sintético e que o botão chama `prompt()`; no
  iPhone (user agent de iPhone no Playwright) aparece a folha com os 3 passos. Pedir ao Rodrigo: instalar no PC (Chrome/Edge) e no
  telemóvel.

### 2.4 "Dar opinião" sempre à mão
- `components/Feedback.tsx`: separar o formulário (estrelas/caras 1–5 + texto) num `FeedbackForm` reutilizável. O cartão automático
  continua igual.
- Novo `FeedbackDialog` (`dialog.sheet`): título "A tua opinião", texto "Diz-nos o que está a correr bem e o que podemos melhorar. Só a
  equipa lê.", o `FeedbackForm` com `context: "menu"`, e por baixo uma linha "Tens uma ideia nova? Partilha-a em Ideias." (ligação).
- Abre a partir da gaveta. Ao enviar: aviso "Obrigado! Lemos todas as respostas.".
- **Aceitação**: no falso, enviar grava uma linha em `feedback` com `context = "menu"`.

### 2.5 Ícones novos (`components/Icons.tsx`, mesmo estilo dos outros)
`Download`, `Gear` (engrenagem octogonal, a combinar com os chanfros), `Share` (iOS). Mais os da Fase 3.3.

### 2.6 Perfil e Definições reorganizados
Regra que separa os dois: **Perfil = quem és e o que já conseguiste** (o que os outros também veem). **Definições = como o app
funciona para ti** (nada disto aparece aos outros). Cada coisa existe num só sítio.

**Perfil** (`components/ProfileView.tsx`), de cima para baixo:
1. Cabeçalho: avatar, nome, @nome, "Membro desde…", etiqueta "Equipa" (Fase 6); à direita, botão-ícone `iconbtn ch` com `Gear`
   e `aria-label="Definições"`. A bio por baixo.
2. Par de botões: "Editar perfil" (`btn sm`) e "Partilhar perfil" (`btn soft sm`, a função `share` que já existe).
3. **Hoje**: o cartão da meta diária (e, depois da Fase 4, as duas barras de limites).
4. **Números**: a grelha das 6 estatísticas (sem mudanças).
5. **Troféus** (Fase 8, só se houver) e **Conquistas** (`BadgeGrid`).
6. **Os teus temas** (o mapa que já existe), no fim.
Sai do Perfil: o botão "Definições" do par (passa a ícone), a `menu-list` (Ranking e Ideias estão na gaveta; Partilhar sobe para o
par) e "Terminar sessão" (passa para Definições → Conta).

**Definições** (`components/Settings.tsx`): deixa de ser uma fila de caixas iguais e passa a **lista agrupada** (estilo das
definições do iPhone): títulos de grupo (`eyebrow`) e, em cada grupo, um `pane` com linhas `menu-row` (rótulo à esquerda, valor
atual à direita em `sub small`, `›` quando abre um subecrã). Subecrãs pelo endereço `?v=definicoes&s=<id>` (acrescentar `s` à
função `navigate` em `App.tsx`; "voltar" do navegador funciona), com "← Definições" no topo.

| Grupo | Linha | Valor à direita | Ao tocar |
|---|---|---|---|
| Estudo | Meta diária | "Normal · 30 XP" | subecrã `meta`: o seletor Leve/Normal/Intensa + a frase que já existe |
| Estudo | Avisos | "Ligados" / "Desligados" / "Bloqueados" | subecrã `avisos`: os 2 interruptores + "Enviar aviso de teste" |
| Aparência | Tema | — | o seletor Automático/Claro/Escuro **na própria linha** (sem subecrã) |
| Privacidade | Aparecer no ranking | interruptor | muda logo; frase por baixo: "Desligado, o teu nome sai do ranking e o perfil público deixa de aparecer no Google." |
| App | Instalar o app | — | 2.3 (só quando há forma de instalar) |
| App | Novidades | "Versão 0.10.2" | abre Novidades |
| Conta | E-mail | o e-mail | — (só leitura) |
| Conta | Entras com | "Google" / "E-mail" / "Google e e-mail" | — |
| Conta | Sincronização | "Guardado" / "A guardar…" / "Sem ligação" / "Erro ao guardar" | — (só leitura) |
| Conta | Alterar palavra-passe | — | o fluxo atual (só com e-mail) |
| Conta | Terminar sessão | — | termina (texto `--brand`, sem `›`) |
| Dados | Descarregar os meus dados | — | descarrega logo (o `download` atual) |
| Dados | Recomeçar do zero | — | subecrã `recomecar`: explicação + escrever RECOMEÇAR + botão |
| Dados | Apagar a conta | — | subecrã `apagar`: `pane is-wrong` com o que se perde, escrever o @nome, botão `btn bad` |
| Equipa (só com acesso) | Painel de administração | papel ("Dono", "Admin", "Moderador") | abre o painel |
| Sobre | Sobre o NOOBrain | — | subecrã `sobre`: o texto atual do "Sobre", fontes, Termos, Privacidade, contacto, Ko-fi |

- No fundo da página, centrado, `sub small`: "NOOBrain beta 0.10.2 · ✦ Feito com IA · NOOBjects".
- Componente novo `components/Switch.tsx` para "Aparecer no ranking": `button role="switch" aria-checked`, calha e botão
  **chanfrados** (`.ch`, sem `border-radius`), ligado = `--brand`, desligado = `--lock`; nunca `--ok`.
- As ações perigosas (recomeçar, apagar conta) só existem dentro dos seus subecrãs, nunca na página principal.
- O `ReminderToggle` mantém a lógica; só muda de sítio (subecrã `avisos`). A gaveta (2.1) continua a ter "Definições".
- **Aceitação** (script `tests/e2e/fase2-perfil.cjs`, 390 e 1280 px, claro e escuro): o Perfil tem a ordem acima, sem "Terminar
  sessão" nem lista de atalhos, e o ícone abre as Definições; as Definições mostram os grupos e valores certos; cada subecrã abre
  pelo endereço, o "voltar" do navegador regressa à lista, e o seletor de meta, o tema, o interruptor do ranking, terminar sessão,
  recomeçar (com RECOMEÇAR) e apagar conta (com o @nome; no falso, confirmar o pedido `DELETE /api/account`) funcionam.

### 2.7 Publicar 0.10.2
`novo`: instalar o app no telemóvel e no computador; "Dar opinião" sempre disponível. `melhorias`: menu com os 4 ecrãs principais e
uma gaveta com o resto; o menu deixa de se mexer ao mudar de ecrã; Perfil e Definições mais arrumados (o Perfil mostra quem és e o
que conseguiste, as Definições juntam tudo o que é configuração, por grupos).

---

## Fase 3 · 0.10.3 · Conteúdo: níveis, português de Portugal, categorias, línguas em pausa

> ✅ feita (0.10.3, 05/10/2026). Testes B feitos: 3 níveis de "Mecânica de bicicletas" (títulos e lições distintos), categorias Xadrez→desporto, Estoicismo→sociedade, bicicletas→oficios, línguas recusadas sem gastar cota. Por fazer: "Python"→tecnologia e "Literatura inglesa" na IA (a conta de teste esgotou as 5 criações do dia e o Supabase recusou apagar o uso: ver Pendências 1c).

### 3.1 Três níveis que são mesmo diferentes
Novo `lib/levels.ts` (partilhado entre servidor e navegador):
```ts
export const LEVELS = [
  { id: "Iniciante", hint: "Nunca estudaste isto." },
  { id: "Intermédio", hint: "Já sabes o básico e queres perceber como funciona." },
  { id: "Avançado", hint: "Já dominas o essencial e queres ir ao detalhe." },
] as const;
export type Level = (typeof LEVELS)[number]["id"];
export const normLevel = (x: unknown): Level => x === "Intermediário" ? "Intermédio" : (LEVELS.some((l) => l.id === x) ? x as Level : "Iniciante");
export const lowerLevel = (l: Level): Level | null => l === "Avançado" ? "Intermédio" : l === "Intermédio" ? "Iniciante" : null;
export const nextLevel = (l: Level): Level | null => l === "Iniciante" ? "Intermédio" : l === "Intermédio" ? "Avançado" : null;
```
- `normLevel` em todo o lado onde entra um nível: `app/api/trail`, `app/api/lesson`, `lib/store.ts` (ao ler o estado, converte
  `trail.level` antigo), `Explore`, `NewTopic`, catálogo. Antes de mexer, confirmar no Supabase:
  `select distinct level from catalog_trails;` — se houver `Intermediário`, `update catalog_trails set level='Intermédio' where level='Intermediário';`
  e o mesmo em `catalog_lessons` (é uma mudança de nome, não apaga nada: autorizada).
- **Guia por nível** (constante `LEVEL_GUIDE` em `lib/levels.ts`, usada nos prompts da trilha e da lição):
  - **Iniciante** — trilha: assume zero conhecimento; conceitos = vocabulário essencial, peças principais, para que serve, primeiros
    passos; o 1.º conceito apresenta o tema; resumos com analogias do dia a dia; nenhum termo técnico sem explicação. Lição: 2
    parágrafos curtos, exemplos do quotidiano, perguntas de lembrar e compreender.
  - **Intermédio** — trilha: assume que o aluno já domina a trilha Iniciante (lista abaixo); conceitos = como funciona por dentro,
    procedimentos passo a passo, diagnóstico de problemas, erros comuns e como evitá-los, escolher entre opções; **proibido** um
    conceito "O que é…" ou de introdução; usa o vocabulário técnico correto com definição curta. Lição: explicação do mecanismo e do
    porquê, exemplo resolvido com números ou situação real, perguntas de aplicar e analisar, opções erradas = enganos comuns.
  - **Avançado** — trilha: assume a trilha Intermédio; conceitos = casos-limite, compromissos (trade-offs), otimização, prática de
    especialista, limites do conhecimento atual; nada que esteja nos níveis abaixo. Lição: cenários com várias etapas, perguntas de
    avaliar e justificar, resposta curta a exigir argumento.
- `app/api/trail/route.ts`:
  - Se o nível tem `lowerLevel`, ler essa trilha do catálogo (`findTrail(key, lower)`) e pôr no prompt:
    `O aluno já domina estes conceitos (nível ${lower}); não os repitas nem os reformules: ${títulos}.` Se não houver no catálogo,
    seguir só com o `LEVEL_GUIDE`.
  - Depois da resposta: se **2 ou mais** títulos tiverem o mesmo `topicKey` de títulos do nível abaixo, ou (Intermédio/Avançado) se o
    1.º título começar por "O que é", repetir **uma vez** com a instrução extra
    `Os conceitos ${lista} repetem o nível anterior. Substitui-os por conceitos próprios do nível ${level}.` (gasta 1 pedido de IA,
    não conta para a cota da pessoa).
  - O teste de nível (`diagnostic`) passa a ser sobre **o nível pedido** (perguntas que alguém que já domina este nível acertaria),
    e no `NewTopic` acertar as 3 sugere o `nextLevel` (texto: `Acertaste as 3 à primeira. Queres começar no nível ${next}?`).
    Para "Avançado" não há teste.
- `app/api/lesson/route.ts`: acrescentar o `LEVEL_GUIDE` da lição ao prompt (hoje só diz `Nível: X`).
- `components/NewTopic.tsx`: seletor com os 3 níveis (`seg three`) e, por baixo, a frase `hint` do nível escolhido (`sub small`).
- `components/TrailView.tsx`: com a trilha concluída e havendo `nextLevel`, um cartão `nudge` "Próximo nível: Intermédio — Continua
  onde esta trilha acabou." com botão "Começar". Se o catálogo tiver essa trilha, começa logo (`startFromCatalog`); senão, cria pela
  IA com o mesmo tema (mesmo fluxo do `NewTopic`, incluindo erros e cota).
- `Explore`: o filtro de nível usa os 3 nomes na ordem de `LEVELS`.
- **Aceitação** (B, conta de teste, pré-visualização): criar "Mecânica de bicicletas" nos 3 níveis (por ordem). Guardar as 3 listas de
  títulos na descrição do PR. Regras: nenhum título repetido entre níveis (`topicKey`); Intermédio e Avançado sem "O que é";
  ler as 3 e confirmar que se distinguem pelo critério do `LEVEL_GUIDE`. Abrir 1 lição de cada nível e confirmar a diferença
  (perguntas de lembrar vs. aplicar vs. justificar). Se ficarem boas, ficam no catálogo; se não, ajustar o prompt e apagar só essas
  linhas (o Rodrigo pode fazê-lo no painel; ou a rota de admin).

### 3.2 Português de Portugal a sério
- Novo `lib/prompt.ts` com `PTPT_RULES` (texto), usado nos prompts de `trail`, `lesson`, `tutor` e `report`:
  ```
  Escreve em português europeu (Portugal), ortografia do Acordo de 1990. Trata o aluno por tu (nunca "você").
  Usa "estar a + infinitivo" (estás a aprender), nunca o gerúndio brasileiro (está aprendendo).
  Vocabulário de Portugal: ecrã, telemóvel, equipa, utilizador, registo, facto, contacto, autocarro, comboio, casa de banho,
  pequeno-almoço, frigorífico, sumo, gelado, chávena, desporto, guarda-redes, câmara, planear, aluguer, Intermédio.
  Acentos de Portugal: económico, fenómeno, género, oxigénio, António, ténis, bebé (nunca ô/ê nestas palavras).
  Exemplos — errado → certo: "você está fazendo" → "estás a fazer"; "na tela do celular" → "no ecrã do telemóvel";
  "a equipe registrou o fato" → "a equipa registou o facto"; "planejamento" → "planeamento"; "ônibus" → "autocarro".
  ```
- `lib/ptpt.ts` — acrescentar (com testes para cada regra em `lib/ptpt.test.ts`):
  - Palavras: café da manhã → pequeno-almoço; suco/sucos → sumo/sumos; sorvete → gelado; xícara → chávena; aluguel → aluguer;
    goleiro → guarda-redes; câmera/câmeras → câmara/câmaras; cadastro/cadastrar → registo/registar; deletar → apagar;
    planejar/planejamento/planejad- → planear/planeamento/planead-; Intermediário (com maiúscula, sozinho) → Intermédio.
  - Regra geral de acento: `ô`/`ê` seguidos de `m` ou `n` **e de vogal** passam a `ó`/`é` (econômico, fenômeno, gênero, tênue,
    gêmeo, Amazônia, anônimo, cômodo, abdômen, Vênus). Exceções que ficam: `estômago`, `estômagos`. Não toca em `têm`, `vêm`,
    `ênfase`, `pôr`, `pôde`, `avô`.
  - Gerúndio depois de estar/ficar/continuar/andar (estou, estás, está, estamos, estão, estava, estavas, estávamos, estavam,
    esteve, estive, estar, fica, ficam, continua, continuam, anda, andam): `-ando → a -ar`, `-endo → a -er`, `-indo → a -ir`,
    `indo → a ir`. Lista de exclusão (não são gerúndios): quando, comando, bando, brando, mando, lindo, estupendo, horrendo,
    tremendo, remendo, adendo, dividendo.
  - Nova `brMarkers(text): string[]` (só deteção, não troca): `você`, `vocês`, `a gente`, `celular` (fora de "célula/celular" de
    biologia: só quando perto de "telefone|ecrã|app|ligar|mensagem"), `tela` (só com "celular|computador|telemóvel"), gerúndio
    que sobrou depois de estar.
- Rotas `trail` e `lesson`: depois do `ptptDeep`, se `brMarkers` do JSON inteiro encontrar algo, **uma** passagem extra de revisão:
  `generateJson` com o mesmo `SCHEMA` e o prompt "Reescreve este JSON em português de Portugal, sem mudar a estrutura, os factos,
  os números nem a ordem. Regras: PTPT_RULES. JSON: …"; depois `ptptDeep` outra vez; `console.warn("ptpt", n_antes, n_depois)`.
  Só acontece ao criar (o resultado fica no catálogo), por isso o custo é pequeno.
- `npm run check:ptpt` tem de passar; acrescentar 25+ casos (inclui as exceções).
- **Auditoria do catálogo**: novo `scripts/audit-ptpt.mjs` (lê `catalog_trails` e `catalog_lessons` com a chave pública, que o RLS
  deixa ler; corre `ptpt` + `brMarkers` e lista o que mudaria). Correr contra produção e pôr o resultado no PR.
  A correção das lições afetadas faz-se no painel (Fase 6.6, "Qualidade" → "Refazer").
- **Aceitação**: testes; (B) criar 2 temas novos e 2 lições; `brMarkers` vazio em tudo o que foi guardado.

### 3.3 Categorias novas
- `lib/categories.ts`: acrescentar `["oficios", "Mãos à obra"]`, `["sociedade", "Sociedade e mente"]`, `["desporto", "Desporto e jogos"]`
  (antes de `outros`). Ícones novos em `Icons.tsx` + `CategoryIcon.tsx`: `oficios` usa o `Hammer` que já existe; novos `Mind`
  (perfil de cabeça com engrenagem) e `Ball` (bola com gomos retos, octogonal). Provisórios até haver desenhos do Rodrigo.
- Migração `categorias_novas`: refazer o `check` de `catalog_trails.category` com as 11 categorias.
- Prompt da trilha — definições e exemplos (substitui a linha atual):
  `ciencias` (física, química, biologia, matemática, astronomia, geologia) · `historia` (acontecimentos, épocas, figuras históricas) ·
  `artes` (literatura, música, pintura, cinema, design, fotografia) · `tecnologia` (computadores, programação, internet, IA,
  eletrónica digital) · `saude` (corpo humano, primeiros socorros, nutrição, saúde mental) · `dinheiro` (finanças pessoais,
  economia, empreendedorismo) · `oficios` (trabalhos práticos e manuais: mecânica de bicicletas e automóveis, carpintaria,
  eletricidade doméstica, canalização, culinária, costura, jardinagem, bricolage) · `sociedade` (filosofia, psicologia,
  política, direito, cidadania, religiões, geografia humana) · `desporto` (regras, táticas, treino, xadrez e outros jogos) ·
  `linguas` (aprender uma língua) · `outros`. "Se o tema é uma atividade que se faz com as mãos ou ferramentas, é oficios, mesmo
  que use máquinas."
- Painel (Fase 6.6) permite mudar a categoria de um tema do catálogo (resolve também os 9 temas iniciais).
- **Aceitação**: (B) "Mecânica de bicicletas" → `oficios`; "Xadrez" → `desporto`; "Estoicismo" → `sociedade`; "Python" → `tecnologia`.

### 3.4 Línguas em pausa
> Nota do Rodrigo (05/10/2026): o problema das línguas **não** era `\n` no texto; era a pronúncia em símbolos fonéticos (ex.: `/ˈoʊ.pən/`), que não ajuda ninguém. Quando as línguas voltarem, a pronúncia tem de ser em português intuitivo (ex.: «ôu-pen»), nunca em alfabeto fonético. A limpeza de `\n` da 1.3 ficou por segurança, mas não resolvia isto.
Decisão do Rodrigo (05/10/2026): aprender línguas sai até haver um formato próprio. Nada é apagado.
- `lib/categories.ts`: `export const LANGUAGES_ON = false;` e `isLanguageTopic(topic)`: texto normalizado (sem acentos, minúsculas)
  com uma destas palavras inteiras: ingles, english, espanhol, castelhano, frances, alemao, italiano, mandarim, chines, japones,
  coreano, russo, arabe, latim, holandes, sueco, polaco, turco, hindi, "lingua gestual", e **sem** as palavras literatura,
  historia, cultura, revolucao, cozinha, arte (ex.: "Literatura inglesa" e "Revolução Francesa" passam).
- `app/api/trail`: com `LANGUAGES_ON` falso, se `isLanguageTopic(topic)` → 422 `{ error: "Aprender línguas está em pausa enquanto
  preparamos uma forma melhor de o fazer. Experimenta outro tema.", paused: true }` **antes** de gastar cota; e se a IA devolver
  `category: "linguas"` → a mesma resposta (sem guardar nada).
- `NewTopic`: a mesma verificação no navegador, com a mesma frase, antes de enviar.
- Esconder a categoria `linguas` e os temas dela: `lib/catalog-client.ts` (Explore), `lib/catalog-public.ts` (landing, `/temas`,
  `sitemap`), chips de categorias. `/temas/<tema de línguas>` → `notFound()`. Usar `categoryOf(key, category) === "linguas"`.
- Trilhas de línguas que as pessoas já têm continuam a funcionar; `TrailView` mostra um `nudge` "Os temas de línguas estão em pausa
  enquanto preparamos uma versão melhor. Podes acabar esta trilha ou arquivá-la."
- Tirar a pronúncia dos cartões (o `Listen` pequeno no `Deck` e o `lang` de `trailLang`) enquanto `LANGUAGES_ON` for falso. O "Ouvir"
  da explicação em português fica.
- `scripts/seed-catalog.mjs`: tirar "Inglês para iniciantes" da lista.
- Prompt da trilha: tirar a linha especial do inglês.
- `PLANO.md`, "Decisões": trocar a linha "Entre os temas iniciais tem de haver uma língua" por "Línguas em pausa desde 05/10/2026".
- **Aceitação**: (A) Explore e landing sem "Inglês"; `/temas/ingles-para-iniciantes` dá 404; (B) `POST /api/trail` com "Inglês" dá
  422 `paused` e a cota não sobe; "Literatura inglesa" cria normalmente.

### 3.5 Publicar 0.10.3
`melhorias`: Iniciante, Intermédio e Avançado com conteúdos mesmo diferentes, e um botão para subir de nível no fim da trilha;
português de Portugal mais cuidado nas lições; categorias novas (Mãos à obra, Sociedade e mente, Desporto e jogos).
`corrigido`: "Intermediário" passa a "Intermédio". Uma linha a explicar que os temas de línguas estão em pausa.

---

## Fase 4 · 0.10.4 · Limites diários com barras

> ✅ feita (0.10.4, 05/10/2026): testada em (A) e (B: `/api/quota` e 429 ao 4.º tema).

Objetivo duplo: descanso (aprender aos poucos fixa melhor) e não esgotar a IA gratuita.

### 4.1 Números (constantes em `lib/limits.ts`, partilhado)
- `NEW_LESSONS_PER_DAY = 6`: lições **novas** por dia (conceito ainda não dominado). Repetir lições já feitas, rever cartões e o
  desafio do dia **não** contam.
- `NEW_TOPICS_PER_DAY = 3`: temas criados **pela IA** por dia. Começar um tema que já existe (Explorar, "Já existe") não conta.
- No servidor, `lib/quota.ts`: `LIMITS.trail` passa de 5 para `NEW_TOPICS_PER_DAY` (3); `lesson` fica 25 e `tutor` 40 (rede de
  segurança para vários aparelhos). As contas em `ADMIN_IDS` (donos) não têm limite (para testes).

### 4.2 Contagem das lições
- `lib/types.ts` → `State.daily?: { day: string; lessons: string[] }` (ids `${trailId}:${index}`).
- `lib/store.ts`: `lessonsToday(s)` (lista do dia atual; noutro dia = vazia) e `markLesson(s, id)`.
- Ao abrir uma lição com `index === trail.done` (a do conceito atual): se o id já está na lista de hoje, abre; se não está e a lista
  tem menos de 6, junta-o e abre; se já tem 6, **não abre** e mostra o ecrã de descanso.
- Ecrã de descanso (`components/RestView.tsx`, dentro da lição): mascote `calm`, título "Por hoje chega de lições novas",
  texto "Já fizeste 6 lições novas hoje. O cérebro fixa melhor com pausas: amanhã há mais.", botões "Rever cartões" (se houver),
  "Repetir uma lição" (volta à trilha) e "Voltar".
- O limite usa o dia local (`day()`), como a sequência. Sincroniza com a nuvem como o resto do estado.

### 4.3 Barras
- Componente `components/DayBars.tsx`: barras `bar ch` com rótulo e `n de máx`; cheia → rótulo "Completo por hoje" (sem cores
  `--ok`/`--bad`; cor `--brand`).
- `TrailView`: por baixo do painel "Progresso", barra fina "Lições novas hoje · 2 de 6".
- `NewTopic`: no topo, "Temas novos com IA hoje · 1 de 3" + frase "Começar um tema do Explorar não conta.". Com 3 de 3: formulário
  desativado e botão "Explorar temas prontos".
- `ProfileView`: na secção "Hoje" (2.6), as duas barras por baixo da meta.
- Nova rota `GET /api/quota` (com sessão): `{ trail: { used, max }, lesson: { used, max } }` lidos de `ai_usage` do dia (chave
  secreta). A barra de temas usa este valor; a de lições usa o estado local.
- **Aceitação** (A): com o estado de teste a 5 lições novas, abrir a 6.ª funciona e a 7.ª mostra o descanso; repetir uma lição feita
  abre sempre; barras certas na trilha, no Novo tema e no Perfil, claro/escuro. (B) a 4.ª criação de tema no dia dá 429 com
  "Chegaste ao limite de hoje. Amanhã há mais." e a barra mostra 3 de 3.

### 4.4 Publicar 0.10.4
`novo`: limites diários com barras (6 lições novas e 3 temas novos por dia), a explicar o porquê (descanso e IA gratuita).

---

## Fase 5 · 0.10.5 · Ideias bem arrumadas

### 5.1 Base de dados (migração `ideias_recurso`)
```sql
alter table public.suggestions
  add column appeal text check (char_length(appeal) <= 300),
  add column appeal_at timestamptz,
  add column decided_at timestamptz;
alter table public.suggestions drop constraint suggestions_status_check;
alter table public.suggestions add constraint suggestions_status_check
  check (status in ('recebida','planeada','em_curso','feita','recusada','recurso'));
create or replace function public.appeal_suggestion(p_id bigint, p_text text) returns void
language plpgsql security definer set search_path = '' as $$
begin
  if char_length(coalesce(p_text,'')) < 10 or char_length(p_text) > 300 then raise exception 'texto' using errcode = 'P0002'; end if;
  update public.suggestions set appeal = p_text, appeal_at = now(), status = 'recurso'
   where id = p_id and user_id = (select auth.uid()) and status = 'recusada' and appeal is null;
  if not found then raise exception 'nao' using errcode = 'P0003'; end if;
end $$;
revoke all on function public.appeal_suggestion(bigint, text) from public, anon;
grant execute on function public.appeal_suggestion(bigint, text) to authenticated;
```
(Confirmar antes o nome real do `check` com `select conname from pg_constraint where conrelid = 'public.suggestions'::regclass;`.)
Depois: `get_advisors` (security).

### 5.2 Separadores (`components/Ideas.tsx`)
Chips com deslocamento horizontal (como as categorias do Explorar), por esta ordem:
- **Populares**: estado `recebida`, `planeada`, `em_curso` ou `recurso`; por votos e depois data.
- **Novas**: estado `recebida` e criadas nos últimos 30 dias; mais recentes primeiro.
- **A caminho**: `planeada` e `em_curso`; `em_curso` primeiro.
- **Feitas**: `feita`; por `decided_at` (ou data).
- **Recusadas**: `recusada` e `recurso`.
Feitas e recusadas nunca aparecem em Populares nem em Novas.

### 5.3 Aspeto e recurso
- Etiqueta de estado com cor: Recebida (neutra), Planeada (`--brand-soft`), Em curso (`--brand`), Feita (`--brand` com `Check`),
  Recusada (**`--bad`**, `pane is-wrong` no cartão inteiro), Em recurso (`--sun`). O Rodrigo pediu vermelho nas recusadas: é uma
  exceção aceite à regra "`--bad` só para errado" (anotar em `PLANO.md`, Decisões).
- Votar só nos estados abertos (recebida, planeada, em curso, em recurso); nos outros o número fica visível sem botão.
- Recusada com resposta: mostra "Porquê: …" (a `reply`). Para o **autor**, se `appeal` é nulo: botão "Pedir revisão" → caixa de texto
  (10 a 300 caracteres, contador) "Explica porque achas que vale a pena reconsiderar." → `rpc("appeal_suggestion")` → aviso
  "Pedido enviado. Vais saber a decisão." Só se pode pedir uma vez.
- Em recurso: mostra o texto do pedido por baixo, "O teu pedido de revisão" (para o autor) ou "Pedido de revisão do autor" (para os outros).
- Painel (Fase 6.4): filtro "Recursos"; decidir = mudar estado para `planeada`/`recebida` (aceite) ou `recusada` (mantém; como
  `appeal` já não é nulo, não pode pedir outra vez). Grava `decided_at`. O aviso push ao autor já existe.
- **Aceitação** (A, com `suggestions` no falso nos 6 estados): cada separador mostra só os estados certos; recusada a vermelho;
  pedir revisão muda para "Em recurso" e o botão desaparece; no escuro também.

### 5.4 Publicar 0.10.5
`novo`: pedir revisão de uma ideia recusada; separadores A caminho e Recusadas. `corrigido`: as ideias feitas já não aparecem em
Novas nem em Populares.

---

## Fase 6 · 0.10.6 · Painel de administração completo e equipa

### 6.1 Papéis (decisão)
| Pode | Dono | Admin | Moderador |
|---|---|---|---|
| Ver números, ideias, erros, opiniões, catálogo, qualidade | ✓ | ✓ | ✓ |
| Responder/mudar ideias, apagar ideias, resolver erros, refazer/apagar catálogo, mudar categoria | ✓ | ✓ | ✓ |
| Pesquisar pessoas e ver ficha (com e-mail) | ✓ | ✓ | só @nome e perfil público |
| Ações na conta de alguém (abaixo) | ✓ | ✓ | — |
| Apagar a conta de alguém | ✓ | — | — |
| Gerir a equipa (dar, mudar e tirar acessos) | ✓ | — | — |
| Ver o registo de ações | ✓ | ✓ | — |
| Sem limites diários (Fase 4) | ✓ | — | — |
- **Dono** = as contas em `ADMIN_IDS` (variável da Vercel). Não podem ser alteradas nem retiradas pelo painel.
- Admins e moderadores ficam na tabela `staff`, geridos pelo dono no painel.

### 6.2 Base de dados (migração `equipa`)
```sql
create table public.staff (
  user_id uuid primary key references auth.users on delete cascade,
  role text not null check (role in ('admin','moderador')),
  added_by uuid references auth.users on delete set null,
  created_at timestamptz not null default now());
alter table public.staff enable row level security;
create policy "staff readable" on public.staff for select using (true); -- só id e papel: para a etiqueta "Equipa"
create table public.admin_log (
  id bigint generated always as identity primary key,
  actor uuid references auth.users on delete set null,
  action text not null check (char_length(action) <= 40),
  target text check (char_length(target) <= 200),
  detail jsonb,
  created_at timestamptz not null default now());
alter table public.admin_log enable row level security; -- sem políticas: só a chave secreta
create index on public.admin_log (created_at desc);
```
Sem políticas de escrita: só o servidor escreve. Depois: `get_advisors` (security); o aviso "RLS enabled no policy" do
`admin_log` é intencional.

### 6.3 Servidor
- `lib/staff.ts`: `roleOf(uid): Promise<"dono" | "admin" | "moderador" | null>` (`ADMIN_IDS` → dono; senão `staff`) e
  `can(role, action)` com a tabela 6.1.
- `app/api/admin/route.ts` reorganizado: `GET ?o=me` → `{ role }` (substitui `{ admin }`; manter `admin: !!role` por compatibilidade
  até o app novo estar publicado). `GET ?o=<secção>` por separador (resumo, ideias, erros, opinioes, catalogo, qualidade, pessoas
  `&q=`, pessoa `&id=`, equipa, registo), cada uma com `can`. `POST { act, … }`, cada ação com `can` e **uma linha em `admin_log`**.
- Ficheiros grandes: separar em `lib/admin-actions.ts` (ações) e `lib/admin-read.ts` (leituras) para a rota ficar curta.

### 6.4 Separadores do painel (`components/admin/*.tsx`, um ficheiro por separador; `Admin.tsx` só monta os chips)
1. **Resumo**: números atuais + contas novas (7 dias), pedidos de IA hoje por tipo e o total vs. o máximo diário.
2. **Ideias**: filtros por estado (incl. "Recursos"), responder, mudar estado, **apagar** (confirmação "Apagar a ideia «…»? Os votos
   também desaparecem.").
3. **Erros reportados**: como hoje + abrir o tema/lição em causa.
4. **Opiniões**: como hoje + média por contexto (menu, l3, fim de trilha).
5. **Catálogo**: lista com pesquisa; mudar categoria (lista das 11); "Refazer trilha" (apaga trilha + lições desse nível, como hoje).
6. **Qualidade**: lições do catálogo com marcas PT-BR (`brMarkers`) ou com erros reportados, com "Refazer lição" (apaga só essa
   linha de `catalog_lessons`; a próxima pessoa que a abrir gera uma nova) e o texto suspeito realçado.
7. **Pessoas**: pesquisa por e-mail, @nome ou UID (até 20 resultados). E-mail/UID via `admin.auth.admin.listUsers` (até 5 páginas
   de 1000) / `getUserById`; @nome via `profiles.username ilike`. Ficha: @nome, nome, avatar, e-mail (não para moderador),
   formas de entrar (google/email…), criada em, último acesso, e-mail confirmado, suspensa até, XP, sequência, XP da semana, no
   ranking, nº de trilhas e última gravação do progresso, aparelhos com avisos, IA usada hoje, papel na equipa. Ações:
   - "Enviar e-mail de nova palavra-passe" (`resetPasswordForEmail`, volta a `/entrar`);
   - "Reenviar confirmação" (`resend` tipo `signup`, só se não confirmado);
   - "Tirar do ranking" / "Repor no ranking" (`in_ranking`);
   - "Repor @nome" (para nomes ofensivos: `user_` + 6 caracteres aleatórios; `display_name` vazio);
   - "Suspender 7 dias" / "Levantar suspensão" (`updateUserById` com `ban_duration` `168h` / `none`);
   - "Apagar progresso" (confirmação escrevendo o @nome; grava o estado vazio);
   - "Apagar conta" (só dono; confirmação escrevendo o @nome; `deleteUser`).
8. **Equipa** (só dono): lista (donos vindos do `ADMIN_IDS` marcados "Dono · definido na Vercel"), adicionar por e-mail/@nome/UID
   com papel, mudar papel, retirar (confirmação).
9. **Registo** (dono e admin): últimas 200 ações (quem, o quê, alvo, quando).
- Todos os botões destrutivos com confirmação; todas as ações com aviso rápido de sucesso/erro.

### 6.5 Acesso e etiquetas
- A gaveta (2.1) mostra "Administração" para qualquer papel; nas Definições, o grupo "Equipa" (2.6).
- Etiqueta pública **"Equipa"** (chip `ch` com `Shield`, cores `--brand`) ao lado do @nome: Ranking, Ideias (autor e quem
  responde), perfil público `/u/[username]`, Perfil próprio. Fonte: `staff` (leitura pública) + donos. Para os donos aparecerem,
  `GET /api/staff` (público, com cache de 5 min) devolve os ids de toda a equipa (donos incluídos), sem papéis.
- **Aceitação** (A, com `ADMIN_IDS` = utilizador do falso e linhas de `staff`/`admin_log` no falso): cada separador abre; um
  moderador não vê e-mails nem ações de conta; só o dono vê Equipa; cada ação grava no registo. (B) com a conta de teste como
  moderador (o Rodrigo adiciona-a no painel): `GET ?o=pessoas` não traz e-mails; `POST` de ação de conta dá 403.

### 6.6 Publicar 0.10.6
`novo`: etiqueta "Equipa" nos membros da equipa do NOOBrain. (O painel é interno: não entra no changelog.)

---

## Fase 7 · 0.10.7 · Novidades com destaques e aviso de beta

### 7.1 Tipos de versão
- `lib/changelog.ts` → `Release.kind: "marco" | "novidades" | "correcoes"` (obrigatório) e `destaques?: string[]` (até 3, só nos
  marcos). Regras (atualizar também `AGENTS.md`, secção do changelog):
  - **marco**: salto de dezena (0.10, 0.11, …), `aviso: true`, com `destaques`;
  - **novidades**: há pelo menos uma linha em `novo` ou `melhorias`;
  - **correcoes**: só `corrigido`.
- Classificar as entradas antigas: 0.10 = marco (destaques: meta diária e conquistas; desafio do dia; o app abre sem internet);
  as restantes pela regra acima.
- `components/News.tsx`:
  - chips de filtro no topo: Tudo · Marcos · Novidades · Correções;
  - **marco**: cartão `pane hero` (azul da marca), eyebrow "Versão 0.11 · grande atualização", título grande, mascote `happy`,
    lista "Destaques" e depois as listas normais;
  - **novidades**: como hoje + etiqueta `Spark` "Novidades";
  - **correcoes**: cartão compacto, fechado por omissão (`details`/`summary` com estilo próprio), etiqueta `Bug` "Correções".
- `Announce.tsx` (janela de "há novidades"): só para marcos e novidades; correções não interrompem ninguém.
- **Aceitação** (A): filtros funcionam; o marco aparece em destaque; correções fechadas; claro/escuro.

### 7.2 Aviso de beta antes de entrar
- No ecrã de entrada (sem sessão), por cima dos separadores Entrar/Criar conta: `pane tint` compacto com `Spark`:
  "**Estás a entrar numa versão beta.** O NOOBrain é gratuito e está a ser construído contigo: algumas coisas podem falhar ou mudar.
  Se algo correr mal, diz-nos em Ideias ou em Dar opinião." Sempre visível (não se fecha), sem empurrar o formulário para fora do
  primeiro ecrã do telemóvel (390×844).
- **Aceitação**: captura a 390 px com o botão "Entrar" visível sem rolar.

### 7.3 Publicar 0.10.7
`melhorias`: Novidades com destaques nas grandes atualizações e filtros por tipo; aviso de beta antes de entrar.

---

## Fase 8 · 0.10.8 · Troféus do ranking semanal

### 8.1 Contra a batota (migração `xp_diario`)
- `profiles` + `day_xp int not null default 0`, `day_on date`.
- `sync_profile_stats`: além do limite por gravação (1000), o ganho conta no máximo **1000 XP por dia** para `week_xp`
  (`gain = least(gain, 1000 - day_xp)` com `day_xp` reposto quando `day_on` muda; dia em Europe/Lisbon). O XP total da pessoa não
  muda; só o que entra no ranking.

### 8.2 Prémios (migração `trofeus`)
```sql
create table public.weekly_awards (
  week_start date not null, user_id uuid not null references auth.users on delete cascade,
  place smallint not null check (place between 1 and 10), xp int not null,
  notified boolean not null default false,
  primary key (week_start, user_id));
alter table public.weekly_awards enable row level security;
create policy "awards readable" on public.weekly_awards for select using (true);
```
Função `close_week()` (`security definer`, `search_path = ''`): semana anterior (segunda-feira em Lisboa − 7 dias); os 10 primeiros
com `in_ranking`, `week_start` = essa semana e `week_xp >= 50`, por `week_xp` desc e `created_at` asc → `insert … on conflict do
nothing`. `pg_cron`: `5 0 * * 1` (segunda 00:05 UTC) `select public.close_week();`. Depois: `get_advisors`.
Aviso push aos premiados: na rota `/api/cron/remind` (já corre de hora a hora), para cada prémio com `notified = false`, envia "Ficaste em 2.º lugar no ranking da semana! Vê o teu troféu."
e marca `notified`.

### 8.3 Prémios (cosméticos, sem dinheiro)
- 1.º: troféu de ouro "Campeão da semana" + coroa no avatar durante a semana seguinte (a coroa fica desbloqueada para sempre no
  criador de personagem, Fase 9).
- 2.º: troféu de prata. 3.º: troféu de bronze. 4.º–10.º: medalha "Top 10".
- Tokens novos em `globals.css` (claro e escuro): `--gold`, `--gold-deep`, `--silver`, `--silver-deep`, `--bronze`, `--bronze-deep`.
- Ícones `TrophyCup` (com o número) e `Medal`.
- **Ranking**: no topo, "Pódio da semana passada" (3 lugares, avatares, XP). **Perfil** (próprio e público): linha "Troféus" com a
  contagem de cada tipo (só aparece se houver).
- Celebração: ao abrir o app depois de ganhar (o app lê `weekly_awards` da pessoa com `week_start > s.awardsSeen`), abre a janela das
  conquistas (`BadgeDialog`) com o troféu e confettis; grava `awardsSeen`.
- Conquistas novas em `lib/badges.ts`: "Pódio" (top 3 uma vez) e "Top 10" (top 10 uma vez), testadas a partir de `s.awards`
  (lista guardada no estado ao ler `weekly_awards`).
- **Aceitação** (A): com `weekly_awards` no falso, o pódio e os troféus aparecem e a celebração abre uma vez; (Supabase) correr
  `close_week()` dentro de uma transação com `rollback` num cenário de teste e confirmar a ordem.

### 8.4 Publicar 0.10.8
`novo`: troféus para os 10 primeiros do ranking de cada semana, com pódio no Ranking. `melhorias`: o ranking passa a contar no
máximo 1000 XP por dia.

---

## Fase 9 · 0.11 · Mascote com variações e criador de personagem

### 9.1 Proposta para aprovar (antes de mexer no app)
Uma página de aprovação (artefacto HTML, ferramenta Artifact; se não existir, ficheiro HTML enviado ao Rodrigo) feita com os
caminhos reais de `lib/mascot-paths.ts` e os tokens de `globals.css`, com tema claro/escuro, com:
1. **Expressões**: as 7 atuais (idle, think, happy, sad, shy, calm, peek) + novas: `sleep` (olhos em linha e "z" chanfrados),
   `wow` (pupilas grandes), `wink` (um olho em linha), `focus` (pupilas ao centro, olhos semicerrados).
2. **Animações** (CSS, respeitam movimento reduzido): acenar (inclinação ±6°), saltinho de vitória, olhar em volta, respirar a
   dormir, piscar (já existe).
3. **Onde aparece** (mapa com mini-capturas): entrada (acenar), trilha vazia (`peek` a espreitar do canto), a carregar (`think` +
   olhar em volta), fim de lição (saltinho / `sad`), limite do dia (`sleep`), sem ligação (`calm`), 404 (`sad`), pódio (coroa),
   conquista (`happy`), gaveta vazia de revisão (`wink`).
4. **Acessórios** (camada SVG por cima, alinhada à cabeça; formas retas e chanfradas, cores da marca): coroa, óculos, boné,
   auscultadores, cachecol, capelo.
5. **Criador de personagem** (simulação): cor do corpo (8: as 6 atuais + 2 novas a acrescentar como tokens), olhos (normal, feliz,
   sono, surpresa), acessório, fundo do avatar (6). Acessórios bloqueados com cadeado e "como desbloquear":
   coroa = 1.º lugar numa semana; capelo = concluir uma trilha; auscultadores = 7 dias seguidos; óculos = 50 cartões revistos;
   boné e cachecol = livres.
Mandar ao Rodrigo e **esperar a aprovação** só desta fase. Enquanto espera, seguir para as Fases 10 e 11.

### 9.2 Depois da aprovação
- `Mascot.tsx`: props `accessory`, `eyes`; expressões e animações novas (CSS em `globals.css`); aplicar no mapa 9.1.3.
- Base de dados (migração `personagem`): `profiles.look jsonb` com `check (pg_column_size(look) < 400)` e um gatilho que recusa
  `look->>'acc' = 'coroa'` sem linha em `weekly_awards` com `place = 1` dessa pessoa. Os outros desbloqueios verificam-se no app
  (baixo risco, só cosmético).
- `Avatar.tsx`: desenha a partir de `look` (com o `avatar` antigo como cor quando `look` é nulo).
- `ProfileForm.tsx`: secção "Personagem" com pré-visualização grande e linhas de opções (chips com miniaturas); bloqueados com
  `Lock` e a frase de como desbloquear.
- `Onboarding`: escolher personagem logo no início (cor + olhos), o resto depois.
- **Aceitação** (A): criar, gravar e ver o mesmo avatar no Perfil, Ranking, Ideias e perfil público; acessório bloqueado não grava;
  claro/escuro; movimento reduzido sem animações.

### 9.3 Publicar 0.11 (marco)
`kind: "marco"`, `aviso: true`, destaques: criador de personagem; mascote com novas expressões; troféus semanais desbloqueiam
acessórios. Mais as linhas das fases anteriores que ainda não foram publicadas (se houver).

---

## Fase 10 · Login com Apple e Discord (preparado e desligado)

- `components/Account.tsx`: generalizar o fluxo do Google (janela à parte, `BroadcastChannel`, voltar atrás) para
  `signInWith(provider: "google" | "apple" | "discord")`. Botões só aparecem com `NEXT_PUBLIC_APPLE_LOGIN=1` /
  `NEXT_PUBLIC_DISCORD_LOGIN=1` (nomes em `.env.example`). Logótipos oficiais em `public/` (como `google.svg`): Apple a preto (no
  escuro, branco) e Discord no azul da marca Discord, dentro de botões `btn soft` iguais ao do Google.
- `app/privacidade`: acrescentar Apple e Discord como formas de entrar (o que recebem e o que não recebem).
- Novo `docs/login-social.md` com os passos do Rodrigo:
  - **Discord** (grátis, idade mínima 13, como o NOOBrain): discord.com/developers → New Application → OAuth2 → Redirects:
    `https://klrgitkxdhofsqwyisvn.supabase.co/auth/v1/callback` → copiar Client ID e Client Secret → Supabase → Authentication →
    Providers → Discord → colar → Save → Vercel: `NEXT_PUBLIC_DISCORD_LOGIN=1` → publicar de novo.
  - **Apple**: exige o Apple Developer Program (**99 USD por ano**). Só com decisão do Rodrigo. Passos (Services ID, chave, domínio)
    segundo a documentação do Supabase "Login with Apple", com o mesmo URL de retorno.
  - Contas com o mesmo e-mail confirmado juntam-se sozinhas (como o Google fez com a tua).
- **Aceitação**: com as variáveis desligadas nada muda; com `NEXT_PUBLIC_DISCORD_LOGIN=1` local, o botão aparece e chama o Supabase
  com `provider: "discord"` (verificar o URL pedido no falso).

---

## Fase 11 · Segurança do GitHub

No repositório (agente):
- `LICENSE`: "Copyright (c) 2026 NOOBjects. Todos os direitos reservados." + parágrafo: o código está visível para transparência;
  não é dada licença para copiar, modificar ou distribuir; a marca NOOBjects/NOOBrain e o mascote não podem ser usados.
- `SECURITY.md`: como reportar uma falha (aviso privado no GitHub ou dev.noobjects@gmail.com), o que não fazer (testes contra contas
  de outras pessoas), resposta em até 7 dias.
- `.github/dependabot.yml`: npm, semanal, agrupar `minor` e `patch`, no máximo 3 PRs abertos.
- `README.md`: secção curta "Segurança" a apontar para o `SECURITY.md`.

O Rodrigo (GitHub, ~10 min; ver "Pendências do Rodrigo"): verificação em dois passos na conta; Settings → Code security: Dependabot
alerts e security updates, Secret scanning + Push protection, Private vulnerability reporting; Settings → Rules → Rulesets → New
branch ruleset "main" (alvo: ramo por omissão; ativar **Block force pushes** e **Restrict deletions**; não exigir PR, porque os agentes
publicam na `main`). Na Vercel: confirmar que Settings → Git → **Git Fork Protection** está ligado (impede que PRs de estranhos
corram com as tuas chaves, agora que as variáveis estão também nas pré-visualizações).

---

## Pendências do Rodrigo (atualizar ao longo das fases)
1. ~~CAPTCHA e conta de teste~~ feitos (05/10/2026).
1d. ~~`drop function bump_catalog_use`~~ feito pelo Rodrigo.
1c. **Testes** (agora o painel → Ferramentas faz isto: repor uso de IA, ligar limites para testar como pessoa normal, rever o português do catálogo): a conta de teste esgotou as cotas do dia; apagar `delete from ai_usage where user_id = '46babcd0-ff00-45d2-8ef4-df4622852cd4';` no SQL Editor para repetir testes com IA (o agente foi bloqueado 2 vezes).
1b. **Fase 1, falta**: `drop function public.bump_catalog_use(text, text);` (a migração `drop_bump_catalog_use` deu timeout 2 vezes pelo agente; a função já não é usada pelo app). Correr no SQL Editor do Supabase, e confirmar com `get_advisors` que o aviso desaparece.
2. Fase 1: confirmar no telemóvel que entra com e-mail e que o "Enviar aviso de teste" chega.
3. Fase 2: instalar o app no PC e no telemóvel.
4. Fase 6: adicionar a conta de teste como moderador no painel (Equipa), para os testes de acesso.
5. Fase 9: aprovar (ou pedir mudanças) na página do mascote e do criador de personagem.
6. Fase 10: decidir se paga o Apple Developer (99 USD/ano); criar a app no Discord (passos em `docs/login-social.md`).
7. Fase 11: os passos do GitHub e da Vercel.
8. Desenhos (quando quiseres): ícones das categorias (agora 11), acessórios definitivos do mascote.
