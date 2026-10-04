"use client";

import { useEffect, useState } from "react";
import { Mascot } from "./Mascot";
import { newId } from "@/lib/api";
import { update } from "@/lib/store";
import { supabase } from "@/lib/supabase";
import { topicKey } from "@/lib/topic";
import type { Concept, Source, State, Trail } from "@/lib/types";

type Row = { key: string; level: string; topic: string; concepts: Concept[]; sources: Source[]; uses: number };

/** Temas que já estão no catálogo partilhado: começar um é instantâneo e não gasta IA. */
export function Explore({ state, onStart, onNew }: { state: State; onStart: (trail: Trail) => void; onNew: () => void }) {
  const [rows, setRows] = useState<Row[] | null>(null);
  const [failed, setFailed] = useState(false);
  const [q, setQ] = useState("");

  useEffect(() => {
    let live = true;
    supabase!.from("catalog_trails").select("key,level,topic,concepts,sources,uses").order("uses", { ascending: false }).limit(60).then(({ data, error }) => {
      if (!live) return;
      if (error) setFailed(true);
      else setRows((data as Row[]) ?? []);
    });
    return () => { live = false; };
  }, []);

  function start(r: Row) {
    const mine = state.trails.find((t) => t.key === r.key && t.level === r.level);
    if (mine) { update((s) => ({ ...s, active: mine.id })); return onStart(mine); }
    const trail: Trail = { id: newId(), topic: r.topic, key: r.key, level: r.level, concepts: r.concepts.map(({ title, summary }) => ({ title, summary })), sources: r.sources, done: 0 };
    update((s) => ({ ...s, trails: [trail, ...s.trails], active: trail.id }));
    void supabase!.rpc("bump_catalog_use", { p_key: r.key, p_level: r.level });
    onStart(trail);
  }

  const want = topicKey(q);
  const shown = rows?.filter((r) => !q.trim() || r.key.includes(want) || r.topic.toLowerCase().includes(q.trim().toLowerCase())) ?? [];

  return (
    <div className="explore">
      <div className="hero-new">
        <div className="hero-mascot"><Mascot mood={rows ? "idle" : "think"} /></div>
        <h1 className="h-screen">Explorar temas</h1>
        <p className="sub">Trilhas que já estão prontas. Começa uma e estudas logo, sem esperar.</p>
      </div>
      <label className="sr" htmlFor="q">Procurar tema</label>
      <input id="q" className="field ch" value={q} onChange={(e) => setQ(e.target.value)} placeholder="Procurar tema" autoComplete="off" />
      {failed && <div className="note ch" role="alert">Não consegui carregar os temas. Tenta outra vez mais tarde.</div>}
      {rows && !shown.length && <p className="sub center">Nenhum tema encontrado.</p>}
      <div className="explore-list">
        {shown.map((r, i) => (
          <div key={`${r.key}:${r.level}`} className="pane rise" style={{ ["--i" as string]: i }}><div className="in due-row">
            <div><b>{r.topic}</b><div className="sub small">{r.level} · {r.concepts.length} conceitos</div></div>
            <button type="button" className="btn sm" onClick={() => start(r)}><span className="face">{state.trails.some((t) => t.key === r.key && t.level === r.level) ? "Abrir" : "Começar"}</span></button>
          </div></div>
        ))}
      </div>
      <button type="button" className="btn soft block" onClick={onNew}><span className="face">Criar um tema novo</span></button>
    </div>
  );
}
