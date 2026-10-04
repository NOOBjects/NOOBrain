// Gera os e-mails (emails/*.html) e as imagens de canto (public/email/*.png).
// Rodar na raiz do projeto:  FONT=caminho/ChakraPetch-Bold.ttf node emails/gen.mjs
// E-mail não suporta clip-path, por isso os cantos chanfrados a 45° são pequenas imagens PNG
// servidas pelo próprio site. Sem imagens (ex.: Outlook a bloquear), os cantos ficam retos.
import { mkdirSync, writeFileSync } from "node:fs";
import sharp from "sharp";

const BASE = "https://noobrain.vercel.app/email/";
mkdirSync("public/email", { recursive: true });

// Cores = tokens do app (app/globals.css).
const C = { brand: "#005fd9", deep: "#0047a6", tint: "#f1f6ff", bg: "#edf3ff", line: "#c6d6f0", ink: "#08183a", ink2: "#34476e", ink3: "#586a91", bad: "#a32424", badSoft: "#fde3e3", white: "#ffffff" };
const HEAD = "'Chakra Petch','Arial Narrow',Arial,sans-serif";
const BODY = "'Figtree','Segoe UI',Helvetica,Arial,sans-serif";

// ---------- imagens ----------
const cuts = { tl: (s) => `0,0 ${s},0 0,${s}`, tr: (s) => `0,0 ${s},0 ${s},${s}`, bl: (s) => `0,0 0,${s} ${s},${s}`, br: (s) => `${s},0 ${s},${s} 0,${s}` };
const made = new Set();
async function corner(pos, fill, outer, s) {
  const name = `c-${pos}-${fill.slice(1)}-${outer.slice(1)}-${s}.png`;
  if (!made.has(name)) {
    made.add(name);
    const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${s}" height="${s}" viewBox="0 0 ${s} ${s}"><rect width="${s}" height="${s}" fill="${fill}"/><polygon points="${cuts[pos](s)}" fill="${outer}"/></svg>`;
    await sharp(Buffer.from(svg), { density: 576 }).resize(s * 2, s * 2).png().toFile(`public/email/${name}`);
  }
  return BASE + name;
}

// Caixa com os 4 cantos cortados. `top` e `bottom` são as cores das faixas de cima e de baixo.
async function box({ top, bottom = top, outer, s, inner, pad = "6px 28px", width = "100%" }) {
  const [tl, tr, bl, br] = await Promise.all([corner("tl", top, outer, s), corner("tr", top, outer, s), corner("bl", bottom, outer, s), corner("br", bottom, outer, s)]);
  const cell = (src, bg) => `<td width="${s}" height="${s}" style="width:${s}px;height:${s}px;padding:0;line-height:0;font-size:0;background:${bg}"><img src="${src}" width="${s}" height="${s}" alt="" style="display:block;border:0"></td>`;
  const fill = (bg) => `<td style="padding:0;height:${s}px;line-height:0;font-size:0;background:${bg}">&nbsp;</td>`;
  return `<table role="presentation" cellpadding="0" cellspacing="0" width="${width}" style="border-collapse:collapse"><tr>${cell(tl, top)}${fill(top)}${cell(tr, top)}</tr><tr><td colspan="3" style="padding:${pad};background:${top}">${inner}</td></tr><tr>${cell(bl, bottom)}${fill(bottom)}${cell(br, bottom)}</tr></table>`;
}

// Logótipo do cabeçalho: mascote não, só o nome na fonte do site, com fundo transparente.
async function wordmark() {
  const t = await sharp({ text: { text: `<span foreground="${C.brand}">NOOB</span><span foreground="${C.ink}">rain</span>`, font: "Chakra Petch Bold", fontfile: process.env.FONT, rgba: true, dpi: 300 } }).png().toBuffer();
  await sharp(t).toFile("public/email/wordmark.png");
  const m = await sharp(t).metadata();
  return `<img src="${BASE}wordmark.png" width="${Math.round(m.width / 2)}" height="${Math.round(m.height / 2)}" alt="NOOBrain" style="display:block;border:0;font:700 24px ${HEAD};color:${C.brand}">`;
}

// ---------- peças ----------
const button = async (url, label) =>
  `<table role="presentation" cellpadding="0" cellspacing="0" style="margin:26px 0 6px"><tr><td>${await box({ top: C.brand, bottom: C.deep, outer: C.white, s: 8, width: "auto", pad: "6px 26px 2px", inner: `<a href="${url}" style="display:block;font:700 16px/1.2 ${HEAD};color:#ffffff;text-decoration:none;text-align:center">${label}</a>` })}</td></tr></table>`;

const code = async (token) =>
  `<table role="presentation" cellpadding="0" cellspacing="0" style="margin:22px 0 6px"><tr><td>${await box({ top: C.tint, outer: C.white, s: 10, width: "auto", pad: "6px 26px", inner: `<span style="font:700 32px/1.2 'Chakra Petch','Consolas','Courier New',monospace;letter-spacing:8px;color:${C.brand}">${token}</span>` })}</td></tr></table>`;

const warn = async (t) =>
  `<div style="margin-top:20px">${await box({ top: C.badSoft, outer: C.white, s: 8, inner: `<span style="font:600 14px/1.45 ${BODY};color:${C.bad}">${t}</span>`, pad: "2px 14px" })}</div>`;

const p = (t) => `<p style="margin:0 0 12px">${t}</p>`;
const small = (t) => `<p style="margin:20px 0 0;font-size:13px;color:${C.ink3}">${t}</p>`;
const fallback = small(`Se o botão não abrir, copia este endereço para o navegador:<br><a href="{{ .ConfirmationURL }}" style="color:${C.brand};word-break:break-all">{{ .ConfirmationURL }}</a>`);

async function page({ preview, title, body, action = "", after = "" }) {
  const card = await box({ top: C.white, outer: C.bg, s: 16, pad: "10px 28px", inner: `<h1 style="margin:0 0 14px;font:700 26px/1.2 ${HEAD};color:${C.ink}">${title}</h1><div style="font:400 16px/1.55 ${BODY};color:${C.ink2}">${body}${action}${after}</div>` });
  return `<!doctype html>
<html lang="pt-PT">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1">
<meta name="color-scheme" content="light">
<title>${title}</title>
<link href="https://fonts.googleapis.com/css2?family=Chakra+Petch:wght@600;700&family=Figtree:wght@400;600&display=swap" rel="stylesheet">
</head>
<body style="margin:0;padding:0;background:${C.bg}">
<div style="display:none;max-height:0;overflow:hidden;opacity:0">${preview}</div>
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:${C.bg}"><tr><td align="center" style="padding:32px 16px">
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="max-width:520px">
    <tr><td style="padding:0 4px 18px">${await wordmark()}</td></tr>
    <tr><td>${card}</td></tr>
    <tr><td style="padding:18px 4px 0;font:400 12px/1.5 ${BODY};color:${C.ink3}">Recebeste este e-mail porque foi usado o endereço {{ .Email }} no NOOBrain. Se não reconheces isto, podes ignorá-lo.<br>NOOBrain por NOOBjects &middot; <a href="{{ .SiteURL }}" style="color:${C.ink3}">{{ .SiteURL }}</a></td></tr>
  </table>
</td></tr></table>
</body>
</html>
`;
}

const emails = {
  "confirmar-conta": { subject: "Confirma a tua conta no NOOBrain", quando: "Confirm signup", make: async () => page({ preview: "Falta só um passo para ativares a tua conta.", title: "Falta só um passo", body: p("Carrega no botão para confirmares o teu e-mail e ativares a conta no NOOBrain. Depois, o teu progresso acompanha-te em qualquer aparelho."), action: await button("{{ .ConfirmationURL }}", "Confirmar e-mail"), after: fallback + small("Se não foste tu, ignora esta mensagem.") }) },
  "convite": { subject: "Foste convidado(a) para o NOOBrain", quando: "Invite user", make: async () => page({ preview: "Aceita o convite e começa a aprender.", title: "Tens um convite", body: p("Foste convidado(a) para o NOOBrain, a app que transforma qualquer tema numa trilha de aprendizagem com lições, cartões e testes."), action: await button("{{ .ConfirmationURL }}", "Aceitar convite"), after: fallback }) },
  "link-magico": { subject: "O teu link para entrar no NOOBrain", quando: "Magic link", make: async () => page({ preview: "Entra no NOOBrain com um só clique.", title: "Entra com um clique", body: p("Carrega no botão para iniciares sessão no NOOBrain. Não precisas de palavra-passe."), action: await button("{{ .ConfirmationURL }}", "Iniciar sessão"), after: fallback + small("O link expira dentro de pouco tempo e só funciona uma vez. Se não pediste este e-mail, ignora-o.") }) },
  "mudar-email": { subject: "Confirma o teu novo e-mail no NOOBrain", quando: "Change email address", make: async () => page({ preview: "Confirma a mudança de endereço de e-mail.", title: "Confirma o novo e-mail", body: p("Pediste para mudar o e-mail da tua conta de <b>{{ .Email }}</b> para <b>{{ .NewEmail }}</b>. Carrega no botão para confirmares."), action: await button("{{ .ConfirmationURL }}", "Confirmar novo e-mail"), after: fallback + (await warn("Não pediste esta mudança? Ignora este e-mail e a conta fica como está.")) }) },
  "recuperar-palavra-passe": { subject: "Cria uma palavra-passe nova no NOOBrain", quando: "Reset password", make: async () => page({ preview: "Escolhe uma palavra-passe nova para a tua conta.", title: "Palavra-passe nova", body: p("Carrega no botão para escolheres uma palavra-passe nova. O link expira dentro de pouco tempo."), action: await button("{{ .ConfirmationURL }}", "Criar palavra-passe nova"), after: fallback + small("Se não pediste isto, ignora esta mensagem: a tua palavra-passe não muda.") }) },
  "confirmar-identidade": { subject: "O teu código de confirmação do NOOBrain", quando: "Reauthentication", make: async () => page({ preview: "O teu código: {{ .Token }}", title: "Confirma que és tu", body: p("Para continuares, escreve este código no NOOBrain:"), action: await code("{{ .Token }}"), after: small("O código expira dentro de pouco tempo. Não o partilhes com ninguém: nós nunca o pedimos.") }) },
  "palavra-passe-alterada": { subject: "A tua palavra-passe do NOOBrain foi alterada", quando: "Password changed (notificação de segurança)", make: async () => page({ preview: "A palavra-passe da tua conta foi alterada.", title: "Palavra-passe alterada", body: p("A palavra-passe da conta <b>{{ .Email }}</b> acabou de ser alterada."), after: await warn("Não foste tu? Usa «Esqueci-me da palavra-passe» no NOOBrain para recuperares a conta já.") }) },
  "email-alterado": { subject: "O e-mail da tua conta do NOOBrain foi alterado", quando: "Email address changed (notificação de segurança)", make: async () => page({ preview: "O e-mail da tua conta foi alterado.", title: "E-mail alterado", body: p("O e-mail da tua conta mudou de <b>{{ .OldEmail }}</b> para <b>{{ .Email }}</b>."), after: await warn("Não foste tu? Responde a quem gere o NOOBrain o mais depressa possível.") }) },
};

let readme = "# E-mails do Supabase\n\nTemplates em português de Portugal, com a identidade NOOB (cantos chanfrados a 45°, fonte Chakra Petch). Para usar: Supabase → Authentication → Emails (Templates). Cola o **assunto** e o **HTML** de cada um no modelo indicado.\n\n| Ficheiro | Modelo no Supabase | Assunto |\n|---|---|---|\n";
for (const [name, e] of Object.entries(emails)) {
  writeFileSync(`emails/${name}.html`, await e.make());
  readme += `| \`${name}.html\` | ${e.quando} | ${e.subject} |\n`;
}
readme += "\nAs variáveis `{{ .ConfirmationURL }}`, `{{ .Token }}`, `{{ .SiteURL }}`, `{{ .Email }}`, `{{ .NewEmail }}` e `{{ .OldEmail }}` são do Supabase: não as mexas. Os dois últimos modelos são notificações de segurança e só aparecem se estiverem ativadas no painel.\n\n## Como foram feitos\n\n- Os cantos chanfrados são imagens pequenas em `public/email/`, servidas por `https://noobrain.vercel.app/email/`. Só aparecem depois de o site ser publicado. Se o cliente de e-mail bloquear imagens, os cantos ficam retos e tudo continua legível.\n- A fonte Chakra Petch só carrega em clientes que o permitem (Apple Mail, iOS e outros). O Gmail e o Outlook usam Arial. O logótipo do cabeçalho é uma imagem e mantém sempre a fonte certa.\n- Para refazer tudo: `FONT=caminho/ChakraPetch-Bold.ttf node emails/gen.mjs`.\n";
writeFileSync("emails/README.md", readme);
console.log("ok", made.size, "cantos");
