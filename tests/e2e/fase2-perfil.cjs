// Fase 2.6: Perfil e Definições reorganizados. Uso: node tests/e2e/fase2-perfil.cjs
const assert = require("assert");
const fs = require("fs");
const { launch, session, BASE } = require("./lib.cjs");
fs.mkdirSync(`${__dirname}/out`, { recursive: true });
const clear = async (p) => { for (let i = 0; i < 4 && (await p.locator("dialog[open]").count()); i++) { await p.keyboard.press("Escape"); await p.waitForTimeout(300); } };
(async () => {
  const b = await launch();
  for (const [name, w, h, dark] of [["tel", 390, 844, false], ["pc", 1280, 900, false], ["tel-escuro", 390, 844, true]]) {
    const { p, ctx } = await session(b, { w, h, dark, progress: "p-rich" });
    await clear(p);
    await p.addStyleTag({ content: "nextjs-portal{display:none!important}" });
    await p.goto(`${BASE}/?v=perfil`, { waitUntil: "networkidle" });
    await p.waitForTimeout(600); await clear(p);
    const txt = await p.locator(".profile").innerText();
    assert(!/Terminar sessão/.test(txt), "Perfil sem Terminar sessão");
    assert.equal(await p.locator(".profile .menu-list").count(), 0, "Perfil sem lista de atalhos");
    const order = ["Editar perfil", "Partilhar perfil", "Meta de hoje", "XP", "Conquistas", "Os teus temas"];
    const pos = order.map((t) => txt.toLowerCase().indexOf(t.toLowerCase()));
    assert(pos.every((x, i) => x >= 0 && (i === 0 || x > pos[i - 1])), `ordem do Perfil ${pos}`);
    await p.screenshot({ path: `${__dirname}/out/f2-perfil-${name}.png`, fullPage: true });

    await p.getByRole("button", { name: "Definições" }).click();
    await p.waitForTimeout(500);
    const st = await p.locator(".settings").innerText();
    for (const t of ["Estudo", "Aparência", "Privacidade", "App", "Conta", "Dados", "Equipa", "Sobre", "Normal · 30 XP", "Aparecer no ranking", "Terminar sessão", "Versão 0.10.10", "NOOBrain beta 0.10.10"]) assert(st.includes(t) || st.toUpperCase().includes(t.toUpperCase()), `Definições sem "${t}"`);
    await p.screenshot({ path: `${__dirname}/out/f2-defs-${name}.png`, fullPage: true });

    // subecrãs pelo endereço e "voltar"
    for (const s of ["meta", "avisos", "recomecar", "apagar", "sobre"]) {
      await p.goto(`${BASE}/?v=definicoes&s=${s}`, { waitUntil: "networkidle" });
      await p.waitForTimeout(400); await clear(p);
      assert(await p.getByText("← Definições").count(), `subecrã ${s}`);
    }
    if (name === "tel") {
      await p.goto(`${BASE}/?v=definicoes`, { waitUntil: "networkidle" }); await clear(p);
      await p.locator(".menu-row", { hasText: "Meta diária" }).click();
      await p.waitForTimeout(600);
      assert(p.url().includes("s=meta"), p.url());
      await p.locator(".seg button", { hasText: "Intensa" }).click();
      await p.goBack(); await p.waitForTimeout(400);
      assert(!p.url().includes("s="), "voltar regressa à lista");
      assert(/Intensa · 50 XP/.test(await p.locator(".settings").innerText()), "meta mudou");
      // tema
      await p.locator(".seg button", { hasText: "Escuro" }).click();
      assert.equal(await p.evaluate(() => document.documentElement.getAttribute("data-theme")), "dark");
      await p.locator(".seg button", { hasText: "Automático" }).click();
      // ranking
      const sw = p.getByRole("switch", { name: "Aparecer no ranking" });
      assert.equal(await sw.getAttribute("aria-checked"), "true");
      await sw.click(); await p.waitForTimeout(600);
      assert.equal(await sw.getAttribute("aria-checked"), "false", "interruptor desliga");
      await sw.click(); await p.waitForTimeout(600);
      // recomeçar
      await p.goto(`${BASE}/?v=definicoes&s=recomecar`, { waitUntil: "networkidle" }); await clear(p);
      const btn = p.locator(".btn", { hasText: "Apagar trilhas e progresso" });
      assert(await btn.isDisabled(), "desativado sem RECOMEÇAR");
      await p.fill("#reset", "RECOMEÇAR");
      assert(!(await btn.isDisabled()));
      // apagar conta
      await p.goto(`${BASE}/?v=definicoes&s=apagar`, { waitUntil: "networkidle" }); await clear(p);
      const del = p.locator(".btn.bad");
      assert(await del.isDisabled());
      await p.fill("#del", "rodrigo_teste");
      assert(!(await del.isDisabled()));
      await p.screenshot({ path: `${__dirname}/out/f2-apagar-${name}.png` });
      // terminar sessão
      await p.goto(`${BASE}/?v=definicoes`, { waitUntil: "networkidle" }); await clear(p);
      await p.locator(".menu-row", { hasText: "Terminar sessão" }).click();
      await p.waitForTimeout(1000);
      assert(await p.locator("input[type=email]").count(), "voltou ao login");
    }
    await ctx.close();
  }
  console.log("fase2-perfil OK");
  await b.close();
})().catch((e) => { console.error("FALHOU:", e.message); process.exit(1); });
