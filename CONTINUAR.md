# Continuar (notas de passagem)

Ficheiro de trabalho: **atualizar a cada bloco concluído**. Se o limite semanal estiver perto dos 100 %, parar tudo,
atualizar isto (feito / por fazer / achados), fazer commit e push.
Contexto: o Rodrigo pediu em 2026-10-05 o pacote abaixo, a seguir à Fase 5 (0.10.6, em produção). A Fase 6 (painel e equipa)
de `PLANO-0.11.md` absorve parte disto.

## Pedidos (estado)
| # | Pedido | Estado |
|---|---|---|
| 1 | Avatar do ranking não corresponde ao escolhido (base tem 0 nas duas contas) | por fazer: investigar |
| 2 | Aviso do dono a todos ou a grupos/equipas (painel) | feito no código (Admin → Ferramentas → Enviar um aviso; act `notice`); falta testar |
| 3 | Notificar o autor quando a ideia muda de estado / recebe resposta (e erro resolvido) | feito no código (admin act idea/report → tabela `inbox`); falta testar |
| 4 | Área de notificações no app | feito no código (sino no cabeçalho, `?v=notificacoes`, `lib/inbox.ts`, `Notifications.tsx`; tabela `inbox` criada na base); falta testar |
| 5 | Avaliação das respostas curtas mais justa + "meio certa" | por fazer |
| 6 | Perguntas subjetivas (ex.: lavar o arroz) evitadas na geração | por fazer |
| 7 | Níveis intermédio/avançado demasiado fáceis | por fazer |
| 8 | Pedir opinião na primeira lição terminada | por fazer |
| 9 | Bug: sair a meio da lição (ex. ir às Ideias) volta ao início; guardar a etapa | por fazer |
| 10 | Completar frases: resposta escondida atrás do espaço + artigo/género que denuncia ou engana ("o ___" vs "a corrente") | por fazer |
| 11 | Novidades: cartão "Em breve" com luz/gradiente nas cores da marca, lista das próximas atualizações | por fazer |
| 12 | Próxima atualização (mesmo pequena) com `aviso: true`; cartão "Em breve" aparece uma vez a todas as contas | por fazer |

## Achados no caminho
- Base: `profiles.avatar` = 0 em renatarondon e rodrigorondonsilva; permissões e RLS de `profiles` estão certas (insert/update com `avatar`).
- Migração `inbox_notificacoes` já aplicada no Supabase (tabela `inbox` com RLS: ler/apagar/marcar lido só o próprio; inserir só pelo servidor).
- O catálogo existente mantém lições antigas (fáceis, cloze com artigo): só mudam com a regeneração (apagar a trilha no painel → nasce de novo) ou Fase 6.6 «Refazer».
