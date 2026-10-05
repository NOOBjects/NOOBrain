"use client";

import { Mascot } from "./Mascot";
import { NEW_LESSONS_PER_DAY } from "@/lib/limits";

/** Limite diário de lições novas: o cérebro fixa melhor com pausas. */
export function RestView({ due, onReview, onTrail, onBack }: { due: number; onReview: () => void; onTrail: () => void; onBack: () => void }) {
  return (
    <div className="rest hero-new">
      <div className="result-mascot"><Mascot mood="calm" /></div>
      <h1 className="h-screen">Por hoje chega de lições novas</h1>
      <p className="sub">Já fizeste {NEW_LESSONS_PER_DAY} lições novas hoje. O cérebro fixa melhor com pausas: amanhã há mais.</p>
      <div className="stack">
        {due > 0 && <button type="button" className="btn block" onClick={onReview}><span className="face">Rever cartões</span></button>}
        <button type="button" className={`btn block${due > 0 ? " soft" : ""}`} onClick={onTrail}><span className="face">Repetir uma lição</span></button>
        <button type="button" className="btn soft block" onClick={onBack}><span className="face">Voltar</span></button>
      </div>
    </div>
  );
}
