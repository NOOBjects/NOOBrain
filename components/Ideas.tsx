"use client";

import { TeamTag } from "./TeamTag";
import type { User } from "@supabase/supabase-js";
import { useCallback, useEffect, useState } from "react";
import { Avatar } from "./Avatar";
import { Check, ChevronUp } from "./Icons";
import { call } from "@/lib/api";
import { supabase } from "@/lib/supabase";

type Idea = {
  id: number; user_id: string; title: string; body: string; status: string; reply: string | null; votes: number; created_at: string;
  appeal: string | null; decided_at: string | null;
  profiles: { username: string; avatar: number } | null;
};
type Tab = "top" | "new" | "way" | "done" | "no";

const TABS: [Tab, string][] = [["top", "Populares"], ["new", "Novas"], ["way", "A caminho"], ["done", "Feitas"], ["no", "Recusadas"]];
const STATUS: Record<string, string> = { recebida: "Recebida", planeada: "Planeada", em_curso: "Em curso", feita: "Feita", recusada: "Recusada", recurso: "Em recurso" };
const OPEN = ["recebida", "planeada", "em_curso", "recurso"]; // só nestas se vota
const DAY = 86_400_000;
const when = (i: Idea) => new Date(i.decided_at ?? i.created_at).getTime();

/** As ideias de cada separador. Feitas e recusadas nunca aparecem em Populares nem em Novas. */
function visible(all: Idea[], tab: Tab): Idea[] {
  const by = (f: (a: Idea, b: Idea) => number) => (l: Idea[]) => [...l].sort(f);
  if (tab === "top") return by((a, b) => b.votes - a.votes || +new Date(b.created_at) - +new Date(a.created_at))(all.filter((i) => OPEN.includes(i.status)));
  if (tab === "new") return by((a, b) => +new Date(b.created_at) - +new Date(a.created_at))(all.filter((i) => i.status === "recebida" && Date.now() - +new Date(i.created_at) < 30 * DAY));
  if (tab === "way") return by((a, b) => Number(b.status === "em_curso") - Number(a.status === "em_curso") || b.votes - a.votes)(all.filter((i) => i.status === "planeada" || i.status === "em_curso"));
  if (tab === "done") return by((a, b) => when(b) - when(a))(all.filter((i) => i.status === "feita"));
  return by((a, b) => when(b) - when(a))(all.filter((i) => i.status === "recusada" || i.status === "recurso"));
}

/** Mural público de ideias: toda a gente vê, vota e partilha; a NOOBjects responde e muda o estado no painel do Supabase. */
export function Ideas({ user, onBack, notify }: { user: User; onBack: () => void; notify: (m: string) => void }) {
  const [tab, setTab] = useState<Tab>("top");
  const [ideas, setIdeas] = useState<Idea[] | null>(null);
  const [mine, setMine] = useState<Set<number>>(new Set());
  const [title, setTitle] = useState("");
  const [body, setBody] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [appealFor, setAppealFor] = useState<number | null>(null);
  const [appealText, setAppealText] = useState("");
  const [appealErr, setAppealErr] = useState<string | null>(null);

  const load = useCallback(async () => {
    const [list, votes] = await Promise.all([
      supabase!.from("suggestions").select("*, profiles!suggestions_user_id_fkey(username, avatar)").order("created_at", { ascending: false }).limit(200),
      supabase!.from("suggestion_votes").select("suggestion_id"),
    ]);
    if (list.error) return setError("Não consegui carregar as ideias. Tenta outra vez mais tarde.");
    setIdeas(list.data as Idea[]);
    setMine(new Set((votes.data ?? []).map((v) => v.suggestion_id as number)));
  }, []);

  useEffect(() => {
    let live = true;
    void Promise.resolve().then(() => { if (live) void load(); });
    return () => { live = false; };
  }, [load]);

  const shown = ideas && visible(ideas, tab);

  async function vote(i: Idea) {
    const had = mine.has(i.id);
    setMine((m) => { const n = new Set(m); if (had) n.delete(i.id); else n.add(i.id); return n; });
    setIdeas((l) => l && l.map((x) => (x.id === i.id ? { ...x, votes: x.votes + (had ? -1 : 1) } : x)));
    const { error: err } = had
      ? await supabase!.from("suggestion_votes").delete().eq("suggestion_id", i.id)
      : await supabase!.from("suggestion_votes").insert({ suggestion_id: i.id });
    if (err) void load(); // desfaz o voto otimista
  }

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    if (title.trim().length < 4) return setError("Dá um título com pelo menos 4 letras.");
    setBusy(true);
    const { error: err } = await supabase!.from("suggestions").insert({ title: title.trim(), body: body.trim() });
    setBusy(false);
    if (err) return setError(err.code === "P0001" ? "Já partilhaste 5 ideias hoje. Obrigado! Volta amanhã." : "Não consegui partilhar. Tenta outra vez.");
    setTitle("");
    setBody("");
    setTab("new");
    await load();
  }

  async function remove(i: Idea) {
    await supabase!.from("suggestions").delete().eq("id", i.id);
    void load();
  }

  async function ask(i: Idea) {
    setAppealErr(null);
    try { await call("/api/appeal", { id: i.id, text: appealText.trim() }); } catch (e) { return setAppealErr(e instanceof Error ? e.message : "Não consegui enviar. Tenta outra vez."); }
    setAppealFor(null);
    setAppealText("");
    notify("Pedido enviado. Vais saber a decisão.");
    await load();
  }

  return (
    <div className="explore">
      <button type="button" className="linkbtn back" onClick={onBack}>← Voltar</button>
      <h1 className="h-screen">Ideias</h1>
      <p className="sub">Diz-nos o que queres ver no NOOBrain. Vota nas ideias de que gostas.</p>

      <form className="pane" onSubmit={submit}><div className="in set">
        <label className="lbl" htmlFor="idea-t">A tua ideia <span className="sub small">({title.length}/80)</span></label>
        <input id="idea-t" className="field ch" value={title} maxLength={80} onChange={(e) => setTitle(e.target.value)} autoComplete="off" />
        <label className="lbl" htmlFor="idea-b">Mais detalhes (opcional) <span className="sub small">({body.length}/600)</span></label>
        <textarea id="idea-b" className="field ch" rows={3} value={body} maxLength={600} onChange={(e) => setBody(e.target.value)} />
        {error && <div className="note ch" role="alert">{error}</div>}
        <button type="submit" className="btn" disabled={busy}><span className="face">{busy ? "Um momento…" : "Partilhar ideia"}</span></button>
      </div></form>

      <div className="topic-chips" role="group" aria-label="Separadores">
        {TABS.map(([id, label]) => <button key={id} type="button" className="chip ch" aria-pressed={tab === id} onClick={() => setTab(id)}>{label}</button>)}
      </div>

      {shown && !shown.length && <p className="sub center">Ainda não há ideias aqui.</p>}
      <div className="explore-list">
        {shown?.map((i, k) => (
          <div key={i.id} className={`pane rise${i.status === "recusada" ? " is-wrong" : ""}`} style={{ ["--i" as string]: k }}><div className="in idea">
            {OPEN.includes(i.status) ? (
              <button type="button" className={`vote${mine.has(i.id) ? " on" : ""}`} aria-pressed={mine.has(i.id)} aria-label={`Votar. ${i.votes} votos`} onClick={() => void vote(i)}>
                <ChevronUp /><b>{i.votes}</b>
              </button>
            ) : <span className="vote static" aria-label={`${i.votes} votos`}><b>{i.votes}</b></span>}
            <div className="idea-main">
              <div className="row-between"><b>{i.title}</b><span className={`chip ch st-${i.status}`}>{i.status === "feita" && <Check />}{STATUS[i.status] ?? i.status}</span></div>
              {i.body && <p className="sub">{i.body}</p>}
              <div className="idea-by">
                {i.profiles && <><Avatar n={i.profiles.avatar} size={22} /><span className="sub small">@{i.profiles.username}</span><TeamTag id={i.user_id} /></>}
                {i.user_id === user.id && i.status === "recebida" && <button type="button" className="linkbtn" onClick={() => void remove(i)}>Apagar</button>}
              </div>
              {i.reply && (i.status === "recusada" || i.status === "recurso"
                ? <p className="sub"><b>Porquê:</b> {i.reply}</p>
                : <div className="pane tint"><div className="in"><div className="eyebrow">Resposta da NOOBjects</div><p>{i.reply}</p></div></div>)}
              {i.status === "recurso" && i.appeal && <div className="pane tint"><div className="in"><div className="eyebrow">{i.user_id === user.id ? "O teu pedido de revisão" : "Pedido de revisão do autor"}</div><p>{i.appeal}</p></div></div>}
              {i.status === "recusada" && i.user_id === user.id && !i.appeal && (appealFor === i.id ? (
                <div className="set">
                  <label className="lbl" htmlFor={`ap${i.id}`}>Explica porque achas que vale a pena reconsiderar. <span className="sub small">({appealText.length}/300)</span></label>
                  <textarea id={`ap${i.id}`} className="field ch" rows={3} maxLength={300} value={appealText} onChange={(e) => setAppealText(e.target.value)} />
                  {appealErr && <div className="note ch" role="alert">{appealErr}</div>}
                  <div className="pair">
                    <button type="button" className="btn sm" disabled={appealText.trim().length < 10} onClick={() => void ask(i)}><span className="face">Enviar pedido</span></button>
                    <button type="button" className="btn soft sm" onClick={() => { setAppealFor(null); setAppealErr(null); }}><span className="face">Cancelar</span></button>
                  </div>
                </div>
              ) : <button type="button" className="btn soft sm" onClick={() => { setAppealFor(i.id); setAppealText(""); }}><span className="face">Pedir revisão</span></button>)}
            </div>
          </div></div>
        ))}
      </div>
    </div>
  );
}
