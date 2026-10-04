# E-mails do Supabase

Templates em português de Portugal, com a identidade NOOB. Para usar: Supabase → Authentication → Emails (Templates). Cola o **assunto** e o **HTML** de cada um no modelo indicado.

| Ficheiro | Modelo no Supabase | Assunto |
|---|---|---|
| `confirmar-conta.html` | Confirm signup | Confirma a tua conta no NOOBrain |
| `convite.html` | Invite user | Foste convidado(a) para o NOOBrain |
| `link-magico.html` | Magic link | O teu link para entrar no NOOBrain |
| `mudar-email.html` | Change email address | Confirma o teu novo e-mail no NOOBrain |
| `recuperar-palavra-passe.html` | Reset password | Cria uma palavra-passe nova no NOOBrain |
| `confirmar-identidade.html` | Reauthentication | O teu código de confirmação do NOOBrain |
| `palavra-passe-alterada.html` | Password changed (notificação de segurança) | A tua palavra-passe do NOOBrain foi alterada |
| `email-alterado.html` | Email address changed (notificação de segurança) | O e-mail da tua conta do NOOBrain foi alterado |

As variáveis `{{ .ConfirmationURL }}`, `{{ .Token }}`, `{{ .SiteURL }}`, `{{ .Email }}`, `{{ .NewEmail }}` e `{{ .OldEmail }}` são do Supabase: não as mexas. Os dois últimos modelos são notificações de segurança e só aparecem se estiverem ativadas no painel.
