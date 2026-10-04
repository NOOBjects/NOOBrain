"use client";

import { useState } from "react";
import { Deck } from "./Deck";
import { Mascot } from "./Mascot";
import { ReminderToggle } from "./ReminderToggle";
import { dueCards, rate, update } from "@/lib/store";
import type { State } from "@/lib/types";

export function ReviewView({ state }: { state: State }) {
  // A fila é congelada ao começar, para os cartões não sumirem da tela enquanto você avalia.
  const [queue, setQueue] = useState<ReturnType<typeof dueCards> | null>(null);
  const due = dueCards(state);
  const groups = due.reduce<Record<string, typeof due>>((g, d) => ((g[d.topic] ??= []).push(d), g), {}); // Object.groupBy falha no iOS 16
  const learned = state.trails.reduce((n, t) => n + t.concepts.slice(0, t.done).filter((c) => c.lesson).length, 0);

  function onRate(id: string, r: 0 | 1 | 2) {
    let when = 0;
    update((s) => {
      const next = rate(s.cards[id], r);
      when = next.due;
      return { ...s, cards: { ...s.cards, [id]: next } };
    });
    return when;
  }

  if (queue)
    return (
      <div>
        <button type="button" className="linkbtn back" onClick={() => setQueue(null)}>← Sair da revisão</button>
        <h1 className="h-screen">Revisão</h1>
        <Deck items={queue.map((d) => ({ id: d.id, term: d.card.term, definition: d.card.definition, hint: d.topic }))} onRate={onRate} onEnd={() => setQueue(null)} endLabel="Concluir" />
      </div>
    );

  return (
    <div>
      <div className="eyebrow">Revisão espaçada</div>
      <h1 className="h-screen">{due.length ? `${due.length} ${due.length === 1 ? "cartão" : "cartões"} para hoje` : "Nada para rever agora"}</h1>
      <p className="sub">Revês no momento em que estás prestes a esquecer. Cada acerto espaça mais a próxima revisão.</p>

      {due.length > 0 ? (
        <>
          <div className="due">
            {Object.entries(groups).map(([topic, items]) => (
              <div key={topic} className="pane"><div className="in due-row"><div><b>{topic}</b><div className="sub small">{items[0].concept}{items.length > 1 ? " e outros" : ""}</div></div><span className="due-n">{items.length}</span></div></div>
            ))}
          </div>
          <button type="button" className="btn block" onClick={() => setQueue(due)}><span className="face">Rever agora</span></button>
        </>
      ) : (
        <div className="empty">
          <div className="hero-mascot"><Mascot /></div>
          <p className="sub center">
            {learned
              ? "Os teus cartões estão em dia. Volta mais tarde: aparecem quando chegar a hora de rever."
              : "Conclui o teste de um conceito na trilha. Os cartões dele entram aqui para revisão."}
          </p>
        </div>
      )}

      <div className="pane gap"><div className="in remind-box"><div className="eyebrow">Lembretes</div><ReminderToggle /></div></div>

      <div className="pane tint gap"><div className="in ladder-box">
        <div className="eyebrow">Intervalos de um cartão que acertas</div>
        <div className="ladder"><i />1 dia <i />3 dias <i />7 dias <i />16 dias <i />35 dias</div>
      </div></div>
    </div>
  );
}
