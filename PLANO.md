# Plano do NOOBrain (roteiro + beta)

Executar **uma fase de cada vez, por ordem**. No fim de cada fase:
1. `npm run build` e `npm run lint`;
2. commit em português e push na `main`;
3. confirmar no site;
4. marcar a fase como feita aqui.

As regras gerais estão no `CLAUDE.md`.

## Já feito
Identidade e mascote · tema → trilha com IA e fontes abertas · lição guiada com tutor · revisão espaçada com selo, contador e aviso · temas parecidos e cache · conta Supabase (Paris) com e-mail e Google, e-mails PT-PT · ilha de menu · responsivo · páginas de privacidade e termos · favicon, ícones, imagem de partilha, manifesto, robots e sitemap · Vercel ligada ao GitHub.

## Decisões tomadas pelo Rodrigo (não voltar a perguntar)
- Login obrigatório para tudo. Sem conta, só o ecrã de entrada, que mostra os temas disponíveis. Quem entra começa do zero.
- Social: perfis com @nome e ranking semanal. Sem seguir, sem feed, sem comentários.
- Sugestões: mural público com votos. O Rodrigo responde e muda o estado no painel do Supabase.
- Push com o app fechado: aprovado o pacote `web-push`.
- O "Sobre" diz que o app é feito quase 100% com IA e que as ideias, o design e as decisões são do Rodrigo (NOOBjects).
- Sempre dentro dos planos gratuitos. A única exceção é o Gemini (ver Fase A).

## Por decidir (Rodrigo)
1. **Idade mínima de 18 anos**, que os termos do Gemini exigem (Fase A). Aceitar, ou mudar de fornecedor de IA mais tarde.
2. **Ligar a faturação do Gemini** (Fase A). Obrigatório para utilizadores na UE; custo estimado de cêntimos por mês na beta.
3. Lista dos 8 temas iniciais (Fase 3.4).
4. Dinheiro e alojamento: ver a última secção. Nada a fazer até ao fim da beta.
5. Os pushes ainda **não publicam sozinhos**: a app da Vercel no GitHub precisa de acesso ao repositório `NOOBrain` (GitHub → NOOBjects → Settings → GitHub Apps → Vercel → Repository access).

## Regras de execução
- Textos novos em PT-PT, tratando por "tu".
- Migrações com `apply_migration` do Supabase (projeto `klrgitkxdhofsqwyisvn`), seguidas de `get_advisors` (security).
- Variáveis na Vercel e segredos no Vault: quem os põe é o Rodrigo. Diz-lhe o nome e onde; no computador, `.env.local` + o nome em `.env.example`.
- Next 16: ler `node_modules/next/dist/docs/` antes de usar `params`, metadata, headers ou scripts no layout.

---

## Fase A: conformidade e custos da IA (antes de tudo)
Os termos do Gemini (verificados a 04/10/2026, [ai.google.dev/gemini-api/terms](https://ai.google.dev/gemini-api/terms)) dizem:
- "You may use only Paid Services when making API Clients available to users in the European Economic Area, Switzerland, or the United Kingdom." **O plano gratuito não pode servir utilizadores em Portugal.**
- "You also will not use the Services as part of a website, application, or other service … that is directed towards or is likely to be accessed by individuals under the age of 18." **O app tem de ser só para maiores de 18.**
- A parte boa: no espaço europeu, o Google não usa os pedidos para treinar os modelos.

**Tarefas do Rodrigo:**
1. No Google AI Studio, ligar a faturação ao projeto da chave (passa a "Tier 1").
2. No Google Cloud → Billing → Budgets, criar um alerta de orçamento (por exemplo, 5 € por mês).
3. Anotar o RPM e o RPD que o AI Studio mostra em Rate limits.

**Custos** (preços oficiais, por milhão de tokens):
| Modelo | Entrada | Saída |
|---|---|---|
| `gemini-3.1-flash-lite` | $0,25 | $1,50 |
| `gemini-3.7-flash` e `gemini-3.8-flash` | $0,75 | $3,75 (duplicam a 1/1/2027) |

Com o flash-lite, uma lição custa cerca de **$0,003**: 1000 lições ≈ $3. O catálogo partilhado (Fase 3) reduz isto muito.

**Código:**
1. `lib/ai.ts`:
   - `MODELS` por omissão passa a `gemini-3.1-flash-lite`, com os reservas mais baratos disponíveis (confirmar na página de preços);
   - pôr o raciocínio ("thinking") no nível mais baixo que o modelo aceitar (ver `thinkingConfig` na documentação da API), porque os tokens de raciocínio contam como saída;
   - `AI_RPM` sai de uma variável com 80% do RPM do Tier 1.
2. Idade:
   - no registo por e-mail e no "Cria o teu perfil" (para quem entra pelo Google), caixa obrigatória "Confirmo que tenho 18 anos ou mais";
   - gravar em `profiles.adult boolean not null check (adult)`, a acrescentar à migração da Fase 2;
   - Termos: "O NOOBrain destina-se a maiores de 18 anos";
   - Privacidade: o Google (Gemini, termos pagos, sem treino) passa a constar como subcontratante.

## Fase 0: correções rápidas e beta visível
1. **Selo da ilha cortado**: o `.isl` tem `clip-path` (classe `ch`), que corta o `.badge` posicionado fora. Em `app/globals.css`, `.badge { top: 3px; right: 3px; }`. Testar com 1 e 2 dígitos.
2. **Passos Aprender/Memorizar/Testar**:
   - em `LessonView.tsx`, o botão passa a ter `` className={`stp ch…`} ``;
   - no CSS, `.stp.cur { background: var(--brand); color: var(--on-brand); }` e `.stp.cur .stp-n { background: var(--on-brand); color: var(--brand); }`;
   - procurar outras regras com `--c:` cujo elemento não tenha `ch`, `pane` ou `btn`, e corrigir da mesma forma.
3. **Beta sempre visível**:
   - criar `lib/config.ts` com `BETA = true` e `VERSION = "0.9"`;
   - no cabeçalho, chip `<span className="chip ch beta">Beta</span>`;
   - no rodapé (`LegalLinks`), "Versão beta · Dar uma ideia" (até à Fase 7, com `mailto:` para o contacto das páginas legais);
   - aviso mostrado uma vez por conta (`noobrain:beta-seen:<uid>`): "O NOOBrain está em beta. Algumas coisas podem falhar ou mudar. As tuas ideias ajudam a decidir o que vem a seguir.", com os botões "Começar" e "Dar uma ideia".
4. **Tudo em PT-PT**:
   - procurar `você|Você|seu |sua |Digite|Clique|Conclua|Espere|Tente|entenda|tela|usuário|celular|Revisar|revisar` em `components/`, `lib/` e `app/` e converter. "Revisar" passa a "Rever";
   - nos prompts (`lib/ai.ts`, `app/api/*`), "português de Portugal (europeu), Acordo Ortográfico de 1990";
   - mensagens de erro também em PT-PT.

## Fase 1: login obrigatório e começar do zero
- Apagar: `lib/merge.ts`, `lib/merge.test.ts` (e o script `check:merge`), `components/MergeChoice.tsx`, `lib/sample.ts` (o `ZIGZAG` passa para `TrailNode.tsx`).
- `lib/store.ts`:
  - `initial` sem trilhas (`trails: []`, `active: ""`);
  - o `parse` descarta trilhas `example`;
  - `activeTrail` passa a devolver `Trail | undefined`; corrigir quem o usa.
- `lib/types.ts`: tirar o campo `example`. `App.tsx`: tirar o chip "Exemplo".
- `App.tsx`:
  - `ready && !user` → só o ecrã de entrada: marca, Beta, `Account` e "Já há lições sobre:" (catálogo, Fase 3);
  - sem trilhas → "Escolhe o teu primeiro tema", com "Explorar temas" e "Criar um tema";
  - remover `MergeChoice` e `conflict`.
- `useSync.ts`:
  - ao entrar: `remote ? remote : (getOwner() === uid ? local : initial)`;
  - remover `conflict`, `resolve`, `isBlank` e `merge`;
  - `signOut()` sem argumento: sai, faz `replace(initial)` e limpa o dono.
- `Account.tsx`: remover o diálogo "Manter o progresso neste aparelho?". O progresso já vive na nuvem; "Terminar sessão" sai logo.

## Fase 2: perfil, @nome, definições e sobre
### Migração `perfis`
```sql
create table public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  username text not null unique
    check (username ~ '^[a-z0-9_]{3,20}$')
    check (username not in ('admin','noobrain','noobjects','suporte','support','root','moderador','oficial','sistema')),
  display_name text not null default '' check (char_length(display_name) <= 40),
  avatar smallint not null default 0 check (avatar between 0 and 5),
  bio text not null default '' check (char_length(bio) <= 160),
  adult boolean not null check (adult),
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
revoke insert, update on public.profiles from anon, authenticated;
grant insert (id, username, display_name, avatar, bio, adult, in_ranking) on public.profiles to authenticated;
grant update (username, display_name, avatar, bio, in_ranking) on public.profiles to authenticated;
create index profiles_week on public.profiles (week_start, week_xp desc) where in_ranking;

alter table public.progress add constraint progress_size check (pg_column_size(data) <= 1000000);

create or replace function public.sync_profile_stats() returns trigger
language plpgsql security definer set search_path = '' as $$
declare
  num_xp int := case when jsonb_typeof(new.data->'xp') = 'number' then least((new.data->>'xp')::numeric, 10000000)::int else 0 end;
  num_streak int := case when jsonb_typeof(new.data->'streak') = 'number' then least((new.data->>'streak')::numeric, 100000)::int else 0 end;
  old_xp int := case when tg_op = 'UPDATE' and jsonb_typeof(old.data->'xp') = 'number' then (old.data->>'xp')::numeric::int else 0 end;
  gain int := least(greatest(num_xp - old_xp, 0), 1000); -- ponytail: teto contra batota simples; validar no servidor se o ranking ganhar peso
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
### Interface
- **`Onboarding.tsx`** (aparece com `user && !profile`; `useSync` expõe `profile` e `reloadProfile()`):
  - @nome com verificação de disponibilidade 400 ms depois de parar de escrever (`select('id', { count: 'exact', head: true })`), com sugestão a partir do `full_name` ou do e-mail;
  - nome a mostrar;
  - avatar: o mascote com fundo `--brand`, `--brand-deep`, `--sun`, `--ink`, `--ink-3` ou `--brand-soft`;
  - caixa dos 18 anos;
  - erro `23505` → "Esse nome já está ocupado".
- **Perfil** (substitui "Sessão iniciada"):
  - topo: avatar, nome, @nome, "Membro desde";
  - estatísticas: XP, sequência, temas concluídos, cartões dominados (`box >= 4`), XP da semana;
  - ações em coluna, todas `btn block` com a mesma largura: Editar perfil, Partilhar perfil (copia `/u/<nome>`), Ranking, Ideias;
  - engrenagem → Definições.
  - Ilha: Trilha, Lição, Explorar, Rever, Perfil.
- **`Settings.tsx`** (vista `definicoes`):
  1. Aparência: Automático / Claro / Escuro, guardado em `localStorage["noobrain:theme"]` e aplicado com `html[data-theme]`.
     - CSS: o bloco escuro da media query passa a `:root:not([data-theme="light"])`; copiar os mesmos tokens para `:root[data-theme="dark"]`.
     - No `<head>` do layout, script inline `try{var t=localStorage.getItem("noobrain:theme");if(t==="light"||t==="dark")document.documentElement.dataset.theme=t}catch(e){}` e `suppressHydrationWarning` no `<html>`.
  2. Lembretes (Fase 5).
  3. Conta: e-mail, alterar palavra-passe (mover de `Account.tsx`), terminar sessão.
  4. Dados: descarregar JSON; "Recomeçar do zero" (escrever RECOMEÇAR); "Apagar conta" (escrever o @nome → `DELETE /api/account`).
  5. Sobre:
     - versão beta, o que é, fontes (wikis, CC BY-SA), Termos, Privacidade, contacto;
     - texto: "O NOOBrain é feito quase 100% com inteligência artificial: o código foi escrito por modelos de IA. As ideias, o design, as decisões e o cuidado com cada detalhe são do Rodrigo, da NOOBjects.";
     - mais tarde, o link de doação.
- **Privacidade**: acrescentar perfil público, ranking (com opção de sair), sugestões públicas, subscrições de push e contadores de IA (guardados 30 dias).

## Fase 3: catálogo partilhado e lições já criadas
Cada trilha ou lição gerada fica guardada uma vez e serve a toda a gente. É o que mais poupa na IA.
```sql
create table public.catalog_trails (
  key text not null, level text not null,
  topic text not null check (char_length(topic) <= 60),
  concepts jsonb not null, sources jsonb not null default '[]',
  uses int not null default 0, created_at timestamptz not null default now(),
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
create or replace function public.bump_catalog_use(p_key text, p_level text) returns void
language sql security definer set search_path = '' as $$
  update public.catalog_trails set uses = uses + 1 where key = p_key and level = p_level;
$$;
revoke execute on function public.bump_catalog_use(text, text) from public, anon;
grant execute on function public.bump_catalog_use(text, text) to authenticated;
```
- **Rodrigo**: pôr `SUPABASE_SECRET_KEY` (Supabase → Project Settings → API Keys → Secret) na Vercel, em Production e Preview.
- `lib/admin.ts`: `createClient(url, SUPABASE_SECRET_KEY, { auth: { persistSession: false, autoRefreshToken: false } })`, ou `null` sem a chave. Só usar em `app/api`.
- Rotas `trail` e `lesson`:
  - procurar primeiro no catálogo, pela chave `(topicKey(topic), level)` ou `(…, topicKey(title))` (a mesma composição do `cacheKey` atual);
  - depois de gerar, fazer `upsert`;
  - erros do catálogo nunca bloqueiam: seguir para a IA.
- `Explore.tsx`:
  - lista do catálogo (colunas necessárias, `uses desc`, limite de 60), com pesquisa local;
  - "Começar" copia a trilha para o estado (id novo, `done: 0`) e chama `bump_catalog_use`;
  - o ecrã de entrada mostra os 8 temas mais usados.
- **Semente**: `scripts/seed-catalog.mjs`.
  - Com `npm run dev` a correr, chama `/api/trail` e `/api/lesson` com o cabeçalho `x-seed-token` (= `SEED_TOKEN`, só em `.env.local`, nunca na Vercel), com 7 s entre pedidos.
  - Temas: Fotossíntese, Sistema Solar, Fernando Pessoa, Revolução dos Cravos, Inteligência Artificial, Finanças pessoais, Primeiros socorros, Teoria das cores.

## Fase 4: segurança, desempenho e IA
1. **IA só com conta**:
   - `lib/api.ts` envia `authorization: Bearer <access_token>`;
   - `lib/auth.ts` → `userFrom(request)` com `admin.auth.getUser(token)`;
   - `trail`, `lesson`, `tutor` e `report` respondem 401 sem utilizador (exceto com `SEED_TOKEN` local).
2. **Cotas diárias**:
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
   - Chamar só quando o pedido vai mesmo à IA.
   - Limites em `lib/config.ts`: trilha 8, lição 40, tutor 60 por dia.
   - Global: `AI_DAILY_MAX` na Vercel. Com o Tier 1 pago, é isto que limita a fatura (por exemplo, 1500 ≈ $4,5 por dia no pior caso).
   - Mensagens: "Chegaste ao limite de hoje. Amanhã há mais." e "A IA do NOOBrain esgotou por hoje. Volta amanhã."
3. **Relatórios de erro**: `alter table public.reports add column user_id uuid references auth.users(id) on delete set null; drop policy "anyone can report" on public.reports;`. A rota grava com `admin` e o `user_id`.
4. **Apagar conta**: `DELETE /api/account` → `admin.auth.admin.deleteUser(uid)`. Tudo apaga em cascata.
5. **Cabeçalhos** em `next.config.ts`: `X-Content-Type-Options: nosniff`, `Referrer-Policy: strict-origin-when-cross-origin`, `X-Frame-Options: DENY`, `Permissions-Policy: camera=(), microphone=(), geolocation=()`.
6. **Desempenho**: manter a espera de 1,5 s na sincronização; consultas com colunas e `limit`; nenhuma biblioteca além do `web-push`.
7. **Painel (Rodrigo)**:
   - Auth → Rate Limits: o Gmail envia ~500 e-mails por dia; se crescer, passar para o Resend;
   - URL Configuration: Site URL `https://noobrain.vercel.app`, Redirect `http://localhost:3000`;
   - proteção de palavras-passe vazadas, se o plano gratuito deixar;
   - o Supabase gratuito pausa projetos após 7 dias sem atividade.

Limites gratuitos de referência:
- Supabase: 500 MB de base, 5 GB de tráfego, 50 000 utilizadores ativos por mês, 500 000 invocações.
- Vercel Hobby: 1 milhão de invocações, 4 h de CPU ativa e 100 GB de transferência por mês.

## Fase 5: notificações no telemóvel
1. `npm install web-push`; gerar as chaves com `npx web-push generate-vapid-keys`.
   - **Rodrigo** põe na Vercel: `NEXT_PUBLIC_VAPID_PUBLIC_KEY`, `VAPID_PRIVATE_KEY`, `VAPID_SUBJECT=mailto:dev.noobjects@gmail.com` e `CRON_SECRET`.
2. Migração:
```sql
create table public.push_subscriptions (
  endpoint text primary key check (char_length(endpoint) <= 1000),
  user_id uuid not null references auth.users(id) on delete cascade,
  p256dh text not null check (char_length(p256dh) <= 200),
  auth text not null check (char_length(auth) <= 100),
  tz text not null default 'Europe/Lisbon' check (char_length(tz) <= 60),
  last_sent_at timestamptz, created_at timestamptz not null default now()
);
alter table public.push_subscriptions enable row level security;
create policy "own subs" on public.push_subscriptions for all to authenticated
  using (user_id = (select auth.uid())) with check (user_id = (select auth.uid()));
create index push_subscriptions_user on public.push_subscriptions (user_id);
```
3. `lib/reminders.ts`:
   - `enable()`: permissão → `register('/sw.js')` → `pushManager.subscribe({ userVisibleOnly: true, applicationServerKey })` → `upsert` com o `tz`;
   - `disable()`: `unsubscribe()` e apagar a linha; chamar também ao terminar sessão;
   - manter `notifyDue` como reserva.
4. `public/sw.js`:
   - evento `push` → `showNotification(d.title, { body, icon: "/icon-192.png", badge: "/icon-192.png", tag, data: { url } })`;
   - o clique abre `data.url`.
5. iPhone sem o app instalado (`!matchMedia('(display-mode: standalone)').matches`): "No iPhone, os avisos só funcionam com o NOOBrain no ecrã principal: Partilhar → Adicionar ao ecrã principal."
6. `app/api/cron/remind/route.ts` (`maxDuration = 60`, exige `Bearer CRON_SECRET`):
   - lê as subscrições e o `progress.data` (até 500);
   - envia entre as 9h e as 21h locais, com `last_sent_at` de há mais de 20 h;
   - texto: "Tens N cartões para rever" (`dueCards` de `lib/store.ts`) ou, a partir das 19h, "A tua sequência de N dias acaba hoje";
   - respostas 404/410 → apagar a subscrição.
7. `POST /api/push/test` + botão "Enviar aviso de teste" nas Definições.
8. Agendamento gratuito no Supabase. O agente ativa as extensões; **o Rodrigo corre a linha do Vault**:
```sql
create extension if not exists pg_cron;
create extension if not exists pg_net;
-- RODRIGO: select vault.create_secret('<o mesmo CRON_SECRET da Vercel>', 'cron_secret');
select cron.schedule('noobrain-lembretes', '0 * * * *', $$
  select net.http_post(url := 'https://noobrain.vercel.app/api/cron/remind',
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
- **`Ranking.tsx`**:
  - `profiles` com `username, display_name, avatar, week_xp`, onde `week_start` = segunda-feira de Lisboa e `in_ranking`, por `week_xp desc`, limite de 50;
  - a minha posição = quantos têm mais XP;
  - "Recomeça às segundas" (o gatilho da Fase 2 já reinicia o `week_xp`);
  - nas Definições, interruptor "Aparecer no ranking".
- **`app/u/[username]/page.tsx`** (servidor):
  - lê o perfil com a chave pública;
  - `notFound()` se não existir;
  - `generateMetadata` com `@nome · NOOBrain`;
  - botão "Aprender no NOOBrain";
  - `params` é uma Promise no Next 16.

## Fase 7: mural de sugestões
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
`Ideas.tsx` (vista `ideias`):
- separadores Mais votadas / Novas / Feitas;
- cada ideia: título, texto, @autor e avatar (`select('*, profiles(username, avatar)')`), voto (chevron + número), chip de estado e bloco "Resposta da NOOBjects";
- formulário com contador de caracteres;
- erro `P0001` → "Já partilhaste 5 ideias hoje. Obrigado! Volta amanhã.";
- abre a partir do Perfil, do rodapé e do aviso da beta.
O Rodrigo gere as ideias no Table Editor → `suggestions` (campos `status` e `reply`).

## Fase 8: animações sem custo de desempenho
Só CSS, só `transform` e `opacity`. A regra `prefers-reduced-motion` existente desliga tudo.
- Troca de vista: `<div key={view} className="view-in">` com `animation: rise .28s` (o `@keyframes rise` já existe).
- Nós da trilha e listas (Explorar, Ideias, Ranking) em cascata: `--i` e `animation-delay: calc(var(--i) * 40ms)`.
- Ilha: transição do item ativo; o selo pulsa quando o número muda.
- Cartões a virar em 3D (`rotateY`; ver o `.face3` existente).
- Quiz: certo = pop de escala + mascote feliz; errado = abanar 300 ms.
- Chip "+N XP" que sobe junto às estatísticas.
- Barra de progresso com `transform: scaleX`.
- Testar no telemóvel com a CPU 4x mais lenta.

## Verificação
| Verificar | Esperado |
|---|---|
| build e lint | sem `error` |
| `get_advisors` security | nada novo (além das palavras-passe vazadas) |
| ilha com 2 e 12 cartões | número inteiro visível |
| lição em claro e escuro | cantos chanfrados, passo atual azul |
| janela anónima no site | só o ecrã de entrada, com Beta e temas |
| conta nova | 0 XP, sem trilhas, "Cria o teu perfil" com a caixa dos 18 anos |
| @nome repetido | "Esse nome já está ocupado" |
| `update profiles set xp = 999` pelo navegador | recusado |
| mesmo tema em duas contas | a 2.ª é instantânea; `ai_daily.n` sobe uma vez |
| 9 trilhas num dia | a 9.ª mostra o limite |
| `curl -X POST /api/trail` sem token | 401 |
| aviso de teste no Android com o app fechado | chega |
| `cron.job_run_details` | `succeeded` de hora a hora |
| 6 ideias seguidas | a 6.ª dá o limite; o voto sobe e desce |
| apagar conta de teste | as linhas desaparecem em todas as tabelas |
| tema Escuro com o sistema em claro | escuro, sem flash |
| CPU 4x mais lenta e "reduzir movimento" | fluido; parado quando reduzido |

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

**Recomendação:**
1. Na beta, Ko-fi no "Sobre" e no aviso da beta (permitido no Hobby, custo zero).
2. Com utilizadores fiéis, plano Apoiante via Paddle + Vercel Pro ($20 por mês).
3. Anúncios só se nada mais resultar.

## Ideias para depois
Meta diária de XP · arquivar ou apagar trilhas · página 404 com o mascote · aviso "sem ligação" e modo offline · e-mail de boas-vindas · conquistas · push ao autor quando a sua ideia muda de estado · mais fontes (Gemini com Google Search: 5000 pesquisas grátis por mês no pago; Open Library) · painel dos erros reportados · mapa de conceitos · e-mails pelo Resend.
