# MANUAL do NOOBrain (siga ao pé da letra)

Este manual vale para qualquer modelo que trabalhe neste projeto. Leia inteiro antes da primeira ação.
Se uma regra daqui conflitar com o seu costume, **a regra daqui vence**.

---

## 0. Como trabalhar (sempre, nesta ordem)

1. Leia o pedido. Escreva para si mesmo, numa frase, o que o usuário quer ver mudado na tela ou no comportamento.
2. Procure a tarefa na seção 3 ("Receitas"). Achou? Siga a receita passo a passo, sem pular nenhum.
3. Não achou receita? Use o mapa da seção 2 para saber qual arquivo abrir.
4. Antes de editar, use Grep/Glob para achar o trecho exato. Leia só esse trecho (com `offset`/`limit`), não o arquivo inteiro.
5. Faça a **menor** mudança que resolve. Não reescreva o que não foi pedido. Não "aproveite para melhorar" outras coisas.
6. Rode a verificação da seção 4. Só diga "terminei" se tudo passou.
7. Responda ao usuário em português, curto, como a um cliente inteligente que não programa: o que mudou e onde ver.

**Pare e pergunte ao usuário** (não adivinhe) se acontecer qualquer um destes:
- o pedido pode ser entendido de dois jeitos que dão resultados diferentes na tela;
- a tarefa exige apagar dados, mexer em contas, publicar, pagar ou instalar um pacote novo;
- a tarefa muda o visual de algo que o usuário não citou;
- você tentou corrigir o mesmo erro 2 vezes e ele continua.

---

## 1. Regras que nunca se quebram

| NUNCA | SEMPRE |
|---|---|
| `border-radius` em qualquer coisa | Cantos chanfrados a 45°: classe `.ch`, `.pane` ou `.btn` (ver 3.2) |
| Cor escrita direto (`#005fd9`, `blue`, `rgb(...)`) em componente | Variável de `app/globals.css`: `var(--brand)`, `var(--ink)`, etc. |
| Sombra com blur (`box-shadow: 0 2px 8px ...`) | Sombra sólida: `filter: drop-shadow(0 var(--depth) 0 var(--cor-deep))` |
| Verde ou vermelho para enfeite | Verde (`--ok`) só para "certo", vermelho (`--bad`) só para "errado" |
| Tailwind, styled-components, CSS-in-JS, nova biblioteca | CSS puro em `app/globals.css` |
| Chave, senha ou token dentro do código | Variável em `.env.local` (fora do Git) e o nome dela em `.env.example` |
| Chamar a IA (Gemini) de qualquer arquivo | Só por `lib/ai.ts` |
| Criar tabela no Supabase sem RLS | Toda tabela com RLS ligado e política por usuário |
| Editar `package-lock.json`, `.next/`, `node_modules/` à mão | Deixar esses com as ferramentas (`npm`) |
| Dizer "terminei" sem rodar a seção 4 | Rodar build e lint, e mostrar que passaram |
| `git push --force`, `git reset --hard`, apagar arquivos sem pedir | Perguntar antes |

**Next.js 16 é diferente do que você conhece.** Antes de usar qualquer recurso do Next (rotas, `params`, cache, metadata, imagens, middleware), procure o guia em `node_modules/next/dist/docs/` com Grep e siga o que estiver lá.

---

## 2. Mapa: "quero mudar X" → abra Y

| Quero mudar... | Arquivo |
|---|---|
| Cores, cantos, sombras, fontes, espaçamentos, tamanhos de tela | `app/globals.css` (variáveis no topo; modo escuro logo abaixo, em `@media (prefers-color-scheme: dark)`) |
| Navegação entre telas, casca do app | `components/App.tsx` |
| Menu flutuante (ilha) | `components/Island.tsx` |
| Lição (Aprender → Memorizar → Testar) | `components/LessonView.tsx` |
| Cartões de memorizar | `components/Deck.tsx` |
| Quiz | `components/Quiz.tsx` |
| Chat do tutor | `components/Tutor.tsx` |
| Tela de revisão | `components/ReviewView.tsx` |
| Tela de novo tema | `components/NewTopic.tsx` |
| Login, conta | `components/Account.tsx`, `lib/supabase.ts`, `lib/useSync.ts` |
| Mascote | `components/Mascot.tsx`, `lib/mascot-paths.ts` |
| Bolinha/nó da trilha | `components/TrailNode.tsx` |
| Ícones | `components/Icons.tsx` |
| Lembretes/notificações | `components/ReminderToggle.tsx`, `lib/reminders.ts`, `public/sw.js` |
| Dados salvos, XP, sequência, revisão espaçada | `lib/store.ts` (chave `noobrain:v2` no navegador) |
| Formato dos dados (tipos) | `lib/types.ts` |
| O que a IA recebe e devolve, modelos, limite por minuto | `lib/ai.ts` |
| Busca nas wikis | `lib/sources.ts` |
| Temas parecidos ("Fernando Pessoa" = "Fernando Pessoa poeta") | `lib/topic.ts` + teste `lib/topic.test.ts` |
| Rotas do servidor | `app/api/trail`, `app/api/lesson`, `app/api/tutor`, `app/api/report` |
| Limite de pedidos por pessoa | `lib/limit.ts` |
| Lista de tarefas futuras | `ROADMAP.md` |

---

## 3. Receitas

### 3.1 Mudar um texto da tela
1. Grep pelo texto exato que aparece na tela (ex.: `"Voltar à trilha"`) em `components/`.
2. Troque só a string. Mantenha acentos.
3. Seção 4.

### 3.2 Mudar ou criar um visual (cor, botão, cartão)
1. Cor nova? Primeiro veja se já existe variável parecida no topo de `app/globals.css`. Use a existente.
2. Precisa mesmo de cor nova? Crie a variável em `:root` **e** a versão escura no bloco `prefers-color-scheme: dark`. Pergunte ao usuário o valor se ele não disse.
3. Botão: copie este padrão, não invente outro:
   ```tsx
   <button type="button" className="btn" onClick={...}><span className="face">Texto</span></button>
   ```
   Variantes já existentes: `btn soft`, `btn sm`, `btn block`.
4. Cartão/caixa: copie este padrão:
   ```tsx
   <div className="pane"><div className="in">conteúdo</div></div>
   ```
   Variantes: `pane tint`, `pane is-right` (certo), `pane is-wrong` (errado), `pane is-mine`.
5. Só cortar cantos de um elemento qualquer: adicione a classe `ch` (tamanho do corte pela variável `--c`).
6. CSS novo vai em `app/globals.css`, perto das classes parecidas. Nada de `style={{...}}` com cores.
7. Seção 4. Depois rode `npm run dev` e peça ao usuário para conferir em http://localhost:3000 (claro e escuro, celular e computador).

### 3.3 Criar um componente novo
1. Arquivo em `components/NomeEmPascalCase.tsx`.
2. Abra um componente parecido (ex.: `ReviewView.tsx`) e copie a estrutura: imports no topo, uma função exportada, classes do `globals.css`.
3. Se usar estado, eventos ou `localStorage`, a primeira linha do arquivo deve ser `"use client";` (confira como os outros fazem).
4. Use em `App.tsx` ou no componente pai. Seção 4.

### 3.4 Mexer na IA
1. Só em `lib/ai.ts`. Nenhum outro arquivo chama o Gemini.
2. Plano gratuito: 10 pedidos por minuto. A fila usa 9. **Não aumente.**
3. Se mudar o formato da resposta, atualize `lib/types.ts` e quem usa esse dado (Grep pelo nome do campo).
4. A chave fica em `AI_API_KEY` no `.env.local`. Nunca imprima a chave em log.

### 3.5 Mexer no banco (Supabase)
1. Projeto: `noobrain-eu` (Paris). Tabelas: `progress` e `reports`, ambas com RLS.
2. Antes de mudar, liste as tabelas e leia a estrutura atual.
3. Toda tabela nova: `alter table ... enable row level security;` + política que só deixa a pessoa ver/editar as próprias linhas.
4. Apagar tabela, coluna ou dados: **pergunte antes**.

### 3.6 Mexer em temas parecidos
1. Edite `lib/topic.ts`.
2. Adicione um caso em `lib/topic.test.ts` que prove a mudança.
3. Rode `npm run check:topic`. Tem que passar.

### 3.7 Salvar e publicar
Só quando o usuário pedir para publicar/enviar.
1. Seção 4 passou.
2. `git status` → confira que não há `.env.local` nem chaves na lista.
3. `git add -A` e `git commit -m "frase curta em português dizendo o que mudou"` (termine a mensagem com a linha de coautoria que o sistema indicar).
4. `git push` (vai para https://github.com/apenasdrei/NOOBrain).
5. Site: se a Vercel ainda não estiver ligada ao GitHub, rode `npx vercel deploy --prod --scope noob-jects`. Endereço: https://noobrain.vercel.app.
6. Abra o endereço e confirme que carrega.

### 3.8 Terminou um item do roteiro
Marque `[x]` no `ROADMAP.md` e mova o item para "Feito".

---

## 4. Verificação (obrigatória antes de dizer "terminei")

Rode na pasta do projeto, um por vez:

| Comando | Passou quando... | Se falhar |
|---|---|---|
| `npm run build` | termina sem `Error` e mostra a lista de rotas | Leia a **primeira** mensagem de erro, abra o arquivo e a linha citados, corrija só isso, rode de novo |
| `npm run lint` | não mostra nenhum `error` | Mesmo processo. `warning` em arquivo que você não mexeu: ignore |
| `npm run check:topic` (só se mexeu em `lib/topic.ts`) | todos os testes `ok`, `fail 0` | Corrija `topic.ts`, não o teste (a menos que o usuário peça) |

Depois de 2 tentativas sem sucesso no mesmo erro: pare, mostre o erro ao usuário e explique em uma frase o que tentou.

---

## 5. Erros comuns

- **"Can't resolve ..."**: caminho de import errado. Copie o formato de import de um arquivo vizinho.
- **"window is not defined" / "localStorage is not defined"**: o componente precisa de `"use client";` na primeira linha, ou o acesso deve ficar dentro de `useEffect`.
- **IA responde 429**: estourou o limite por minuto. Não é bug do código; espere 1 minuto.
- **IA responde 500/503**: o Google está sobrecarregado; `lib/ai.ts` já tenta de novo e usa modelos reserva.
- **Login não funciona no `localhost`**: faltam `NEXT_PUBLIC_SUPABASE_URL` e `NEXT_PUBLIC_SUPABASE_KEY` no `.env.local`. Peça ao usuário; não invente valores.
- **Texto com caracteres estranhos (`Ã©`)**: é só o terminal exibindo errado. Os arquivos são UTF-8; não "corrija".
