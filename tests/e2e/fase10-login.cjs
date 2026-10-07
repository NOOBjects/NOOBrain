// Fase 10: Apple e Discord preparados e desligados. Uso:
//   node tests/e2e/fase10-login.cjs off   (dev normal: nenhum botão social)
//   node tests/e2e/fase10-login.cjs on    (dev com NEXT_PUBLIC_GOOGLE_LOGIN=1 NEXT_PUBLIC_APPLE_LOGIN=1 NEXT_PUBLIC_DISCORD_LOGIN=1)
const assert = require("assert");
const fs = require("fs");
const { launch, BASE } = require("./lib.cjs");
fs.mkdirSync(`${__dirname}/out`, { recursive: true });
(async () => {
  const mode = process.argv[2] === "on" ? "on" : "off";
  const b = await launch();
  const ctx = await b.newContext({ viewport: { width: 390, height: 844 }, deviceScaleFactor: 2 });
  const p = await ctx.newPage();
  await p.goto(`${BASE}/`, { waitUntil: "networkidle" }); await p.waitForTimeout(600);
  if (mode === "off") {
    assert.equal(await p.locator("[data-provider]").count(), 0, "sem variáveis, nenhum botão social");
    console.log("fase10-login (desligado) OK");
  } else {
    for (const id of ["google", "apple", "discord"]) assert.equal(await p.locator(`[data-provider=${id}]`).count(), 1, `botão ${id}`);
    assert(/Continuar com a Apple/i.test(await p.locator("[data-provider=apple]").innerText()), "texto da Apple");
    await p.screenshot({ path: `${__dirname}/out/f10-botoes.png`, fullPage: true });
    for (const id of ["discord", "apple"]) {
      const [popup] = await Promise.all([ctx.waitForEvent("page"), p.locator(`[data-provider=${id}]`).click()]);
      await popup.waitForURL(/authorize/, { timeout: 8000 }).catch(() => {});
      const url = popup.url();
      assert(url.includes("/auth/v1/authorize") && url.includes(`provider=${id}`), `pedido ao Supabase com provider=${id}: ${url}`);
      await popup.close(); await p.waitForTimeout(300);
    }
    console.log("fase10-login (ligado) OK");
  }
  await b.close();
})().catch((e) => { console.error("FALHOU:", e.message); process.exit(1); });
