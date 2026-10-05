// Supabase falso (só para testes locais): auth + PostgREST mínimos, em memória. Nada sai da máquina.
// Arrancar: node tests/e2e/mock-supabase.cjs   (porta 54321). Ver tests/e2e/README.md.
const http = require("http");
const fs = require("fs");
const path = require("path");
const PORT = 54321;
const UID = "11111111-1111-4111-8111-111111111111";
const EMAIL = "teste@noobrain.local";
const PASSWORD = "teste1234";
const FIX = path.join(__dirname, "fixtures");
const now = () => new Date().toISOString();
const user = { id: UID, aud: "authenticated", role: "authenticated", email: EMAIL, email_confirmed_at: now(), app_metadata: { provider: "email", providers: ["email"] }, user_metadata: {}, created_at: "2026-09-20T10:00:00Z" };

function weekStart(d = new Date()) {
  const x = new Date(Date.UTC(d.getUTCFullYear(), d.getUTCMonth(), d.getUTCDate()));
  x.setUTCDate(x.getUTCDate() - ((x.getUTCDay() + 6) % 7));
  return x.toISOString().slice(0, 10);
}

const lessonFor = (title, i) => ({
  warmup: { q: `O que achas que «${title}» quer dizer?`, options: ["Uma ideia simples", "Algo sem relação", "Um erro comum", "Nenhuma destas"], answer: i % 4 },
  intro: [`${title} é um conceito central deste tema. Aqui fica a explicação curta, com as palavras essenciais e um exemplo concreto para fixar.`, "O segundo parágrafo liga o conceito ao anterior e mostra onde aparece no dia a dia."],
  example: i === 0 ? "Exemplo resolvido completo, passo a passo." : i < 3 ? "Exemplo com um passo em falta: primeiro observamos, depois «___», por fim concluímos." : "Problema: aplica o conceito a esta situação.",
  solution: i >= 3 ? "A resolução completa do problema, em duas frases." : undefined,
  cards: [{ term: "Termo um", definition: "Definição curta do termo um." }, { term: "Termo dois", definition: "Definição curta do termo dois." }, { term: "Termo três", definition: "Definição do termo três." }],
  quiz: [
    { q: "Pergunta de escolha múltipla número um?", options: ["Opção A", "Opção B certa", "Opção C", "Opção D"], answer: 1, why: "Porque a B é a certa." },
    { q: "Pergunta dois, com opções mais longas para testar o layout?", options: ["Uma opção bastante comprida que ocupa duas linhas no telemóvel", "Curta", "Média de tamanho", "Outra"], answer: 0, why: "A primeira explica tudo." },
    { q: "Pergunta três?", options: ["1", "2", "3", "4"], answer: 2, why: "Três é a resposta." },
  ],
  cloze: [{ text: "A fase luminosa produz «___» e «___», usados depois.", answer: "ATP e NADPH", accept: [] }],
  order: [{ prompt: "Ordena os passos", steps: ["Primeiro passo", "Segundo passo", "Terceiro passo", "Quarto passo"] }],
  short: [{ q: "Porque é que isto acontece?", ref: "Deve mencionar a causa." }],
});

const trails = JSON.parse(fs.readFileSync(path.join(FIX, "catalog_trails.json"), "utf8"));
const db = {
  profiles: [{ id: UID, username: "rodrigo_teste", display_name: "Rodrigo", avatar: 0, bio: "A aprender tudo.", in_ranking: true, xp: 0, streak: 0, topics_done: 0, week_xp: 120, week_start: weekStart(), created_at: "2026-09-20T10:00:00Z", age_ok: true },
    { id: "2", username: "ana", display_name: "Ana", avatar: 2, bio: "", in_ranking: true, xp: 500, streak: 3, topics_done: 1, week_xp: 340, week_start: weekStart(), created_at: "2026-09-21T10:00:00Z" },
    { id: "3", username: "joao_99", display_name: "", avatar: 3, bio: "", in_ranking: true, xp: 90, streak: 1, topics_done: 0, week_xp: 90, week_start: weekStart(), created_at: "2026-09-22T10:00:00Z" }],
  progress: [],
  catalog_trails: trails,
  catalog_lessons: [],
  suggestions: [
    { id: 1, user_id: "2", title: "Modo escuro mais escuro", body: "Para ler à noite.", status: "planeada", reply: "Boa ideia!", votes: 4, created_at: "2026-10-01T10:00:00Z" },
    { id: 2, user_id: UID, title: "Mais temas de história", body: "", status: "recebida", reply: null, votes: 1, created_at: "2026-10-03T10:00:00Z" },
  ],
  suggestion_votes: [],
  push_subscriptions: [],
  catalog_starts: [],
  reports: [],
  feedback: [],
};
if (process.env.NO_PROFILE) db.profiles.shift();
import(path.join(__dirname, "../../lib/topic.ts")).then(({ topicKey }) => { for (const t of trails) t.concepts.forEach((c, i) => db.catalog_lessons.push({ trail_key: t.key, level: t.level, concept_key: topicKey(c.title), lesson: lessonFor(c.title, i) })); });
const PK = { profiles: ["id"], progress: ["user_id"], catalog_trails: ["key", "level"], catalog_lessons: ["trail_key", "level", "concept_key"], push_subscriptions: ["endpoint"], suggestion_votes: ["suggestion_id", "user_id"], catalog_starts: ["key", "level", "user_id"] };

const session = () => ({ access_token: "mock-token", token_type: "bearer", expires_in: 86400, expires_at: Math.floor(Date.now() / 1000) + 86400, refresh_token: "mock-refresh", user });

function val(v) {
  if (v === "true") return true;
  if (v === "false") return false;
  if (v === "null") return null;
  return v;
}
function match(row, filters) {
  return filters.every(([col, op, v]) => {
    const r = row[col];
    if (op === "eq") return String(r) === String(val(v)) || r === val(v);
    if (op === "neq") return String(r) !== String(v);
    if (op === "gt") return Number(r) > Number(v);
    if (op === "gte") return Number(r) >= Number(v);
    if (op === "lt") return Number(r) < Number(v);
    if (op === "in") return v.replace(/^\(|\)$/g, "").split(",").map((s) => s.replace(/^"|"$/g, "")).includes(String(r));
    if (op === "is") return r === val(v);
    return true;
  });
}

function send(res, status, body, headers = {}) {
  res.writeHead(status, { "content-type": "application/json", ...cors, ...headers });
  res.end(body === undefined ? "" : JSON.stringify(body));
}
const cors = { "access-control-allow-origin": "*", "access-control-allow-headers": "*", "access-control-allow-methods": "*", "access-control-expose-headers": "content-range" };

http.createServer((req, res) => {
  let raw = "";
  req.on("data", (c) => (raw += c));
  req.on("end", () => {
    const url = new URL(req.url, "http://x");
    const body = raw ? JSON.parse(raw) : null;
    if (req.method === "OPTIONS") return send(res, 204);
    if (process.env.LOG) console.log(req.method, req.url);
    const p = url.pathname;
    if (p === "/__reset") { // repõe o progresso inicial (entre testes)
      // ?f=p-rich → progresso de tests/e2e/fixtures/p-rich.json; sem f → sem progresso
      const f = url.searchParams.get("f");
      db.progress = f && f !== "none" ? [{ user_id: UID, data: JSON.parse(fs.readFileSync(path.join(FIX, `${f.replace(/\.json$/, "")}.json`), "utf8")), updated_at: now() }] : [];
      return send(res, 200, {});
    }
    if (p === "/auth/v1/token") {
      if (url.searchParams.get("grant_type") === "password" && body?.password !== PASSWORD) return send(res, 400, { code: "invalid_credentials", error_code: "invalid_credentials", msg: "Invalid login credentials" });
      return send(res, 200, session());
    }
    if (p === "/auth/v1/user") return send(res, 200, user);
    if (p.startsWith("/auth/v1/")) return send(res, 200, {});
    if (p.startsWith("/rest/v1/rpc/")) return send(res, 200, null);
    const m = p.match(/^\/rest\/v1\/(\w+)$/);
    if (!m) return send(res, 404, { message: "no" });
    const table = m[1];
    db[table] ??= [];
    const filters = [];
    let order = [], limit = Infinity;
    for (const [k, v] of url.searchParams) {
      if (k === "select" || k === "columns" || k === "on_conflict") continue;
      if (k === "order") { order = v.split(",").map((o) => o.split(".")); continue; }
      if (k === "limit") { limit = Number(v); continue; }
      const i = v.indexOf(".");
      filters.push([k, v.slice(0, i), v.slice(i + 1)]);
    }
    if (table === "progress" || table === "suggestion_votes") filters.push(["user_id", "eq", UID]); // RLS
    const prefer = req.headers.prefer ?? "";
    if (req.method === "GET" || req.method === "HEAD") {
      let rows = db[table].filter((r) => match(r, filters));
      for (const [col, dir] of [...order].reverse()) rows = [...rows].sort((a, b) => (a[col] > b[col] ? 1 : a[col] < b[col] ? -1 : 0) * (dir === "desc" ? -1 : 1));
      const count = rows.length;
      rows = rows.slice(0, limit);
      if (table === "suggestions") rows = rows.map((r) => { const pr = db.profiles.find((x) => x.id === r.user_id); return { ...r, profiles: pr ? { username: pr.username, avatar: pr.avatar } : null }; });
      const h = { "content-range": `0-${Math.max(0, rows.length - 1)}/${count}` };
      if (req.method === "HEAD") return send(res, 200, undefined, h);
      if ((req.headers.accept ?? "").includes("vnd.pgrst.object")) return rows.length === 1 ? send(res, 200, rows[0], h) : send(res, 406, { code: "PGRST116", message: "0 rows" });
      return send(res, 200, rows, h);
    }
    if (req.method === "POST") {
      const list = (Array.isArray(body) ? body : [body]).map((r) => ({ ...r }));
      for (const r of list) {
        if (table === "suggestions") Object.assign(r, { id: Date.now(), user_id: UID, status: "recebida", reply: null, votes: 0, created_at: now() });
        if (table === "suggestion_votes") { r.user_id = UID; const s = db.suggestions.find((x) => x.id === r.suggestion_id); if (s) s.votes++; }
        if (table === "profiles") Object.assign(r, { xp: 0, streak: 0, topics_done: 0, week_xp: 0, week_start: weekStart(), created_at: now(), in_ranking: true });
        if (table === "catalog_starts") {
          r.user_id = UID;
          if (db.catalog_starts.some((x) => x.key === r.key && x.level === r.level && x.user_id === UID)) return send(res, 409, { code: "23505", message: "duplicate key" });
          const c = db.catalog_trails.find((x) => x.key === r.key && x.level === r.level); if (c) c.uses = (c.uses ?? 0) + 1;
        }
        const pk = PK[table];
        const i = pk ? db[table].findIndex((x) => pk.every((k) => x[k] === r[k])) : -1;
        if (i >= 0) db[table][i] = { ...db[table][i], ...r };
        else db[table].push(r);
        if (table === "progress") { const pr = db.profiles.find((x) => x.id === UID); if (pr && r.data) { pr.xp = r.data.xp; pr.streak = r.data.streak; } }
      }
      return send(res, 201, prefer.includes("return=representation") ? list : undefined);
    }
    if (req.method === "PATCH") {
      db[table].filter((r) => match(r, filters)).forEach((r) => Object.assign(r, body));
      return send(res, 204);
    }
    if (req.method === "DELETE") {
      const gone = db[table].filter((r) => match(r, filters));
      if (table === "suggestion_votes") gone.forEach((g) => { const s = db.suggestions.find((x) => x.id === g.suggestion_id); if (s) s.votes--; });
      db[table] = db[table].filter((r) => !gone.includes(r));
      return send(res, 204);
    }
    send(res, 405, {});
  });
}).listen(PORT, () => console.log("mock em", PORT));
