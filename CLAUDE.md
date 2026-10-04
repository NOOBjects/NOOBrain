@AGENTS.md

# NOOBrain: regras do projeto (ler antes de agir)

App web para aprender qualquer tema, estilo Duolingo, com a identidade da NOOBjects. O Rodrigo é designer e leigo em código: ele decide o quê, tu decides o como. Responde em português de Portugal, curto, como a um cliente inteligente. Textos do app sempre em **PT-PT, tratando por "tu"**.
Trabalho em curso e roteiro: **`PLANO.md`** (ler só quando a tarefa for de lá).

## Como trabalhar
1. Diz para ti numa frase o que muda na tela ou no comportamento.
2. Usa o mapa abaixo; procura com Grep/Glob e lê só o trecho necessário.
3. Faz a **menor** mudança que resolve. Não melhores o que não foi pedido.
4. Verifica (secção "Antes de dizer que terminou") e responde: o que mudou e onde ver.

**Pára e pergunta** se: o pedido tem duas leituras com resultados diferentes; é preciso apagar dados, mexer em contas, publicar, pagar ou instalar um pacote novo; muda o visual de algo não citado; o mesmo erro falhou 2 vezes.

## Nunca / sempre
| Nunca | Sempre |
|---|---|
| `border-radius` | cantos chanfrados a 45°: `.ch` (corte em `--c`), `.pane`, `.btn` |
| cor escrita direto no componente | tokens de `app/globals.css` (claro em `:root`, escuro no bloco `prefers-color-scheme`) |
| sombra com desfoque | sombra sólida 4px: `filter: drop-shadow(0 var(--depth) 0 var(--cor-deep))` |
| verde/vermelho de enfeite | `--ok` só para certo, `--bad` só para errado |
| Tailwind, CSS-in-JS, biblioteca nova sem ok | CSS puro em `app/globals.css` |
| chave ou segredo no código | `.env.local` (fora do Git) + só o nome em `.env.example` |
| chamar a IA fora de `lib/ai.ts` | tudo por `lib/ai.ts` (trocar de provedor = só esse ficheiro) |
| tabela no Supabase sem RLS | RLS ligado + política por utilizador |
| mexer à mão em `package-lock.json`, `.next/`, `node_modules/` | deixar com o `npm` |
| `push --force`, `reset --hard`, apagar ficheiros sem pedir | perguntar |
| worktrees | só ramos; trabalhar na pasta do projeto |

**Next.js 16 é diferente do que conheces**: antes de usar rotas, `params`, cache, metadata, imagens ou middleware, lê o guia em `node_modules/next/dist/docs/`.

Padrões de UI (copiar, não inventar):
- botão `<button type="button" className="btn"><span className="face">Texto</span></button>`, com as variantes `soft`, `sm`, `block`;
- caixa `<div className="pane"><div className="in">…</div></div>`, com as variantes `tint`, `is-right`, `is-wrong`, `is-mine`.

Componente novo: `components/NomePascal.tsx`, com `"use client";` se usar estado, eventos ou `localStorage`.

## Mapa: quero mudar X → abro Y
| X | Y |
|---|---|
| cores, cantos, sombras, fontes, pontos de quebra | `app/globals.css` |
| navegação e casca | `components/App.tsx`; menu flutuante `Island.tsx`; ecrãs no endereço (`?v=`, função `navigate` em `App.tsx`); fim do login do Google em `app/entrar` + `LoginDone.tsx` |
| lição (Aprender → Memorizar → Testar) | `LessonView.tsx`, `Deck.tsx`, `Quiz.tsx`, `Tutor.tsx` |
| revisão, novo tema, conta | `ReviewView.tsx`, `NewTopic.tsx`, `Account.tsx` (+ `lib/supabase.ts`, `lib/useSync.ts`) |
| mascote, nó da trilha, ícones | `Mascot.tsx` + `lib/mascot-paths.ts`, `TrailNode.tsx`, `Icons.tsx` |
| lembretes | `ReminderToggle.tsx`, `lib/reminders.ts`, `public/sw.js` |
| estado, XP, sequência, revisão espaçada | `lib/store.ts` (localStorage `noobrain:v2`); tipos em `lib/types.ts` |
| IA (prompts, modelos, fila de 9/min) | `lib/ai.ts`; rotas `app/api/trail`, `lesson`, `tutor`, `report` |
| fontes (wikis), cache, limite por IP | `lib/sources.ts`, `lib/cache.ts`, `lib/limit.ts` |
| temas parecidos | `lib/topic.ts` + `lib/topic.test.ts` (`npm run check:topic`) |
| ícones do site, metadados, manifesto | `app/icon.svg`, `app/favicon.ico`, `app/apple-icon.png`, `app/opengraph-image.png`, `app/layout.tsx`, `app/manifest.ts` |
| novidades, versão, avisos de atualização | `lib/changelog.ts`, `News.tsx`, `Announce.tsx`, `ReminderToggle.tsx` |
| e-mails do Supabase | `emails/` (ver `emails/README.md`) |

## Antes de dizer que terminou
- `npm run build`: sem `Error`, mostra a lista de rotas.
- `npm run lint`: sem `error` (avisos em ficheiros não mexidos: ignorar).
- `npm run check:topic`: se mexeste em `lib/topic.ts`. Corrige o código, não o teste.
- Mudança visível: ver no navegador (claro e escuro, telemóvel e computador).
- 2 tentativas falhadas no mesmo erro: pára, mostra o erro e diz o que tentaste.

Erros comuns:
- "Can't resolve": import errado; copia o formato de um ficheiro vizinho.
- "window/localStorage is not defined": falta `"use client"` ou o acesso tem de estar num `useEffect`.
- IA com 429: limite por minuto; espera. IA com 5xx: Groq sobrecarregado; `lib/ai.ts` já tenta outro modelo.
- `Ã©` no terminal: é só a exibição; os ficheiros são UTF-8.

## Infraestrutura
- **Site**: https://noobrain.vercel.app (Vercel, equipa `noob-jects`, plano Hobby, funções em Paris `cdg1`). A Vercel está ligada ao GitHub `NOOBjects/NOOBrain` (ramo `main`). Se um push não publicar sozinho, o Rodrigo cria a publicação no painel (Deployments → Create Deployment → `main`).
- **Supabase**: projeto `NOOBrain`, ref `klrgitkxdhofsqwyisvn`, Paris, conta dev.noobjects@gmail.com. Tabelas `progress` e `reports`, com RLS. Login por e-mail (SMTP do Gmail) e Google. A chave pública é pública por natureza; a proteção é o RLS. Antes de mudar o banco, lista as tabelas; apagar tabelas, colunas ou dados pede confirmação.
- **IA**: chave em `AI_API_KEY`. Fornecedor: **Groq gratuito** (o Gemini gratuito não pode servir a UE nem menores). Sem faturação: a IA tem de ficar sempre gratuita. Idade mínima do app: 13 anos.
- **Variáveis na Vercel e segredos**: quem as põe é o Rodrigo (as permissões bloqueiam o agente). Diz-lhe o nome exato e onde.
- **Publicar** (só quando pedido): verificação acima → mudança visível: entrada nova no topo de `lib/changelog.ts` → `git status` sem `.env*` → commit em português com a linha de coautoria → `git push`. No fim, abrir o site e confirmar.
