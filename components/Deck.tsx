"use client";

import { useState } from "react";
import { Listen } from "./Listen";
import { RATINGS, whenText } from "@/lib/store";

/** Com `options` e `answer`, o item é uma pergunta de teste falhada: responde-se em vez de virar (certa = "Bom", errada = "De novo"). */
export type DeckItem = { id: string; term: string; definition: string; hint?: string; options?: string[]; answer?: number; lang?: string };

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
  const [picked, setPicked] = useState<number | null>(null); // opção escolhida numa pergunta
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
    setPicked(null);
    setQueue((q) => (r === 0 && requeue ? [...q.slice(1), q[0]] : q.slice(1)));
  }
  const isQ = !!item.options;
  const flip = () => { if (!isQ) setFlipped((f) => !f); };
  const shown = flipped || picked !== null;
  const right = picked !== null && picked === item.answer;

  return (
    <div className="deck">
      <div className="count">
        <span>{queue.length === 1 ? "Último cartão" : `Faltam ${queue.length} cartões`}</span>
        <span>{lastDue ? `O anterior volta em ${lastDue}` : item.options ? "Escolhe a resposta" : "Toque para virar"}</span>
      </div>
      <div className="flip">
        <div role="button" tabIndex={0} className="card3d" data-flipped={shown ? "1" : "0"} onClick={flip}
          onKeyDown={(e) => { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); flip(); } }}
          aria-label={isQ ? "Pergunta" : flipped ? "Mostrar o termo" : "Mostrar a definição"}>
          <span className="face3 front"><span className="pane"><span className="in"><span className="hint">{item.hint ?? (isQ ? "Pergunta" : "Termo")}</span><span className="term">{item.term}</span>{item.lang && !isQ && <Listen text={item.term} lang={item.lang} label="Ouvir a pronúncia" small />}</span></span></span>
          <span className="face3 back"><span className="pane tint"><span className="in"><span className="hint">{isQ ? (right ? "Certo" : "A resposta é") : "Definição"}</span><span className="def">{item.definition}</span></span></span></span>
        </div>
      </div>
      {isQ ? (
        picked === null ? (
          <div className="opts" role="group" aria-label="Alternativas">
            {item.options!.map((o, k) => (
              <button key={k} type="button" className="opt pane" onClick={() => setPicked(k)}><span className="in">{o}</span></button>
            ))}
          </div>
        ) : (
          <button type="button" className={`btn block ${right ? "ok" : "bad"}`} autoFocus onClick={() => pick(right ? 1 : 0)}>
            <span className="face">Continuar<small>{right ? "volta mais tarde" : "volta em 10 min"}</small></span>
          </button>
        )
      ) : flipped ? (
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
