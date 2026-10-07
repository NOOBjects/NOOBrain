import { admin } from "./admin";
import { CATEGORIES } from "./categories";
import { brMarkersDeep } from "./ptpt";
import { pushReady } from "./push";
import { LIMITS } from "./quota";
import { OWNERS, can, roleOf, type Role } from "./staff";

// Leituras do painel de administração (uma por separador). `db` é sempre o cliente com a chave secreta.
const db = () => admin!;
const count = async (q: PromiseLike<{ count: number | null }>) => (await q).count ?? 0;
const ID = /^[\w-]{1,64}$/; // ids de contas (UUID no Supabase)
const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
const today = () => new Date().toISOString().slice(0, 10);

export async function resumo(uid: string) {
  const week = new Date(Date.now() - 7 * 86_400_000).toISOString();
  const [daily, usage, accounts, news, active, devices, topics, lessons, ratings, mine] = await Promise.all([
    db().from("ai_daily").select("n").eq("day", today()).maybeSingle(),
    db().from("ai_usage").select("kind,n").eq("day", today()),
    count(db().from("profiles").select("id", { count: "exact", head: true })),
    count(db().from("profiles").select("id", { count: "exact", head: true }).gte("created_at", week)),
    count(db().from("progress").select("user_id", { count: "exact", head: true }).gte("updated_at", week)),
    count(db().from("push_subscriptions").select("endpoint", { count: "exact", head: true })),
    count(db().from("catalog_trails").select("key", { count: "exact", head: true })),
    count(db().from("catalog_lessons").select("concept_key", { count: "exact", head: true })),
    db().from("feedback").select("rating"),
    db().from("ai_usage").select("kind,n").eq("user_id", uid).eq("day", today()),
  ]);
  const kinds: Record<string, number> = {};
  for (const r of usage.data ?? []) kinds[r.kind] = (kinds[r.kind] ?? 0) + r.n;
  const rs = (ratings.data ?? []).map((f) => f.rating as number);
  const mineKinds: Record<string, number> = {};
  for (const r of mine.data ?? []) mineKinds[r.kind] = r.n;
  return {
    numbers: { accounts, news, active, devices, topics, lessons, aiToday: daily.data?.n ?? 0, aiMax: Number(process.env.AI_DAILY_MAX) || 2500, aiKinds: kinds, rating: rs.length ? Math.round((rs.reduce((a, b) => a + b, 0) / rs.length) * 10) / 10 : null },
    mine: { usage: mineKinds, max: LIMITS },
  };
}

export async function ideias() {
  const { data } = await db().from("suggestions").select("id,title,body,status,reply,votes,created_at,appeal,user_id").order("created_at", { ascending: false }).limit(200);
  return { ideas: data ?? [] };
}

export async function erros() {
  const { data } = await db().from("reports").select("id,what,detail,created_at,resolved").order("created_at", { ascending: false }).limit(150);
  return { reports: data ?? [] };
}

export async function opinioes() {
  const { data } = await db().from("feedback").select("id,rating,text,context,created_at").order("created_at", { ascending: false }).limit(200);
  const by: Record<string, { n: number; sum: number }> = {};
  for (const f of data ?? []) { const k = f.context.startsWith("t:") ? "fim de trilha" : f.context; (by[k] ??= { n: 0, sum: 0 }); by[k].n++; by[k].sum += f.rating; }
  return { feedback: data ?? [], byContext: Object.entries(by).map(([context, v]) => ({ context, n: v.n, avg: Math.round((v.sum / v.n) * 10) / 10 })) };
}

export async function catalogo() {
  const { data } = await db().from("catalog_trails").select("key,level,topic,uses,category,rev").order("uses", { ascending: false }).limit(500);
  return { catalog: data ?? [], categories: CATEGORIES.map(([id, name]) => ({ id, name })) };
}

/** Lições do catálogo com palavras do Brasil ou com erros reportados por ler (texto suspeito realçado). */
export async function qualidade() {
  const [lessons, reports] = await Promise.all([
    db().from("catalog_lessons").select("trail_key,level,concept_key,lesson").limit(5000),
    db().from("reports").select("id,detail").eq("resolved", false).limit(300),
  ]);
  const asked = (reports.data ?? []).map((r) => ({ id: r.id as number, q: String(r.detail).split("|")[0].trim() })).filter((r) => r.q.length >= 15);
  const out: { trail_key: string; level: string; concept_key: string; marks: string[]; word?: string; reports: number[]; snippet: string }[] = [];
  for (const l of lessons.data ?? []) {
    const marks = brMarkersDeep(l.lesson);
    const text = JSON.stringify(l.lesson);
    const hit = asked.filter((r) => text.includes(r.q.slice(0, 60).replace(/"/g, '\\"')));
    if (!marks.length && !hit.length) continue;
    const hay = text.toLowerCase();
    const where = (m: string) => (m === "gíria" ? hay.search(/(?<![a-zà-ÿ])(né|tá|galera|valeu|beleza|legal|baixar|salvar|ruim|gostoso|pessoal|cara)(?![a-zà-ÿ])/) : m === "arquivo" ? hay.search(/arquivos?/) : hay.indexOf(m.toLowerCase()));
    const i = marks.map(where).find((x) => x >= 0) ?? -1;
    const word = i >= 0 ? (hay.slice(i).match(/^[\p{L}]+/u)?.[0] ?? "") : "";
    out.push({ trail_key: l.trail_key, level: l.level, concept_key: l.concept_key, marks: [...new Set(marks)].slice(0, 8), word, reports: hit.map((h) => h.id), snippet: i >= 0 ? text.slice(Math.max(0, i - 60), i + 80) : hit.length ? asked.find((a) => a.id === hit[0].id)!.q : "" });
  }
  return { suspicious: out.slice(0, 100), scanned: lessons.data?.length ?? 0 };
}

export async function ferramentas(uid: string) {
  const [glossary, notices, mine] = await Promise.all([
    db().from("ptpt_glossary").select("word,replacement").order("word"),
    db().from("inbox").select("title,created_at").eq("kind", "aviso").order("created_at", { ascending: false }).limit(1000),
    db().from("ai_usage").select("kind,n").eq("user_id", uid).eq("day", today()),
  ]);
  const sent = new Map<string, { title: string; at: string; n: number }>();
  for (const r of notices.data ?? []) { const k = `${r.title}|${r.created_at.slice(0, 16)}`; const e = sent.get(k); if (e) e.n++; else sent.set(k, { title: r.title, at: r.created_at, n: 1 }); }
  const usage: Record<string, number> = {};
  for (const r of mine.data ?? []) usage[r.kind] = r.n;
  return { glossary: glossary.data ?? [], notices: [...sent.values()].slice(0, 8), usage, max: LIMITS, pushReady };
}

// ---------- pessoas ----------
type Card = { id: string; username: string | null; display_name: string; avatar: number; email?: string };

/** Pesquisa por e-mail, @nome ou UID (até 20). O moderador só vê @nome e perfil público. */
export async function pessoas(q: string, role: Role) {
  const term = q.trim();
  if (term.length < 2) return { people: [] as Card[] };
  const withEmail = can(role, "emails");
  const cards = new Map<string, Card>();
  const addProfiles = async (ids: string[]) => {
    if (!ids.length) return;
    const { data } = await db().from("profiles").select("id,username,display_name,avatar").in("id", ids);
    for (const p of data ?? []) cards.set(p.id, { ...p });
  };
  if (UUID.test(term)) {
    await addProfiles([term]);
  } else if (term.includes("@") && !term.startsWith("@") && withEmail) {
    const found: { id: string; email?: string }[] = [];
    for (let page = 1; page <= 5 && found.length < 20; page++) {
      const { data } = await db().auth.admin.listUsers({ page, perPage: 1000 });
      const users = data?.users ?? [];
      found.push(...users.filter((u) => u.email?.toLowerCase().includes(term.toLowerCase())));
      if (users.length < 1000) break;
    }
    await addProfiles(found.slice(0, 20).map((u) => u.id));
    for (const u of found) { const c = cards.get(u.id); if (c) c.email = u.email; }
    for (const u of found.slice(0, 20)) if (!cards.has(u.id)) cards.set(u.id, { id: u.id, username: null, display_name: "", avatar: 0, email: u.email });
  } else {
    const { data } = await db().from("profiles").select("id,username,display_name,avatar").ilike("username", `%${term.replace(/^@/, "").replace(/[%_]/g, "")}%`).limit(20);
    for (const p of data ?? []) cards.set(p.id, { ...p });
  }
  return { people: [...cards.values()].slice(0, 20) };
}

/** Ficha de uma pessoa. O moderador recebe só o perfil público. */
export async function pessoa(id: string, role: Role) {
  if (!ID.test(id)) return null;
  const [profile, staff] = await Promise.all([
    db().from("profiles").select("id,username,display_name,avatar,bio,in_ranking,xp,streak,topics_done,week_xp,created_at").eq("id", id).maybeSingle(),
    roleOf(id),
  ]);
  const base = { profile: profile.data, team: staff };
  if (!can(role, "emails")) return base;
  const [auth, prog, devices, usage] = await Promise.all([
    db().auth.admin.getUserById(id),
    db().from("progress").select("data,updated_at").eq("user_id", id).maybeSingle(),
    count(db().from("push_subscriptions").select("endpoint", { count: "exact", head: true }).eq("user_id", id)),
    db().from("ai_usage").select("kind,n").eq("user_id", id).eq("day", today()),
  ]);
  const u = auth.data?.user;
  const state = prog.data?.data as { trails?: unknown[] } | undefined;
  const aiToday: Record<string, number> = {};
  for (const r of usage.data ?? []) aiToday[r.kind] = r.n;
  return {
    ...base,
    owner: OWNERS.includes(id),
    account: u ? {
      email: u.email, providers: (u.app_metadata?.providers as string[] | undefined) ?? [u.app_metadata?.provider].filter(Boolean),
      created_at: u.created_at, last_sign_in_at: u.last_sign_in_at ?? null, confirmed: !!u.email_confirmed_at,
      banned_until: (u as { banned_until?: string | null }).banned_until ?? null,
    } : null,
    progress: { saved_at: prog.data?.updated_at ?? null, trails: state?.trails?.length ?? 0 },
    devices, aiToday,
  };
}

export async function equipa() {
  const { data } = await db().from("staff").select("user_id,role,created_at").order("created_at");
  const ids = [...OWNERS, ...(data ?? []).map((s) => s.user_id)];
  const { data: ps } = ids.length ? await db().from("profiles").select("id,username,display_name,avatar").in("id", ids) : { data: [] };
  const who = (id: string) => ps?.find((p) => p.id === id) ?? null;
  return {
    owners: OWNERS.map((id) => ({ user_id: id, profile: who(id) })),
    staff: (data ?? []).map((s) => ({ ...s, profile: who(s.user_id) })),
  };
}

export async function registo() {
  const { data } = await db().from("admin_log").select("id,actor,action,target,detail,created_at").order("created_at", { ascending: false }).limit(200);
  const ids = [...new Set((data ?? []).map((r) => r.actor).filter(Boolean))] as string[];
  const { data: ps } = ids.length ? await db().from("profiles").select("id,username").in("id", ids) : { data: [] };
  return { log: (data ?? []).map((r) => ({ ...r, actor_name: ps?.find((p) => p.id === r.actor)?.username ?? null })) };
}
