# Roteiro do NOOBrain

Ordem de prioridade: de cima para baixo. Marque como feito ao concluir.

**Em curso: [PLANO-BETA.md](PLANO-BETA.md)** (fases 0 a 8, executar por ordem).

## Feito
- [x] Identidade NOOBjects, mascote animado (pupila quadrada que se adapta ao canto do olho), tokens
- [x] Tema → trilha com IA gratuita (Gemini), fila de 9 pedidos/min, modelos reserva
- [x] Lição guiada: Aprender → Memorizar → Testar, com tutor à mão
- [x] Revisão espaçada, selo na ilha, aviso na trilha, contador no título, notificação opcional
- [x] Detecção de temas parecidos (chave canônica + erro de digitação) e cache no servidor
- [x] Fontes: Wikipédia, Wikilivros, Wikiversidade, Wikisource (e Wikipedia em inglês se nada em português)
- [x] Conta opcional com Supabase (Europa) e sincronização do progresso
- [x] Ilha de menu flutuante: some ao rolar para baixo ou pela seta, volta ao rolar para cima
- [x] Responsivo: celular, tablet, desktop, celular deitado, toque/mouse, contraste alto, movimento reduzido
- [x] Painel de conta: entrar, criar conta, recuperar palavra-passe, ecrã de e-mail enviado, escolha ao juntar progressos, dados só depois de carregados

## Próximo (pedido pelo usuário)
- [ ] **Animações em quase tudo**: troca de página, entrar num conceito, mascote reagindo, botões, cartões, trilha
- [ ] **Entrar com o Google**: já funciona no localhost; falta confirmar no site depois de publicar
- [ ] **Mais fontes** para cobrir qualquer assunto: busca na web com resultados citados (ex.: Gemini com Google Search, Brave ou Tavily), Open Library para livros
- [ ] **Catálogo compartilhado**: lição/trilha gerada uma vez serve a todos. Precisa de uma chave secreta de escrita no servidor (decisão do usuário: usar a "secret key" do Supabase ou um token próprio com função no banco)
- [ ] **Lembretes com o app fechado** (push de verdade): service worker com Web Push, chaves VAPID e uma tarefa agendada na Vercel
- [ ] **Idioma: português de Portugal** (decidido). Painel de conta já convertido; falta o resto do app e as instruções da IA em lib/ai.ts

## Ideias
- [ ] Apagar a conta pelo próprio app (RGPD: os dados estão na UE). Precisa de uma rota no servidor com a chave secreta do Supabase
- [ ] E-mails com servidor próprio (ex.: Resend): o envio de e-mails incluído no Supabase tem um limite baixo por hora
- [ ] Instalar como app (manifest e ícones PNG), modo offline
- [ ] Apagar ou arquivar trilhas, renomear
- [ ] Painel simples dos erros reportados
- [ ] Limite diário de uso por pessoa e proteção contra abuso antes de divulgar
- [ ] Mapa de conceitos, conquistas, metas diárias
