# Continuar (notas de passagem)

Ficheiro de trabalho: **atualizar a cada bloco concluído**. Se o limite semanal estiver perto dos 100 %, parar tudo,
atualizar isto (feito / por fazer / achados), fazer commit e push.
Contexto: o Rodrigo pediu em 2026-10-05 o pacote abaixo, a seguir à Fase 5 (0.10.6, em produção). A Fase 6 (painel e equipa)
de `PLANO-0.11.md` absorve parte disto.

## Pedidos (estado)
| # | Pedido | Estado |
|---|---|---|
| 1 | Avatar do ranking não corresponde ao escolhido | não reproduzido (no app guarda bem; na base as duas contas têm 0). Guardar agora confirma o valor gravado e avisa se falhar. Pedir ao Rodrigo para voltar a escolher e guardar |
| 2 | Aviso do dono a todos ou a grupos/equipas (painel) | feito no código (Admin → Ferramentas → Enviar um aviso; act `notice`); falta testar |
| 3 | Notificar o autor quando a ideia muda de estado / recebe resposta (e erro resolvido) | feito no código (admin act idea/report → tabela `inbox`); falta testar |
| 4 | Área de notificações no app | feito no código (sino no cabeçalho, `?v=notificacoes`, `lib/inbox.ts`, `Notifications.tsx`; tabela `inbox` criada na base); falta testar |
| 5 | Avaliação das respostas curtas mais justa + «meio certa» | feito (veredito certa/parcial/errada em `/api/tutor`; cloze com tolerância a gralhas; parcial = meio ponto). Falta testar com IA real |
| 6 | Perguntas subjetivas evitadas na geração | feito no prompt de `/api/lesson` (só vale para lições novas) |
| 7 | Níveis intermédio/avançado demasiado fáceis | feito em `lib/levels.ts` (LEVEL_GUIDE.lesson); só vale para lições novas |
| 8 | Opinião na primeira lição terminada | feito (`feedbackAsk` id `l1`; aparece no ecrã de resultado e na trilha) |
| 9 | Continuar a lição ao voltar | feito (`lib/kept.ts`, sessionStorage; testado em `pacote-0107.cjs`) |
| 10 | Completar frases | feito (`lib/cloze.ts`: tira o artigo antes do espaço, aceita com/sem artigo, gralhas = quase certo; resposta aparece dentro da frase; botão «Não sei, mostra a resposta») |
| 11 | Cartão «Em breve» (Novidades) | feito (`Soon.tsx`, lista em `SOON` de `lib/changelog.ts`) |
| 12 | Aviso para todos na próxima atualização; «Em breve» uma vez por conta | feito (entrada 0.10.7 com `aviso: true`; `State.soon`) |

## Achados no caminho
- Base: `profiles.avatar` = 0 em renatarondon e rodrigorondonsilva; permissões e RLS de `profiles` estão certas (insert/update com `avatar`).
- Migração `inbox_notificacoes` já aplicada no Supabase (tabela `inbox` com RLS: ler/apagar/marcar lido só o próprio; inserir só pelo servidor).
- O catálogo existente mantém lições antigas (fáceis, cloze com artigo): só mudam com a regeneração (apagar a trilha no painel → nasce de novo) ou Fase 6.6 «Refazer».

## Plano restante (pedido do Rodrigo em 2026-10-07: «continue o plano inteiro» + tirar tudo o que diz «feito por IA»)
Versões: Fase 6 → 0.10.8, Fase 7 → 0.10.9, Fase 8 → 0.10.10, Fase 9 → 0.11 (marco). Fases 10 e 11 não mudam o changelog.
| Item | Estado |
|---|---|
| Tirar «Feito com IA» (Definições/Sobre, rodapé, LegalPage, CSS `.chip.ai`, PLANO) | feito (mantido: aviso legal em Termos, Privacidade e Tutor, que são avisos sobre erros, não selo) |
| 9.1 Página de aprovação do mascote | publicada: https://claude.ai/artifact/7DXnD5T9DAz3zg673XVmn3 — **à espera de aprovação do Rodrigo** (só bloqueia 9.2) |
| Fase 6 (painel completo, equipa, etiqueta Equipa) | **publicada** (0.10.8, PR 15); migração `equipa` aplicada |
| Fase 7 (Novidades com marcos, aviso de beta) | feita e testada (`fase7-novidades.cjs`); 0.10.9 a publicar |
| Fase 8 (troféus semanais) | por fazer |
| Fase 10 (login Apple/Discord desligado) | por fazer |
| Fase 11 (LICENSE, SECURITY.md, dependabot) | por fazer |
| Fase 9.2 (código do mascote/criador) | depois da aprovação |
