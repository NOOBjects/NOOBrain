// Enche o catálogo com os temas iniciais. Corre-se no computador, com o servidor local ligado:
//   1) npm run dev            (noutro terminal)
//   2) npm run seed:catalog
// Precisa de SEED_TOKEN e SUPABASE_SECRET_KEY no .env.local (nunca na Vercel).
// Espera entre pedidos para caber nos limites gratuitos da IA (8000 tokens por minuto por modelo).
const BASE = process.env.SEED_URL || "http://localhost:3000";
const TOKEN = process.env.SEED_TOKEN;
const DELAY = Number(process.env.SEED_DELAY) || 20_000;
const LEVEL = "Iniciante";
const TOPICS = [
  "Fotossíntese", "Sistema Solar", "Fernando Pessoa", "Inglês para iniciantes", "Revolução dos Cravos",
  "Inteligência Artificial", "Finanças pessoais", "Primeiros socorros", "Teoria das cores",
];

if (!TOKEN) { console.error("Falta SEED_TOKEN no .env.local."); process.exit(1); }
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

async function post(path, body) {
  for (let attempt = 1; attempt <= 3; attempt++) {
    const t0 = Date.now();
    const res = await fetch(`${BASE}${path}`, { method: "POST", headers: { "content-type": "application/json", "x-seed-token": TOKEN }, body: JSON.stringify(body) });
    const data = await res.json().catch(() => ({}));
    if (res.ok) {
      if (Date.now() - t0 > 1500) await sleep(DELAY); // só espera se a IA foi mesmo chamada (o catálogo responde logo)
      return data;
    }
    console.warn(`  ${path} deu ${res.status} (${data.error ?? "?"}); nova tentativa em 60 s`);
    await sleep(60_000);
  }
  throw new Error(`${path} falhou 3 vezes`);
}

for (const topic of TOPICS) {
  console.log(`\n${topic}`);
  const trail = await post("/api/trail", { topic, level: LEVEL });
  for (const [i, c] of trail.concepts.entries()) {
    console.log(`  ${i + 1}/${trail.concepts.length} ${c.title}`);
    await post("/api/lesson", { topic: trail.topic, level: LEVEL, title: c.title, summary: c.summary });
  }
}
console.log("\nFeito.");
