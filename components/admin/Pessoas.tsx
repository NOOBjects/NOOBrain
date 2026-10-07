"use client";

import { useState } from "react";
import { Avatar } from "../Avatar";
import { act, Danger, Empty, ROLE_LABEL, useSection, when, type Role, type Say } from "./shared";
import { call } from "@/lib/api";

type Card = { id: string; username: string | null; display_name: string; avatar: number; email?: string };
type Ficha = {
  profile: { id: string; username: string; display_name: string; avatar: number; bio: string; in_ranking: boolean; xp: number; streak: number; topics_done: number; week_xp: number; created_at: string } | null;
  team: Role | null; owner?: boolean;
  account?: { email?: string; providers: string[]; created_at: string; last_sign_in_at: string | null; confirmed: boolean; banned_until: string | null } | null;
  progress?: { saved_at: string | null; trails: number }; devices?: number; aiToday?: Record<string, number>;
};

/** Pesquisar pessoas e agir na conta. Moderadores só veem @nome e perfil público. */
export function Pessoas({ role, say }: { role: Role; say: Say }) {
  const [q, setQ] = useState("");
  const [people, setPeople] = useState<Card[] | null>(null);
  const [busy, setBusy] = useState(false);
  const [open, setOpen] = useState<string | null>(null);
  async function search(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    try { setPeople((await call<{ people: Card[] }>(`/api/admin?o=pessoas&q=${encodeURIComponent(q)}`)).people); } catch (er) { say((er as Error).message, true); }
    setBusy(false);
  }
  return (
    <div className="list">
      <form className="pair" onSubmit={search} style={{ gridTemplateColumns: "1fr auto" }}>
        <input className="field ch" aria-label="Pesquisar pessoas" placeholder={role === "moderador" ? "@nome" : "E-mail, @nome ou UID"} value={q} onChange={(e) => setQ(e.target.value)} autoCapitalize="none" autoComplete="off" />
        <button type="submit" className="btn sm" disabled={busy || q.trim().length < 2}><span className="face">{busy ? "…" : "Pesquisar"}</span></button>
      </form>
      {people && !people.length && <Empty>Ninguém encontrado.</Empty>}
      {people?.map((p) => (
        <div key={p.id}>
          <button type="button" className="pane" style={{ width: "100%", padding: 0, border: 0, background: "none", textAlign: "left" }} aria-expanded={open === p.id} onClick={() => setOpen(open === p.id ? null : p.id)}>
            <span className="in due-row"><span className="acts-inline"><Avatar n={p.avatar} size={36} /><span><b>{p.display_name || (p.username ? `@${p.username}` : "Sem perfil")}</b><span className="sub small" style={{ display: "block" }}>{p.username ? `@${p.username}` : p.id}{p.email ? ` · ${p.email}` : ""}</span></span></span></span>
          </button>
          {open === p.id && <FichaView id={p.id} role={role} say={say} onGone={() => { setOpen(null); setPeople((l) => l && l.filter((x) => x.id !== p.id)); }} />}
        </div>
      ))}
    </div>
  );
}

function FichaView({ id, role, say, onGone }: { id: string; role: Role; say: Say; onGone: () => void }) {
  const { data, reload } = useSection<Ficha>("pessoa", `&id=${id}`);
  const [typed, setTyped] = useState("");
  if (!data) return <p className="sub center">A carregar…</p>;
  const p = data.profile;
  const a = data.account;
  const full = role !== "moderador";
  const run = async (body: object, ok: string, then?: () => void) => { if (await act({ ...body, id }, say, ok)) { void reload(); then?.(); } };
  const rows: [string, string][] = p ? [
    ["@nome", `@${p.username}`], ["Nome", p.display_name || "—"], ["Sobre", p.bio || "—"], ["XP", String(p.xp)], ["Sequência", `${p.streak} dias`], ["XP da semana", String(p.week_xp)],
    ["No ranking", p.in_ranking ? "Sim" : "Não"], ["Temas concluídos", String(p.topics_done)], ["Conta criada", when(p.created_at)], ...(data.team ? [["Equipa", ROLE_LABEL[data.team]] as [string, string]] : []),
  ] : [];
  if (full && a) rows.push(["E-mail", a.email ?? "—"], ["Entra com", a.providers.join(", ") || "—"], ["E-mail confirmado", a.confirmed ? "Sim" : "Não"], ["Último acesso", a.last_sign_in_at ? when(a.last_sign_in_at) : "—"],
    ["Suspensa até", a.banned_until && new Date(a.banned_until) > new Date() ? when(a.banned_until) : "Não"],
    ["Trilhas / última gravação", `${data.progress?.trails ?? 0} · ${data.progress?.saved_at ? when(data.progress.saved_at) : "—"}`], ["Aparelhos com avisos", String(data.devices ?? 0)],
    ["IA hoje", Object.entries(data.aiToday ?? {}).map(([k, n]) => `${k} ${n}`).join(" · ") || "0"]);
  const suspended = !!a?.banned_until && new Date(a.banned_until) > new Date();
  return (
    <div className="pane gap"><div className="in set">
      {!p && <p className="sub">Esta conta ainda não criou perfil.</p>}
      <dl className="ficha">{rows.map(([k, v]) => <div key={k}><dt className="eyebrow">{k}</dt><dd>{v}</dd></div>)}</dl>
      {full && !data.owner && (
        <>
          <div className="eyebrow">Ações na conta</div>
          <div className="acts-wrap">
            {a?.email && <button type="button" className="btn soft sm" onClick={() => void run({ act: "reset-password" }, "E-mail de nova palavra-passe enviado.")}><span className="face">Enviar e-mail de nova palavra-passe</span></button>}
            {a && !a.confirmed && <button type="button" className="btn soft sm" onClick={() => void run({ act: "resend" }, "Confirmação reenviada.")}><span className="face">Reenviar confirmação</span></button>}
            {p && <button type="button" className="btn soft sm" onClick={() => void run({ act: "ranking", on: !p.in_ranking }, p.in_ranking ? "Tirada do ranking." : "Reposta no ranking.")}><span className="face">{p.in_ranking ? "Tirar do ranking" : "Repor no ranking"}</span></button>}
            {p && <button type="button" className="btn soft sm" onClick={() => void run({ act: "rename" }, "@nome reposto.")}><span className="face">Repor @nome</span></button>}
            <button type="button" className="btn soft sm" onClick={() => void run({ act: suspended ? "unsuspend" : "suspend" }, suspended ? "Suspensão levantada." : "Conta suspensa por 7 dias.")}><span className="face">{suspended ? "Levantar suspensão" : "Suspender 7 dias"}</span></button>
          </div>
          {p && (
            <>
              <label className="lbl" htmlFor={`cf-${id}`}>Para apagar progresso{role === "dono" ? " ou a conta" : ""}, escreve o @nome ({p.username})</label>
              <input id={`cf-${id}`} className="field ch" value={typed} onChange={(e) => setTyped(e.target.value)} autoCapitalize="none" autoComplete="off" />
              <div className="acts-wrap">
                <button type="button" className="btn bad sm" disabled={typed.toLowerCase() !== p.username} onClick={() => void run({ act: "wipe-progress", confirm: typed }, "Progresso apagado.", () => setTyped(""))}><span className="face">Apagar progresso</span></button>
                {role === "dono" && (
                  <Danger label="Apagar conta" sure={`Apagar a conta @${p.username} para sempre?`}
                    onConfirm={() => { if (typed.toLowerCase() !== p.username) return say("Escreve primeiro o @nome na caixa acima.", true); void run({ act: "delete-account", confirm: typed }, "Conta apagada.", onGone); }} />
                )}
              </div>
            </>
          )}
        </>
      )}
    </div></div>
  );
}
