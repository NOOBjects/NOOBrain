import { admin } from "@/lib/admin";
import { generateJson } from "@/lib/ai";
import { refreshGlossary } from "@/lib/glossary";
import { userFrom } from "@/lib/auth";
import { pushReady, sendPush } from "@/lib/push";
import { ptpt, ptptDeep } from "@/lib/ptpt";
import { LIMITS } from "@/lib/quota";

export const maxDuration = 60; // a procura de palavras com IA pode demorar

// Painel de administração. Só para as contas em ADMIN_IDS (ids separados por vírgula, variável só do servidor, na Vercel).
// Usa a chave secreta: lê e muda o que o RLS esconde do app (ideias, erros reportados, opiniões, números).
const ADMINS = (process.env.ADMIN_IDS ?? "").split(",").map((s) => s.trim()).filter(Boolean);
const STATUS = ["recebida", "planeada", "em_curso", "feita", "recusada"];
const LABEL: Record<string, string> = { recebida: "Recebida", planeada: "Planeada", em_curso: "Em curso", feita: "Feita", recusada: "Recusada" };
const fail = (error: string, status: number) => Response.json({ error }, { status });

async function who(request: Request) {
  const user = await userFrom(request);
  return user && ADMINS.includes(user.id) ? user : null;
}

const count = async (q: PromiseLike<{ count: number | null }>) => (await q).count ?? 0;

/** ?o=me → { admin }; sem parâmetro → tudo o que o painel mostra. */
export async function GET(request: Request) {
  const user = await who(request);
  if (new URL(request.url).searchParams.get("o") === "me") return Response.json({ admin: !!user });
  if (!user || !admin) return fail("Sem acesso.", 403);
  const today = new Date().toISOString().slice(0, 10);
  const week = new Date(Date.now() - 7 * 86_400_000).toISOString();
  const [ideas, reports, feedback, usage, daily, catalog, accounts, active, devices, lessons, glossary] = await Promise.all([
    admin.from("suggestions").select("id,title,body,status,reply,votes,created_at").order("created_at", { ascending: false }).limit(100),
    admin.from("reports").select("id,what,detail,created_at,resolved").order("created_at", { ascending: false }).limit(100),
    admin.from("feedback").select("id,rating,text,context,created_at").order("created_at", { ascending: false }).limit(100),
    admin.from("ai_usage").select("kind,n").eq("day", today),
    admin.from("ai_daily").select("n").eq("day", today).maybeSingle(),
    admin.from("catalog_trails").select("key,level,topic,uses,category").order("uses", { ascending: false }).limit(200),
    count(admin.from("profiles").select("id", { count: "exact", head: true })),
    count(admin.from("progress").select("user_id", { count: "exact", head: true }).gte("updated_at", week)),
    count(admin.from("push_subscriptions").select("endpoint", { count: "exact", head: true })),
    count(admin.from("catalog_lessons").select("concept_key", { count: "exact", head: true })),
    admin.from("ptpt_glossary").select("word,replacement").order("word"),
  ]);
  const mineRows = await admin.from("ai_usage").select("kind,n").eq("user_id", user.id).eq("day", today);
  const mine: Record<string, number> = {};
  for (const r of mineRows.data ?? []) mine[r.kind] = r.n;
  const kinds: Record<string, number> = {};
  for (const r of usage.data ?? []) kinds[r.kind] = (kinds[r.kind] ?? 0) + r.n;
  const ratings = (feedback.data ?? []).map((f) => f.rating);
  return Response.json({
    numbers: {
      accounts, active, devices, lessons,
      topics: catalog.data?.length ?? 0,
      aiToday: daily.data?.n ?? 0, aiKinds: kinds,
      rating: ratings.length ? Math.round((ratings.reduce((a, b) => a + b, 0) / ratings.length) * 10) / 10 : null,
    },
    tools: { usage: mine, max: LIMITS, glossary: glossary.data ?? [] },
    ideas: ideas.data ?? [], reports: reports.data ?? [], feedback: feedback.data ?? [], catalog: catalog.data ?? [],
  });
}

/** Ações: mudar estado/resposta de uma ideia (avisa o autor), marcar um erro como resolvido, apagar um tema do catálogo. */
export async function POST(request: Request) {
  const user = await who(request);
  if (!user || !admin) return fail("Sem acesso.", 403);
  const b = await request.json().catch(() => null);
  if (b?.act === "idea") {
    const id = Number(b.id);
    const status = STATUS.includes(b.status) ? b.status : null;
    const reply = typeof b.reply === "string" ? b.reply.trim().slice(0, 400) : null;
    if (!id || !status) return fail("Pedido inválido.", 400);
    const { data: before } = await admin.from("suggestions").select("user_id,title,status").eq("id", id).maybeSingle();
    const { error } = await admin.from("suggestions").update({ status, reply: reply || null }).eq("id", id);
    if (error) return fail("Não consegui guardar.", 500);
    // Aviso ao autor quando o estado muda (se tiver os avisos ligados neste ou noutro aparelho).
    if (before && before.status !== status && pushReady) {
      const { data: subs } = await admin.from("push_subscriptions").select("endpoint,p256dh,auth").eq("user_id", before.user_id);
      await Promise.all((subs ?? []).map((s) => sendPush(s, { title: "A tua ideia no NOOBrain", body: `«${before.title}» passou a ${LABEL[status]}.`, tag: `idea-${id}`, url: "/?v=ideias" })));
    }
    return Response.json({ ok: true });
  }
  if (b?.act === "report") {
    const { error } = await admin.from("reports").update({ resolved: !!b.resolved }).eq("id", Number(b.id));
    return error ? fail("Não consegui guardar.", 500) : Response.json({ ok: true });
  }
  if (b?.act === "topic") {
    const key = String(b.key ?? ""), level = String(b.level ?? "");
    if (!key || !level) return fail("Pedido inválido.", 400);
    await admin.from("catalog_lessons").delete().eq("trail_key", key).eq("level", level);
    const { error } = await admin.from("catalog_trails").delete().eq("key", key).eq("level", level);
    return error ? fail("Não consegui apagar.", 500) : Response.json({ ok: true });
  }
  // Ferramenta: aplica a revisão de português de Portugal (lib/ptpt.ts + glossário) ao catálogo. Quem já tinha uma trilha mudada fica com o aviso "atualizar" (sobe `rev`).
  if (b?.act === "ptpt") {
    await refreshGlossary(admin, true);
    let changed = 0;
    const bump = new Set<string>();
    const [trails, lessons] = await Promise.all([
      admin.from("catalog_trails").select("key,level,concepts,rev").limit(1000),
      admin.from("catalog_lessons").select("trail_key,level,concept_key,lesson").limit(5000),
    ]);
    for (const t of trails.data ?? []) {
      const fixed = ptptDeep(t.concepts);
      if (JSON.stringify(fixed) !== JSON.stringify(t.concepts)) { await admin.from("catalog_trails").update({ concepts: fixed }).eq("key", t.key).eq("level", t.level); bump.add(`${t.key}|${t.level}`); changed++; }
    }
    for (const l of lessons.data ?? []) {
      const fixed = ptptDeep(l.lesson);
      if (JSON.stringify(fixed) !== JSON.stringify(l.lesson)) { await admin.from("catalog_lessons").update({ lesson: fixed }).eq("trail_key", l.trail_key).eq("level", l.level).eq("concept_key", l.concept_key); bump.add(`${l.trail_key}|${l.level}`); changed++; }
    }
    for (const t of trails.data ?? []) if (bump.has(`${t.key}|${t.level}`)) await admin.from("catalog_trails").update({ rev: (t.rev ?? 0) + 1 }).eq("key", t.key).eq("level", t.level);
    return Response.json({ ok: true, changed, trails: bump.size });
  }
  // Pede a toda a gente que atualize as trilhas (sobe `rev` em todo o catálogo): usar depois de refazer conteúdo.
  if (b?.act === "refresh-all") {
    const { data } = await admin.from("catalog_trails").select("key,level,rev").limit(1000);
    for (const t of data ?? []) await admin.from("catalog_trails").update({ rev: (t.rev ?? 0) + 1 }).eq("key", t.key).eq("level", t.level);
    return Response.json({ ok: true, trails: data?.length ?? 0 });
  }
  // Glossário: palavras de Portugal que o ptpt aplica sempre.
  if (b?.act === "gloss") {
    const word = typeof b.word === "string" ? b.word.trim().toLowerCase().slice(0, 60) : "";
    const replacement = typeof b.replacement === "string" ? b.replacement.trim().slice(0, 60) : "";
    if (word.length < 2 || !replacement || word === replacement.toLowerCase()) return fail("Escreve a palavra e a de Portugal.", 400);
    const { error } = await admin.from("ptpt_glossary").upsert({ word, replacement });
    return error ? fail("Não consegui guardar.", 500) : Response.json({ ok: true });
  }
  if (b?.act === "gloss-del") {
    const { error } = await admin.from("ptpt_glossary").delete().eq("word", String(b.word ?? ""));
    return error ? fail("Não consegui apagar.", 500) : Response.json({ ok: true });
  }
  // A IA lê o vocabulário de todo o catálogo e sugere palavras que só se usam no Brasil (o dono aceita ou ignora).
  if (b?.act === "gloss-scan") {
    await refreshGlossary(admin, true);
    const [trails, lessons] = await Promise.all([admin.from("catalog_trails").select("concepts").limit(1000), admin.from("catalog_lessons").select("lesson").limit(5000)]);
    const seen = new Set<string>();
    const add = (v: unknown) => {
      if (typeof v === "string") for (const w of v.toLowerCase().match(/[\p{L}-]{4,}/gu) ?? []) seen.add(w);
      else if (Array.isArray(v)) v.forEach(add);
      else if (v && typeof v === "object") Object.values(v).forEach(add);
    };
    for (const t of trails.data ?? []) add(t.concepts);
    for (const l of lessons.data ?? []) add(l.lesson);
    const words = [...seen].filter((w) => ptpt(w) === w).sort();
    const chunks: string[][] = [];
    for (let i = 0; i < words.length; i += 350) chunks.push(words.slice(i, i + 350));
    const SCHEMA = { type: "object", properties: { items: { type: "array", items: { type: "object", properties: { word: { type: "string" }, replacement: { type: "string" } }, required: ["word", "replacement"], additionalProperties: false } } }, required: ["items"], additionalProperties: false };
    const found = new Map<string, string>();
    for (let i = 0; i < Math.min(chunks.length, 12); i += 4) {
      const out = await Promise.all(chunks.slice(i, i + 4).map((c) => generateJson<{ items: { word: string; replacement: string }[] }>(
        `Esta é uma lista de palavras de lições escritas em português. Devolve só as que NÃO se usam em português de Portugal: palavras ou grafias do Brasil, grafias anteriores ao Acordo Ortográfico de 1990 e gírias. Para cada uma, dá a palavra equivalente de Portugal (uma só palavra ou expressão curta, no mesmo género e número). Não incluas palavras que também existem e se usam em Portugal. Se não houver nenhuma, devolve items vazio.\n${c.join(", ")}`, SCHEMA).catch(() => ({ items: [] }))));
      for (const o of out) for (const it of o.items ?? []) {
        const word = String(it.word ?? "").trim().toLowerCase(), replacement = String(it.replacement ?? "").trim();
        if (word && replacement && word !== replacement.toLowerCase() && seen.has(word) && replacement.length <= 60) found.set(word, replacement);
      }
    }
    return Response.json({ ok: true, scanned: words.length, suggestions: [...found].map(([word, replacement]) => ({ word, replacement })) });
  }
  // Ferramenta de teste: repõe o uso de IA de hoje, da própria conta ou de outra (pelo @nome).
  if (b?.act === "usage") {
    let uid: string = user.id;
    const name = typeof b.username === "string" ? b.username.trim().replace(/^@/, "").toLowerCase() : "";
    if (name) {
      const { data: p } = await admin.from("profiles").select("id").eq("username", name).maybeSingle();
      if (!p) return fail("Não encontrei esse @nome.", 404);
      uid = p.id;
    }
    const { error } = await admin.from("ai_usage").delete().eq("user_id", uid).eq("day", new Date().toISOString().slice(0, 10));
    return error ? fail("Não consegui repor.", 500) : Response.json({ ok: true });
  }
  return fail("Ação desconhecida.", 400);
}
