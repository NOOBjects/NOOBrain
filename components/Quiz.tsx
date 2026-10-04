"use client";

import { useState } from "react";
import { Mascot } from "./Mascot";
import { reportError } from "@/lib/api";
import type { Question } from "@/lib/types";

export function Quiz({ questions, onFinish }: { questions: Question[]; onFinish: (correct: number) => void }) {
  const [i, setI] = useState(0);
  const [sel, setSel] = useState<number | null>(null);
  const [checked, setChecked] = useState(false);
  const [correct, setCorrect] = useState(0);
  const [reported, setReported] = useState(false);
  const q = questions[i];
  const ok = checked && sel === q.answer;

  function next() {
    const total = correct;
    if (i + 1 >= questions.length) return onFinish(total);
    setI(i + 1);
    setSel(null);
    setChecked(false);
    setReported(false);
  }

  return (
    <div className="quiz">
      <div className="qtop">
        <div className="bar ch"><i style={{ transform: `scaleX(${i / questions.length})` }} /></div>
        <span className="eyebrow">{i + 1}/{questions.length}</span>
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
        <button type="button" className="btn block qbtn" disabled={sel === null} onClick={() => { setChecked(true); if (sel === q.answer) setCorrect((c) => c + 1); }}>
          <span className="face">Verificar</span>
        </button>
      ) : (
        <div className={`feedback ${ok ? "ok" : "bad"}`} role="status">
          <div className="row">
            <div className="fb-mascot"><Mascot mood={ok ? "happy" : "sad"} /></div>
            <h3>{ok ? "Correto!" : `Quase. A resposta é: ${q.options[q.answer]}`}</h3>
          </div>
          <p>{q.why}</p>
          <button type="button" className={`btn block ${ok ? "ok" : "bad"}`} autoFocus onClick={next}>
            <span className="face">{i + 1 >= questions.length ? "Finalizar" : "Continuar"}</span>
          </button>
          <button type="button" className="linkbtn" disabled={reported} onClick={() => { setReported(true); reportError("quiz", `${q.q} | marcada: ${q.options[sel ?? 0]} | certa: ${q.options[q.answer]}`); }}>
            {reported ? "Obrigado, registado" : "Reportar erro"}
          </button>
        </div>
      )}
    </div>
  );
}
