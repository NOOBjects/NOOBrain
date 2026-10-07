import type { User } from "@supabase/supabase-js";
import { admin } from "./admin";
import { generateJson } from "./ai";
import { CATEGORY_IDS } from "./categories";
import { refreshGlossary } from "./glossary";
import { pushReady, sendPush } from "./push";
import { ptpt, ptptDeep } from "./ptpt";
import { OWNERS, can, logAction, roleOf, type Action, type Role } from "./staff";

// Ações do painel (POST). Cada uma confere o papel (`can`) e deixa uma linha no registo.
const STATUS = ["recebida", "planeada", "em_curso", "feita", "recusada", "recurso"];
const LABEL: Record<string, string> = { recebida: "Recebida", planeada: "Planeada", em_curso: "Em curso", feita: "Feita", recusada: "Recusada", recurso: "Em recurso" };
const LINKS = ["ideias", "novidades", "perfil", "ranking", "explorar", "revisar", "definicoes", "notificacoes"];
const ID = /^[\w-]{1,64}$/; // ids de contas (UUID no Supabase)
const plain = (x: string) => x.normalize("NFD").replace(/[̀-ͯ]/g, "").toLowerCase();
const clip = (x: unknown, max: number) => (typeof x === "string" ? x.replace(/\s+/g, " ").trim().slice(0, max) : "");
const okLink = (x: unknown) => (typeof x === "string" && LINKS.includes(x) ? `?v=${x}` : "");
const fail = (error: string, status: number) => Response.json({ error }, { status });
const done = (extra: object = {}) => Response.json({ ok: true, ...extra });

type Note = { kind: "ideia" | "erro" | "aviso" | "sistema"; title: string; body?: string; link?: string };
/** Põe uma notificação na caixa de cada pessoa. Devolve quantas ficaram. */
async function tell(ids: string[], n: Note) {
  const rows = [...new Set(ids)].map((user_id) => ({ user_id, kind: n.kind, title: n.title, body: n.body ?? "", link: n.link ?? "" }));
  for (let i = 0; i < rows.length; i += 500) {
    const { error } = await admin!.from("inbox").insert(rows.slice(i, i + 500));
    if (error) return 0;
  }
  return rows.length;
}

/** Descobre uma conta por UID, e-mail ou @nome. */
async function find(ref: unknown): Promise<{ id: string; username: string | null } | null> {
  const q = clip(ref, 120).replace(/^@/, "");
  if (!q) return null;
  if (ID.test(q)) { const { data } = await admin!.from("profiles").select("id,username").eq("id", q).maybeSingle(); if (data) return data; }
  if (q.includes("@")) {
    for (let page = 1; page <= 5; page++) {
      const { data } = await admin!.auth.admin.listUsers({ page, perPage: 1000 });
      const u = data?.users.find((x) => x.email?.toLowerCase() === q.toLowerCase());
      if (u) { const { data: p } = await admin!.from("profiles").select("id,username").eq("id", u.id).maybeSingle(); return p ?? { id: u.id, username: null }; }
      if ((data?.users.length ?? 0) < 1000) break;
    }
    return null;
  }
  const { data } = await admin!.from("profiles").select("id,username").eq("username", q.toLowerCase()).maybeSingle();
  return data ?? null;
}

export async function runAction(b: Record<string, unknown>, user: User, role: Role, request: Request): Promise<Response> {
  const db = admin!;
  const need = (a: Action) => (can(role, a) ? null : fail("Sem permissão para isto.", 403));
  const act = String(b.act ?? "");
  const log = (action: string, target?: string, detail?: object) => logAction(user.id, action, target, detail);
  const gate = (a: Action) => need(a);

  // ---- moderação: ideias, erros, catálogo ----
  if (act === "idea") {
    const denied = gate("moderar"); if (denied) return denied;
    const id = Number(b.id);
    const status = STATUS.includes(String(b.status)) ? String(b.status) : null;
    const reply = typeof b.reply === "string" ? b.reply.trim().slice(0, 400) : null;
    if (!id || !status) return fail("Pedido inválido.", 400);
    const { data: before } = await db.from("suggestions").select("user_id,title,status,reply").eq("id", id).maybeSingle();
    const { error } = await db.from("suggestions").update({ status, reply: reply || null, ...(before?.status !== status && { decided_at: new Date().toISOString() }) }).eq("id", id);
    if (error) return fail("Não consegui guardar.", 500);
    const changed = before?.status !== status;
    const answered = !!reply && reply !== before?.reply;
    if (before && before.user_id !== user.id && (changed || answered)) {
      const title = !changed ? "A equipa respondeu à tua ideia" : status === "recusada" ? "A tua ideia foi recusada" : status === "feita" ? "A tua ideia já está no NOOBrain" : status === "recurso" ? "Recebemos o teu pedido de revisão" : status === "recebida" ? "A tua ideia voltou a ser analisada" : `A tua ideia está ${LABEL[status].toLowerCase()}`;
      await tell([before.user_id], { kind: "ideia", title, body: clip(`«${before.title}»${reply ? ` · ${reply}` : ""}`, 300), link: "?v=ideias" });
      if (pushReady) {
        const { data: subs } = await db.from("push_subscriptions").select("endpoint,p256dh,auth").eq("user_id", before.user_id);
        await Promise.all((subs ?? []).map((x) => sendPush(x, { title: "A tua ideia no NOOBrain", body: `${title}: «${before.title}»`, tag: `idea-${id}`, url: "/?v=ideias" })));
      }
    }
    await log("ideia", `#${id}`, { status, reply: !!reply });
    return done();
  }
  if (act === "idea-del") {
    const denied = gate("moderar"); if (denied) return denied;
    const id = Number(b.id);
    if (!id) return fail("Pedido inválido.", 400);
    const { data: before } = await db.from("suggestions").select("title").eq("id", id).maybeSingle();
    await db.from("suggestion_votes").delete().eq("suggestion_id", id);
    const { error } = await db.from("suggestions").delete().eq("id", id);
    if (error) return fail("Não consegui apagar.", 500);
    await log("ideia-apagar", `#${id}`, { title: before?.title });
    return done();
  }
  if (act === "report") {
    const denied = gate("moderar"); if (denied) return denied;
    const id = Number(b.id);
    const { data: before } = await db.from("reports").select("user_id,detail,resolved").eq("id", id).maybeSingle();
    const { error } = await db.from("reports").update({ resolved: !!b.resolved }).eq("id", id);
    if (error) return fail("Não consegui guardar.", 500);
    if (b.resolved && before && !before.resolved && before.user_id && before.user_id !== user.id)
      await tell([before.user_id], { kind: "erro", title: "O erro que reportaste foi resolvido", body: clip(`Obrigado por avisares: «${String(before.detail).split("|")[0]}»`, 200) });
    await log(b.resolved ? "erro-resolvido" : "erro-reaberto", `#${id}`);
    return done();
  }
  if (act === "topic") { // apagar/refazer uma trilha do catálogo (a próxima pessoa gera-a de novo)
    const denied = gate("moderar"); if (denied) return denied;
    const key = String(b.key ?? ""), level = String(b.level ?? "");
    if (!key || !level) return fail("Pedido inválido.", 400);
    await db.from("catalog_lessons").delete().eq("trail_key", key).eq("level", level);
    const { error } = await db.from("catalog_trails").delete().eq("key", key).eq("level", level);
    if (error) return fail("Não consegui apagar.", 500);
    await log("trilha-apagar", `${key}|${level}`);
    return done();
  }
  if (act === "category") {
    const denied = gate("moderar"); if (denied) return denied;
    const key = String(b.key ?? ""), level = String(b.level ?? ""), category = String(b.category ?? "");
    if (!key || !level || !(CATEGORY_IDS as string[]).includes(category)) return fail("Pedido inválido.", 400);
    const { error } = await db.from("catalog_trails").update({ category }).eq("key", key).eq("level", level);
    if (error) return fail("Não consegui guardar.", 500);
    await log("categoria", `${key}|${level}`, { category });
    return done();
  }
  if (act === "lesson-redo") { // apaga só essa lição; a próxima pessoa que a abrir gera uma nova
    const denied = gate("moderar"); if (denied) return denied;
    const { error } = await db.from("catalog_lessons").delete().eq("trail_key", String(b.trail_key ?? "")).eq("level", String(b.level ?? "")).eq("concept_key", String(b.concept_key ?? ""));
    if (error) return fail("Não consegui apagar.", 500);
    await log("licao-refazer", `${b.trail_key}|${b.level}|${b.concept_key}`);
    return done();
  }

  // ---- ferramentas ----
  if (act === "notice") {
    const denied = gate("ferramentas"); if (denied) return denied;
    const title = clip(b.title, 120), body = clip(b.body, 600);
    if (title.length < 3) return fail("Escreve o título do aviso.", 400);
    let ids: string[] = [];
    if (b.audience === "team") { const { data } = await db.from("staff").select("user_id"); ids = [...OWNERS, ...(data ?? []).map((s) => s.user_id)]; }
    else if (b.audience === "users") {
      const names = String(b.usernames ?? "").split(/[\s,;]+/).map((x) => x.replace(/^@/, "").toLowerCase()).filter(Boolean).slice(0, 50);
      if (!names.length) return fail("Escreve pelo menos um @nome.", 400);
      const { data: ps } = await db.from("profiles").select("id,username").in("username", names);
      const miss = names.filter((n) => !(ps ?? []).some((p) => p.username === n));
      if (miss.length) return fail(`Não encontrei: ${miss.map((m) => `@${m}`).join(", ")}.`, 404);
      ids = (ps ?? []).map((p) => p.id);
    } else { const { data: ps } = await db.from("profiles").select("id").limit(5000); ids = (ps ?? []).map((p) => p.id); }
    const link = okLink(b.link);
    const sent = await tell(ids, { kind: "aviso", title, body, link });
    if (!sent) return fail("Não consegui enviar.", 500);
    let pushed = 0;
    if (b.push === true && pushReady) {
      const { data: subs } = await db.from("push_subscriptions").select("endpoint,p256dh,auth").in("user_id", ids).limit(500);
      const out = await Promise.all((subs ?? []).map((x) => sendPush(x, { title, body: body || "Abre o NOOBrain para ver.", tag: "noobrain-notice", url: link ? `/${link}` : "/?v=notificacoes" })));
      pushed = out.filter((r) => r === "ok").length;
    }
    await log("aviso", String(b.audience ?? "all"), { title, sent, pushed });
    return done({ sent, pushed });
  }
  if (act === "ptpt") {
    const denied = gate("ferramentas"); if (denied) return denied;
    await refreshGlossary(db, true);
    let changed = 0;
    const bump = new Set<string>();
    const [trails, lessons] = await Promise.all([
      db.from("catalog_trails").select("key,level,concepts,rev").limit(1000),
      db.from("catalog_lessons").select("trail_key,level,concept_key,lesson").limit(5000),
    ]);
    for (const t of trails.data ?? []) {
      const fixed = ptptDeep(t.concepts);
      if (JSON.stringify(fixed) !== JSON.stringify(t.concepts)) { await db.from("catalog_trails").update({ concepts: fixed }).eq("key", t.key).eq("level", t.level); bump.add(`${t.key}|${t.level}`); changed++; }
    }
    for (const l of lessons.data ?? []) {
      const fixed = ptptDeep(l.lesson);
      if (JSON.stringify(fixed) !== JSON.stringify(l.lesson)) { await db.from("catalog_lessons").update({ lesson: fixed }).eq("trail_key", l.trail_key).eq("level", l.level).eq("concept_key", l.concept_key); bump.add(`${l.trail_key}|${l.level}`); changed++; }
    }
    for (const t of trails.data ?? []) if (bump.has(`${t.key}|${t.level}`)) await db.from("catalog_trails").update({ rev: (t.rev ?? 0) + 1 }).eq("key", t.key).eq("level", t.level);
    await log("rever-catalogo", undefined, { changed, trails: bump.size });
    return done({ changed, trails: bump.size });
  }
  if (act === "refresh-all") {
    const denied = gate("ferramentas"); if (denied) return denied;
    const { data } = await db.from("catalog_trails").select("key,level,rev").limit(1000);
    for (const t of data ?? []) await db.from("catalog_trails").update({ rev: (t.rev ?? 0) + 1 }).eq("key", t.key).eq("level", t.level);
    await log("atualizar-todos", undefined, { trails: data?.length ?? 0 });
    return done({ trails: data?.length ?? 0 });
  }
  if (act === "gloss") {
    const denied = gate("ferramentas"); if (denied) return denied;
    const word = typeof b.word === "string" ? b.word.trim().toLowerCase().slice(0, 60) : "";
    const replacement = typeof b.replacement === "string" ? b.replacement.trim().slice(0, 60) : "";
    if (word.length < 2 || !replacement || word === replacement.toLowerCase()) return fail("Escreve a palavra e a de Portugal.", 400);
    const { error } = await db.from("ptpt_glossary").upsert({ word, replacement });
    if (error) return fail("Não consegui guardar.", 500);
    await log("glossario", word, { replacement });
    return done();
  }
  if (act === "gloss-del") {
    const denied = gate("ferramentas"); if (denied) return denied;
    const { error } = await db.from("ptpt_glossary").delete().eq("word", String(b.word ?? ""));
    if (error) return fail("Não consegui apagar.", 500);
    await log("glossario-apagar", String(b.word ?? ""));
    return done();
  }
  if (act === "gloss-scan") {
    const denied = gate("ferramentas"); if (denied) return denied;
    await refreshGlossary(db, true);
    const [trails, lessons] = await Promise.all([db.from("catalog_trails").select("concepts").limit(1000), db.from("catalog_lessons").select("lesson").limit(5000)]);
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
    for (let i = 0; i < Math.min(chunks.length, 16); i += 4) {
      const out = await Promise.all(chunks.slice(i, i + 4).map((c) => generateJson<{ items: { word: string; replacement: string }[] }>(
        `Esta é uma lista de palavras de lições escritas em português. Devolve só as que NÃO se usam em português de Portugal: palavras ou grafias do Brasil, grafias anteriores ao Acordo Ortográfico de 1990 e gírias. Para cada uma, dá a palavra equivalente de Portugal (uma só palavra ou expressão curta, no mesmo género e número). Não incluas palavras que também existem e se usam em Portugal, nem estrangeirismos comuns (site, smartphone, stress…), nem erros de acentuação. A palavra de Portugal tem de seguir o Acordo Ortográfico de 1990 (atualizar, ativo, otimização: nunca actualizar, activo, optimização). Se não houver nenhuma, devolve items vazio.\n${c.join(", ")}`, SCHEMA).catch(() => ({ items: [] }))));
      for (const o of out) for (const it of o.items ?? []) {
        const word = String(it.word ?? "").trim().toLowerCase(), replacement = String(it.replacement ?? "").trim();
        if (word && replacement && plain(word) !== plain(replacement) && !/(?:cç|pç)/i.test(replacement) && seen.has(word) && replacement.length <= 60) found.set(word, replacement);
      }
    }
    return done({ scanned: words.length, suggestions: [...found].map(([word, replacement]) => ({ word, replacement })) });
  }
  if (act === "usage") {
    const denied = gate("ferramentas"); if (denied) return denied;
    let uid: string = user.id;
    const name = typeof b.username === "string" ? b.username.trim().replace(/^@/, "").toLowerCase() : "";
    if (name) {
      const { data: p } = await db.from("profiles").select("id").eq("username", name).maybeSingle();
      if (!p) return fail("Não encontrei esse @nome.", 404);
      uid = p.id;
    }
    const { error } = await db.from("ai_usage").delete().eq("user_id", uid).eq("day", new Date().toISOString().slice(0, 10));
    if (error) return fail("Não consegui repor.", 500);
    await log("repor-ia", name ? `@${name}` : "própria");
    return done();
  }

  // ---- pessoas ----
  if (["reset-password", "resend", "ranking", "rename", "suspend", "unsuspend", "wipe-progress"].includes(act)) {
    const denied = gate("conta"); if (denied) return denied;
    const id = String(b.id ?? "");
    if (!ID.test(id)) return fail("Pedido inválido.", 400);
    if (OWNERS.includes(id) && id !== user.id) return fail("Não podes mexer na conta de um dono.", 403);
    const { data: profile } = await db.from("profiles").select("username").eq("id", id).maybeSingle();
    const who = profile?.username ? `@${profile.username}` : id;
    if (act === "reset-password" || act === "resend") {
      const { data } = await db.auth.admin.getUserById(id);
      const email = data?.user?.email;
      if (!email) return fail("Esta conta não tem e-mail.", 400);
      const origin = new URL(request.url).origin;
      if (act === "reset-password") { const { error } = await db.auth.resetPasswordForEmail(email, { redirectTo: `${origin}/entrar` }); if (error) return fail("Não consegui enviar o e-mail.", 502); }
      else {
        if (data?.user?.email_confirmed_at) return fail("A conta já está confirmada.", 400);
        const { error } = await db.auth.resend({ type: "signup", email, options: { emailRedirectTo: `${origin}/entrar` } });
        if (error) return fail("Não consegui reenviar a confirmação.", 502);
      }
      await log(act, who);
      return done();
    }
    if (act === "ranking") {
      const on = b.on === true;
      const { error } = await db.from("profiles").update({ in_ranking: on }).eq("id", id);
      if (error) return fail("Não consegui guardar.", 500);
      await log(on ? "ranking-repor" : "ranking-tirar", who);
      return done();
    }
    if (act === "rename") {
      const fresh = `user_${Math.random().toString(36).slice(2, 8)}`;
      const { error } = await db.from("profiles").update({ username: fresh, display_name: "" }).eq("id", id);
      if (error) return fail("Não consegui guardar.", 500);
      await log("repor-nome", who, { novo: fresh });
      return done({ username: fresh });
    }
    if (act === "suspend" || act === "unsuspend") {
      const { error } = await db.auth.admin.updateUserById(id, { ban_duration: act === "suspend" ? "168h" : "none" });
      if (error) return fail("Não consegui guardar.", 500);
      await log(act, who);
      return done();
    }
    if (act === "wipe-progress") {
      if (clip(b.confirm, 40).toLowerCase() !== (profile?.username ?? "").toLowerCase() || !profile?.username) return fail("Escreve o @nome para confirmar.", 400);
      const empty = { trails: [], active: "", xp: 0, streak: 0, lastDay: null, cards: {}, updatedAt: Date.now() };
      const { error } = await db.from("progress").upsert({ user_id: id, data: empty, updated_at: new Date().toISOString() });
      if (error) return fail("Não consegui apagar.", 500);
      await log("apagar-progresso", who);
      return done();
    }
  }
  if (act === "delete-account") {
    const denied = gate("apagarConta"); if (denied) return denied;
    const id = String(b.id ?? "");
    if (!ID.test(id) || OWNERS.includes(id)) return fail("Não podes apagar esta conta.", 403);
    const { data: profile } = await db.from("profiles").select("username").eq("id", id).maybeSingle();
    if (!profile?.username || clip(b.confirm, 40).toLowerCase() !== profile.username.toLowerCase()) return fail("Escreve o @nome para confirmar.", 400);
    const { error } = await db.auth.admin.deleteUser(id);
    if (error) return fail("Não consegui apagar a conta.", 502);
    await log("apagar-conta", `@${profile.username}`);
    return done();
  }

  // ---- equipa (só o dono) ----
  if (act === "staff-set" || act === "staff-del") {
    const denied = gate("equipa"); if (denied) return denied;
    const target = await find(b.ref);
    if (!target) return fail("Não encontrei essa conta.", 404);
    if (OWNERS.includes(target.id)) return fail("Os donos são definidos na Vercel e não se alteram aqui.", 400);
    if (act === "staff-del") {
      const { error } = await db.from("staff").delete().eq("user_id", target.id);
      if (error) return fail("Não consegui guardar.", 500);
      await log("equipa-retirar", target.username ? `@${target.username}` : target.id);
      return done();
    }
    const newRole = b.role === "admin" || b.role === "moderador" ? b.role : null;
    if (!newRole) return fail("Escolhe o papel.", 400);
    if (!target.username) return fail("Essa conta ainda não criou perfil.", 400);
    const { error } = await db.from("staff").upsert({ user_id: target.id, role: newRole, added_by: user.id });
    if (error) return fail("Não consegui guardar.", 500);
    await log("equipa-papel", `@${target.username}`, { role: newRole, antes: await roleOf(target.id) });
    return done();
  }
  return fail("Ação desconhecida.", 400);
}
