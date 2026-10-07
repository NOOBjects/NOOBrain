// Fase 8: troféus do ranking semanal (pódio, perfil, celebração uma vez, conquistas). Uso: node tests/e2e/fase8-trofeus.cjs
const assert = require("assert");
const fs = require("fs");
const { launch, session, BASE } = require("./lib.cjs");
fs.mkdirSync(`${__dirname}/out`, { recursive: true });
const MOCK = process.env.E2E_MOCK || "http://localhost:54321";
const H = { authorization: "Bearer mock", apikey: "mock", "content-type": "application/json" };
const put = (t, rows) => fetch(`${MOCK}/rest/v1/${t}`, { method: "POST", headers: H, body: JSON.stringify(rows) });
const UID = "11111111-1111-4111-8111-111111111111", ANA = "22222222-2222-4222-8222-222222222222", JOAO = "33333333-3333-4333-8333-333333333333";
function weekStart(d = new Date()) {
  const p = Object.fromEntries(new Intl.DateTimeFormat("en-CA", { timeZone: "Europe/Lisbon", year: "numeric", month: "2-digit", day: "2-digit" }).formatToParts(d).map((x) => [x.type, x.value]));
  const x = new Date(Date.UTC(+p.year, +p.month - 1, +p.day)); x.setUTCDate(x.getUTCDate() - ((x.getUTCDay() + 6) % 7)); return x.toISOString().slice(0, 10);
}
const last = weekStart(new Date(Date.now() - 7 * 86400000));
const clear = async (p) => { for (let i = 0; i < 4 && (await p.locator("dialog[open]").count()); i++) { await p.keyboard.press("Escape"); await p.waitForTimeout(300); } };
(async () => {
  const b = await launch();
  for (const [name, w, h, dark] of [["tel", 390, 844, false], ["pc-escuro", 1280, 900, true]]) {
    const { p } = await session(b, { w, h, dark, progress: "p-rich" });
    await put("weekly_awards", [
      { week_start: last, user_id: ANA, place: 1, xp: 640 }, { week_start: last, user_id: UID, place: 2, xp: 410 }, { week_start: last, user_id: JOAO, place: 3, xp: 220 },
      { week_start: last, user_id: "44444444-4444-4444-8444-444444444444", place: 7, xp: 90 },
    ]);
    await p.addStyleTag({ content: "nextjs-portal{display:none!important}" });
    // celebração ao abrir o app (a janela de boas-vindas/novidades fecha-se antes)
    await p.goto(`${BASE}/`, { waitUntil: "networkidle" }); await p.waitForTimeout(1200);
    const dlg = p.locator("dialog[open]", { hasText: "2.º lugar" });
    assert(await dlg.count(), "janela de troféu aberta");
    assert(/Ranking da semana/i.test(await dlg.innerText()), "janela do ranking");
    await p.screenshot({ path: `${__dirname}/out/f8-celebracao-${name}.png` });
    await dlg.getByRole("button", { name: "Continuar" }).click(); await p.waitForTimeout(500);
    // não volta a celebrar
    await p.reload({ waitUntil: "networkidle" }); await p.waitForTimeout(1200);
    assert(!(await p.locator("dialog[open]", { hasText: "2.º lugar" }).count()), "celebra só uma vez");
    // conquistas novas: Pódio e Top 10
    const st = await p.evaluate(() => JSON.parse(localStorage.getItem("noobrain:v2")));
    assert.equal(st.awardsSeen, last, "awardsSeen gravado");
    assert(st.badges.podio && st.badges.top10, "conquistas Pódio e Top 10");
    // ranking: pódio da semana passada
    await clear(p);
    await p.goto(`${BASE}/?v=ranking`, { waitUntil: "networkidle" }); await p.waitForTimeout(900); await clear(p);
    assert.equal(await p.locator(".podium li").count(), 3, "pódio com 3 lugares");
    assert(/Pódio da semana passada/i.test(await p.locator(".podium-wrap").innerText()), "título do pódio");
    assert(await p.locator(".podium .cup.p1").count() && await p.locator(".podium .cup.p2").count() && await p.locator(".podium .cup.p3").count(), "ouro, prata e bronze");
    await p.screenshot({ path: `${__dirname}/out/f8-podio-${name}.png`, fullPage: true });
    // perfil: linha de troféus
    await p.goto(`${BASE}/?v=perfil`, { waitUntil: "networkidle" }); await p.waitForTimeout(800); await clear(p);
    assert(await p.locator(".trophy-line .cup.p2").count(), "troféu de prata no perfil");
    await p.screenshot({ path: `${__dirname}/out/f8-perfil-${name}.png`, fullPage: true });
    await p.close();
  }
  await b.close();
  console.log("fase8-trofeus OK");
})().catch((e) => { console.error("FALHOU:", e.message); process.exit(1); });
