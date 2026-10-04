<!-- BEGIN:nextjs-agent-rules -->

# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->

## Novidades (changelog): regras
Fonte única: `lib/changelog.ts` (aparece no app em Novidades; a versão do app sai da entrada mais recente).
- Cada publicação com mudanças que a pessoa vê acrescenta uma entrada **no topo** de `CHANGELOG`. Correções só internas (código, testes, documentação) não entram.
- Campos: `version` (0.9.1 → 0.9.2 …; salto de "dezena" só em marcos), `date` (AAAA-MM-DD, a data real), `title` (curto), `novo`, `melhorias`, `corrigido` (listas; omitir as vazias) e, só nas atualizações maiores, `aviso: true` (envia aviso push a quem pediu).
- Onde vai cada linha: **novo** = funcionalidade que não existia; **melhorias** = algo que já existia e ficou melhor; **corrigido** = erro que deixou de acontecer.
- Texto: PT-PT, a tratar por "tu", a falar para quem usa, uma frase por linha, sem "Fase N", sem nomes de ficheiros nem termos técnicos.
- A versão e a data valem para a publicação inteira: várias mudanças do mesmo dia entram na mesma entrada se ainda não foi publicada.
