"use client";

import { useRef, useState } from "react";
import { Check, Close, Grip, Idea } from "./Icons";
import { reportError } from "@/lib/api";

export type QuizItem =
  | { kind: "mc"; q: string; options: string[]; answer: number; why: string }
  | { kind: "cloze"; text: string; answer: string; accept: string[] }
  | { kind: "order"; prompt: string; steps: string[] }
  | { kind: "short"; q: string; ref: string };

type Judge = (item: Extract<QuizItem, { kind: "short" }>, answer: string) => Promise<{ correct: boolean; feedback: string }>;
/** Resultado de uma pergunta: `answer` e `steps` só aparecem quando errou; `label` muda o nome do bloco de explicação. */
type Checked = { ok: boolean; why: string; report: string; title?: string; answer?: string; steps?: string[]; label?: string };

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
      onCheck({ ok, answer: item.options[item.answer], why: item.why, report: `${item.q} | marcada: ${item.options[sel ?? 0]} | certa: ${item.options[item.answer]}` });
    } else if (item.kind === "cloze") {
      const ok = [item.answer, ...item.accept].some((a) => norm(a) === norm(text));
      onCheck({ ok, answer: item.answer, why: item.text.replace("___", item.answer), report: `${item.text} | escrita: ${text} | certa: ${item.answer}` });
    } else if (item.kind === "order") {
      const ok = perm.every((v, i) => v === i);
      onCheck({ ok, steps: item.steps, why: "", report: `${item.prompt} | ordem dada: ${perm.map((v) => v + 1).join("")}` });
    } else {
      setBusy(true);
      try {
        const r = await judge!(item, text);
        onCheck({ ok: r.correct, label: "Correção", why: r.feedback, report: `${item.q} | resposta: ${text} | avaliação: ${r.feedback}` });
      } catch {
        onCheck({ ok: true, title: "Sem correção", why: "Não consegui avaliar a resposta agora. Conta como certa.", report: item.q }); // sem ligação ou cota: não penaliza
      }
      setBusy(false);
    }
  }

  // Ordenar: arrastar pela pega (rato ou dedo) ou, com o teclado, setas para cima e para baixo na pega.
  const list = useRef<HTMLOListElement>(null);
  const [drag, setDrag] = useState<number | null>(null); // passo que está a ser arrastado
  const put = (v: number, to: number) => setPerm((p) => { const a = p.filter((x) => x !== v); a.splice(Math.max(0, Math.min(a.length, to)), 0, v); return a; });
  function dragMove(e: React.PointerEvent) {
    if (drag === null || !list.current) return;
    const rows = [...list.current.children] as HTMLElement[];
    const to = rows.findIndex((r) => { const b = r.getBoundingClientRect(); return e.clientY >= b.top && e.clientY <= b.bottom; });
    if (to >= 0 && perm[to] !== drag) put(drag, to);
  }
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
          <p className="sub small">Arrasta pela pega para pôr os passos pela ordem certa.</p>
          <ol className="ord" ref={list} onPointerMove={dragMove} onPointerUp={() => setDrag(null)} onPointerCancel={() => setDrag(null)}>
            {perm.map((v, k) => (
              <li key={v} className={drag === v ? "dragging" : undefined}>
                <span className="pane"><span className="in">
                  <span className="ord-n">{k + 1}</span>
                  <span className="ord-t">{item.steps[v]}</span>
                  <button type="button" className="grip" disabled={done} aria-label={`Mover: ${item.steps[v]}. Setas para cima e para baixo.`}
                    onPointerDown={(e) => { list.current?.setPointerCapture(e.pointerId); setDrag(v); }}
                    onKeyDown={(e) => { if (e.key === "ArrowUp") { e.preventDefault(); put(v, k - 1); } if (e.key === "ArrowDown") { e.preventDefault(); put(v, k + 1); } }}><Grip /></button>
                </span></span>
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
          <div className="fb-head">
            <span className="fb-ico ch">{res.ok ? <Check /> : <Close />}</span>
            <h3>{res.title ?? (res.ok ? "Correto!" : "Não foi desta")}</h3>
          </div>
          {!res.ok && res.answer && <div className="fb-block"><span className="eyebrow">Resposta certa</span><b className="fb-answer">{res.answer}</b></div>}
          {!res.ok && res.steps && <div className="fb-block"><span className="eyebrow">Ordem certa</span><ol className="fb-steps">{res.steps.map((s) => <li key={s}>{s}</li>)}</ol></div>}
          {res.why && <div className="fb-block"><span className="eyebrow"><Idea />{res.label ?? "Porquê"}</span><p>{res.why}</p></div>}
          {!res.ok && retry && <p className="fb-note">Esta pergunta volta no fim, até acertares.</p>}
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
