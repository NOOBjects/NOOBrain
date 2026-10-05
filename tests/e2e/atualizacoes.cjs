// Avisos de atualização: nova versão da app e trilhas desatualizadas. Uso: NEXT_PUBLIC_BUILD=abc node tests/e2e/atualizacoes.cjs (Supabase falso + next dev com a mesma variável)
const assert = require("assert");
const fs = require("fs");
const { launch, session, BASE } = require("./lib.cjs");
const MOCK = process.env.E2E_MOCK || "http://localhost:54321";
fs.mkdirSync(`${__dirname}/out`, { recursive: true });
const clear = async (p) => { for (let i = 0; i < 4 && (await p.locator("dialog[open]").count()); i++) { await p.keyboard.press("Escape"); await p.waitForTimeout(300); } };
(async () => {
  await fetch(`${MOCK}/rest/v1/catalog_trails?key=eq.fotossintese`, { method: "PATCH", headers: { "content-type": "application/json" }, body: JSON.stringify({ rev: 0 }) });
  const b = await launch();
  for (const [name, w, h, dark] of [["tel", 390, 844, false], ["pc", 1280, 900, true]]) {
    const { p, ctx } = await session(b, { w, h, dark, progress: "p-rich" });
    await clear(p);
    await p.addStyleTag({ content: "nextjs-portal{display:none!important}" });
    // sem novidades: nenhum aviso de atualização
    assert(!(await p.getByText("Há uma nova versão do NOOBrain").count()), "sem aviso quando a versão é a mesma");
    assert(!(await p.getByText(/trilha desatualizada/).count()), "sem trilhas desatualizadas");

    // nova versão da app: o servidor responde com outra "build"
    await p.route("**/api/version", (r) => r.fulfill({ json: { build: "outra-build" } }));
    await p.evaluate(() => document.dispatchEvent(new Event("visibilitychange")));
    await p.waitForSelector("text=Há uma nova versão do NOOBrain", { timeout: 5000 });
    await p.screenshot({ path: `${__dirname}/out/upd-app-${name}.png` });
    await p.unroute("**/api/version");

    // trilha desatualizada: o dono subiu a versão do conteúdo no catálogo
    await fetch(`${MOCK}/rest/v1/catalog_trails?key=eq.fotossintese`, { method: "PATCH", headers: { "content-type": "application/json" }, body: JSON.stringify({ rev: 2 }) });
    await p.goto(`${BASE}/`, { waitUntil: "networkidle" }); await p.waitForTimeout(800); await clear(p);
    await p.waitForSelector("text=Há uma trilha desatualizada", { timeout: 5000 });
    const before = await p.evaluate(() => { const t = JSON.parse(localStorage.getItem("noobrain:v2")).trails[0]; return { done: t.done, rev: t.rev ?? 0 }; });
    await p.screenshot({ path: `${__dirname}/out/upd-trilha-${name}.png` });
    await p.getByRole("button", { name: "Atualizar agora" }).first().click();
    await p.waitForTimeout(1000);
    const after = await p.evaluate(() => { const t = JSON.parse(localStorage.getItem("noobrain:v2")).trails[0]; return { done: t.done, rev: t.rev, lessons: t.concepts.filter((c) => c.lesson).length }; });
    assert.equal(after.rev, 2, "rev atualizado");
    assert.equal(after.done, before.done, "o progresso fica");
    assert.equal(after.lessons, 0, "lições voltam a vir do catálogo");
    assert(!(await p.getByText(/trilha desatualizada/).count()), "aviso desaparece");
    await fetch(`${MOCK}/rest/v1/catalog_trails?key=eq.fotossintese`, { method: "PATCH", headers: { "content-type": "application/json" }, body: JSON.stringify({ rev: 0 }) });
    await ctx.close();
  }
  console.log("atualizacoes OK");
  await b.close();
})().catch((e) => { console.error("FALHOU:", e.message); process.exit(1); });
