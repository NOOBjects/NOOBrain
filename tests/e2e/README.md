# Testes no navegador (locais, sem contas reais)

Um Supabase **falso** (`mock-supabase.cjs`, em memória, porta 54321) e scripts Playwright que entram com a conta de teste
`teste@noobrain.local` / `teste1234` (só existe aqui). Nada disto vai para a Vercel nem toca no Supabase verdadeiro.
O Playwright e o Chromium vêm do ambiente (não são dependências do projeto; nunca correr `playwright install`).

## Arrancar
```bash
node tests/e2e/mock-supabase.cjs &                       # Supabase falso
NEXT_PUBLIC_SUPABASE_URL=http://localhost:54321 NEXT_PUBLIC_SUPABASE_KEY=mock \
SUPABASE_SECRET_KEY=mock ADMIN_IDS=11111111-1111-4111-8111-111111111111 npx next dev -p 3000 &
node tests/e2e/flow.cjs claro            # telemóvel, tema claro
node tests/e2e/flow.cjs escuro dark      # telemóvel, tema escuro
node tests/e2e/flow.cjs pc "" 1280       # computador
```
As capturas ficam em `tests/e2e/out/` (fora do Git). Abrir algumas com a ferramenta de leitura de imagens para conferir.

## O que o falso sabe fazer
- Entrar com e-mail e palavra-passe (a errada dá "E-mail ou palavra-passe incorretos.").
- Ler e gravar `progress`, `profiles`, `suggestions`, `suggestion_votes`, `push_subscriptions`, `reports`, `feedback`, `catalog_*`
  (filtros `eq`, `neq`, `gt`, `gte`, `lt`, `in`, `is`, `order`, `limit`, `count`). Tabelas novas funcionam sem mudar nada (ficam vazias).
- `GET /__reset?f=p-rich` repõe o progresso na nuvem a partir de `fixtures/p-rich.json` (`p-empty`, `p-new`, ou nada).
- As 9 trilhas do catálogo (`fixtures/catalog_trails.json`) com lições geradas (todas com os 6 tipos de exercício).
- **Não** tem IA: criar um tema novo ou o tutor dão erro aqui. Isso testa-se numa pré-visualização da Vercel (ver o plano).

Para funções novas do Supabase (`rpc`), o falso devolve `null`: acrescentar o comportamento em `mock-supabase.cjs` quando o teste depender dele.
