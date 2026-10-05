// Fase 4: limites diários com barras. Uso: node tests/e2e/fase4-limites.cjs (Supabase falso + next dev)
const assert = require("assert");
const fs = require("fs");
const { launch, session, BASE } = require("./lib.cjs");
fs.mkdirSync(`${__dirname}/out`, { recursive: true });
const clear = async (p) => { for (let i = 0; i < 4 && (await p.locator("dialog[open]").count()); i++) { await p.keyboard.press("Escape"); await p.waitForTimeout(300); } };
const today = new Date().toLocaleDateString("sv");
const rich = JSON.parse(fs.readFileSync(`${__dirname}/fixtures/p-rich.json`, "utf8"));
const make = (name, lessons) => fs.writeFileSync(`${__dirname}/fixtures/${name}.json`, JSON.stringify({ ...rich, daily: { day: today, lessons } }));
make("p-limit5", ["a:0", "a:1", "a:2", "a:3", "a:4"]);
make("p-limit6", ["a:0", "a:1", "a:2", "a:3", "a:4", "a:5"]);
make("p-limit6-repeat", ["a:0", "a:1", "a:2", "a:3", "a:4", "a:5"]);
(async () => {
  const b = await launch();
  for (const [name, w, h, dark] of [["tel", 390, 844, false], ["pc", 1280, 900, true]]) {
    // 5 de 6: a 6.ª lição nova abre e passa a contar; depois já não há mais
    let { p, ctx } = await session(b, { w, h, dark, progress: "p-limit5" });
    await clear(p);
    await p.addStyleTag({ content: "nextjs-portal{display:none!important}" });
    assert(/Lições novas hoje/i.test(await p.locator(".prog").innerText()) && /5 de 6/i.test(await p.locator(".prog").innerText()), "barra 5 de 6 na trilha");
    await p.screenshot({ path: `${__dirname}/out/f4-trilha-${name}.png`, fullPage: true });
    await p.goto(`${BASE}/?v=licao&c=2`, { waitUntil: "networkidle" }); await p.waitForTimeout(800); await clear(p);
    assert(!(await p.getByText("Por hoje chega de lições novas").count()), "a 6.ª lição nova abre");
    const state = await p.evaluate(() => JSON.parse(localStorage.getItem("noobrain:v2")).daily);
    assert.equal(state.lessons.length, 6, "ficou contada");
    await p.goto(`${BASE}/?v=licao&c=2`, { waitUntil: "networkidle" }); await p.waitForTimeout(600); await clear(p);
    assert(!(await p.getByText("Por hoje chega de lições novas").count()), "voltar à mesma lição continua a abrir");
    await ctx.close();

    // 6 de 6 (outra lição): descanso
    ({ p, ctx } = await session(b, { w, h, dark, progress: "p-limit6" }));
    await clear(p);
    await p.addStyleTag({ content: "nextjs-portal{display:none!important}" });
    await p.goto(`${BASE}/?v=licao&c=2`, { waitUntil: "networkidle" }); await p.waitForTimeout(800); await clear(p);
    assert(await p.getByText("Por hoje chega de lições novas").count(), "descanso à 7.ª");
    assert(await p.getByRole("button", { name: "Rever cartões" }).count(), "botão Rever cartões");
    await p.screenshot({ path: `${__dirname}/out/f4-descanso-${name}.png` });
    // repetir uma lição já feita abre sempre
    await p.goto(`${BASE}/?v=licao&c=0`, { waitUntil: "networkidle" }); await p.waitForTimeout(800); await clear(p);
    assert(!(await p.getByText("Por hoje chega de lições novas").count()), "repetir lição feita abre");
    // Perfil: as duas barras; Novo tema com 3 de 3
    await p.route("**/api/quota", (r) => r.fulfill({ json: { trail: { used: 3, max: 3 }, lesson: { used: 0, max: 25 } } }));
    await p.goto(`${BASE}/?v=perfil`, { waitUntil: "networkidle" }); await p.waitForTimeout(800); await clear(p);
    const pt = await p.locator(".goal-box").innerText();
    assert(/Lições novas hoje/i.test(pt) && /Temas novos com IA hoje/i.test(pt) && /Completo por hoje/i.test(pt), "barras no Perfil");
    await p.screenshot({ path: `${__dirname}/out/f4-perfil-${name}.png`, fullPage: true });
    await p.goto(`${BASE}/?v=novo`, { waitUntil: "networkidle" }); await p.waitForTimeout(800); await clear(p);
    assert(await p.getByRole("button", { name: "Explorar temas prontos" }).count(), "3 de 3: Explorar temas prontos");
    assert.equal(await p.locator("#topic").isVisible(), false, "formulário desativado");
    await p.screenshot({ path: `${__dirname}/out/f4-novo-${name}.png`, fullPage: true });
    await ctx.close();
  }
  console.log("fase4-limites OK");
  await b.close();
})().catch((e) => { console.error("FALHOU:", e.message); process.exit(1); });
