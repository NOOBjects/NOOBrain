"use client";

import { useState } from "react";
import { Mascot } from "./Mascot";
import type { Conflict } from "@/lib/useSync";
import type { State } from "@/lib/types";

/** "3 trilhas · 120 XP · 5 dias seguidos" */
function summary(s: State) {
  const n = s.trails.filter((t) => !t.example).length;
  return [
    `${n} ${n === 1 ? "trilha" : "trilhas"}`,
    `${s.xp} XP`,
    `${s.streak} ${s.streak === 1 ? "dia seguido" : "dias seguidos"}`,
  ].join(" · ");
}

/** Aparece ao entrar numa conta quando este aparelho tem progresso feito sem conta e diferente do da conta. */
export function MergeChoice({ conflict, onPick }: { conflict: Conflict; onPick: (c: "juntar" | "conta" | "aparelho") => Promise<void> }) {
  const [busy, setBusy] = useState(false);
  const pick = (c: "juntar" | "conta" | "aparelho") => { setBusy(true); void onPick(c); };
  return (
    <div className="account">
      <div className="hero-mascot"><Mascot mood="think" /></div>
      <h1 className="h-screen">Encontrámos dois progressos</h1>
      <p className="sub">Este aparelho tem progresso feito sem conta, diferente do que está guardado na tua conta. O que queres fazer?</p>
      <div className="pane merge"><div className="in">
        <span className="eyebrow">Neste aparelho</span><b>{summary(conflict.local)}</b>
        <span className="eyebrow">Na conta</span><b>{summary(conflict.remote)}</b>
      </div></div>
      <div className="account-form">
        <button type="button" className="btn block" disabled={busy} onClick={() => pick("juntar")}><span className="face">Juntar os dois</span></button>
        <p className="sub small">Ficam todas as trilhas e cartões. Do XP e da sequência, fica o valor maior.</p>
        <button type="button" className="btn soft block" disabled={busy} onClick={() => pick("conta")}><span className="face">Usar só o da conta</span></button>
        <button type="button" className="btn soft block" disabled={busy} onClick={() => pick("aparelho")}><span className="face">Usar só o deste aparelho</span></button>
      </div>
    </div>
  );
}
