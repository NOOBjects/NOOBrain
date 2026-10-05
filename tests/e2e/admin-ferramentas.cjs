// Ferramentas do dono no painel. Uso: node tests/e2e/admin-ferramentas.cjs (Supabase falso + next dev com ADMIN_IDS = conta de teste)
const assert = require("assert");
const fs = require("fs");
const { launch, session, BASE } = require("./lib.cjs");
fs.mkdirSync(`${__dirname}/out`, { recursive: true });
const clear = async (p) => { for (let i = 0; i < 4 && (await p.locator("dialog[open]").count()); i++) { await p.keyboard.press("Escape"); await p.waitForTimeout(300); } };
(async () => {
  const b = await launch();
  const { p, ctx } = await session(b, { progress: "p-limit6" });
  await clear(p);
  await p.addStyleTag({ content: "nextjs-portal{display:none!important}" });
  await p.goto(`${BASE}/?v=admin`, { waitUntil: "networkidle" }); await clear(p);
  await p.getByRole("tab", { name: "Ferramentas" }).click();
  await p.waitForTimeout(500);
  const txt = await p.locator(".admin").innerText();
  assert(/Temas 0 de 3/i.test(txt), "uso de hoje " + txt.slice(0, 200));
  await p.screenshot({ path: `${__dirname}/out/admin-ferramentas.png`, fullPage: true });

  // "Testar como pessoa normal" liga o cabeçalho nos pedidos
  await p.getByRole("switch", { name: "Testar como pessoa normal" }).click();
  assert.equal(await p.evaluate(() => localStorage.getItem("noobrain:testlimits")), "1");
  const seen = p.waitForRequest((r) => r.url().includes("/api/admin") && r.method() === "POST");
  await p.getByRole("button", { name: "Repor o meu uso de IA" }).click();
  assert.equal((await seen).headers()["x-noobrain-limits"], "on", "cabeçalho dos limites");
  await p.waitForTimeout(500);
  assert(/foi reposto/i.test(await p.locator(".admin").innerText()), "mensagem de reposição");

  // repor as lições novas limpa a contagem do dia
  assert((await p.evaluate(() => JSON.parse(localStorage.getItem("noobrain:v2")).daily?.lessons?.length)) >= 6);
  await p.getByRole("button", { name: "Repor as lições novas" }).click();
  await p.waitForTimeout(300);
  assert.equal(await p.evaluate(() => JSON.parse(localStorage.getItem("noobrain:v2")).daily?.lessons?.length ?? 0), 0, "lições repostas");

  // glossário: acrescentar e apagar uma palavra
  await p.getByLabel("Palavra do Brasil").fill("bagulho");
  await p.getByLabel("Palavra de Portugal").fill("coisa");
  await p.getByRole("button", { name: "Acrescentar ao glossário" }).click();
  await p.waitForSelector("text=bagulho →", { timeout: 3000 });
  await p.locator(".gloss li", { hasText: "bagulho" }).getByRole("button", { name: "Apagar" }).click();
  await p.waitForTimeout(500);
  assert(!(await p.locator(".gloss li", { hasText: "bagulho" }).count()), "glossário: apagou");

  // revisão do português do catálogo
  await p.getByRole("button", { name: "Rever o catálogo" }).click();
  await p.waitForTimeout(800);
  assert(/Corrigi|catálogo/i.test(await p.locator(".admin").innerText().then((t) => t.split("\n").slice(-3).join(" "))), "mensagem do catálogo");
  await p.getByRole("switch", { name: "Testar como pessoa normal" }).click();
  assert.equal(await p.evaluate(() => localStorage.getItem("noobrain:testlimits")), null);
  console.log("admin-ferramentas OK");
  await ctx.close(); await b.close();
})().catch((e) => { console.error("FALHOU:", e.message); process.exit(1); });
