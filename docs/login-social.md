# Entrar com Discord e Apple (passos do Rodrigo)

Os botões já estão no código e ficam **escondidos** até ligares a variável certa na Vercel. Enquanto estiverem desligados, nada muda.
O endereço de retorno do Supabase, igual para os dois: `https://klrgitkxdhofsqwyisvn.supabase.co/auth/v1/callback`.

## Discord (grátis; idade mínima 13, como o NOOBrain)
1. Vai a <https://discord.com/developers/applications> → **New Application** (nome: NOOBrain).
2. **OAuth2** → em **Redirects** acrescenta o endereço de retorno acima → **Save Changes**.
3. Copia o **Client ID** e o **Client Secret** (Reset Secret, se for preciso).
4. Supabase → **Authentication → Providers → Discord** → liga, cola o Client ID e o Client Secret → **Save**.
5. Vercel → projeto → **Settings → Environment Variables** → `NEXT_PUBLIC_DISCORD_LOGIN` = `1` (Production e Preview) → publica de novo (Deployments → Redeploy).
6. Testa: no ecrã de entrada aparece «Continuar com o Discord».

## Apple (paga: Apple Developer Program, 99 USD por ano)
Só vale a pena se decidires pagar. Sem isso a Apple não deixa criar o acesso.
1. Inscreve-te em <https://developer.apple.com/programs/>.
2. Segue o guia do Supabase «Login with Apple» (<https://supabase.com/docs/guides/auth/social-login/auth-apple>): criar um **App ID**, um **Services ID** (domínio `klrgitkxdhofsqwyisvn.supabase.co`, retorno = endereço acima) e uma **chave** (.p8). O Supabase pede o Services ID e um segredo gerado a partir da chave (o guia explica; o segredo expira de 6 em 6 meses, por isso marca no calendário).
3. Supabase → **Authentication → Providers → Apple** → liga e preenche → **Save**.
4. Vercel → `NEXT_PUBLIC_APPLE_LOGIN` = `1` → publica de novo.

## Notas
- Contas com o **mesmo e-mail confirmado** juntam-se sozinhas (como aconteceu com o Google).
- A Apple deixa a pessoa esconder o e-mail verdadeiro: nesse caso o NOOBrain recebe um e-mail de reencaminhamento da Apple.
- A Política de Privacidade já menciona Google, Apple e Discord.
