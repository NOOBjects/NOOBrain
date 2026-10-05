// Fase 3: níveis, línguas em pausa, categorias. Uso: node tests/e2e/fase3-niveis.cjs (Supabase falso + next dev)
const assert = require("assert");
const fs = require("fs");
const { launch, session, BASE } = require("./lib.cjs");
fs.mkdirSync(`${__dirname}/out`, { recursive: true });
const clear = async (p) => { for (let i = 0; i < 4 && (await p.locator("dialog[open]").count()); i++) { await p.keyboard.press("Escape"); await p.waitForTimeout(300); } };
(async () => {
  const b = await launch();
  for (const [name, w, h, dark] of [["tel", 390, 844, false], ["pc", 1280, 900, true]]) {
    const { p, ctx } = await session(b, { w, h, dark, progress: "p-rich" });
    await clear(p);
    await p.addStyleTag({ content: "nextjs-portal{display:none!important}" });

    // Novo tema: 3 níveis com frase, línguas em pausa
    await p.goto(`${BASE}/?v=novo`, { waitUntil: "networkidle" }); await clear(p);
    const lv = await p.locator(".seg button").allInnerTexts();
    assert.deepEqual(lv.map((x) => x.trim().toLowerCase()), ["iniciante", "intermédio", "avançado"], "3 níveis");
    await p.locator(".seg button", { hasText: "Intermédio" }).click();
    assert(await p.getByText("Já sabes o básico e queres perceber como funciona.").count(), "frase do nível");
    await p.fill("#topic", "Inglês para iniciantes");
    await p.locator("button[type=submit]").click();
    await p.waitForTimeout(400);
    assert(await p.getByText("Aprender línguas está em pausa").count(), "recusa de línguas no navegador");
    await p.screenshot({ path: `${__dirname}/out/f3-novo-${name}.png`, fullPage: true });

    // Explorar: sem Inglês, sem a categoria Línguas
    await p.goto(`${BASE}/?v=explorar`, { waitUntil: "networkidle" }); await clear(p);
    await p.waitForTimeout(600);
    const txt = await p.locator(".explore").innerText();
    assert(!/Inglês/i.test(txt), "Explorar sem Inglês");
    assert(!/Línguas/.test(txt), "sem chip Línguas");
    assert(/Fotossíntese/.test(txt), "Explorar mostra os outros temas");
    await p.screenshot({ path: `${__dirname}/out/f3-explorar-${name}.png`, fullPage: true });
    await ctx.close();
  }

  // trilha concluída: cartão do próximo nível
  {
    const { p, ctx } = await session(b, { progress: "p-done" });
    await clear(p);
    await p.waitForTimeout(500);
    const t = await p.locator(".app").innerText();
    assert(/Próximo nível: Intermédio/.test(t), "cartão do próximo nível");
    await p.screenshot({ path: `${__dirname}/out/f3-proximo.png`, fullPage: true });
    await ctx.close();
  }

  // /temas/<língua> dá 404 e a lista não a mostra
  const r = await fetch(`${BASE}/temas/ingles-para-iniciantes`);
  assert.equal(r.status, 404, `/temas/ingles-para-iniciantes -> ${r.status}`);
  const l = await (await fetch(`${BASE}/`)).text();
  assert(!/ingles-para-iniciantes/.test(l), "landing sem a língua");
  console.log("fase3-niveis OK");
  await b.close();
})().catch((e) => { console.error("FALHOU:", e.message); process.exit(1); });
