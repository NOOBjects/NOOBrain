// Fase 5: separadores das Ideias, estados a cores, pedir revisão. Uso: node tests/e2e/fase5-ideias.cjs
const assert = require("assert");
const fs = require("fs");
const { launch, session, BASE } = require("./lib.cjs");
fs.mkdirSync(`${__dirname}/out`, { recursive: true });
const clear = async (p) => { for (let i = 0; i < 4 && (await p.locator("dialog[open]").count()); i++) { await p.keyboard.press("Escape"); await p.waitForTimeout(300); } };
const titles = (p) => p.locator(".idea-main > .row-between > b").allInnerTexts();
(async () => {
  const b = await launch();
  for (const [name, w, h, dark] of [["tel", 390, 844, false], ["pc", 1280, 900, true]]) {
    await fetch((process.env.E2E_MOCK || "http://localhost:54321") + "/__reset");
    const { p, ctx } = await session(b, { w, h, dark, progress: "p-rich" });
    await clear(p);
    await p.addStyleTag({ content: "nextjs-portal{display:none!important}" });
    await p.goto(`${BASE}/?v=ideias`, { waitUntil: "networkidle" }); await p.waitForTimeout(800); await clear(p);
    const tab = async (label) => { await p.getByRole("button", { name: label, exact: true }).click(); await p.waitForTimeout(300); return titles(p); };

    const top = await titles(p);
    assert.deepEqual(top, ["Ouvir as lições em voz alta", "Modo escuro mais escuro", "Modo sem limites", "Mais temas de história", "Ideia antiga ainda recebida"], "Populares: só abertas, por votos: " + top);
    const nw = await tab("Novas");
    assert.deepEqual(nw, ["Mais temas de história"], "Novas: só recebidas dos últimos 30 dias: " + nw);
    const way = await tab("A caminho");
    assert.deepEqual(way, ["Ouvir as lições em voz alta", "Modo escuro mais escuro"], "A caminho: em curso primeiro: " + way);
    const done = await tab("Feitas");
    assert.deepEqual(done, ["Instalar no telemóvel"], "Feitas");
    const no = await tab("Recusadas");
    assert.deepEqual(no.sort(), ["Anúncios no app", "Modo sem limites", "Pagar para ter mais lições"].sort(), "Recusadas inclui as em recurso: " + no);
    assert.equal(await p.locator(".pane.is-wrong").count(), 2, "recusadas a vermelho (cartão inteiro)");
    assert.equal(await p.locator(".vote.static").count(), 2, "recusadas só mostram o número, sem botão de voto");
    assert(await p.getByText("Porquê:").count() >= 2, "Porquê: resposta");
    assert(await p.getByText("Pedido de revisão do autor").count(), "em recurso mostra o pedido");
    assert.equal(await p.getByRole("button", { name: "Pedir revisão" }).count(), 1, "só o autor da recusada vê Pedir revisão");
    await p.screenshot({ path: `${__dirname}/out/f5-recusadas-${name}.png`, fullPage: true });
    for (const t of ["Populares", "Feitas"]) { await p.getByRole("button", { name: t, exact: true }).click(); await p.waitForTimeout(200); }
    await p.screenshot({ path: `${__dirname}/out/f5-feitas-${name}.png`, fullPage: true });
    await ctx.close();
  }
  // pedir revisão (muda a base falsa, por isso só no fim)
  {
    const { p, ctx } = await session(b, { progress: "p-rich" });
    await clear(p);
    await p.goto(`${BASE}/?v=ideias`, { waitUntil: "networkidle" }); await p.waitForTimeout(800); await clear(p);
      await p.getByRole("button", { name: "Recusadas", exact: true }).click();
      await p.getByRole("button", { name: "Pedir revisão" }).click();
      const send = p.getByRole("button", { name: "Enviar pedido" });
      assert(await send.isDisabled(), "pedido curto desativado");
      await p.locator("textarea[id^=ap]").fill("Acho que ajudava a pagar o servidor.");
      await send.click();
      await p.waitForTimeout(800);
    assert(!(await p.getByRole("button", { name: "Pedir revisão" }).count()), "o botão desaparece");
      assert(await p.getByText("O teu pedido de revisão").count(), "mostra o pedido ao autor");
      assert(await p.locator(".chip.st-recurso", { hasText: "Em recurso" }).count() >= 2, "Em recurso");
    assert(/Pedido enviado/.test(await p.locator(".toast").innerText()), "aviso");
    // painel: filtro Recursos mostra os pedidos
    await p.goto(`${BASE}/?v=admin`, { waitUntil: "networkidle" }); await clear(p);
    await p.getByRole("tab", { name: "Ideias" }).click();
    await p.getByRole("button", { name: /Recursos \(/ }).click();
    await p.waitForTimeout(300);
    assert(await p.getByText("Pedido de revisão do autor:").count() >= 1, "painel mostra o pedido de revisão");
    await p.screenshot({ path: `${__dirname}/out/f5-admin.png`, fullPage: true });
    await ctx.close();
  }
  console.log("fase5-ideias OK");
  await b.close();
})().catch((e) => { console.error("FALHOU:", e.message); process.exit(1); });
