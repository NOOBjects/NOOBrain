"use client";

import { useState } from "react";
import { Mascot } from "./Mascot";
import { reportError } from "@/lib/api";
import type { Question } from "@/lib/types";

/** Teste: a pergunta errada volta ao fim da ronda até ser acertada. `onFinish` diz quantas acertou à primeira e quais falhou. */
export function Quiz({ questions, onFinish }: { questions: Question[]; onFinish: (first: number, missed: number[]) => void }) {
  const [order, setOrder] = useState(() => questions.map((_, k) => k)); // índices por responder; as erradas voltam ao fim
  const [i, setI] = useState(0);
  const [sel, setSel] = useState<number | null>(null);
  const [checked, setChecked] = useState(false);
  const [resolved, setResolved] = useState(0);
  const [missed, setMissed] = useState<number[]>([]);
  const [reported, setReported] = useState(false);
  const qi = order[i];
  const q = questions[qi];
  const ok = checked && sel === q.answer;
  const last = i + 1 >= order.length && ok;

  function check() {
    setChecked(true);
    if (sel === q.answer) setResolved((r) => r + 1);
    else if (!missed.includes(qi)) setMissed((m) => [...m, qi]);
  }

  function next() {
    if (last) return onFinish(questions.length - missed.length, missed);
    if (!ok) setOrder((o) => [...o, qi]);
    setI(i + 1);
    setSel(null);
    setChecked(false);
    setReported(false);
  }

  return (
    <div className="quiz">
      <div className="qtop">
        <div className="bar ch"><i style={{ transform: `scaleX(${resolved / questions.length})` }} /></div>
        <span className="eyebrow">{resolved}/{questions.length}</span>
      </div>
      <h2 className="q">{q.q}</h2>
      <div className="opts" role="radiogroup" aria-label="Alternativas">
        {q.options.map((o, k) => {
          const state = checked ? (k === q.answer ? "is-right" : k === sel ? "is-wrong" : "") : k === sel ? "is-picked" : "";
          return (
            <button key={k} type="button" role="radio" aria-checked={sel === k} disabled={checked} className={`opt pane ${state}`} onClick={() => setSel(k)}>
              <span className="in">{o}</span>
            </button>
          );
        })}
      </div>

      {!checked ? (
        <button type="button" className="btn block qbtn" disabled={sel === null} onClick={check}>
          <span className="face">Verificar</span>
        </button>
      ) : (
        <div className={`feedback ${ok ? "ok" : "bad"}`} role="status">
          <div className="row">
            <div className="fb-mascot"><Mascot mood={ok ? "happy" : "sad"} /></div>
            <h3>{ok ? "Correto!" : `Quase. A resposta é: ${q.options[q.answer]}`}</h3>
          </div>
          <p>{q.why}</p>
          {!ok && <p className="sub small">Esta pergunta volta no fim, até acertares.</p>}
          <button type="button" className={`btn block ${ok ? "ok" : "bad"}`} autoFocus onClick={next}>
            <span className="face">{last ? "Finalizar" : "Continuar"}</span>
          </button>
          <button type="button" className="linkbtn" disabled={reported} onClick={() => { setReported(true); reportError("quiz", `${q.q} | marcada: ${q.options[sel ?? 0]} | certa: ${q.options[q.answer]}`); }}>
            {reported ? "Obrigado, registado" : "Reportar erro"}
          </button>
        </div>
      )}
    </div>
  );
}
