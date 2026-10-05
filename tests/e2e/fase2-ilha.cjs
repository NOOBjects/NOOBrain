// Fase 2.1/2.3/2.4: a ilha não se mexe, tem 4 botões e a gaveta; instalar; dar opinião.
// Uso: node tests/e2e/fase2-ilha.cjs   (Supabase falso + next dev a correr)
const assert = require("assert");
const fs = require("fs");
const { launch, session, BASE } = require("./lib.cjs");
fs.mkdirSync(`${__dirname}/out`, { recursive: true });
const box = (p) => p.locator(".island").boundingBox();
const clear = async (p) => { for (let i = 0; i < 4 && (await p.locator("dialog[open]").count()); i++) { await p.keyboard.press("Escape"); await p.waitForTimeout(300); } };
const near = (a, b) => ["x", "y", "width", "height"].every((k) => Math.abs(a[k] - b[k]) <= 0.5);
(async () => {
  const b = await launch();
  for (const [name, w, h, dark] of [["tel", 390, 844, false], ["pc", 1280, 900, false], ["tel-escuro", 390, 844, true]]) {
    const { p, ctx } = await session(b, { w, h, dark, progress: "p-rich" });
    await clear(p);
    await p.addStyleTag({ content: "nextjs-portal{display:none!important}" });
    const boxes = [];
    for (const v of ["", "?v=explorar", "?v=revisar", "?v=perfil"]) {
      await p.goto(`${BASE}/${v}`, { waitUntil: "networkidle" });
      await p.waitForTimeout(600);
      await clear(p);
      boxes.push(await box(p));
    }
    boxes.slice(1).forEach((x) => assert(near(boxes[0], x), `${name}: a ilha mexeu-se ${JSON.stringify(boxes[0])} vs ${JSON.stringify(x)}`));
    assert.equal(await p.locator(".island .isl").count(), 4, "4 botões");
    assert.equal(await p.locator(".island .isl", { hasText: "Lição" }).count(), 0, "sem botão Lição");

    // gaveta
    const more = p.getByRole("button", { name: "Mais opções" });
    await more.click();
    await p.waitForTimeout(300);
    const rows = await p.locator("#isl-drawer .menu-row").allInnerTexts();
    console.log(name, "gaveta:", rows.join(" | "));
    assert.deepEqual(rows.map((r) => r.trim()).slice(0, 4), ["Ideias", "Ranking", "Novidades", "Dar opinião"]);
    assert(rows.some((r) => /Definições/.test(r)), "Definições");
    await p.screenshot({ path: `${__dirname}/out/f2-ilha-${name}.png` });
    await p.keyboard.press("Escape");
    assert.equal(await p.locator("#isl-drawer").count(), 0, "Escape fecha");
    assert.equal(await more.evaluate((e) => e === document.activeElement), true, "foco volta à seta");
    await more.click();
    await p.mouse.click(5, 100);
    assert.equal(await p.locator("#isl-drawer").count(), 0, "toque fora fecha");
    // cada item abre o ecrã certo
    for (const [label, v] of [["Ideias", "ideias"], ["Ranking", "ranking"], ["Novidades", "novidades"], ["Definições", "definicoes"]]) {
      await more.click();
      await p.locator("#isl-drawer .menu-row", { hasText: label }).click();
      await p.waitForTimeout(500);
      assert(p.url().includes(`v=${v}`), `${label} -> ${p.url()}`);
      assert.equal(await p.locator("#isl-drawer").count(), 0, "gaveta fecha ao escolher");
    }
    await ctx.close();
  }

  // dar opinião grava em feedback com context "menu"
  {
    const { p, ctx } = await session(b, { progress: "p-rich" });
    await clear(p);
    await p.getByRole("button", { name: "Mais opções" }).click();
    await p.locator("#isl-drawer .menu-row", { hasText: "Dar opinião" }).click();
    await p.waitForSelector("dialog[open]");
    await p.locator("dialog .rate-n").nth(3).click();
    await p.locator("dialog textarea").fill("Gosto muito.");
    await p.screenshot({ path: `${__dirname}/out/f2-opiniao.png` });
    await p.locator("dialog .btn", { hasText: "Enviar" }).click();
    await p.waitForTimeout(800);
    assert.equal(await p.locator("dialog[open]").count(), 0, "janela fecha");
    assert(/Obrigado/.test(await p.locator(".toast").innerText()), "aviso de agradecimento");
    await ctx.close();
  }

  // instalar: evento sintético no Chromium e iPhone
  {
    const { p, ctx } = await session(b, { progress: "p-rich" });
    await clear(p);
    await p.evaluate(() => { window.__prompted = 0; const e = new Event("beforeinstallprompt"); e.prompt = async () => { window.__prompted++; }; e.userChoice = Promise.resolve({ outcome: "accepted" }); window.dispatchEvent(e); });
    await p.getByRole("button", { name: "Mais opções" }).click();
    await p.locator("#isl-drawer .menu-row", { hasText: "Instalar o app" }).click();
    await p.waitForTimeout(300);
    assert.equal(await p.evaluate(() => window.__prompted), 1, "chamou prompt()");
    await ctx.close();
    for (const ua of [
      "Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.0 Mobile/15E148 Safari/604.1",
      "Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) CriOS/120.0.0.0 Mobile/15E148 Safari/604.1", // Chrome no iPhone
    ]) {
    const c2 = await b.newContext({ viewport: { width: 390, height: 844 }, userAgent: ua });
    const q = await c2.newPage();
    await q.goto(BASE + "/", { waitUntil: "networkidle" });
    await q.fill("input[type=email]", "teste@noobrain.local");
    await q.fill("input[type=password]", "teste1234");
    await q.locator("form button[type=submit]").first().click();
    await q.waitForTimeout(2500);
    await clear(q);
    await q.getByRole("button", { name: "Mais opções" }).click();
    await q.locator("#isl-drawer .menu-row", { hasText: "Instalar o app" }).click();
    await q.waitForSelector("dialog[open] .steps li");
    assert.equal(await q.locator("dialog .steps li").count(), 3, "3 passos");
    await q.screenshot({ path: `${__dirname}/out/f2-instalar-ios.png` });
    await c2.close();
    }
  }
  console.log("fase2-ilha OK");
  await b.close();
})().catch((e) => { console.error("FALHOU:", e.message); process.exit(1); });
