"use client";

import { useEffect } from "react";
import { ReminderToggle } from "./ReminderToggle";
import { Soon } from "./Soon";
import { Bug, Spark, Up } from "./Icons";
import { CHANGELOG, LATEST, type Release } from "@/lib/changelog";
import { update } from "@/lib/store";
import type { State } from "@/lib/types";

const when = (d: string) => new Date(`${d}T12:00:00`).toLocaleDateString("pt-PT", { day: "numeric", month: "long", year: "numeric" });

const GROUPS = [
  { key: "novo", label: "Novo", icon: <Spark /> },
  { key: "melhorias", label: "Melhorias", icon: <Up /> },
  { key: "corrigido", label: "Corrigido", icon: <Bug /> },
] as const satisfies readonly { key: keyof Release; label: string; icon: React.ReactNode }[];

/** Novidades: o que é a beta, o interruptor dos avisos de atualização e o que mudou em cada versão. */
export function News({ state, onIdeas }: { state: State; onIdeas: () => void }) {
  // Abrir esta página conta como "já vi as novidades".
  useEffect(() => {
    if (state.seenVersion !== LATEST.version) update((s) => ({ ...s, seenVersion: LATEST.version }));
  }, [state.seenVersion]);
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
      {CHANGELOG.map((r, i) => (
        <section key={r.version} className="pane gap release" style={{ "--i": i } as React.CSSProperties}><div className="in">
          <div className="eyebrow">Versão {r.version} · {when(r.date)}</div>
          <h2>{r.title}</h2>
          {GROUPS.map(({ key, label, icon }) => r[key]?.length ? (
            <div key={key} className={`rel-group ${key}`}>
              <div className="rel-tag ch">{icon}{label}</div>
              <ul className="news-list">{r[key]!.map((t) => <li key={t}>{t}</li>)}</ul>
            </div>
          ) : null)}
        </div></section>
      ))}
    </div>
  );
}
