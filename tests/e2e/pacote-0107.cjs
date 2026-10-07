// 0.10.7: notificações, avisos da equipa, continuar a lição, "Em breve", frases por completar. Uso: node tests/e2e/pacote-0107.cjs
// (Supabase falso + next dev com ADMIN_IDS = conta de teste)
const assert = require("assert");
const fs = require("fs");
const { launch, session, BASE } = require("./lib.cjs");
const MOCK = process.env.E2E_MOCK || "http://localhost:54321";
fs.mkdirSync(`${__dirname}/out`, { recursive: true });
const UID = "11111111-1111-4111-8111-111111111111";
const clear = async (p) => { for (let i = 0; i < 4 && (await p.locator("dialog[open]").count()); i++) { await p.keyboard.press("Escape"); await p.waitForTimeout(300); } };
const db = async (t) => (await fetch(`${MOCK}/rest/v1/${t}`, { headers: { authorization: "Bearer mock", apikey: "mock" } })).json();
const put = (t, rows) => fetch(`${MOCK}/rest/v1/${t}`, { method: "POST", headers: { authorization: "Bearer mock", apikey: "mock", "content-type": "application/json" }, body: JSON.stringify(rows) });

(async () => {
  const b = await launch();
  for (const [name, w, h, dark] of [["tel", 390, 844, false], ["pc-escuro", 1280, 900, true]]) {
    // sem "Em breve" visto: aparece uma vez no ecrã inicial
    const { p } = await session(b, { w, h, dark, progress: "p-rich" });
    await clear(p);
    await p.addStyleTag({ content: "nextjs-portal{display:none!important}" });
    await p.goto(`${BASE}/`, { waitUntil: "networkidle" }); await p.waitForTimeout(500); await clear(p);
    // as janelas de aviso vêm uma de cada vez: fechar o que houver até ao «Em breve»
    for (let i = 0; i < 4 && !(await p.getByRole("heading", { name: "Em breve" }).count()); i++) {
      const close = p.locator(".announce .btn", { hasText: /Fechar|Agora não/ }).first();
      if (await close.count()) { await close.click(); await p.waitForTimeout(300); } else break;
    }
    assert(await p.getByRole("heading", { name: "Em breve" }).count(), "o cartão Em breve aparece no ecrã inicial");
    await p.screenshot({ path: `${__dirname}/out/p0107-soon-${name}.png`, fullPage: true });
    await p.getByRole("button", { name: "Percebi", exact: true }).click();
    await p.waitForTimeout(300);
    assert.equal(await p.getByRole("heading", { name: "Em breve" }).count(), 0, "depois de fechar não volta");
    await p.reload({ waitUntil: "networkidle" }); await p.waitForTimeout(800);
    assert.equal(await p.getByRole("heading", { name: "Em breve" }).count(), 0, "e continua fechado depois de recarregar");
    // mas fica nas Novidades
    await p.goto(`${BASE}/?v=novidades`, { waitUntil: "networkidle" }); await p.waitForTimeout(500);
    assert(await p.locator(".soon").count(), "Em breve nas Novidades");
    assert(/Versão 0\.10\.9/i.test(await p.locator(".news").innerText()), "entrada 0.10.7");
    await p.screenshot({ path: `${__dirname}/out/p0107-news-${name}.png`, fullPage: false });

    // notificações: duas na caixa, o sino mostra 2, abrir a página lê-as
    await put("inbox", [
      { user_id: UID, kind: "ideia", title: "A tua ideia foi recusada", body: "«Mais cores» · Já temos isso.", link: "?v=ideias" },
      { user_id: UID, kind: "erro", title: "O erro que reportaste foi resolvido", body: "Obrigado por avisares", link: "" },
      { user_id: "22222222-2222-4222-8222-222222222222", kind: "aviso", title: "De outra pessoa", body: "", link: "" },
    ]);
    await p.goto(`${BASE}/`, { waitUntil: "networkidle" }); await p.waitForTimeout(800);
    const bell = p.getByRole("button", { name: /Notificações: \d+ por ler/ });
    assert(await bell.count(), "sino com notificações por ler");
    await bell.click(); await p.waitForTimeout(600);
    const txt = await p.locator(".inbox").innerText();
    assert(/foi recusada/.test(txt) && /foi resolvido/.test(txt), "as duas notificações");
    assert(!/De outra pessoa/.test(txt), "só a caixa da própria conta");
    await p.screenshot({ path: `${__dirname}/out/p0107-inbox-${name}.png`, fullPage: true });
    await p.waitForTimeout(2200);
    assert(await p.getByRole("button", { name: "Notificações", exact: true }).count(), "depois de ler, o sino já não tem número");
    assert((await db("inbox")).filter((r) => r.user_id === UID && !r.read_at).length === 0, "read_at gravado");
    await p.locator(".note-row", { hasText: "foi recusada" }).click(); await p.waitForTimeout(500);
    assert(p.url().includes("v=ideias"), "tocar abre as Ideias: " + p.url());
    await p.close();
  }

  // painel: enviar aviso a @ana (e a toda a gente), e a lista dos últimos
  {
    const { p } = await session(b, { progress: "p-rich" });
    await clear(p);
    await p.addStyleTag({ content: "nextjs-portal{display:none!important}" });
    p.on("dialog", (d) => d.accept());
    await p.goto(`${BASE}/?v=admin`, { waitUntil: "networkidle" }); await clear(p);
    await p.getByRole("tab", { name: "Ferramentas" }).click(); await p.waitForTimeout(400);
    await p.locator("#n-aud").selectOption("users");
    await p.getByLabel("@nomes, separados por vírgula").fill("@ana, @naoexiste");
    await p.locator("#n-title").fill("Manutenção às 18h");
    await p.getByRole("button", { name: "Enviar aviso" }).click(); await p.waitForTimeout(700);
    assert(/Não encontrei: @naoexiste/.test(await p.locator("body").innerText()), "@nome inexistente é recusado");
    await p.getByLabel("@nomes, separados por vírgula").fill("@ana");
    await p.getByRole("button", { name: "Enviar aviso" }).click(); await p.waitForTimeout(700);
    assert(/Aviso enviado a 1 conta/.test(await p.locator("body").innerText()), "enviado a 1");
    let rows = (await db("inbox")).filter((r) => r.kind === "aviso" && r.title === "Manutenção às 18h");
    assert.equal(rows.length, 1); assert.equal(rows[0].user_id, "22222222-2222-4222-8222-222222222222");
    await p.locator("#n-aud").selectOption("all");
    await p.locator("#n-title").fill("Olá a todos");
    await p.getByRole("button", { name: "Enviar aviso" }).click(); await p.waitForTimeout(800);
    rows = (await db("inbox")).filter((r) => r.title === "Olá a todos");
    assert(rows.length >= 3, "toda a gente: " + rows.length);
    assert(/Últimos avisos/i.test(await p.locator(".admin").innerText()), "lista dos últimos avisos");
    await p.screenshot({ path: `${__dirname}/out/p0107-admin-aviso.png`, fullPage: true });

    // aviso ao autor da ideia: recusar e depois erro resolvido
    for (const [t, id] of [["suggestions", 901], ["reports", 902]]) await fetch(`${MOCK}/rest/v1/${t}?id=eq.${id}`, { method: "DELETE", headers: { authorization: "Bearer mock", apikey: "mock" } });
    await put("suggestions", [{ id: 901, user_id: "22222222-2222-4222-8222-222222222222", title: "Modo escuro roxo", body: "x" }]);
    await put("reports", [{ id: 902, user_id: "22222222-2222-4222-8222-222222222222", what: "quiz", detail: "Pergunta tal | marcada: a | certa: b", resolved: false }]);
    const tok = { authorization: "Bearer mock-token", "content-type": "application/json" };
    for (const body of [{ act: "idea", id: 901, status: "recusada", reply: "Por agora não." }, { act: "report", id: 902, resolved: true }]) {
      const r = await fetch(`${BASE}/api/admin`, { method: "POST", headers: tok, body: JSON.stringify(body) });
      assert.equal(r.status, 200, `admin ${body.act}: ${r.status}`);
    }
    const mine = (await db("inbox")).filter((r) => r.user_id === "22222222-2222-4222-8222-222222222222");
    assert(mine.some((r) => r.kind === "ideia" && /recusada/.test(r.title) && /Por agora não/.test(r.body)), "autor avisado: recusada");
    assert(mine.some((r) => r.kind === "erro" && /resolvido/.test(r.title)), "quem reportou avisado");
    for (const [t, id] of [["suggestions", 901], ["reports", 902]]) await fetch(`${MOCK}/rest/v1/${t}?id=eq.${id}`, { method: "DELETE", headers: { authorization: "Bearer mock", apikey: "mock" } });
    await p.close();
  }

  // continuar a lição: ir às Ideias a meio e voltar mantém a etapa
  {
    const { p } = await session(b, { progress: "p-rich" });
    await clear(p);
    await p.addStyleTag({ content: "nextjs-portal{display:none!important}" });
    await p.locator(".node.cur").click(); await p.waitForTimeout(1500);
    await p.getByRole("button", { name: /Não faço ideia/ }).click(); await p.waitForTimeout(300);
    for (let i = 0; i < 4; i++) { const c = p.getByRole("button", { name: "Continuar" }); if (await c.count()) await c.click(); }
    await p.getByRole("button", { name: /vamos memorizar/i }).click(); await p.waitForTimeout(300);
    for (let i = 0; i < 3; i++) { await p.locator(".card3d").click(); await p.waitForTimeout(500); await p.locator(".rate .btn").nth(2).click(); }
    await p.getByRole("button", { name: /Ir para o teste/ }).click(); await p.waitForTimeout(400);
    // 1.ª pergunta feita, 2.ª por fazer
    await p.locator(".opt").nth(0).click(); await p.getByRole("button", { name: "Verificar" }).click(); await p.waitForTimeout(300);
    await p.locator(".feedback .btn").first().click(); await p.waitForTimeout(300);
    const before = await p.locator(".qtop .eyebrow").innerText();
    const lessonUrl = p.url();
    await p.evaluate(() => window.scrollTo(0, 0)); await p.waitForTimeout(500);
    await p.getByRole("button", { name: "Mais opções" }).click();
    await p.locator(".menu-row", { hasText: "Ideias" }).click(); await p.waitForTimeout(600);
    assert(p.url().includes("v=ideias"));
    await p.goBack(); await p.waitForTimeout(1500);
    assert.equal(p.url(), lessonUrl);
    assert(await p.locator('.stp.cur', { hasText: "Testar" }).count(), "voltou ao passo Testar");
    assert.equal(await p.locator(".qtop .eyebrow").innerText(), before, "a pergunta atual mantém-se");
    await p.close();
  }
  await b.close();
  console.log("ok");
})().catch((e) => { console.error(e); process.exit(1); });
