# Plano do NOOBrain (roteiro + beta)

Executar **uma fase de cada vez, por ordem**. No fim de cada fase:
1. `npm run build` e `npm run lint`;
2. commit em português e push na `main`;
3. confirmar no site;
4. marcar a fase como feita aqui.

As regras gerais estão no `CLAUDE.md`.

## Já feito
Identidade e mascote · tema → trilha com IA e fontes abertas · lição guiada com tutor · revisão espaçada com selo, contador e aviso · temas parecidos e cache · conta Supabase (Paris) com e-mail e Google, e-mails PT-PT · ilha de menu · responsivo · páginas de privacidade e termos · favicon, ícones, imagem de partilha, manifesto, robots e sitemap · ícone do projeto na Vercel · README com visual · funções confirmadas em Paris (`cdg1`).

## Registo de alterações (changelog)
Regra: de cada vez que algo muda, acrescentar uma linha no topo, com a data e o que mudou para quem usa. A ideia de mostrar isto dentro do app ("Novidades") está em "Ideias para depois".

**2026-10-04** (um dia de trabalho, versão beta 0.9)
- Página inicial mais rápida: o captcha só carrega quando começas a escrever no formulário. Lighthouse (telemóvel) numa página de tema: desempenho 99, acessibilidade 100, boas práticas 100, SEO 100. O Google já não mostra destaque para "Course" (descontinuado em 2025): é normal o teste de resultados ricos não mostrar nada.
- Perfil no telemóvel: o conteúdo já não sai do ecrã e o avatar volta a mostrar o mascote.
- Telemóvel: o menu de baixo (ilha) cortava o botão Perfil com 6 abas; agora os botões repartem a largura (só ícones em ecrãs estreitos).
- Ideias: lista corrigida, aba "Ideias" na ilha; apagar trilha (com confirmação); botão "Terminar sessão" no Perfil.
- Criação de temas: pede mais contexto quando o tema é ambíguo (ex.: só "Fernando"). Emblema "Feito com IA · NOOBjects".
- Fase 8: animações leves. Fase 7: mural de ideias com votos. Fase 6: ranking semanal e perfil público.
- Fase 5: avisos push com o app fechado (testado no computador). Fase 4: IA só com conta, cotas diárias, cabeçalhos de segurança.
- Fases 3 e 3B: catálogo partilhado (9 temas, 72 lições), Explorar, landing e páginas de tema para o Google.
- Fase 2: perfil com @nome e avatar, definições (tema claro/escuro, dados, apagar conta). Fase 1: login obrigatório, começar do zero.
- Fase 0: selo Beta, aviso da beta, textos em PT-PT. Fase A: IA passa do Gemini para o Groq gratuito; idade mínima 13 anos; captcha.

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
1. ~~Conta no Groq~~: **feita**. A chave já está em `AI_API_KEY` na Vercel. Falta:
   - o Rodrigo pôr a mesma chave no `.env.local` (trocar a linha `AI_API_KEY=`), para testar no computador;
   - apagar a chave antiga do Gemini no Google AI Studio.
2. ~~Publicação automática~~: **resolvido** (cada push na `main` publica sozinho).
3. **Ko-fi**: criar a conta e dar o link. Entra no "Sobre" e no aviso da beta (Fase 2), em `lib/config.ts` → `KOFI_URL`.
4. **SEO**: a etiqueta do Search Console já está no site (`app/layout.tsx`, `verification`). Validado e `sitemap.xml` enviado. O "Não foi possível obter" no 1.º dia é normal; o Google tenta de novo. Se continuar após 2 dias, reenviar.
5. Dinheiro e alojamento além das doações: ver a última secção. Nada a fazer até ao fim da beta.

## Regras de execução
- Textos novos em PT-PT, tratando por "tu".
- Migrações com `apply_migration` do Supabase (projeto `klrgitkxdhofsqwyisvn`), seguidas de `get_advisors` (security).
- Variáveis na Vercel e segredos no Vault: quem os põe é o Rodrigo. Diz-lhe o nome e onde; no computador, `.env.local` + o nome em `.env.example`.
- Next 16: ler `node_modules/next/dist/docs/` antes de usar `params`, metadata, headers ou scripts no layout.

---

## Fase A: IA gratuita com o Groq — FEITA (04/10/2026)
Notas: a caixa dos 13 anos está só no registo por e-mail e fica em `user_metadata.age_ok`; passar para `profiles.age_ok` e pô-la também no "Cria o teu perfil" (cobre o Google) na Fase 2. O corte das fontes já estava em 4500 caracteres (cabe nos 8000 tokens/min). Prompts já em PT-PT.
**Porque mudar.** Os termos do Gemini (verificados a 04/10/2026) proíbem o plano gratuito para utilizadores na UE e proíbem apps acessíveis a menores de 18. O **Groq** ([termos](https://console.groq.com/docs/legal/services-agreement)) tem:
- plano gratuito sem proibição de produção;
- "Groq is not permitted to use Inputs or Outputs for training";
- apps usados por menores são permitidos, desde que o cliente cumpra a lei (para nós, o RGPD);
- clientes europeus contratam com a Groq UK.

DeepSeek e Mistral foram descartados:
- DeepSeek: não é gratuito e guarda os dados na China (problemas de RGPD);
- Mistral: o gratuito é só para protótipos e treina com os dados por omissão.

**Modelos e limites gratuitos** ([fonte](https://console.groq.com/docs/rate-limits)). Cada modelo tem o seu limite: 30 pedidos/min, 1000/dia, 8000 tokens/min e 200 000 tokens/dia.
- Cadeia: `openai/gpt-oss-120b` → `qwen/qwen3.8-27b` → `openai/gpt-oss-20b`. Os três garantem JSON válido (`strict: true`).
- Capacidade total: ~600 000 tokens/dia ≈ **130 lições novas por dia**, mais o tutor. O catálogo partilhado (Fase 3) faz com que cada lição só seja gerada uma vez.
- `ponytail:` se a beta crescer além disto, acrescentar um 2.º fornecedor gratuito como reserva (Cloudflare Workers AI, 10 000 "neurons"/dia) em `lib/ai.ts`.

**Código** (só `lib/ai.ts` e os esquemas nas rotas):
1. `lib/ai.ts`:
   - `POST https://api.groq.com/openai/v1/chat/completions` com `authorization: Bearer ${AI_API_KEY}`;
   - corpo: `{ model, messages: [{ role: "system", content: REGRAS }, { role: "user", content: prompt }], temperature: 0.4, reasoning_effort: "low", response_format: { type: "json_schema", json_schema: { name: "resposta", strict: true, schema } } }`;
   - ler `choices[0].message.content` e fazer `JSON.parse`;
   - 429 ou 5xx → passar ao modelo seguinte; todos esgotados → `AiError("limite")`;
   - `MODELS` vem de `AI_MODEL` (por omissão, a cadeia acima);
   - a fila interna passa a 25 por minuto (`AI_RPM`).
2. Esquemas nas rotas `trail`, `lesson` e `tutor`: converter do formato Gemini (`"OBJECT"`, `"STRING"`) para JSON Schema (`"object"`, `"string"`). Com `strict`, todas as propriedades vão em `required` e cada objeto leva `additionalProperties: false`.
3. Cortar o texto das fontes a ~6000 caracteres (`lib/sources.ts`), para caber nos 8000 tokens por minuto.
4. `REGRAS` (mensagem de sistema, PT-PT): "És o tutor do NOOBrain, um app de aprendizagem usado também por adolescentes. Responde só sobre o tema de estudo, com linguagem adequada a todas as idades. Recusa com gentileza conteúdo sexual, violento, perigoso ou de ódio e volta ao tema. Nunca peças dados pessoais."
5. Atualizar `.env.example`, a Privacidade e o `CLAUDE.md`. Na Privacidade: o Groq é subcontratante, os dados são processados nos EUA e no Reino Unido e não são usados para treino.
6. **Idade de 13 anos**:
   - no registo por e-mail e no "Cria o teu perfil", caixa obrigatória "Confirmo que tenho 13 anos ou mais";
   - gravar em `profiles.age_ok`;
   - Termos: "Para usar o NOOBrain precisas de ter pelo menos 13 anos".
7. Teste: gerar 1 trilha e 1 lição no `npm run dev` e confirmar que vêm em PT-PT e com o formato certo.

## Fase 0: correções rápidas e beta visível — FEITA (04/10/2026)
Notas: o valor interno do nível "Intermediário" não mudou (está nas trilhas guardadas e nas rotas); o comentário e os prompts internos ainda têm algum português do Brasil, sem efeito para a pessoa. A caixa de ideias é um `mailto:` até à Fase 7.
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

## Fase 1: login obrigatório e começar do zero — FEITA (04/10/2026)
Notas: falta só o "Já há lições sobre:" no ecrã de entrada e o botão "Explorar temas" (dependem do catálogo, Fase 3). No `useSync`, a nuvem manda, mas fica o progresso do navegador se já for da mesma conta e mais recente (evita perder o último 1,5 s).
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

## Fase 2: perfil, @nome, definições e sobre — FEITA (04/10/2026)
Notas: migração `perfis` aplicada (segurança sem avisos novos). Ficam para as suas fases: botões Partilhar perfil / Ranking / Ideias, o interruptor "Aparecer no ranking", "Explorar" na ilha, e na Privacidade o ranking, as sugestões, o push e os contadores de IA. "Apagar conta" (`DELETE /api/account`, `lib/admin.ts`, `lib/auth.ts`) já está feito aqui; falta só o resto da Fase 4. O Ko-fi é o texto "Fundraising em breve" no Sobre e no aviso da beta.
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
  age_ok boolean not null check (age_ok),
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
grant insert (id, username, display_name, avatar, bio, age_ok, in_ranking) on public.profiles to authenticated;
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
  - caixa dos 13 anos;
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

## Fase 3: catálogo partilhado e lições já criadas — FEITA (04/10/2026), falta correr a semente (Rodrigo)
Notas: migração `catalogo` aplicada. Para encher o catálogo com os 9 temas: pôr `SUPABASE_SECRET_KEY` e `SEED_TOKEN` (texto aleatório) no `.env.local`, reiniciar `npm run dev` e correr `npm run seed:catalog` (~30 min, 20 s entre pedidos). Entretanto o catálogo enche-se sozinho com o uso.
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
  - Temas: Fotossíntese, Sistema Solar, Fernando Pessoa, **Inglês para iniciantes**, Revolução dos Cravos, Inteligência Artificial, Finanças pessoais, Primeiros socorros, Teoria das cores. Para o Inglês, o prompt pede conceitos práticos (cumprimentos, verbo *to be*, números, frases do dia a dia) e cartões "inglês → português".

## Fase 3B: SEO (aparecer no Google) — FEITA (04/10/2026), faltam o Lighthouse e o teste de resultados ricos
Notas: página inicial e `/temas/[slug]` geradas no servidor (renovam todos os dias), JSON-LD, imagem de partilha por tema, sitemap com os temas do catálogo. `CatalogChips.tsx` passou a ser a lista de ligações da landing. Os perfis públicos ficam na Fase 6. O Rodrigo pode reenviar o `sitemap.xml` ao Search Console e ao Bing quando houver mais temas.
Com o login obrigatório, o Google não vê nada do que está dentro do app. Por isso, o SEO precisa de **páginas públicas** com conteúdo real, geradas no servidor.
1. **Página inicial pública** (`app/page.tsx`, sem sessão):
   - o ecrã de entrada da Fase 1 passa a ser uma landing de verdade, gerada no servidor;
   - `h1` "Aprende qualquer tema, um conceito de cada vez", 3 blocos (trilha, lição guiada, revisão espaçada), temas populares com links para `/temas/...` e o login;
   - o app (componente cliente) só carrega quando há sessão.
2. **Páginas de tema** `app/temas/[slug]/page.tsx`:
   - uma por trilha do catálogo (`slug` = `key`), com `generateStaticParams` + revalidação diária (ver o guia de cache do Next 16);
   - mostram o título, o nível, a lista de conceitos com os resumos, as fontes e o botão "Começar esta trilha" (leva ao login e, depois, abre a trilha);
   - `generateMetadata`: título "Aprender <tema> passo a passo · NOOBrain" e descrição com os 2 primeiros conceitos;
   - JSON-LD `Course` (nome, descrição, `provider` NOOBjects, `inLanguage: "pt-PT"`, `isAccessibleForFree: true`);
   - imagem de partilha por tema com `ImageResponse` (`opengraph-image.tsx` na pasta da rota).
3. **Perfis públicos** (`/u/[username]`, Fase 6): indexáveis só se `in_ranking`; senão, `robots: { index: false }`.
4. **`app/sitemap.ts`** passa a listar `/`, as páginas legais e todos os `/temas/[slug]` (lidos do catálogo com a chave pública).
5. **`app/layout.tsx`**:
   - JSON-LD `WebApplication` (nome, URL, categoria `EducationalApplication`, `offers` grátis);
   - a verificação do Google já está feita (`verification.google`): não apagar.
6. **Rodrigo**:
   - Search Console: depois de validado, enviar `sitemap.xml` em Sitemaps;
   - o mesmo no Bing Webmaster Tools (importa do Google num clique).
7. **Domínio**: fica `noobrain.vercel.app` (decisão do Rodrigo: sem custos). Todos os URLs absolutos saem de uma constante `SITE_URL` em `lib/config.ts`, para mudar num só sítio se um dia houver domínio.
8. Verificar: Lighthouse (SEO e desempenho ≥ 90 no telemóvel) e o [teste de resultados ricos](https://search.google.com/test/rich-results) numa página de tema.

## Fase 4: segurança, desempenho e IA — FEITA (04/10/2026), falta o painel (Rodrigo; a proteção de palavras-passe vazadas não está disponível no plano atual do Supabase, ignorar o aviso)
Notas: IA só com conta (401 sem sessão), cotas diárias (limites em `lib/quota.ts`, global por `AI_DAILY_MAX`), relatórios só com sessão, cabeçalhos de segurança, apagar conta já na Fase 2. Sem `SUPABASE_SECRET_KEY` no `.env.local`, a IA local responde 401: acrescentar a chave.
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
   - Limites em `lib/config.ts`: trilha 5, lição 25, tutor 40 por dia.
   - Global: `AI_DAILY_MAX` (por omissão 2500 pedidos/dia, abaixo dos 3000 que somam os três modelos gratuitos).
   - Mensagens: "Chegaste ao limite de hoje. Amanhã há mais." e "A IA gratuita do NOOBrain esgotou por hoje. Volta amanhã."
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

## Fase 5: notificações no telemóvel — FEITA no código (04/10/2026), faltam as variáveis e o Vault (Rodrigo)
Notas: migração `push_subscriptions`, `pg_cron` e `pg_net` ativos, tarefas `noobrain-lembretes` (de hora a hora) e `noobrain-limpeza` agendadas. As chaves VAPID e o CRON_SECRET foram geradas para o `.env.local` (copiar para a Vercel). Enquanto o Vault não tiver o `cron_secret`, a tarefa horária falha sem efeito.
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

## Fase 6: ranking e perfil público — FEITA (04/10/2026)
Notas: o ranking só mostra quem tem XP na semana (`week_xp > 0`); o botão Ideias do Perfil chega com a Fase 7.
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

## Fase 7: mural de sugestões — FEITA (04/10/2026)
Notas: o Rodrigo gere as ideias no Table Editor → `suggestions` (campos `status` e `reply`). O `pg_net` foi movido para o schema `extensions` (aviso do linter).
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

## Fase 8: animações sem custo de desempenho — FEITA (04/10/2026), falta testar no telemóvel com CPU lenta (Rodrigo)
Notas: troca de vista, nós da trilha, selo da ilha, pop e abanão no teste, barras com `scaleX` e chip "+N XP". Os cartões já viravam em 3D.
Só CSS, só `transform` e `opacity`. A regra `prefers-reduced-motion` existente desliga tudo.
- Troca de vista: `<div key={view} className="view-in">` com `animation: rise .28s` (o `@keyframes rise` já existe).
- Nós da trilha e listas (Explorar, Ideias, Ranking) em cascata: `--i` e `animation-delay: calc(var(--i) * 40ms)`.
- Ilha: transição do item ativo; o selo pulsa quando o número muda.
- Cartões a virar em 3D (`rotateY`; ver o `.face3` existente).
- Quiz: certo = pop de escala + mascote feliz; errado = abanar 300 ms.
- Chip "+N XP" que sobe junto às estatísticas.
- Barra de progresso com `transform: scaleX`.
- Testar no telemóvel com a CPU 4x mais lenta.

## Notas de pesquisa: didática (ensinar DE FACTO) — só ideias, NÃO é uma fase; o planeamento é do Opus
Pesquisa feita a 04/10/2026. Cada ponto abaixo tem a fonte; o que não tem fonte é hipótese minha e está marcado.

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

### Onde o app está hoje (o que já está bem e o que falta)
- Bem: passos pequenos (explicação curta → cartões → teste), feedback com explicação, revisão espaçada por caixas (1, 3, 7, 16, 35 dias), tutor.
- Falta: a lição **começa por ler** (passivo); o teste é só escolha múltipla (reconhecer, não recordar); **errar não obriga a corrigir** e o conceito abre com qualquer nota; as perguntas do teste **não entram na revisão**; a revisão não mistura temas; não há modelos que se "apagam" aos poucos; não há imagens; para línguas, nada de áudio nem fala.

### Ideias de mudança (sugestão de ordem de impacto; por planear)
1. **Domínio antes de avançar** (`LessonView.tsx`, `Quiz.tsx`): o conceito só conta como concluído com ≥ 2 de 3 certas; as erradas voltam no fim da ronda até acertar (corrigir antes de seguir). Mantém o XP menor se repetir.
2. **Recordar primeiro** (`LessonView.tsx`, `lib/ai.ts`): antes da explicação, 1 pergunta de pré-teste ("o que achas que é...?", sem nota, só para ativar o que já sabes), depois a explicação, depois os cartões. Hipótese minha, apoiada em "gerar" e "ativar conhecimento prévio"; medir se as notas sobem.
3. **Perguntas na revisão** (`lib/store.ts`, `ReviewView.tsx`): as perguntas do teste que a pessoa errou entram na fila de revisão espaçada, ao lado dos cartões.
4. **Intercalar** (`ReviewView.tsx`): misturar temas e conceitos na mesma sessão de revisão, em vez de por trilha.
5. **Outros tipos de pergunta** (`lib/ai.ts`, `Quiz.tsx`): completar a frase (cloze), ordenar passos e resposta curta escrita, avaliada pela IA com feedback ao nível do processo ("o que faltou e porquê"), sem elogios vazios.
6. **Exemplos que se apagam** (`lib/ai.ts`): 1.º conceito da trilha com exemplo resolvido completo, depois exemplos com um passo em falta, depois só o problema.
7. **Imagens e esquemas** (`Mascot`/novo `Figure.tsx`): quando o conceito é visual, um esquema simples gerado em SVG, sem texto repetido por baixo (coerência e redundância de Mayer).
8. **Línguas, voz** (novo `lib/speech.ts`): ouvir com `speechSynthesis` do navegador (gratuito, sem chave) em cartões e frases; exercício "ouve e escolhe"; depois "repete a frase" com `SpeechRecognition` onde o navegador suportar (Chrome/Edge). Frases inteiras em contexto, não só palavras soltas. Para falar a sério, uma conversa guiada com o tutor (hipótese minha, depende da cota da IA).
9. **Nível certo** (`lib/ai.ts`): um mini-teste de diagnóstico ao criar o tema para escolher entre Iniciante e Intermédio e manter a taxa de sucesso perto de 80% (Rosenshine, "alta taxa de sucesso").
10. **Medir de verdade:** guardar por conceito as notas do 1.º teste e as da revisão aos 7 dias; olhar para elas antes e depois de cada mudança. Sem isto não se sabe se ensina.

### Limites desta pesquisa
Os resumos vêm de artigos e sínteses, não li os livros completos (Make It Stick, Visible Learning, Cognitive Load Theory de Sweller). Antes de ler como lei, ler os originais dos pontos 1, 2 e 7.

## Verificação
| Verificar | Esperado |
|---|---|
| build e lint | sem `error` |
| `get_advisors` security | nada novo (além das palavras-passe vazadas) |
| ilha com 2 e 12 cartões | número inteiro visível |
| lição em claro e escuro | cantos chanfrados, passo atual azul |
| janela anónima no site | só o ecrã de entrada, com Beta e temas |
| conta nova | 0 XP, sem trilhas, "Cria o teu perfil" com a caixa dos 13 anos |
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

**Recomendação** (o Rodrigo já escolheu o Ko-fi para a beta):
1. Na beta, Ko-fi no "Sobre" e no aviso da beta (permitido no Hobby, custo zero).
2. Com utilizadores fiéis, plano Apoiante via Paddle + Vercel Pro ($20 por mês).
3. Anúncios só se nada mais resultar.

## Ideias para depois
Novidades dentro do app / changelog visível quando algo muda (o registo de alterações já existe aqui no PLANO.md; falta mostrá-lo a quem usa) · Animações sofisticadas em todo o app (transições entre ecrãs, micro-interações, mascote reativo, celebrações; a Fase 8 só fez o básico, leve, com transform e opacity) · Dashboard de administrador (gerir ideias, estados e respostas, ver relatórios de erro, números de uso; hoje faz-se no painel do Supabase) · Vozes e conversa para línguas (ver as notas de pesquisa sobre didática, ideia 8) · Sistema de feedback + tutorial (guiar quem chega e recolher opinião dentro do app) · Página Explorar mais trabalhada (ícones, categorias, filtros) · Criação de temas mais inteligente (a base já pede mais contexto quando o tema é ambíguo; evoluir com sugestões de desambiguação e, no futuro, escolher entre significados) · Emblema "Feito com IA · NOOBjects" mais trabalhado, alinhado com a identidade do estúdio (inclusão de IAs) · Criador de personagem para o avatar (mais variações: cores, olhos, acessórios, desbloqueados com XP ou conquistas; hoje há 6 cores do mascote) · Meta diária de XP · arquivar ou apagar trilhas · página 404 com o mascote · aviso "sem ligação" e modo offline · e-mail de boas-vindas · conquistas · push ao autor quando a sua ideia muda de estado · mais fontes (pesquisa na web citada; Open Library para livros) · painel dos erros reportados · mapa de conceitos · e-mails pelo Resend.
