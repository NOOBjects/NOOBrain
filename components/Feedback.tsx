"use client";

import { useEffect, useRef, useState } from "react";
import { update } from "@/lib/store";
import { supabase } from "@/lib/supabase";
import type { State, Trail } from "@/lib/types";

type Ask = { id: string; title: string };

/** Quando pedir opinião: ao dominar o 1.º conceito e ao concluir cada trilha (uma vez cada). */
export function feedbackAsk(s: State, trail: Trail): Ask | null {
  const done = s.trails.reduce((n, t) => n + t.done, 0);
  const asked = s.asked ?? [];
  if (trail.concepts.length && trail.done >= trail.concepts.length && !asked.includes(`t:${trail.id}`)) return { id: `t:${trail.id}`, title: `Concluíste “${trail.topic}”. Como correu?` };
  if (done >= 1 && !asked.includes("l1") && !asked.includes("l3")) return { id: "l1", title: done === 1 ? "Acabaste a tua primeira lição. Como correu?" : "Como está a correr o NOOBrain?" };
  return null;
}

const FACES = ["Muito mal", "Mal", "Assim-assim", "Bem", "Muito bem"];

/** Nota de 1 a 5 e texto opcional. Fica na tabela `feedback` (só o painel de administração lê). */
function FeedbackForm({ context, uid, onSent, onSkip }: { context: string; uid: string; onSent: () => void; onSkip?: () => void }) {
  const [rating, setRating] = useState(0);
  const [text, setText] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState(false);

  async function send() {
    setBusy(true);
    const { error: err } = await supabase!.from("feedback").insert({ user_id: uid, rating, text: text.trim().slice(0, 600), context: context.slice(0, 60) });
    setBusy(false);
    if (err) return setError(true);
    onSent();
  }

  return (
    <>
      <div className="rating" role="radiogroup" aria-label="Nota de 1 a 5">
        {FACES.map((f, i) => (
          <button key={f} type="button" role="radio" aria-checked={rating === i + 1} aria-label={`${i + 1}: ${f}`} title={f}
            className={`rate-n ch${rating >= i + 1 ? " on" : ""}`} onClick={() => setRating(i + 1)}>{i + 1}</button>
        ))}
      </div>
      {rating > 0 && (
        <textarea className="field ch" rows={2} maxLength={600} value={text} onChange={(e) => setText(e.target.value)}
          placeholder={rating >= 4 ? "O que mais gostas? (opcional)" : "O que podemos melhorar? (opcional)"} aria-label="Comentário (opcional)" />
      )}
      {error && <p className="hint bad" role="alert">Não consegui enviar. Tenta outra vez.</p>}
      <div className="pair">
        <button type="button" className="btn sm" disabled={!rating || busy} onClick={() => void send()}><span className="face">{busy ? "A enviar…" : "Enviar"}</span></button>
        {onSkip && <button type="button" className="btn soft sm" onClick={onSkip}><span className="face">Agora não</span></button>}
      </div>
    </>
  );
}

/** Cartão automático "Como está a correr?". */
export function Feedback({ ask, uid, onDone }: { ask: Ask; uid: string; onDone: (sent: boolean) => void }) {
  const close = () => update((s) => ({ ...s, asked: [...(s.asked ?? []), ask.id] }));
  return (
    <section className="pane tint announce" aria-labelledby="fb-t"><div className="in">
      <b id="fb-t">{ask.title}</b>
      <p className="sub small">A tua opinião decide o que melhoramos a seguir.</p>
      <FeedbackForm context={ask.id} uid={uid} onSent={() => { close(); onDone(true); }} onSkip={() => { close(); onDone(false); }} />
    </div></section>
  );
}

/** "Dar opinião" a partir do menu: janela com o mesmo formulário. */
export function FeedbackDialog({ uid, onClose, onIdeas, onSent }: { uid: string; onClose: () => void; onIdeas: () => void; onSent: () => void }) {
  const ref = useRef<HTMLDialogElement>(null);
  useEffect(() => { const d = ref.current; if (d && !d.open) d.showModal(); }, []);
  return (
    <dialog ref={ref} className="sheet" aria-labelledby="fbd-t" onClose={onClose} onClick={(e) => e.target === ref.current && ref.current?.close()}>
      <div className="pane"><div className="in set">
        <h2 id="fbd-t">A tua opinião</h2>
        <p className="sub">Diz-nos o que está a correr bem e o que podemos melhorar. Só a equipa lê.</p>
        <FeedbackForm context="menu" uid={uid} onSent={() => { ref.current?.close(); onSent(); }} onSkip={() => ref.current?.close()} />
        <p className="sub small">Tens uma ideia nova? <button type="button" className="linkbtn" onClick={() => { ref.current?.close(); onIdeas(); }}>Partilha-a em Ideias.</button></p>
      </div></div>
    </dialog>
  );
}
