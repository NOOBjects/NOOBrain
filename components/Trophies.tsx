"use client";

import { useEffect, useRef } from "react";
import { Confetti } from "./Confetti";
import { PLACE_NAME, tally, type Award } from "@/lib/awards";

/** Troféu (1.º ouro, 2.º prata, 3.º bronze) ou medalha «Top 10» (4.º a 10.º), com o número lá dentro. */
export function TrophyCup({ place, size = 48 }: { place: number; size?: number }) {
  const cls = place <= 3 ? `p${place}` : "p4";
  return (
    <svg className={`cup ${cls}`} width={size} height={size * 1.1} viewBox="0 0 48 53" role="img" aria-label={PLACE_NAME(place)}>
      {place <= 3 ? (
        <>
          <path className="c-hand" d="M10 10 H4 V18 L10 24 M38 10 H44 V18 L38 24" />
          <path className="c-body" d="M10 5 H38 V22 L30 32 H18 L10 22 Z" />
          <path className="c-base" d="M21 32 H27 V40 H21 Z M13 41 H35 V47 H13 Z" />
          <text x="24" y="23">{place}</text>
        </>
      ) : (
        <>
          <path className="c-base" d="M14 2 H22 L24 14 H16 Z M34 2 H26 L24 14 H32 Z" />
          <path className="c-body" d="M16 14 H32 L42 24 V36 L32 47 H16 L6 36 V24 Z" />
          <text x="24" y="35">10</text>
        </>
      )}
    </svg>
  );
}

/** «Troféus» no perfil: contagem de cada tipo (não mostra nada se não houver). */
export function TrophyLine({ awards }: { awards: Pick<Award, "place">[] }) {
  if (!awards.length) return null;
  const t = tally(awards);
  const rows: [number, number, string][] = [[1, t.ouro, "ouro"], [2, t.prata, "prata"], [3, t.bronze, "bronze"], [4, t.top10, "Top 10"]];
  return (
    <section aria-labelledby="troph-t">
      <h2 id="troph-t" className="h-sec">Troféus</h2>
      <div className="trophy-line">
        {rows.filter(([, n]) => n > 0).map(([p, n, label]) => <span key={p} className="t" title={`${n} × ${label}`}><TrophyCup place={p} size={28} />× {n}</span>)}
      </div>
    </section>
  );
}

/** Janela de celebração ao abrir o app depois de ganhar um prémio, com confettis. */
export function TrophyDialog({ awards, onClose }: { awards: Award[]; onClose: () => void }) {
  const ref = useRef<HTMLDialogElement>(null);
  useEffect(() => { const d = ref.current; if (d && !d.open) d.showModal(); }, []);
  const best = [...awards].sort((a, b) => a.place - b.place)[0];
  const fmt = (w: string) => new Date(`${w}T12:00:00`).toLocaleDateString("pt-PT", { day: "numeric", month: "long" });
  return (
    <dialog ref={ref} className="sheet" aria-labelledby="troph-d" onClose={onClose}>
      <Confetti />
      <div className="pane hero"><div className="in">
        <div className="w-head center">
          <span className="chip ch beta">Ranking da semana</span>
          <div className="badge-big"><TrophyCup place={best.place} size={88} /></div>
          <h2 id="troph-d">{best.place === 1 ? "Foste o campeão da semana!" : `Ficaste em ${best.place}.º lugar!`}</h2>
          <p>{PLACE_NAME(best.place)} · semana de {fmt(best.week_start)} · {best.xp} XP</p>
          {awards.length > 1 && <p className="sub small">Tens mais {awards.length - 1} {awards.length === 2 ? "prémio novo" : "prémios novos"} no teu Perfil.</p>}
        </div>
        <div className="w-ask"><form method="dialog"><button type="submit" className="btn block" autoFocus><span className="face">Continuar</span></button></form></div>
      </div></div>
    </dialog>
  );
}
