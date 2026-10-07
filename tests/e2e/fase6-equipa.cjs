// Fase 6: painel completo e equipa. Uso: node tests/e2e/fase6-equipa.cjs
// (Supabase falso + next dev com ADMIN_IDS = conta de teste; "mod-token" = ana/moderadora, "adm-token" = joão/admin)
const assert = require("assert");
const fs = require("fs");
const { launch, session, BASE } = require("./lib.cjs");
fs.mkdirSync(`${__dirname}/out`, { recursive: true });
const MOCK = process.env.E2E_MOCK || "http://localhost:54321";
const H = { authorization: "Bearer mock", apikey: "mock", "content-type": "application/json" };
const db = async (t) => (await fetch(`${MOCK}/rest/v1/${t}`, { headers: H })).json();
const put = (t, rows) => fetch(`${MOCK}/rest/v1/${t}`, { method: "POST", headers: H, body: JSON.stringify(rows) });
const api = (token, path, body) => fetch(`${BASE}/api/admin${path}`, { method: body ? "POST" : "GET", headers: { authorization: `Bearer ${token}`, "content-type": "application/json" }, body: body ? JSON.stringify(body) : undefined });
const clear = async (p) => { for (let i = 0; i < 4 && (await p.locator("dialog[open]").count()); i++) { await p.keyboard.press("Escape"); await p.waitForTimeout(300); } };

(async () => {
  const b = await launch();
  const { p } = await session(b, { progress: "p-rich" });
  await clear(p);
  await p.addStyleTag({ content: "nextjs-portal{display:none!important}" });
  const say = () => p.locator("body").innerText();
  await put("catalog_lessons", [{ trail_key: "teste-br", level: "Iniciante", concept_key: "usuario", lesson: { intro: ["O usuário está fazendo o download na tela do celular."], example: "", cards: [], quiz: [] } }]);
  await p.goto(`${BASE}/?v=admin`, { waitUntil: "networkidle" }); await clear(p);

  // dono: todos os separadores
  for (const t of ["Resumo", "Ideias", "Erros", "Opiniões", "Catálogo", "Qualidade", "Pessoas", "Ferramentas", "Equipa", "Registo"]) {
    const tab = p.getByRole("tab", { name: t, exact: true });
    assert(await tab.count(), `separador ${t}`);
    await tab.click(); await p.waitForTimeout(500);
    assert(!(await p.locator(".admin [role=alert]").count()), `erro no separador ${t}`);
  }
  await p.getByRole("tab", { name: "Resumo" }).click(); await p.waitForTimeout(400);
  assert(/Contas novas/i.test(await p.locator(".admin").innerText()), "resumo com contas novas");

  // ideias: apagar com confirmação
  await p.getByRole("tab", { name: "Ideias" }).click(); await p.waitForTimeout(500);
  const idea = p.locator(".pane", { hasText: "Ideia antiga ainda recebida" });
  await idea.getByRole("button", { name: "Apagar" }).click();
  assert(/Os votos também desaparecem/.test(await say()), "pede confirmação");
  await idea.getByRole("button", { name: "Confirmar" }).click(); await p.waitForTimeout(600);
  assert(!(await db("suggestions")).some((s) => s.id === 8), "ideia apagada");

  // catálogo: mudar categoria
  await p.getByRole("tab", { name: "Catálogo" }).click(); await p.waitForTimeout(500);
  const sel = p.locator("select[id^=cat-]").first();
  const key = (await sel.getAttribute("id")).replace("cat-", "");
  await sel.selectOption("oficios"); await p.waitForTimeout(600);
  assert((await db("catalog_trails")).some((t) => `${t.key}-${t.level}` === key && t.category === "oficios"), "categoria mudada");

  // qualidade: lição com palavras do Brasil
  await p.getByRole("tab", { name: "Qualidade" }).click(); await p.waitForTimeout(700);
  assert(/fazendo/i.test(await p.locator(".admin").innerText()), "lição suspeita listada");
  await p.screenshot({ path: `${__dirname}/out/f6-qualidade.png`, fullPage: true });
  await p.getByRole("button", { name: "Refazer lição" }).click();
  await p.getByRole("button", { name: "Confirmar" }).click(); await p.waitForTimeout(600);
  assert(!(await db("catalog_lessons")).some((l) => l.trail_key === "teste-br"), "lição apagada");

  // pessoas: pesquisa por @nome e por e-mail, ficha e ações
  await p.getByRole("tab", { name: "Pessoas" }).click();
  await p.getByLabel("Pesquisar pessoas").fill("ana"); await p.getByRole("button", { name: "Pesquisar" }).click(); await p.waitForTimeout(600);
  await p.locator("button.pane", { hasText: "@ana" }).click(); await p.waitForTimeout(600);
  let ficha = await p.locator(".ficha").innerText();
  assert(/ana@exemplo\.pt/.test(ficha) && /google/i.test(ficha), "ficha com e-mail e formas de entrar: " + ficha);
  await p.screenshot({ path: `${__dirname}/out/f6-ficha.png`, fullPage: true });
  await p.getByRole("button", { name: "Tirar do ranking" }).click(); await p.waitForTimeout(600);
  assert.equal((await db("profiles")).find((x) => x.id === "22222222-2222-4222-8222-222222222222").in_ranking, false, "tirada do ranking");
  await p.getByRole("button", { name: "Enviar e-mail de nova palavra-passe" }).click(); await p.waitForTimeout(500);
  await p.getByRole("button", { name: "Suspender 7 dias" }).click(); await p.waitForTimeout(600);
  let authLog = await (await fetch(`${MOCK}/__authlog`)).json();
  assert(authLog.some((l) => l.act === "recover"), "e-mail de nova palavra-passe");
  assert(authLog.some((l) => l.act === "update" && l.body?.ban_duration === "168h"), "suspensão de 7 dias");
  await p.getByRole("button", { name: "Repor @nome" }).click(); await p.waitForTimeout(600);
  assert(/^user_/.test((await db("profiles")).find((x) => x.id === "22222222-2222-4222-8222-222222222222").username), "@nome reposto");
  // pesquisa por e-mail
  await p.getByLabel("Pesquisar pessoas").fill("joao@exemplo"); await p.getByRole("button", { name: "Pesquisar" }).click(); await p.waitForTimeout(600);
  assert(await p.locator("button.pane", { hasText: "joao@exemplo.pt" }).count(), "pesquisa por e-mail");
  // equipa: dar acesso, mudar o papel, retirar (o @nome ficou a «user_xxxx», por isso uso o UID)
  await p.getByRole("tab", { name: "Equipa" }).click(); await p.waitForTimeout(500);
  assert(/definido na Vercel/.test(await p.locator(".admin").innerText()), "donos listados");
  await p.getByLabel("E-mail, @nome ou UID").fill("@joao_99");
  await p.getByRole("button", { name: "Dar acesso" }).click(); await p.waitForTimeout(700);
  assert.equal((await db("staff")).find((s) => s.user_id === "33333333-3333-4333-8333-333333333333")?.role, "moderador", "staff criado");
  await p.getByLabel("Papel de @joao_99").selectOption("admin"); await p.waitForTimeout(600);
  assert.equal((await db("staff")).find((s) => s.user_id === "33333333-3333-4333-8333-333333333333")?.role, "admin", "papel mudado");
  await p.getByRole("tab", { name: "Registo" }).click(); await p.waitForTimeout(600);
  const reg = await p.locator(".admin").innerText();
  for (const a of ["ideia-apagar", "categoria", "licao-refazer", "ranking-tirar", "suspend", "repor-nome", "equipa-papel"]) assert(reg.includes(a), `registo sem «${a}»`);

  // acesso por papel (API)
  await put("staff", [{ user_id: "22222222-2222-4222-8222-222222222222", role: "moderador" }]);
  const mod = "mod-token", adm = "adm-token";
  assert.equal((await api(mod, "?o=ideias")).status, 200, "moderador vê ideias");
  assert.equal((await api(mod, "?o=equipa")).status, 403, "moderador não vê equipa");
  assert.equal((await api(mod, "?o=registo")).status, 403, "moderador não vê registo");
  assert.equal((await api(mod, "?o=ferramentas")).status, 403, "moderador sem ferramentas");
  const ppl = await (await api(mod, "?o=pessoas&q=joao")).json();
  assert(!JSON.stringify(ppl).includes("@exemplo"), "moderador não vê e-mails");
  const fm = await (await api(mod, "?o=pessoa&id=33333333-3333-4333-8333-333333333333")).json();
  assert(fm.profile && !fm.account, "moderador só vê o perfil público");
  assert.equal((await api(mod, "", { act: "reset-password", id: "33333333-3333-4333-8333-333333333333" })).status, 403, "moderador sem ações na conta");
  assert.equal((await api(mod, "", { act: "notice", audience: "all", title: "x y z" })).status, 403, "moderador sem avisos");
  assert.equal((await api(mod, "", { act: "idea", id: 1, status: "feita", reply: "ok" })).status, 200, "moderador responde a ideias");
  // admin (joão)
  assert.equal((await api(adm, "?o=registo")).status, 200, "admin vê o registo");
  assert.equal((await api(adm, "?o=equipa")).status, 403, "admin não gere a equipa");
  assert.equal((await api(adm, "", { act: "staff-set", ref: "22222222-2222-4222-8222-222222222222", role: "admin" })).status, 403, "admin não dá acessos");
  assert.equal((await api(adm, "", { act: "delete-account", id: "22222222-2222-4222-8222-222222222222", confirm: "x" })).status, 403, "só o dono apaga contas");
  assert.equal((await api(adm, "", { act: "reset-password", id: "11111111-1111-4111-8111-111111111111" })).status, 403, "ninguém mexe na conta de um dono");
  // quem não é da equipa
  assert.equal((await api("out-token", "?o=resumo")).status, 403, "sem equipa: 403");
  assert.equal((await (await api("out-token", "?o=me")).json()).role, null);
  // dono: não se mexe nas contas de donos; apagar conta pede o @nome
  assert.equal((await api("mock-token", "", { act: "suspend", id: "11111111-1111-4111-8111-111111111111" })).status, 200, "o dono pode agir na própria conta");
  assert.equal((await api("mock-token", "", { act: "delete-account", id: "33333333-3333-4333-8333-333333333333", confirm: "errado" })).status, 400, "apagar conta pede o @nome");

  // /api/staff e a etiqueta
  const ids = (await (await fetch(`${BASE}/api/staff`)).json()).ids;
  assert(ids.includes("11111111-1111-4111-8111-111111111111") && ids.includes("22222222-2222-4222-8222-222222222222") && ids.includes("33333333-3333-4333-8333-333333333333"), "ids da equipa: " + ids);
  await p.goto(`${BASE}/?v=ranking`, { waitUntil: "networkidle" }); await p.waitForTimeout(800);
  assert(await p.locator(".rank .chip.team").count(), "etiqueta Equipa no ranking");
  await p.screenshot({ path: `${__dirname}/out/f6-ranking.png` });
  await p.goto(`${BASE}/?v=perfil`, { waitUntil: "networkidle" }); await p.waitForTimeout(800);
  assert(await p.locator(".profile .chip.team").count(), "etiqueta Equipa no perfil");

  console.log("fase6-equipa OK");
  await b.close();
})().catch((e) => { console.error("FALHOU:", e.message); process.exit(1); });
