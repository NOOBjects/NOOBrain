"use client";

import { useState } from "react";
import { ChevronDown, ChevronUp } from "./Icons";
import { Mascot } from "./Mascot";
import { reportError } from "@/lib/api";

export type QuizItem =
  | { kind: "mc"; q: string; options: string[]; answer: number; why: string }
  | { kind: "cloze"; text: string; answer: string; accept: string[] }
  | { kind: "order"; prompt: string; steps: string[] }
  | { kind: "short"; q: string; ref: string };

type Judge = (item: Extract<QuizItem, { kind: "short" }>, answer: string) => Promise<{ correct: boolean; feedback: string }>;
type Checked = { ok: boolean; head: string; why: string; report: string; title?: string };

/** Sem acentos, maiúsculas nem pontuação: "Água." e "agua" contam como iguais. */
const norm = (s: string) => s.normalize("NFD").replace(/[̀-ͯ]/g, "").toLowerCase().replace(/[^a-z0-9 ]+/g, " ").replace(/\s+/g, " ").trim();

/** Baralha os passos até não ficarem já na ordem certa. */
function shuffled(n: number) {
  const a = [...Array(n).keys()];
  do { for (let i = n - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [a[i], a[j]] = [a[j], a[i]]; } } while (a.every((v, i) => v === i));
  return a;
}

/** Uma pergunta (de qualquer tipo): mostra os campos, corrige e devolve o resultado por `onCheck`. */
function Ask({ item, done, onCheck, judge }: { item: QuizItem; done: boolean; onCheck: (c: Checked) => void; judge?: Judge }) {
  const [sel, setSel] = useState<number | null>(null);
  const [text, setText] = useState("");
  const [perm, setPerm] = useState(() => (item.kind === "order" ? shuffled(item.steps.length) : []));
  const [busy, setBusy] = useState(false);

  async function check(e?: React.FormEvent) {
    e?.preventDefault();
    if (item.kind === "mc") {
      const ok = sel === item.answer;
      onCheck({ ok, head: `Quase. A resposta é: ${item.options[item.answer]}`, why: item.why, report: `${item.q} | marcada: ${item.options[sel ?? 0]} | certa: ${item.options[item.answer]}` });
    } else if (item.kind === "cloze") {
      const ok = [item.answer, ...item.accept].some((a) => norm(a) === norm(text));
      onCheck({ ok, head: `Quase. A resposta é: ${item.answer}`, why: item.text.replace("___", item.answer), report: `${item.text} | escrita: ${text} | certa: ${item.answer}` });
    } else if (item.kind === "order") {
      const ok = perm.every((v, i) => v === i);
      onCheck({ ok, head: "Quase. A ordem certa é:", why: item.steps.map((s, k) => `${k + 1}. ${s}`).join("  "), report: `${item.prompt} | ordem dada: ${perm.map((v) => v + 1).join("")}` });
    } else {
      setBusy(true);
      try {
        const r = await judge!(item, text);
        onCheck({ ok: r.correct, head: "Quase.", why: r.feedback, report: `${item.q} | resposta: ${text} | avaliação: ${r.feedback}` });
      } catch {
        onCheck({ ok: true, head: "", title: "Sem correção", why: "Não consegui avaliar a resposta agora. Conta como certa.", report: item.q }); // sem ligação ou cota: não penaliza
      }
      setBusy(false);
    }
  }

  const move = (k: number, d: -1 | 1) => setPerm((p) => { const a = [...p]; [a[k], a[k + d]] = [a[k + d], a[k]]; return a; });
  const ready = item.kind === "mc" ? sel !== null : item.kind === "order" ? true : text.trim().length >= 2;

  return (
    <form onSubmit={check}>
      {item.kind === "mc" && (
        <>
          <h2 className="q">{item.q}</h2>
          <div className="opts" role="radiogroup" aria-label="Alternativas">
            {item.options.map((o, k) => {
              const state = done ? (k === item.answer ? "is-right" : k === sel ? "is-wrong" : "") : k === sel ? "is-picked" : "";
              return (
                <button key={k} type="button" role="radio" aria-checked={sel === k} disabled={done} className={`opt pane ${state}`} onClick={() => setSel(k)}>
                  <span className="in">{o}</span>
                </button>
              );
            })}
          </div>
        </>
      )}
      {item.kind === "cloze" && (
        <>
          <div className="eyebrow">Completa a frase</div>
          <h2 className="q">{item.text.replace("___", "＿＿＿")}</h2>
          <input className="field ch" value={text} onChange={(e) => setText(e.target.value)} disabled={done} maxLength={60} autoComplete="off" aria-label="A tua resposta" />
        </>
      )}
      {item.kind === "order" && (
        <>
          <div className="eyebrow">Ordena os passos</div>
          <h2 className="q">{item.prompt}</h2>
          <ol className="ord">
            {perm.map((v, k) => (
              <li key={v}>
                <span className="pane"><span className="in">{item.steps[v]}</span></span>
                <button type="button" className="iconbtn" disabled={done || k === 0} onClick={() => move(k, -1)} aria-label="Subir"><ChevronUp /></button>
                <button type="button" className="iconbtn" disabled={done || k === perm.length - 1} onClick={() => move(k, 1)} aria-label="Descer"><ChevronDown /></button>
              </li>
            ))}
          </ol>
        </>
      )}
      {item.kind === "short" && (
        <>
          <div className="eyebrow">Responde numa frase</div>
          <h2 className="q">{item.q}</h2>
          <textarea className="field ch" rows={3} value={text} onChange={(e) => setText(e.target.value)} disabled={done || busy} maxLength={400} aria-label="A tua resposta" />
        </>
      )}
      {!done && (
        <button type="submit" className="btn block qbtn" disabled={!ready || busy}>
          <span className="face">{busy ? "A corrigir…" : "Verificar"}</span>
        </button>
      )}
    </form>
  );
}

/**
 * Teste: a pergunta errada volta ao fim da ronda até ser acertada (com `retry`, por omissão).
 * `onFinish` diz quantas acertou à primeira e quais (índices em `items`) falhou.
 */
export function Quiz({ items, onFinish, judge, retry = true }: { items: QuizItem[]; onFinish: (first: number, missed: number[]) => void; judge?: Judge; retry?: boolean }) {
  const [order, setOrder] = useState(() => items.map((_, k) => k)); // índices por responder; as erradas voltam ao fim
  const [i, setI] = useState(0);
  const [res, setRes] = useState<Checked | null>(null);
  const [resolved, setResolved] = useState(0);
  const [missed, setMissed] = useState<number[]>([]);
  const [reported, setReported] = useState(false);
  const qi = order[i];
  const last = i + 1 >= order.length && (!!res?.ok || !retry);

  function checked(c: Checked) {
    setRes(c);
    if (!c.ok && !missed.includes(qi)) setMissed((m) => [...m, qi]);
    if (c.ok || !retry) setResolved((r) => r + 1); // sem `retry`, a errada também fica resolvida
  }

  function next() {
    if (last) return onFinish(items.length - missed.length, missed);
    if (!res?.ok && retry) setOrder((o) => [...o, qi]);
    setI(i + 1);
    setRes(null);
    setReported(false);
  }

  return (
    <div className="quiz">
      <div className="qtop">
        <div className="bar ch"><i style={{ transform: `scaleX(${resolved / items.length})` }} /></div>
        <span className="eyebrow">{resolved}/{items.length}</span>
      </div>
      <Ask key={i} item={items[qi]} done={!!res} onCheck={checked} judge={judge} />

      {res && (
        <div className={`feedback ${res.ok ? "ok" : "bad"}`} role="status">
          <div className="row">
            <div className="fb-mascot"><Mascot mood={res.ok ? "happy" : "sad"} /></div>
            <h3>{res.title ?? (res.ok ? "Correto!" : res.head)}</h3>
          </div>
          <p>{res.why}</p>
          {!res.ok && retry && <p className="sub small">Esta pergunta volta no fim, até acertares.</p>}
          <button type="button" className={`btn block ${res.ok ? "ok" : "bad"}`} autoFocus onClick={next}>
            <span className="face">{last ? "Finalizar" : "Continuar"}</span>
          </button>
          <button type="button" className="linkbtn" disabled={reported} onClick={() => { setReported(true); reportError("quiz", res.report); }}>
            {reported ? "Obrigado, registado" : "Reportar erro"}
          </button>
        </div>
      )}
    </div>
  );
}
