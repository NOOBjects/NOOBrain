# Plano NOOBrain Beta (para o Sonnet 5.5 executar)

## Contexto
O NOOBrain está publicado (noobrain.vercel.app). O login por Google e por e-mail funciona, e a Vercel está ligada ao GitHub. Antes de abrir o app a pessoas reais, o Rodrigo pediu: deixar claro que é beta, login obrigatório e começar do zero, lições já criadas, perfil completo com nome de utilizador e ranking, mural de sugestões, notificações que funcionem no telemóvel, definições (tema, dados, sobre), correções de UI, animações e uma revisão de segurança e desempenho. Tudo tem de caber **sempre** nos planos gratuitos do Supabase e da Vercel.

Decisões já tomadas pelo Rodrigo (não voltar a perguntar):
- **Login obrigatório para tudo.** Sem conta, só se vê o ecrã de entrada, que mostra os temas já disponíveis.
- **Social = perfis + ranking semanal.** Sem seguir, sem feed, sem comentários.
- **Sugestões = mural público com votos.** O Rodrigo responde e muda o estado pelo painel do Supabase.
- **Push com o app fechado: aprovado o pacote `web-push`.**
- O "Sobre" diz que o app é feito quase 100% com IA e que as ideias, o design e as decisões são do Rodrigo (NOOBjects).

Resposta à dúvida do Rodrigo sobre "Manter o progresso neste aparelho?": o progresso **já fica na nuvem**. A pergunta era só sobre deixar ou não uma cópia no navegador depois de sair. Com login obrigatório, essa pergunta desaparece: ao sair, a cópia do navegador apaga-se sempre e a conta guarda tudo.

## Regras para quem executa (além de MANUAL.md e CLAUDE.md)
- Uma fase de cada vez, pela ordem abaixo. No fim de cada fase: `npm run build`, `npm run lint` (e `npm run check:topic` se mexer em `lib/topic.ts`), commit com mensagem em português, push na `main` (a Vercel publica sozinha) e verificação no site.
- Todos os textos novos em **português de Portugal, tratando por "tu"** ("Inicia sessão", "ecrã", "guardar", "rever").
- Antes de usar qualquer API do Next 16 (`params`, metadata, headers, scripts no layout), ler o guia em `node_modules/next/dist/docs/`.
- As migrações SQL deste plano aplicam-se com a ferramenta `apply_migration` do Supabase (projeto `klrgitkxdhofsqwyisvn`). Depois de cada migração, correr `get_advisors` (security) e corrigir o que aparecer.
- **Variáveis de ambiente na Vercel e segredos no Vault: quem os põe é o Rodrigo.** As permissões bloqueiam o agente. Em cada fase, dizer-lhe exatamente o nome e onde pôr; no computador, guardar em `.env.local` e registar só o nome em `.env.example`.
- Cores só pelos tokens de `app/globals.css`. Cantos sempre chanfrados (`.ch`, `.pane`, `.btn`). Nada de `border-radius`, nada de sombra com desfoque.

---

## Fase 0: correções rápidas e beta visível
1. **Selo da ilha cortado** (`app/globals.css`, `.badge` ~linha 362). O botão `.isl` tem `clip-path` (classe `ch`), que corta o selo posicionado fora dele. Pôr o selo dentro dos limites: `top: 3px; right: 3px;`. Conferir com 1 e com 2 dígitos.
2. **Passos Aprender/Memorizar/Testar** (`components/LessonView.tsx` ~linha 104 e `.stp` ~linha 512):
   - acrescentar `ch` ao className do botão: `` className={`stp ch${...}`} ``;
   - trocar `.stp.cur { background: var(--ink); color: var(--bg); }` por `.stp.cur { background: var(--brand); color: var(--on-brand); }`;
   - trocar `.stp.cur .stp-n` por `background: var(--on-brand); color: var(--brand);`.
   Depois, procurar no CSS outras regras com `--c:` cujo elemento, no TSX, não tenha `ch`, `pane` ou `btn`, e corrigir da mesma forma.
3. **Beta sempre visível**: criar `lib/config.ts` com `export const BETA = true;` e `export const VERSION = "0.9";`.
   - No cabeçalho (`App.tsx`, dentro de `.brand-text`), um chip `<span className="chip ch beta">Beta</span>` quando `BETA` for verdadeiro.
   - No rodapé (`components/LegalPage.tsx` → `LegalLinks`), acrescentar: "Versão beta · Dar uma ideia" (o link leva ao mural, na Fase 7; até lá, `mailto:` para o e-mail de contacto que já existe nas páginas legais).
   - Aviso de boas-vindas à beta: um ecrã `pane` mostrado uma vez por conta, depois do primeiro login (chave `noobrain:beta-seen:<uid>` no localStorage). Texto: "O NOOBrain está em beta. Algumas coisas podem falhar ou mudar. As tuas ideias ajudam a decidir o que vem a seguir." Botões: "Começar" e "Dar uma ideia".
4. **Tudo em PT-PT**: procurar em `components/`, `lib/` e `app/` por `você|Você|seu |sua |Digite|Clique|Conclua|Espere|Tente|entenda|tela|usuário|celular|Revisar|revisar` e converter. Na ilha, "Revisar" passa a "Rever". Em `lib/ai.ts` e nas rotas `app/api/*/route.ts`, trocar "português do Brasil" por "português de Portugal (europeu), com a ortografia do Acordo Ortográfico de 1990". Mensagens de erro das rotas também em PT-PT.
5. ROADMAP: marcar "Idioma: português de Portugal" como feito.

## Fase 1: login obrigatório e começar do zero
**Ficheiros:** `lib/store.ts`, `lib/useSync.ts`, `components/App.tsx`, `components/Account.tsx`. A apagar: `lib/merge.ts`, `lib/merge.test.ts`, `components/MergeChoice.tsx`, `lib/sample.ts` (o `ZIGZAG` passa para `TrailNode.tsx`) e o script `check:merge` do `package.json`.
1. `lib/store.ts`: `initial = { trails: [], active: "", xp: 0, streak: 0, lastDay: null, cards: {}, updatedAt: 0 }`. No `parse`, descartar trilhas com `example: true`. `activeTrail` passa a devolver `Trail | undefined`; corrigir todos os sítios que o usam.
2. `App.tsx`:
   - `ready && !user` → mostrar só o ecrã de entrada: marca, chip Beta, `Account` e, por baixo, "Já há lições sobre:" com os temas do catálogo (fica vazio até à Fase 3).
   - Sem trilhas → estado vazio "Escolhe o teu primeiro tema", com botões "Explorar temas" (Fase 3) e "Criar um tema" (vista `novo`).
   - Remover tudo o que é `MergeChoice`/`conflict`.
3. `useSync.ts`: ao entrar, `remote ? remote : (getOwner() === uid ? local : initial)`. Remover `conflict`, `resolve`, `isBlank` e `merge`. `signOut()` deixa de receber argumento: sai, faz `replace(initial)` e limpa o dono.
4. `Account.tsx`: remover o diálogo "Manter o progresso neste aparelho?" (estado `leaving` e os botões "Manter e sair"/"Apagar daqui e sair"). "Terminar sessão" sai logo.
5. Remover o campo `example` de `Trail` em `lib/types.ts` e o chip "Exemplo" em `App.tsx`.

## Fase 2: perfil, nome de utilizador, definições e sobre
### 2.1 Migração `perfis` (SQL completo)
```sql
create table public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  username text not null unique
    check (username ~ '^[a-z0-9_]{3,20}$')
    check (username not in ('admin','noobrain','noobjects','suporte','support','root','moderador','oficial','sistema')),
  display_name text not null default '' check (char_length(display_name) <= 40),
  avatar smallint not null default 0 check (avatar between 0 and 5),
  bio text not null default '' check (char_length(bio) <= 160),
  in_ranking boolean not null default true,
  xp int not null default 0,
  streak int not null default 0,
  topics_done int not null default 0,
  week_xp int not null default 0,
  week_start date not null default (date_trunc('week', now() at time zone 'Europe/Lisbon'))::date,
  created_at timestamptz not null default now()
);
alter table public.profiles enable row level security;
create policy "profiles readable" on public.profiles for select to anon, authenticated using (true);
create policy "own profile insert" on public.profiles for insert to authenticated with check (id = (select auth.uid()));
create policy "own profile update" on public.profiles for update to authenticated
  using (id = (select auth.uid())) with check (id = (select auth.uid()));
-- só estes campos podem ser escritos pelo utilizador; XP e estatísticas só pelo gatilho abaixo
revoke insert, update on public.profiles from anon, authenticated;
grant insert (id, username, display_name, avatar, bio, in_ranking) on public.profiles to authenticated;
grant update (username, display_name, avatar, bio, in_ranking) on public.profiles to authenticated;
create index profiles_week on public.profiles (week_start, week_xp desc) where in_ranking;

-- progresso: tamanho máximo por pessoa (protege os 500 MB do plano gratuito)
alter table public.progress add constraint progress_size check (pg_column_size(data) <= 1000000);

-- estatísticas do perfil calculadas a partir do progresso guardado
create or replace function public.sync_profile_stats() returns trigger
language plpgsql security definer set search_path = '' as $$
declare
  num_xp int := case when jsonb_typeof(new.data->'xp') = 'number' then least((new.data->>'xp')::numeric, 10000000)::int else 0 end;
  num_streak int := case when jsonb_typeof(new.data->'streak') = 'number' then least((new.data->>'streak')::numeric, 100000)::int else 0 end;
  old_xp int := case when tg_op = 'UPDATE' and jsonb_typeof(old.data->'xp') = 'number' then (old.data->>'xp')::numeric::int else 0 end;
  gain int := least(greatest(num_xp - old_xp, 0), 1000); -- ponytail: teto por gravação contra batota simples; validação no servidor se o ranking ganhar peso
  wk date := (date_trunc('week', now() at time zone 'Europe/Lisbon'))::date;
  done int := 0;
begin
  if jsonb_typeof(new.data->'trails') = 'array' then
    select count(*) into done from jsonb_array_elements(new.data->'trails') t
    where jsonb_typeof(t->'concepts') = 'array' and jsonb_array_length(t->'concepts') > 0
      and jsonb_typeof(t->'done') = 'number' and (t->>'done')::numeric >= jsonb_array_length(t->'concepts');
  end if;
  update public.profiles p set
    xp = num_xp, streak = num_streak, topics_done = done,
    week_xp = case when p.week_start = wk then p.week_xp + gain else gain end,
    week_start = wk
  where p.id = new.user_id;
  return new;
end $$;
revoke execute on function public.sync_profile_stats() from public, anon, authenticated;
create trigger progress_stats after insert or update of data on public.progress
  for each row execute function public.sync_profile_stats();
```

### 2.2 Primeiro login → "Cria o teu perfil"
- Novo `components/Onboarding.tsx`. Aparece quando `user && !profile`. O perfil é lido em `useSync` com `from('profiles').select('*').eq('id', uid).maybeSingle()` e exposto como `profile` + `reloadProfile()`.
- Campos:
  - **Nome de utilizador**: minúsculas, `[a-z0-9_]`, 3 a 20 caracteres; verifica se está livre 400 ms depois de a pessoa parar de escrever, com `select('id', { count: 'exact', head: true }).eq('username', v)`. Sugestão inicial vinda de `user_metadata.full_name` ou da parte antes do @ do e-mail.
  - **Nome a mostrar**: pré-preenchido com `full_name`.
  - **Avatar**: 6 opções, o mascote com fundo em `--brand`, `--brand-deep`, `--sun`, `--ink`, `--ink-3`, `--brand-soft`. Mais cores só com o valor dado pelo Rodrigo.
- Gravar com `insert`. Se der erro de nome repetido (código `23505`), mostrar "Esse nome já está ocupado".
- Depois, o aviso da beta (Fase 0) e o estado vazio da Fase 1.

### 2.3 Página Perfil (substitui o ecrã "Sessão iniciada")
- Topo: avatar, nome, @utilizador, "Membro desde <mês ano>".
- Grelha de estatísticas: XP total, sequência, temas concluídos, cartões dominados (`box >= 4`, calculado no navegador), XP desta semana.
- Ações em **coluna, todas `btn block`, com a mesma largura**: "Editar perfil", "Partilhar perfil" (copia `https://noobrain.vercel.app/u/<username>`), "Ranking" (Fase 6), "Ideias" (Fase 7), e um botão de engrenagem no canto do título para "Definições". Isto resolve os botões desalinhados.
- A ilha passa a ter: Trilha, Lição, Explorar (Fase 3), Rever, Perfil.

### 2.4 Definições (nova vista `definicoes`, componente `components/Settings.tsx`)
Secções, cada uma num `pane`:
1. **Aparência**: Automático / Claro / Escuro.
   - Guardar em `localStorage["noobrain:theme"]` e aplicar com `document.documentElement.dataset.theme`.
   - CSS: o bloco `@media (prefers-color-scheme: dark) { :root {…} }` (linha ~48) passa a `:root:not([data-theme="light"])` dentro da media query. Copiar o mesmo bloco de tokens escuros para `:root[data-theme="dark"]`, fora da media query.
   - No `app/layout.tsx`, script inline no `<head>` para não haver flash ao carregar: `try{var t=localStorage.getItem("noobrain:theme");if(t==="light"||t==="dark")document.documentElement.dataset.theme=t}catch(e){}` e `suppressHydrationWarning` no `<html>`.
2. **Lembretes**: o `ReminderToggle` (refeito na Fase 5).
3. **Conta**: e-mail, "Alterar palavra-passe" (já existe em `Account.tsx`, mover para aqui), "Terminar sessão".
4. **Os teus dados**:
   - "Descarregar os meus dados": um JSON com o progresso e o perfil.
   - "Recomeçar do zero": confirmação a escrever "RECOMEÇAR", depois `replace(initial)`, que sobe para a nuvem.
   - "Apagar conta": confirmação a escrever o @utilizador, depois `DELETE /api/account`. Ver Fase 4.
5. **Sobre**: versão (`VERSION` + "beta"), o que é o NOOBrain, fontes (Wikipédia, Wikilivros, Wikiversidade, Wikisource, com licença CC BY-SA e ligação), Termos, Privacidade, contacto. Texto obrigatório (o Rodrigo pode afinar):
   > "O NOOBrain é feito quase 100% com inteligência artificial: o código foi escrito por modelos de IA. As ideias, o design, as decisões e o cuidado com cada detalhe são do Rodrigo, da NOOBjects."

### 2.5 Política de privacidade
Atualizar `app/privacidade/page.tsx`: perfil público (nome de utilizador, nome, avatar, estatísticas), ranking (com opção de sair), sugestões públicas, subscrições de notificações e contadores de uso da IA (guardados 30 dias).

## Fase 3: catálogo partilhado e lições já criadas
Objetivo: cada trilha ou lição gerada pela IA fica guardada uma vez e serve a toda a gente. É também o que mais poupa a cota gratuita da IA.

### 3.1 Migração `catalogo`
```sql
create table public.catalog_trails (
  key text not null, level text not null,
  topic text not null check (char_length(topic) <= 60),
  concepts jsonb not null, sources jsonb not null default '[]',
  uses int not null default 0,
  created_at timestamptz not null default now(),
  primary key (key, level)
);
create table public.catalog_lessons (
  trail_key text not null, level text not null, concept_key text not null,
  lesson jsonb not null, created_at timestamptz not null default now(),
  primary key (trail_key, level, concept_key)
);
alter table public.catalog_trails enable row level security;
alter table public.catalog_lessons enable row level security;
create policy "catalog readable" on public.catalog_trails for select to anon, authenticated using (true);
create policy "lessons readable" on public.catalog_lessons for select to authenticated using (true);
-- escrita só pelo servidor com a chave secreta (não há políticas de insert/update)
create or replace function public.bump_catalog_use(p_key text, p_level text) returns void
language sql security definer set search_path = '' as $$
  update public.catalog_trails set uses = uses + 1 where key = p_key and level = p_level;
$$;
revoke execute on function public.bump_catalog_use(text, text) from public, anon;
grant execute on function public.bump_catalog_use(text, text) to authenticated;
```

### 3.2 Servidor
- **Variável nova** `SUPABASE_SECRET_KEY` (Supabase → Project Settings → API Keys → Secret key). O Rodrigo põe-na na Vercel em **Production e Preview**, sem `NEXT_PUBLIC_`.
- Novo `lib/admin.ts`:
  ```ts
  import { createClient } from "@supabase/supabase-js";
  // Cliente com a chave secreta: SÓ em rotas de app/api. Nunca importar em components/.
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SECRET_KEY;
  export const admin = url && key ? createClient(url, key, { auth: { persistSession: false, autoRefreshToken: false } }) : null;
  ```
- `app/api/trail/route.ts`: antes do cache em memória e da IA, procurar `catalog_trails` por `(topicKey(topic), level)`. Se encontrar, devolver. Depois de gerar, fazer `upsert` em `catalog_trails`.
- `app/api/lesson/route.ts`: o mesmo com `catalog_lessons`, chave `(topicKey(topic), level, topicKey(title))`, que é a mesma composição do `cacheKey` atual.
- Os erros do catálogo nunca podem impedir a resposta: `try/catch` e seguir para a IA.

### 3.3 Vista Explorar (`components/Explore.tsx`)
- Lista `catalog_trails` (`select key, level, topic, concepts, sources, uses`, ordenado por `uses desc`, limite de 60) com caixa de pesquisa local.
- Tocar em "Começar" copia a trilha para o estado (id novo, `done: 0`), chama `bump_catalog_use` e abre-a. As lições vêm por `/api/lesson`, que agora encontra-as no catálogo.
- O ecrã de entrada (Fase 1) mostra os 8 temas com mais `uses`.

### 3.4 Lições já criadas (semente)
- `scripts/seed-catalog.mjs`: com `npm run dev` a correr, chama `POST /api/trail` e depois `POST /api/lesson` para cada conceito.
- Usa o cabeçalho `x-seed-token` igual a `SEED_TOKEN` do `.env.local`. As rotas só aceitam este cabeçalho se `SEED_TOKEN` existir, e essa variável **nunca vai para a Vercel**.
- Faz uma pausa de 7 s entre pedidos, para não passar dos 9 por minuto.
- Temas iniciais (o Rodrigo pode trocar): Fotossíntese, Sistema Solar, Fernando Pessoa, Revolução dos Cravos, Inteligência Artificial, Finanças pessoais, Primeiros socorros, Teoria das cores. Nível Iniciante.
- Antes de correr, confirmar o limite diário do modelo no Google AI Studio. São ~64 pedidos; se o limite for curto, dividir por dias.

## Fase 4: segurança, desempenho e IA
1. **IA só com conta**:
   - `lib/api.ts` junta `authorization: Bearer <access_token>` (de `supabase.auth.getSession()`).
   - Novo `lib/auth.ts` com `userFrom(request)`: lê o token e devolve o utilizador com `admin.auth.getUser(token)`, ou `null`.
   - As rotas `trail`, `lesson`, `tutor` e `report` respondem 401 sem utilizador (exceto com o `SEED_TOKEN` local).
2. **Cotas diárias** (migração):
   ```sql
   create table public.ai_usage (
     user_id uuid not null references auth.users(id) on delete cascade,
     day date not null default current_date,
     kind text not null check (kind in ('trail','lesson','tutor')),
     n int not null default 0,
     primary key (user_id, day, kind)
   );
   create table public.ai_daily (day date primary key, n int not null default 0);
   alter table public.ai_usage enable row level security;
   alter table public.ai_daily enable row level security;
   create or replace function public.consume_ai(p_user uuid, p_kind text, p_user_max int, p_global_max int)
   returns text language plpgsql security definer set search_path = '' as $$
   declare v_all int; v_user int;
   begin
     insert into public.ai_daily as d (day, n) values (current_date, 1)
       on conflict (day) do update set n = d.n + 1 returning n into v_all;
     if v_all > p_global_max then return 'global'; end if;
     insert into public.ai_usage as u (user_id, day, kind, n) values (p_user, current_date, p_kind, 1)
       on conflict (user_id, day, kind) do update set n = u.n + 1 returning n into v_user;
     if v_user > p_user_max then return 'user'; end if;
     return 'ok';
   end $$;
   revoke execute on function public.consume_ai(uuid, text, int, int) from public, anon, authenticated;
   grant execute on function public.consume_ai(uuid, text, int, int) to service_role;
   ```
   - Chamar `admin.rpc('consume_ai', …)` **só quando o pedido vai mesmo à IA** (falhou o catálogo e o cache).
   - Limites em `lib/config.ts`: trilha 8/dia, lição 40/dia, tutor 60/dia. O limite global vem de `AI_DAILY_MAX` (variável na Vercel; valor ≈ 80% do limite diário visto no AI Studio).
   - Mensagens: "Chegaste ao limite de hoje. Amanhã há mais." e "A IA gratuita do NOOBrain esgotou por hoje. Volta amanhã."
3. **Relatórios de erro**:
   ```sql
   alter table public.reports add column user_id uuid references auth.users(id) on delete set null;
   drop policy "anyone can report" on public.reports;
   ```
   `app/api/report/route.ts` passa a gravar com `admin` e o `user_id`.
4. **Apagar conta**: `DELETE /api/account` → `userFrom` → `admin.auth.admin.deleteUser(uid)`. Todas as tabelas apagam em cascata. No navegador: `replace(initial)` e terminar sessão.
5. **Cabeçalhos de segurança** em `next.config.ts` (`headers()`): `X-Content-Type-Options: nosniff`, `Referrer-Policy: strict-origin-when-cross-origin`, `X-Frame-Options: DENY`, `Permissions-Policy: camera=(), microphone=(), geolocation=()`.
6. **Desempenho**:
   - A sincronização já agrupa mudanças com 1,5 s de espera; manter.
   - Explorar e ranking pedem só as colunas necessárias, com `limit`.
   - O `select` do progresso só acontece ao entrar.
   - Nenhuma biblioteca nova além de `web-push`.
7. **Painel (tarefas do Rodrigo, lista para lhe dar)**:
   - Supabase → Auth → Rate Limits: rever o limite de e-mails. O Gmail aceita ~500 envios por dia; se a beta crescer, passar para o Resend (ver ROADMAP).
   - Supabase → Auth → URL Configuration: Site URL `https://noobrain.vercel.app`, Redirect URLs com `http://localhost:3000`.
   - Proteção de palavras-passe vazadas: ativar se o plano gratuito o permitir (o advisor está a pedir).
   - Lembrete: o Supabase gratuito pausa projetos sem atividade durante 7 dias; a Vercel Hobby é para uso não comercial.

## Fase 5: notificações no telemóvel (push real)
1. `npm install web-push` (aprovado).
2. Chaves: `npx web-push generate-vapid-keys`. O Rodrigo põe na Vercel (Production):
   - `NEXT_PUBLIC_VAPID_PUBLIC_KEY`
   - `VAPID_PRIVATE_KEY`
   - `VAPID_SUBJECT=mailto:dev.noobjects@gmail.com`
   - `CRON_SECRET` (texto aleatório longo)
3. Migração:
   ```sql
   create table public.push_subscriptions (
     endpoint text primary key check (char_length(endpoint) <= 1000),
     user_id uuid not null references auth.users(id) on delete cascade,
     p256dh text not null check (char_length(p256dh) <= 200),
     auth text not null check (char_length(auth) <= 100),
     tz text not null default 'Europe/Lisbon' check (char_length(tz) <= 60),
     last_sent_at timestamptz,
     created_at timestamptz not null default now()
   );
   alter table public.push_subscriptions enable row level security;
   create policy "own subs" on public.push_subscriptions for all to authenticated
     using (user_id = (select auth.uid())) with check (user_id = (select auth.uid()));
   create index push_subscriptions_user on public.push_subscriptions (user_id);
   ```
4. Navegador (`lib/reminders.ts`):
   - `enable()`: pedir permissão, `register('/sw.js')`, `pushManager.subscribe({ userVisibleOnly: true, applicationServerKey })` e `upsert` da subscrição com `tz: Intl.DateTimeFormat().resolvedOptions().timeZone`.
   - `disable()`: `unsubscribe()` e apagar a linha.
   - Ao terminar sessão, chamar `disable()`.
   - Manter `notifyDue` como reserva enquanto o app está aberto.
5. `public/sw.js`: acrescentar
   ```js
   self.addEventListener("push", (e) => {
     const d = e.data ? e.data.json() : {};
     e.waitUntil(self.registration.showNotification(d.title || "NOOBrain", {
       body: d.body || "", icon: "/icon-192.png", badge: "/icon-192.png", tag: d.tag || "noobrain", data: { url: d.url || "/" },
     }));
   });
   ```
   No `notificationclick`, abrir `e.notification.data.url`.
6. **iPhone**: se for iOS e não estiver instalado (`!matchMedia('(display-mode: standalone)').matches`), o `ReminderToggle` mostra: "No iPhone, os avisos só funcionam com o NOOBrain no ecrã principal: toca em Partilhar → Adicionar ao ecrã principal." O manifesto já existe.
7. Rota `app/api/cron/remind/route.ts` (`maxDuration = 60`):
   - exige `authorization === Bearer ${CRON_SECRET}`;
   - com `admin`, lê as subscrições e o `progress.data` de cada utilizador (até 500 por execução);
   - envia se: hora local (pelo `tz`) entre 9h e 21h, e `last_sent_at` com mais de 20 h;
   - qual aviso: se `dueCards(state).length > 0`, "Tens N cartões para rever"; senão, se a sequência está em risco e a hora local é ≥ 19h, "A tua sequência de N dias acaba hoje";
   - `dueCards` vem de `lib/store.ts` (funções puras);
   - respostas 404/410 do serviço de push → apagar a subscrição.
8. Rota `POST /api/push/test` (utilizador com sessão): envia "Os avisos estão a funcionar." Botão "Enviar aviso de teste" nas Definições.
9. Agendamento no Supabase (gratuito: `pg_cron` + `pg_net`). O agente ativa as extensões. **O Rodrigo corre a linha do Vault** com o mesmo valor do `CRON_SECRET`:
   ```sql
   create extension if not exists pg_cron;
   create extension if not exists pg_net;
   -- RODRIGO: select vault.create_secret('<o mesmo CRON_SECRET da Vercel>', 'cron_secret');
   select cron.schedule('noobrain-lembretes', '0 * * * *', $$
     select net.http_post(
       url := 'https://noobrain.vercel.app/api/cron/remind',
       headers := jsonb_build_object('Authorization', 'Bearer ' || (select decrypted_secret from vault.decrypted_secrets where name = 'cron_secret')),
       body := '{}'::jsonb, timeout_milliseconds := 30000);
   $$);
   select cron.schedule('noobrain-limpeza', '30 3 * * *', $$
     delete from public.ai_usage where day < current_date - 30;
     delete from public.ai_daily where day < current_date - 30;
     delete from cron.job_run_details where end_time < now() - interval '7 days';
   $$);
   ```

## Fase 6: ranking e perfil público
- **Ranking** (`components/Ranking.tsx`, aberto a partir do Perfil):
  - `from('profiles').select('username, display_name, avatar, week_xp').eq('week_start', segundaDeLisboa).eq('in_ranking', true).order('week_xp', { ascending: false }).limit(50)`;
  - a minha posição: `count` de quem tem `week_xp` maior;
  - "Recomeça todas as segundas-feiras" (não precisa de tarefa agendada: o gatilho da Fase 2 reinicia o `week_xp`);
  - nas Definições, interruptor "Aparecer no ranking" (`in_ranking`).
- **Perfil público** `app/u/[username]/page.tsx` (componente de servidor):
  - lê o perfil por REST com a chave pública (a leitura de `profiles` está aberta a `anon`);
  - `notFound()` se não existir;
  - `generateMetadata` com o título `@username · NOOBrain`;
  - mostra avatar, nome, estatísticas e o botão "Aprender no NOOBrain";
  - `params` é uma Promise no Next 16: ver o guia antes.

## Fase 7: mural de sugestões
Migração:
```sql
create table public.suggestions (
  id bigint generated always as identity primary key,
  user_id uuid not null default auth.uid() references public.profiles(id) on delete cascade,
  title text not null check (char_length(title) between 4 and 80),
  body text not null default '' check (char_length(body) <= 600),
  status text not null default 'recebida' check (status in ('recebida','planeada','em_curso','feita','recusada')),
  reply text check (char_length(reply) <= 600),
  votes int not null default 0,
  created_at timestamptz not null default now()
);
create table public.suggestion_votes (
  suggestion_id bigint not null references public.suggestions(id) on delete cascade,
  user_id uuid not null default auth.uid() references public.profiles(id) on delete cascade,
  primary key (suggestion_id, user_id)
);
alter table public.suggestions enable row level security;
alter table public.suggestion_votes enable row level security;
create policy "suggestions readable" on public.suggestions for select to authenticated using (true);
create policy "own suggestion insert" on public.suggestions for insert to authenticated with check (user_id = (select auth.uid()));
create policy "own suggestion delete" on public.suggestions for delete to authenticated using (user_id = (select auth.uid()) and status = 'recebida');
revoke insert, update on public.suggestions from anon, authenticated;
grant insert (title, body) on public.suggestions to authenticated;
create policy "own votes" on public.suggestion_votes for all to authenticated
  using (user_id = (select auth.uid())) with check (user_id = (select auth.uid()));
revoke update on public.suggestion_votes from anon, authenticated;
create index suggestions_votes on public.suggestions (votes desc, created_at desc);

create or replace function public.suggestion_limit() returns trigger
language plpgsql security definer set search_path = '' as $$
begin
  if (select count(*) from public.suggestions where user_id = new.user_id and created_at > now() - interval '1 day') >= 5 then
    raise exception 'limite de sugestões por dia' using errcode = 'P0001';
  end if;
  return new;
end $$;
create trigger suggestions_limit before insert on public.suggestions for each row execute function public.suggestion_limit();

create or replace function public.count_votes() returns trigger
language plpgsql security definer set search_path = '' as $$
begin
  update public.suggestions set votes = votes + case when tg_op = 'INSERT' then 1 else -1 end
  where id = coalesce(new.suggestion_id, old.suggestion_id);
  return null;
end $$;
create trigger suggestion_votes_count after insert or delete on public.suggestion_votes for each row execute function public.count_votes();
revoke execute on function public.suggestion_limit() from public, anon, authenticated;
revoke execute on function public.count_votes() from public, anon, authenticated;
```
UI (`components/Ideas.tsx`, vista `ideias`):
- separadores "Mais votadas", "Novas", "Feitas";
- cada ideia num `pane`: título, texto, @autor e avatar (`select('*, profiles(username, avatar)')`), botão de voto (chevron + número; muda a cor quando votado), chip de estado;
- quando há resposta do Rodrigo, um bloco "Resposta da NOOBjects";
- formulário "Partilha uma ideia" (título + texto, contador de caracteres);
- erro `P0001` → "Já partilhaste 5 ideias hoje. Obrigado! Volta amanhã.";
- abre a partir do Perfil, do rodapé ("Dar uma ideia") e do aviso da beta.
O Rodrigo gere as ideias no Supabase → Table Editor → `suggestions` (mudar `status` e escrever `reply`). Dizer-lhe isto no fim da fase.

## Fase 8: animações (sem custo de desempenho)
Só `transform` e `opacity`, só CSS, nenhuma biblioteca. A regra global `prefers-reduced-motion` (já existe) desliga tudo.
- Troca de vista: em `App.tsx`, `<div key={view} className="view-in">` à volta do conteúdo; `.view-in { animation: rise 0.28s cubic-bezier(0.2,0.9,0.3,1) both; }` (o `@keyframes rise` já existe).
- Nós da trilha: entrada em cascata com `style={{ "--i": i }}` e `animation-delay: calc(var(--i) * 40ms)`.
- Ilha: o item ativo com uma transição de cor e escala suave; o selo dá um pulso curto quando o número muda (`key={badge}`).
- Cartões (`Deck.tsx`): virar em 3D com `transform: rotateY` (confirmar o que já existe em `.face3`).
- Quiz: certo = "pop" de escala (1 → 1,04 → 1) e o mascote feliz; errado = abanar horizontal de 300 ms.
- XP ganho: um chip "+N XP" que sobe e desaparece junto às estatísticas do cabeçalho.
- Barra de progresso: `transition: width` já pode ser trocada por `transform: scaleX` com `transform-origin: left`.
- Ecrãs de Perfil, Explorar e Ideias: listas com a mesma cascata dos nós.
- Testar no telemóvel (DevTools com CPU 4x mais lenta): sem saltos visíveis.

---

## Ficheiros principais
- Alterados: `components/App.tsx`, `Account.tsx`, `LessonView.tsx`, `Island.tsx`, `ReminderToggle.tsx`, `LegalPage.tsx`, `lib/store.ts`, `lib/useSync.ts`, `lib/types.ts`, `lib/api.ts`, `lib/reminders.ts`, `lib/ai.ts`, `app/api/*/route.ts`, `app/layout.tsx`, `app/globals.css`, `app/privacidade/page.tsx`, `public/sw.js`, `next.config.ts`, `package.json`, `.env.example`, `ROADMAP.md`.
- Novos: `lib/config.ts`, `lib/admin.ts`, `lib/auth.ts`, `components/Onboarding.tsx`, `Settings.tsx`, `Explore.tsx`, `Ranking.tsx`, `Ideas.tsx`, `app/u/[username]/page.tsx`, `app/api/account/route.ts`, `app/api/cron/remind/route.ts`, `app/api/push/test/route.ts`, `scripts/seed-catalog.mjs`.
- Apagados: `lib/merge.ts`, `lib/merge.test.ts`, `components/MergeChoice.tsx`, `lib/sample.ts`.

## Verificação (em cada fase, e no fim)
| Verificar | Como | Esperado |
|---|---|---|
| Build e lint | `npm run build`, `npm run lint` | sem `error` |
| Segurança da base | `get_advisors` security | nenhum aviso novo além do das palavras-passe vazadas |
| Selo da ilha | ver a ilha com 2 e 12 cartões | número inteiro visível |
| Passos da lição | abrir uma lição em modo claro e escuro | cantos chanfrados, passo atual azul, nada branco |
| Login obrigatório | janela anónima em noobrain.vercel.app | só o ecrã de entrada, com chip Beta e temas do catálogo |
| Começar do zero | criar conta nova | 0 XP, 0 dias, sem trilhas, ecrã "Cria o teu perfil" |
| Perfil | escolher @nome repetido | "Esse nome já está ocupado" |
| Estatísticas | concluir uma lição | XP no Perfil e no ranking sobe |
| Batota | `update profiles set xp = 999` pelo navegador | recusado (sem permissão na coluna) |
| Catálogo | gerar o mesmo tema em duas contas | a 2.ª resposta vem instantânea; `ai_daily.n` só sobe uma vez |
| Cota | gerar 9 trilhas no mesmo dia | a 9.ª mostra a mensagem de limite |
| IA sem conta | `curl -X POST /api/trail` sem token | 401 |
| Push | ligar lembretes no Android e "Enviar aviso de teste" com o app fechado | o aviso chega |
| Push agendado | `select * from cron.job_run_details order by start_time desc limit 5` | `succeeded` de hora a hora |
| Sugestões | 6 ideias seguidas | a 6.ª dá a mensagem de limite; votar sobe e desce o número |
| Apagar conta | apagar uma conta de teste | as linhas em `profiles`, `progress` e `push_subscriptions` desaparecem |
| Tema | Definições → Escuro com o sistema em claro | fica escuro, sem flash ao recarregar |
| Animações | telemóvel com CPU 4x mais lenta e "reduzir movimento" | fluido; sem movimento quando reduzido |

## Dinheiro (ainda não entra neste plano; decidir depois da beta)
Ordem recomendada, da menos para a mais invasiva:
1. **Doações**: um link Ko-fi, Buy Me a Coffee ou GitHub Sponsors no "Sobre" e no aviso da beta ("Gostas do NOOBrain? Ajuda a mantê-lo gratuito"). Quase sem código e sem dados de pagamento no app.
2. **Plano "Apoiante"**: mais cota de IA por dia, avatares e cores extra, selo no perfil. O pagamento vai pelo Stripe Checkout (a página de pagamento é do Stripe; o app nunca vê cartões). Precisa de uma tabela com o estado da subscrição e de um webhook.
3. **Anúncios (AdSense)**: só como último recurso. Na UE obrigam a um banner de consentimento de cookies certificado, tornam o app menos acolhedor e rendem pouco com poucos utilizadores. Se um dia avançar: um único espaço discreto (por exemplo, no fim da página Explorar) e nunca dentro das lições.
Atenção: o plano Hobby da Vercel é só para uso não comercial. Anúncios e pagamentos obrigam a passar para o Vercel Pro (pago) ou a mudar de alojamento. As doações são zona cinzenta: confirmar nas regras da Vercel antes.

## Ideias que ficaram de fora (para o Rodrigo decidir depois)
Meta diária de XP, arquivar ou apagar trilhas, página 404 com o mascote, aviso de "sem ligação", e-mail de boas-vindas, conquistas, e enviar um push ao autor quando a sua ideia muda de estado.
