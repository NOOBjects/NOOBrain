// Ajudas para os testes no navegador (Playwright já instalado no ambiente; não é dependência do projeto).
// Pressupõe: Supabase falso em :54321 e `next dev` em :3000 apontado para ele (ver README.md desta pasta).
const fs = require("fs");
const PW = process.env.PLAYWRIGHT_PATH || ["playwright", "/opt/node22/lib/node_modules/playwright"].find((p) => { try { require.resolve(p); return true; } catch { return false; } });
const { chromium } = require(PW);
const BASE = process.env.E2E_BASE || "http://localhost:3000";
const MOCK = process.env.E2E_MOCK || "http://localhost:54321";
exports.BASE = BASE;

// Chromium pré-instalado (PLAYWRIGHT_BROWSERS_PATH); nunca correr "playwright install".
function chrome() {
  if (process.env.CHROMIUM) return process.env.CHROMIUM;
  const root = process.env.PLAYWRIGHT_BROWSERS_PATH || "/opt/pw-browsers";
  const dir = fs.existsSync(root) ? fs.readdirSync(root).find((d) => d.startsWith("chromium-")) : null;
  return dir ? `${root}/${dir}/chrome-linux/chrome` : undefined;
}
exports.launch = () => chromium.launch({ executablePath: chrome() });

/** Repõe o progresso guardado na "nuvem" falsa: f = nome de um ficheiro em fixtures/ (sem .json) ou nada. */
exports.reset = (f) => fetch(`${MOCK}/__reset${f ? `?f=${f}` : ""}`);

/** Abre um separador com sessão iniciada. w/h = tamanho do ecrã; dark = tema escuro; progress = fixture da nuvem. */
exports.session = async (b, { w = 390, h = 844, dark = false, state, progress } = {}) => {
  await exports.reset(progress);
  const ctx = await b.newContext({ viewport: { width: w, height: h }, deviceScaleFactor: 2, colorScheme: dark ? "dark" : "light", hasTouch: w < 600 });
  const p = await ctx.newPage();
  p.on("console", (m) => { if (m.type() === "error" && !/favicon|404/.test(m.text())) console.log("CONSOLE", m.text().slice(0, 300)); });
  p.on("pageerror", (e) => console.log("PAGEERROR", e.message));
  await p.goto(`${BASE}/`, { waitUntil: "networkidle" });
  if (state) await p.evaluate((s) => { localStorage.setItem("noobrain:v2", JSON.stringify(s)); }, state);
  await p.fill("input[type=email]", "teste@noobrain.local");
  await p.fill("input[type=password]", "teste1234");
  await p.locator("form button[type=submit]").first().click();
  await p.waitForTimeout(2500);
  return { ctx, p };
};
