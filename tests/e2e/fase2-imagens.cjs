// Gera as imagens do manifesto (ícone maskable e capturas) em public/. Uso: node tests/e2e/fase2-imagens.cjs (servidores a correr).
const fs = require("fs");
const path = require("path");
const { launch, session } = require("./lib.cjs");
const PUB = path.join(__dirname, "../../public");
(async () => {
  const b = await launch();
  // ícone maskable: o ícone com 20 % de margem sobre o azul da marca
  const svg = fs.readFileSync(path.join(__dirname, "../../app/icon.svg"), "utf8").replace("<svg ", '<svg width="100%" height="100%" ');
  const ic = await b.newPage({ viewport: { width: 512, height: 512 } });
  await ic.setContent(`<body style="margin:0;background:#005fd9;display:grid;place-items:center;height:100vh"><div style="width:60%;height:60%">${svg}</div></body>`);
  await ic.screenshot({ path: path.join(PUB, "icon-maskable-512.png") });
  // capturas: trilha do Supabase falso, tema claro (1080x1920 e 1920x1080)
  for (const [name, w, h, scale] of [["shot-phone", 360, 640, 3], ["shot-wide", 960, 540, 2]]) {
    const { p, ctx } = await session(b, { w, h, progress: "p-rich" });
    await p.addStyleTag({ content: "nextjs-portal{display:none!important}" });
    await p.close(); await ctx.close();
    const c2 = await b.newContext({ viewport: { width: w, height: h }, deviceScaleFactor: scale, colorScheme: "light" });
    const pg = await c2.newPage();
    await pg.goto(require("./lib.cjs").BASE + "/", { waitUntil: "networkidle" });
    await pg.fill("input[type=email]", "teste@noobrain.local");
    await pg.fill("input[type=password]", "teste1234");
    await pg.locator("form button[type=submit]").first().click();
    await pg.waitForTimeout(3000);
    const close = pg.getByRole("button", { name: "Fechar" });
    if (await close.count()) { await close.first().click(); await pg.waitForTimeout(500); }
    await pg.addStyleTag({ content: "nextjs-portal{display:none!important}" });
    await pg.screenshot({ path: path.join(PUB, `${name}.png`) });
    await c2.close();
  }
  await b.close();
})();
