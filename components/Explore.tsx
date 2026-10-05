"use client";

import { useEffect, useMemo, useState } from "react";
import { CategoryIcon } from "./CategoryIcon";
import { Compass, HeroIco } from "./Icons";
import { CATEGORIES, categoryName, type Category } from "@/lib/categories";
import { LEVELS } from "@/lib/levels";
import { loadCatalog, startFromCatalog, type CatalogRow } from "@/lib/catalog-client";
import { topicKey } from "@/lib/topic";
import type { State, Trail } from "@/lib/types";

const norm = (s: string) => s.normalize("NFD").replace(/[̀-ͯ]/g, "").toLowerCase().trim();

/** Temas que já estão no catálogo partilhado: começar um é instantâneo e não gasta IA. */
export function Explore({ state, initialQuery = "", onStart, onNew }: { state: State; initialQuery?: string; onStart: (trail: Trail) => void; onNew: () => void }) {
  const [rows, setRows] = useState<CatalogRow[] | null>(null);
  const [failed, setFailed] = useState(false);
  const [q, setQ] = useState(initialQuery);
  const [cat, setCat] = useState<Category | "">("");
  const [level, setLevel] = useState("");
  const [sort, setSort] = useState<"uses" | "new">("uses");

  useEffect(() => {
    let live = true;
    loadCatalog().then((r) => live && setRows(r), () => live && setFailed(true));
    return () => { live = false; };
  }, []);

  const cats = useMemo(() => CATEGORIES.filter(([id]) => rows?.some((r) => r.category === id)), [rows]);
  const levels = useMemo(() => LEVELS.map((l) => l.id as string).filter((l) => rows?.some((r) => r.level === l)), [rows]);
  const want = topicKey(q);
  const shown = (rows ?? [])
    .filter((r) => !q.trim() || r.key.includes(want) || norm(r.topic).includes(norm(q)))
    .filter((r) => !cat || r.category === cat)
    .filter((r) => !level || r.level === level)
    .sort((a, b) => (sort === "new" ? b.created_at.localeCompare(a.created_at) : b.uses - a.uses));
  const has = (r: CatalogRow) => state.trails.some((t) => t.key === r.key && t.level === r.level);

  return (
    <div className="explore">
      <div className="hero-new">
        <HeroIco><Compass /></HeroIco>
        <h1 className="h-screen">Explorar temas</h1>
        <p className="sub">Trilhas que já estão prontas. Começa uma e estudas logo, sem esperar.</p>
      </div>
      <label className="sr" htmlFor="q">Procurar tema</label>
      <input id="q" className="field ch" type="search" value={q} onChange={(e) => setQ(e.target.value)} placeholder="Procurar tema" autoComplete="off" enterKeyHint="search" />
      {cats.length > 1 && (
        <div className="topic-chips cats" role="group" aria-label="Categorias">
          <button type="button" className="chip ch" aria-pressed={!cat} onClick={() => setCat("")}>Todas</button>
          {cats.map(([id, label]) => (
            <button key={id} type="button" className="chip ch" aria-pressed={cat === id} onClick={() => setCat(cat === id ? "" : id)}><CategoryIcon c={id} />{label}</button>
          ))}
        </div>
      )}
      <div className="filters">
        <div className="seg" role="group" aria-label="Ordenar">
          <button type="button" className="ch" aria-pressed={sort === "uses"} onClick={() => setSort("uses")}>Populares</button>
          <button type="button" className="ch" aria-pressed={sort === "new"} onClick={() => setSort("new")}>Novos</button>
        </div>
        {levels.length > 1 && (
          <select className="field ch level-pick" value={level} onChange={(e) => setLevel(e.target.value)} aria-label="Nível">
            <option value="">Todos os níveis</option>
            {levels.map((l) => <option key={l} value={l}>{l}</option>)}
          </select>
        )}
      </div>
      {failed && <div className="note ch" role="alert">Não consegui carregar os temas. Verifica a ligação e tenta outra vez.</div>}
      {!rows && !failed && <div className="explore-list" aria-hidden="true">{[0, 1, 2].map((i) => <div key={i} className="pane skel"><div className="in" /></div>)}</div>}
      {rows && !shown.length && <p className="sub center">Nenhum tema encontrado. Que tal criares tu este?</p>}
      <div className="explore-list">
        {shown.map((r, i) => (
          <div key={`${r.key}:${r.level}`} className="pane rise" style={{ ["--i" as string]: Math.min(i, 12) }}><div className="in topic-row">
            <span className="cat-ico ch" aria-hidden="true"><CategoryIcon c={r.category} /></span>
            <div className="topic-t"><b>{r.topic}</b><div className="sub small" title={categoryName(r.category)}>{r.level} · {r.concepts.length} conceitos</div></div>
            <button type="button" className={`btn sm${has(r) ? " soft" : ""}`} onClick={() => onStart(startFromCatalog(r, state))}><span className="face">{has(r) ? "Abrir" : "Começar"}</span></button>
          </div></div>
        ))}
      </div>
      <button type="button" className="btn soft block" onClick={onNew}><span className="face">Criar um tema novo</span></button>
    </div>
  );
}
