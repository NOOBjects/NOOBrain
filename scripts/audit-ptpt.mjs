// Auditoria do catálogo: o que a revisão de português de Portugal (lib/ptpt.ts) mudaria e o que ainda parece Brasil.
// Só lê (chave pública; o RLS deixa ler o catálogo). Uso:
//   NEXT_PUBLIC_SUPABASE_URL=... NEXT_PUBLIC_SUPABASE_KEY=... node scripts/audit-ptpt.mjs
import { brMarkersDeep, ptptDeep } from "../lib/ptpt.ts";

const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const key = process.env.NEXT_PUBLIC_SUPABASE_KEY;
if (!url || !key) { console.error("Faltam NEXT_PUBLIC_SUPABASE_URL e NEXT_PUBLIC_SUPABASE_KEY."); process.exit(1); }

const get = async (t, select) => (await fetch(`${url}/rest/v1/${t}?select=${select}&limit=1000`, { headers: { apikey: key } })).json();
const rows = [
  ...(await get("catalog_trails", "key,level,concepts")).map((r) => ({ where: `trilha ${r.key} (${r.level})`, data: r.concepts })),
  ...(await get("catalog_lessons", "trail_key,level,concept_key,lesson")).map((r) => ({ where: `lição ${r.trail_key}/${r.concept_key} (${r.level})`, data: r.lesson })),
];
let changed = 0, flagged = 0;
for (const { where, data } of rows) {
  const fixed = ptptDeep(data);
  const diff = JSON.stringify(fixed) !== JSON.stringify(data);
  const left = brMarkersDeep(fixed);
  if (diff) changed++;
  if (left.length) flagged++;
  if (diff || left.length) console.log(`${where}: ${diff ? "ptpt mudaria algo" : ""}${left.length ? ` · sobra: ${[...new Set(left)].join(", ")}` : ""}`);
}
console.log(`\n${rows.length} entradas · ${changed} mudariam com o ptpt · ${flagged} com marcas de Brasil que sobram (refazer no painel)`);
