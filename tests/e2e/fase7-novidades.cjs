// Fase 7: Novidades com marcos/correções, filtros e aviso de beta antes de entrar. Uso: node tests/e2e/fase7-novidades.cjs
const assert = require("assert");
const fs = require("fs");
const { launch, session, BASE } = require("./lib.cjs");
fs.mkdirSync(`${__dirname}/out`, { recursive: true });
const clear = async (p) => { for (let i = 0; i < 4 && (await p.locator("dialog[open]").count()); i++) { await p.keyboard.press("Escape"); await p.waitForTimeout(300); } };
(async () => {
  const b = await launch();
  for (const [name, w, h, dark] of [["tel", 390, 844, false], ["pc-escuro", 1280, 900, true]]) {
    const { p } = await session(b, { w, h, dark, progress: "p-rich" });
    await clear(p);
    await p.addStyleTag({ content: "nextjs-portal{display:none!important}" });
    await p.goto(`${BASE}/?v=novidades`, { waitUntil: "networkidle" }); await p.waitForTimeout(600);
    const all = await p.locator(".release").count();
    assert(all >= 15, "todas as versões: " + all);
    assert.equal(await p.locator(".release.marco").count(), 1, "um marco (0.10)");
    assert(/Destaques/i.test(await p.locator(".release.marco").innerText()) && /grande atualização/i.test(await p.locator(".release.marco").innerText()), "marco em destaque");
    assert.equal(await p.locator(".release.fix").count(), 1, "uma versão só de correções");
    assert.equal(await p.locator(".release.fix details[open]").count(), 0, "correções fechadas");
    await p.locator(".release.fix summary").click();
    assert.equal(await p.locator(".release.fix details[open]").count(), 1, "abrem ao tocar");
    // filtros
    await p.locator(".news .topic-chips button", { hasText: /^Marcos$/ }).click();
    assert.equal(await p.locator(".release").count(), 1);
    await p.locator(".news .topic-chips button", { hasText: /^Correções$/ }).click();
    assert.equal(await p.locator(".release").count(), 1);
    await p.locator(".news .topic-chips button", { hasText: /^Novidades$/ }).click();
    assert.equal(await p.locator(".release").count(), all - 2);
    await p.locator(".news .topic-chips button", { hasText: /^Tudo$/ }).click();
    assert.equal(await p.locator(".release").count(), all);
    await p.locator(".release.marco").scrollIntoViewIfNeeded();
    await p.screenshot({ path: `${__dirname}/out/f7-marco-${name}.png` });
    await p.close();
  }
  // aviso de beta antes de entrar: o botão «Entrar» tem de se ver sem rolar no telemóvel
  const ctx = await b.newContext({ viewport: { width: 390, height: 844 }, deviceScaleFactor: 2 });
  const p = await ctx.newPage();
  await p.goto(`${BASE}/`, { waitUntil: "networkidle" }); await p.waitForTimeout(600);
  assert(/versão beta/i.test(await p.locator(".beta-note").innerText()), "aviso de beta");
  const box = await p.locator(".account-form button[type=submit]").first().boundingBox();
  assert(box && box.y + box.height <= 844, `botão Entrar visível sem rolar (fundo em ${box && Math.round(box.y + box.height)})`);
  await p.screenshot({ path: `${__dirname}/out/f7-entrada.png` });
  await p.getByRole("button", { name: "Criar conta", exact: true }).first().click(); await p.waitForTimeout(400);
  assert(await p.locator(".beta-note").count(), "também em Criar conta");
  await ctx.close(); await b.close();
  console.log("fase7-novidades OK");
})().catch((e) => { console.error("FALHOU:", e.message); process.exit(1); });
