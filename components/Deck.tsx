"use client";

import { useState } from "react";
import { RATINGS, whenText } from "@/lib/store";

export type DeckItem = { id: string; term: string; definition: string; hint?: string };

/**
 * Cartões de memória: toque para virar, depois diga o quanto lembrou.
 * Com `requeue`, o cartão marcado "De novo" volta ao fim da fila até você acertar (usado ao aprender).
 * `onRate` devolve quando o cartão volta pela revisão espaçada.
 */
export function Deck({ items, onRate, onEnd, endLabel = "Concluir", endTitle = "Cartões em dia", endText, requeue = false }: {
  items: DeckItem[];
  onRate: (id: string, rating: 0 | 1 | 2) => number;
  onEnd: () => void;
  endLabel?: string;
  endTitle?: string;
  endText?: string;
  requeue?: boolean;
}) {
  const [queue, setQueue] = useState(items);
  const [flipped, setFlipped] = useState(false);
  const [lastDue, setLastDue] = useState<string | null>(null);
  const item = queue[0];

  if (!item)
    return (
      <div className="result">
        <h2 className="h-screen">{endTitle}</h2>
        {endText && <p className="sub">{endText}</p>}
        <button type="button" className="btn" onClick={onEnd}><span className="face">{endLabel}</span></button>
      </div>
    );

  function pick(r: 0 | 1 | 2) {
    setLastDue(whenText(onRate(item.id, r)));
    setFlipped(false);
    setQueue((q) => (r === 0 && requeue ? [...q.slice(1), q[0]] : q.slice(1)));
  }
  const flip = () => setFlipped((f) => !f);

  return (
    <div className="deck">
      <div className="count">
        <span>{queue.length === 1 ? "Último cartão" : `Faltam ${queue.length} cartões`}</span>
        <span>{lastDue ? `O anterior volta em ${lastDue}` : "Toque para virar"}</span>
      </div>
      <div className="flip">
        <div role="button" tabIndex={0} className="card3d" data-flipped={flipped ? "1" : "0"} onClick={flip}
          onKeyDown={(e) => { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); flip(); } }}
          aria-label={flipped ? "Mostrar o termo" : "Mostrar a definição"}>
          <span className="face3 front"><span className="pane"><span className="in"><span className="hint">{item.hint ?? "Termo"}</span><span className="term">{item.term}</span></span></span></span>
          <span className="face3 back"><span className="pane tint"><span className="in"><span className="hint">Definição</span><span className="def">{item.definition}</span></span></span></span>
        </div>
      </div>
      {flipped ? (
        <div className="rate">
          {RATINGS.map((r, k) => (
            <button key={r.label} type="button" className={`btn ${r.cls}`} onClick={() => pick(k as 0 | 1 | 2)}>
              <span className="face">{r.label}<small>{requeue && k === 0 ? "revê agora" : r.hint}</small></span>
            </button>
          ))}
        </div>
      ) : (
        <button type="button" className="btn soft block" onClick={flip}><span className="face">Mostrar resposta</span></button>
      )}
    </div>
  );
}
