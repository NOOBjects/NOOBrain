"use client";

import { useEffect, useState } from "react";
import { Mascot } from "./Mascot";
import { ReminderToggle } from "./ReminderToggle";
import { Soon } from "./Soon";
import { Bug, Spark, Up } from "./Icons";
import { CHANGELOG, LATEST, type Kind, type Release } from "@/lib/changelog";
import { update } from "@/lib/store";
import type { State } from "@/lib/types";

const when = (d: string) => new Date(`${d}T12:00:00`).toLocaleDateString("pt-PT", { day: "numeric", month: "long", year: "numeric" });

const GROUPS = [
  { key: "novo", label: "Novo", icon: <Spark /> },
  { key: "melhorias", label: "Melhorias", icon: <Up /> },
  { key: "corrigido", label: "Corrigido", icon: <Bug /> },
] as const satisfies readonly { key: keyof Release; label: string; icon: React.ReactNode }[];

const FILTERS: { id: "tudo" | Kind; label: string }[] = [{ id: "tudo", label: "Tudo" }, { id: "marco", label: "Marcos" }, { id: "novidades", label: "Novidades" }, { id: "correcoes", label: "Correções" }];

function Lists({ r }: { r: Release }) {
  return GROUPS.map(({ key, label, icon }) => r[key]?.length ? (
    <div key={key} className={`rel-group ${key}`}>
      <div className="rel-tag ch">{icon}{label}</div>
      <ul className="news-list">{r[key]!.map((t) => <li key={t}>{t}</li>)}</ul>
    </div>
  ) : null);
}

/** Uma versão: o marco (grande atualização) vem em destaque, as novidades como cartão normal e as correções compactas e fechadas. */
function ReleaseCard({ r, i }: { r: Release; i: number }) {
  const style = { "--i": i } as React.CSSProperties;
  if (r.kind === "marco")
    return (
      <section className="pane hero gap release marco" style={style}><div className="in">
        <div className="marco-head">
          <div><div className="eyebrow">Versão {r.version} · grande atualização</div><h2>{r.title}</h2><div className="sub small">{when(r.date)}</div></div>
          <div className="marco-mascot"><Mascot mood="happy" /></div>
        </div>
        {!!r.destaques?.length && <><div className="eyebrow">Destaques</div><ul className="news-list destaques">{r.destaques.map((t) => <li key={t}>{t}</li>)}</ul></>}
        <Lists r={r} />
      </div></section>
    );
  if (r.kind === "correcoes")
    return (
      <section className="pane gap release fix" style={style}><div className="in">
        <details>
          <summary><span className="rel-tag ch"><Bug />Correções</span><span><b>Versão {r.version}</b> · {r.title}<span className="sub small"> · {when(r.date)}</span></span></summary>
          <div className="fix-body"><Lists r={r} /></div>
        </details>
      </div></section>
    );
  return (
    <section className="pane gap release" style={style}><div className="in">
      <div className="row-between center-y"><div className="eyebrow">Versão {r.version} · {when(r.date)}</div><span className="rel-tag ch"><Spark />Novidades</span></div>
      <h2>{r.title}</h2>
      <Lists r={r} />
    </div></section>
  );
}

/** Novidades: o «Em breve», o que é a beta, o interruptor dos avisos e o que mudou em cada versão (com filtros por tipo). */
export function News({ state, onIdeas }: { state: State; onIdeas: () => void }) {
  const [filter, setFilter] = useState<"tudo" | Kind>("tudo");
  // Abrir esta página conta como "já vi as novidades".
  useEffect(() => {
    if (state.seenVersion !== LATEST.version) update((s) => ({ ...s, seenVersion: LATEST.version }));
  }, [state.seenVersion]);
  const list = CHANGELOG.filter((r) => filter === "tudo" || r.kind === filter);
  return (
    <div className="news">
      <div className="eyebrow">Versão beta {LATEST.version}</div>
      <h1 className="h-screen">Novidades</h1>
      <div className="gap"><Soon /></div>
      <div className="pane tint gap"><div className="in">
        <b>O NOOBrain está em beta</b>
        <p className="sub small">Estamos a construí-lo contigo: algumas coisas podem falhar ou mudar. As tuas ideias decidem o que vem a seguir.</p>
        <div className="beta-row"><button type="button" className="btn soft sm" onClick={onIdeas}><span className="face">Dar uma ideia</span></button></div>
      </div></div>
      <div className="pane gap"><div className="in remind-box"><div className="eyebrow">Avisos de atualização</div><ReminderToggle kind="news" /></div></div>
      <div className="topic-chips gap" role="group" aria-label="Filtrar versões">
        {FILTERS.map((f) => <button key={f.id} type="button" className="chip ch" aria-pressed={filter === f.id} onClick={() => setFilter(f.id)}>{f.label}</button>)}
      </div>
      {!list.length && <p className="sub center">Nada neste filtro.</p>}
      {list.map((r, i) => <ReleaseCard key={r.version} r={r} i={i} />)}
    </div>
  );
}
