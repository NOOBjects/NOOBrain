"use client";

import { useRef, useState } from "react";
import { askTutor, reportError } from "@/lib/api";
import type { Lesson } from "@/lib/types";

type Msg = { role: "user" | "tutor"; text: string; reported?: boolean };

const SUGGESTIONS = ["Explique de outro jeito", "Dê um exemplo do dia a dia", "Me faça uma pergunta para testar"];

export function Tutor({ topic, title, lesson }: { topic: string; title: string; lesson: Lesson }) {
  const [msgs, setMsgs] = useState<Msg[]>([]);
  const [text, setText] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const end = useRef<HTMLDivElement>(null);
  const context = [...lesson.intro, lesson.example].join(" ");

  async function send(question: string) {
    const q = question.trim();
    if (q.length < 2 || busy) return;
    const history = msgs.map((m) => ({ role: m.role, text: m.text }));
    setMsgs((m) => [...m, { role: "user", text: q }]);
    setText("");
    setError(null);
    setBusy(true);
    try {
      const answer = await askTutor({ topic, title, lesson: context, question: q, history });
      setMsgs((m) => [...m, { role: "tutor", text: answer }]);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Não consegui responder agora.");
    } finally {
      setBusy(false);
      setTimeout(() => end.current?.scrollIntoView({ block: "nearest", behavior: "smooth" }), 50);
    }
  }

  return (
    <div className="tutor">
      <div className="chat" aria-live="polite">
        <div className="msg"><div className="pane flat"><div className="in">Estou aqui para tirar dúvidas sobre este conceito. Posso explicar de outro jeito, dar exemplos ou testar você.</div></div></div>
        {msgs.map((m, i) => (
          <div key={i} className={`msg${m.role === "user" ? " me" : ""}`}>
            <div className="pane flat"><div className="in">{m.text}</div></div>
            {m.role === "tutor" && (
              <button type="button" className="linkbtn" disabled={m.reported} onClick={() => {
                setMsgs((all) => all.map((x, k) => (k === i ? { ...x, reported: true } : x)));
                reportError("tutor", `${msgs[i - 1]?.text ?? ""} => ${m.text}`);
              }}>{m.reported ? "Obrigado, registrado" : "Reportar erro"}</button>
            )}
          </div>
        ))}
        {busy && <div className="msg"><div className="pane flat"><div className="in typing" aria-label="Tutor digitando"><i /><i /><i /></div></div></div>}
        {error && <div className="note ch" role="alert">{error}</div>}
        <div ref={end} />
      </div>

      <div className="sugg">
        {SUGGESTIONS.map((s) => <button key={s} type="button" className="chip ch" disabled={busy} onClick={() => send(s)}>{s}</button>)}
      </div>
      <form className="ask" onSubmit={(e) => { e.preventDefault(); send(text); }}>
        <label className="sr" htmlFor="ask">Sua dúvida</label>
        <input id="ask" className="field ch" value={text} onChange={(e) => setText(e.target.value)} placeholder="Escreva sua dúvida" maxLength={300} autoComplete="off" />
        <button type="submit" className="btn" disabled={busy || text.trim().length < 2}><span className="face">Enviar</span></button>
      </form>
      <p className="disc">Respostas geradas por IA a partir da lição. Confira as fontes e use “Reportar erro” se algo parecer errado.</p>
    </div>
  );
}
