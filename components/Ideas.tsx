"use client";

import type { User } from "@supabase/supabase-js";
import { useCallback, useEffect, useState } from "react";
import { Avatar } from "./Avatar";
import { ChevronUp } from "./Icons";
import { supabase } from "@/lib/supabase";

type Idea = {
  id: number; user_id: string; title: string; body: string; status: string; reply: string | null; votes: number; created_at: string;
  profiles: { username: string; avatar: number } | null;
};
type Tab = "top" | "new" | "done";

const TABS: [Tab, string][] = [["top", "Mais votadas"], ["new", "Novas"], ["done", "Feitas"]];
const STATUS: Record<string, string> = { recebida: "Recebida", planeada: "Planeada", em_curso: "Em curso", feita: "Feita", recusada: "Recusada" };

/** Mural público de ideias: toda a gente vê, vota e partilha; a NOOBjects responde e muda o estado no painel do Supabase. */
export function Ideas({ user, onBack }: { user: User; onBack: () => void }) {
  const [tab, setTab] = useState<Tab>("top");
  const [ideas, setIdeas] = useState<Idea[] | null>(null);
  const [mine, setMine] = useState<Set<number>>(new Set());
  const [title, setTitle] = useState("");
  const [body, setBody] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  const load = useCallback(async (t: Tab) => {
    let q = supabase!.from("suggestions").select("*, profiles(username, avatar)").limit(50);
    if (t === "top") q = q.order("votes", { ascending: false }).order("created_at", { ascending: false });
    else if (t === "new") q = q.order("created_at", { ascending: false });
    else q = q.eq("status", "feita").order("created_at", { ascending: false });
    const [list, votes] = await Promise.all([q, supabase!.from("suggestion_votes").select("suggestion_id")]);
    if (list.error) return setError("Não consegui carregar as ideias. Tenta outra vez mais tarde.");
    setIdeas(list.data as Idea[]);
    setMine(new Set((votes.data ?? []).map((v) => v.suggestion_id as number)));
  }, []);

  useEffect(() => {
    let live = true;
    void Promise.resolve().then(() => { if (live) void load(tab); });
    return () => { live = false; };
  }, [tab, load]);

  async function vote(i: Idea) {
    const had = mine.has(i.id);
    setMine((m) => { const n = new Set(m); if (had) n.delete(i.id); else n.add(i.id); return n; });
    setIdeas((l) => l && l.map((x) => (x.id === i.id ? { ...x, votes: x.votes + (had ? -1 : 1) } : x)));
    const { error: err } = had
      ? await supabase!.from("suggestion_votes").delete().eq("suggestion_id", i.id)
      : await supabase!.from("suggestion_votes").insert({ suggestion_id: i.id });
    if (err) void load(tab); // desfaz o voto otimista
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
    await load("new");
  }

  async function remove(i: Idea) {
    await supabase!.from("suggestions").delete().eq("id", i.id);
    void load(tab);
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

      <div className="seg three" role="group" aria-label="Ordenar">
        {TABS.map(([id, label]) => <button key={id} type="button" className="ch" aria-pressed={tab === id} onClick={() => setTab(id)}>{label}</button>)}
      </div>

      {ideas && !ideas.length && <p className="sub center">Ainda não há ideias aqui.</p>}
      <div className="explore-list">
        {ideas?.map((i, k) => (
          <div key={i.id} className="pane rise" style={{ ["--i" as string]: k }}><div className="in idea">
            <button type="button" className={`vote${mine.has(i.id) ? " on" : ""}`} aria-pressed={mine.has(i.id)} aria-label={`Votar. ${i.votes} votos`} onClick={() => void vote(i)}>
              <ChevronUp /><b>{i.votes}</b>
            </button>
            <div className="idea-main">
              <div className="row-between"><b>{i.title}</b><span className="chip ch">{STATUS[i.status] ?? i.status}</span></div>
              {i.body && <p className="sub">{i.body}</p>}
              <div className="idea-by">
                {i.profiles && <><Avatar n={i.profiles.avatar} size={22} /><span className="sub small">@{i.profiles.username}</span></>}
                {i.user_id === user.id && i.status === "recebida" && <button type="button" className="linkbtn" onClick={() => void remove(i)}>Apagar</button>}
              </div>
              {i.reply && <div className="pane tint"><div className="in"><div className="eyebrow">Resposta da NOOBjects</div><p>{i.reply}</p></div></div>}
            </div>
          </div></div>
        ))}
      </div>
    </div>
  );
}
