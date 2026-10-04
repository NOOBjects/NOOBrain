# NOOBrain

App para aprender qualquer tema: trilha de conceitos, tutor, cartões e revisão espaçada. Estúdio NOOBjects.

## Como rodar

```bash
npm install
npm run dev     # abre em http://localhost:3000
npm run build   # confere se tudo compila
```

## Onde mexer no visual

- `app/globals.css`: cores, cantos e sombras (variáveis no topo). Mudou ali, mudou o app inteiro.
- `components/Mascot.tsx`: mascote animado (corpo, olhos e pupilas em camadas).
- `public/brand/`: logos vetorizados da NOOBjects.

## Marcos

1. Base e identidade · 2. Tema vira trilha (IA) · 3. Lição completa (tutor, cartões, quiz, revisão espaçada) · 4. Conta e progresso (Supabase) · 5. No ar (falta publicar)

## IA

Plano gratuito do Google Gemini, limite de 10 pedidos por minuto. Pegue uma chave em https://aistudio.google.com/apikey e cole em `.env.local` (`AI_API_KEY=...`). `lib/ai.ts` controla a fila de 9 pedidos por minuto, tenta modelos reserva se o principal estiver sobrecarregado e é o único arquivo a mudar para trocar de provedor. Cada lição é gerada uma vez e guardada no progresso.

## Conta e progresso

Supabase: tabelas `progress` (estado de cada pessoa) e `reports` (botão "Reportar erro"), ambas com RLS. Sem conta, tudo fica no navegador. Copie `.env.example` para `.env.local` e preencha a URL e a publishable key do projeto.

## Responsivo

Pontos de quebra em `app/globals.css`: 600px (tablet pequeno), 900px (barra lateral), 1280px e 1700px (telas largas), mais celular deitado, telas de até 359px, toque, mouse, contraste alto e movimento reduzido.
