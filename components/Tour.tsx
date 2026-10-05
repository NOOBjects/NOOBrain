"use client";

import { useEffect, useRef, useState } from "react";
import { Book, Route, Sync } from "./Icons";

const STEPS = [
  { icon: <Route />, title: "A tua trilha", text: "Cada tema é um caminho de conceitos, do mais simples ao mais avançado. Escolhe um em Explorar ou cria o teu." },
  { icon: <Book />, title: "Cada lição, três passos", text: "Aprender com uma explicação curta, Memorizar com cartões e Testar. O tutor tira-te dúvidas em qualquer passo." },
  { icon: <Sync />, title: "Rever na hora certa", text: "Os cartões voltam antes de os esqueceres. Bastam uns minutos por dia para manteres a sequência." },
];

/** Visita guiada de 3 passos, para quem acabou de criar o perfil. Pode-se saltar. */
export function Tour({ onDone }: { onDone: () => void }) {
  const ref = useRef<HTMLDialogElement>(null);
  const [i, setI] = useState(0);
  useEffect(() => {
    const d = ref.current;
    if (d && !d.open) d.showModal();
  }, []);
  const step = STEPS[i];
  const last = i === STEPS.length - 1;
  return (
    <dialog ref={ref} className="sheet" aria-labelledby="tour-t" onClose={onDone}>
      <div className="pane hero"><div className="in">
        <div className="w-head">
          <div className="tour-dots" aria-label={`Passo ${i + 1} de ${STEPS.length}`}>{STEPS.map((_, k) => <i key={k} className={k === i ? "on" : ""} />)}</div>
          <span className="w-ico ch big" aria-hidden="true">{step.icon}</span>
          <h2 id="tour-t" key={i} className="reveal">{step.title}</h2>
          <p key={`p${i}`} className="reveal">{step.text}</p>
        </div>
        <div className="w-ask">
          <div className="pair">
            <form method="dialog"><button type="submit" className="btn soft sm block"><span className="face">{last ? "Fechar" : "Saltar"}</span></button></form>
            {last
              ? <form method="dialog"><button type="submit" className="btn sm block" autoFocus><span className="face">Começar</span></button></form>
              : <button type="button" className="btn sm block" autoFocus onClick={() => setI(i + 1)}><span className="face">Seguinte</span></button>}
          </div>
        </div>
      </div></div>
    </dialog>
  );
}
