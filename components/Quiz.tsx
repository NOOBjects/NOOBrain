"use client";

import { useRef, useState } from "react";
import { Check, Close, Grip, Idea } from "./Icons";
import { reportError } from "@/lib/api";
import { judgeCloze } from "@/lib/cloze";
import { useKept } from "@/lib/kept";

export type QuizItem =
  | { kind: "mc"; q: string; options: string[]; answer: number; why: string; tag?: string }
  | { kind: "match"; pairs: { term: string; definition: string }[] }
  | { kind: "cloze"; text: string; answer: string; accept: string[]; bare?: boolean }
  | { kind: "order"; prompt: string; steps: string[] }
  | { kind: "short"; q: string; ref: string };

type Judge = (item: Extract<QuizItem, { kind: "short" }>, answer: string) => Promise<{ correct: boolean; partial?: boolean; feedback: string }>;
/** Resultado de uma pergunta: `answer` e `steps` só aparecem quando errou; `label` muda o nome do bloco de explicação. */
type Checked = { ok: boolean; partial?: boolean; why: string; report: string; title?: string; answer?: string; steps?: string[]; label?: string; neutral?: boolean };

/** Traz a correção para dentro do ecrã (acima da ilha do menu) quando aparece. */
export const revealFeedback = (el: HTMLElement | null) => { el?.scrollIntoView({ block: "nearest", behavior: matchMedia("(prefers-reduced-motion: reduce)").matches ? "auto" : "smooth" }); };


/** "«___»" e "___" contam como espaço; devolve as partes do texto entre os espaços. */
const blanks = (t: string) => t.replace(/«\s*_{3,}\s*»/g, "___").split(/_{3,}/);
/** Preenche os espaços com a resposta ("ATP e NADPH" em dois espaços → "ATP" e "NADPH"). */
function fill(t: string, answer: string) {
  const parts = blanks(t);
  if (parts.length <= 2) return parts.join(answer);
  const bits = answer.split(/\s*(?:,|\be\b)\s*/).filter(Boolean);
  return parts.reduce((out, p, i) => out + p + (i < parts.length - 1 ? (bits.length === parts.length - 1 ? bits[i] : i === 0 ? answer : "…") : ""), "");
}

/** Baralha os passos até não ficarem já na ordem certa. */
function shuffled(n: number) {
  const a = [...Array(n).keys()];
  do { for (let i = n - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [a[i], a[j]] = [a[j], a[i]]; } } while (a.every((v, i) => v === i));
  return a;
}

/** Uma pergunta (de qualquer tipo): mostra os campos, corrige e devolve o resultado por `onCheck`. */
function Ask({ item, done, res, onCheck, judge }: { item: QuizItem; done: boolean; res?: Checked | null; onCheck: (c: Checked) => void; judge?: Judge }) {
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
      const v = judgeCloze(item, text);
      const why = item.bare ? "" : fill(item.text, item.answer);
      const report = `${item.text} | escrita: ${text} | certa: ${item.answer}`;
      if (v === "near") onCheck({ ok: true, partial: true, title: "Quase certo", answer: item.answer, why: why || "Atenção à escrita da palavra.", label: "Escreve assim", report });
      else onCheck({ ok: v === "ok", answer: item.answer, why, report });
    } else if (item.kind === "match") {
      return; // os pares corrigem-se ao tocar (ver Match)
    } else if (item.kind === "order") {
      const ok = perm.every((v, i) => v === i);
      onCheck({ ok, steps: item.steps, why: "", report: `${item.prompt} | ordem dada: ${perm.map((v) => v + 1).join("")}` });
    } else {
      setBusy(true);
      try {
        const r = await judge!(item, text);
        onCheck({ ok: r.correct || !!r.partial, partial: !r.correct && !!r.partial, title: !r.correct && r.partial ? "Quase certo" : undefined, label: "Correção", why: r.feedback, report: `${item.q} | resposta: ${text} | avaliação: ${r.feedback}` });
      } catch {
        onCheck({ ok: true, neutral: true, title: "Sem correção", why: "Não consegui avaliar a resposta agora. Conta como certa.", report: item.q }); // sem ligação ou cota: não penaliza
      }
      setBusy(false);
    }
  }

  function giveUp() {
    if (item.kind !== "cloze") return;
    onCheck({ ok: false, answer: item.answer, why: item.bare ? "" : fill(item.text, item.answer), report: `${item.text} | não sei | certa: ${item.answer}` });
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
  if (item.kind === "match") return <Match pairs={item.pairs} done={done} onCheck={onCheck} />;

  return (
    <form onSubmit={check}>
      {item.kind === "mc" && (
        <>
          {item.tag && <div className="eyebrow">{item.tag}</div>}
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
          <h2 className="q">{blanks(item.text).map((p, k, a) => (
            <span key={k}>{p}{k < a.length - 1 && <span className={`blank${a.length === 2 ? " live" : ""}${done ? (res?.ok ? " is-right" : " is-wrong") : ""}`} aria-label="espaço em branco">{a.length === 2 ? (done && !res?.ok ? item.answer : text) : ""}</span>}</span>
          ))}</h2>
          <input className="field ch" value={text} onChange={(e) => setText(e.target.value)} disabled={done} maxLength={60} autoComplete="off" aria-label="A tua resposta" placeholder="Escreve a palavra que falta" />
          {!done && <button type="button" className="linkbtn" onClick={giveUp}>Não sei, mostra a resposta</button>}
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

/** Ligar pares: toca num termo e depois na definição dele. Cada par certo fica fixo; um par errado treme e conta como erro. */
function Match({ pairs, done, onCheck }: { pairs: { term: string; definition: string }[]; done: boolean; onCheck: (c: Checked) => void }) {
  const [defs] = useState(() => shuffled(pairs.length));
  const [pick, setPick] = useState<number | null>(null); // termo escolhido
  const [got, setGot] = useState<number[]>([]); // pares já ligados (índice do termo)
  const [wrong, setWrong] = useState<{ t: number; d: number } | null>(null);
  const [misses, setMisses] = useState(0);

  function tryDef(d: number) {
    if (pick === null || done) return;
    if (d === pick) {
      const next = [...got, d];
      setGot(next);
      setPick(null);
      if (next.length === pairs.length)
        onCheck({ ok: misses === 0, why: misses ? `Trocaste ${misses === 1 ? "um par" : `${misses} pares`} antes de acertar.` : "", title: misses ? "Quase" : undefined, report: `ligar pares: ${pairs.map((p) => p.term).join(", ")} | erros: ${misses}` });
    } else {
      setMisses((m) => m + 1);
      setWrong({ t: pick, d });
      setTimeout(() => setWrong(null), 450);
      setPick(null);
    }
  }

  return (
    <div className="match">
      <div className="eyebrow">Liga os pares</div>
      <h2 className="q">Toca num termo e depois na definição certa.</h2>
      <div className="match-terms" role="group" aria-label="Termos">
        {pairs.map((p, t) => (
          <button key={t} type="button" className={`chip ch mt${got.includes(t) ? " is-got" : ""}${pick === t ? " is-picked" : ""}${wrong?.t === t ? " is-wrong" : ""}`}
            disabled={done || got.includes(t)} aria-pressed={pick === t} onClick={() => setPick(t)}>{p.term}</button>
        ))}
      </div>
      <div className="opts one" role="group" aria-label="Definições">
        {defs.map((d) => (
          <button key={d} type="button" className={`opt pane${got.includes(d) ? " is-right" : ""}${wrong?.d === d ? " is-wrong" : ""}`}
            disabled={done || got.includes(d) || pick === null} onClick={() => tryDef(d)}>
            <span className="in">{got.includes(d) && <b className="mt-tag">{pairs[d].term}</b>}{pairs[d].definition}</span>
          </button>
        ))}
      </div>
    </div>
  );
}

/**
 * Teste: a pergunta errada volta ao fim da ronda até ser acertada (com `retry`, por omissão).
 * `onFinish` diz quantas acertou à primeira e quais (índices em `items`) falhou.
 */
export function Quiz({ items, onFinish, judge, retry = true, keep }: { items: QuizItem[]; onFinish: (first: number, missed: number[], partials: number) => void; judge?: Judge; retry?: boolean; keep?: string }) {
  // Com `keep`, o ponto onde a pessoa ia (pergunta atual, certas, falhadas) sobrevive a sair do ecrã. Guarda-se ao passar para a pergunta seguinte.
  const [saved, save] = useKept(keep ?? "noobrain:quiz:none", { order: items.map((_, k) => k), i: 0, resolved: 0, missed: [] as number[], partials: 0 });
  const ok = saved.order.length >= items.length && saved.order.every((k) => k < items.length) && saved.i < saved.order.length;
  const [order, setOrder] = useState(() => (keep && ok ? saved.order : items.map((_, k) => k))); // índices por responder; as erradas voltam ao fim
  const [i, setI] = useState(() => (keep && ok ? saved.i : 0));
  const [res, setRes] = useState<Checked | null>(null);
  const [resolved, setResolved] = useState(() => (keep && ok ? saved.resolved : 0));
  const [missed, setMissed] = useState<number[]>(() => (keep && ok ? saved.missed : []));
  const [partials, setPartials] = useState(() => (keep && ok ? saved.partials ?? 0 : 0)); // quase certas: valem meio ponto
  const [reported, setReported] = useState(false);
  const qi = order[i];
  const last = i + 1 >= order.length && (!!res?.ok || !retry);

  function checked(c: Checked) {
    setRes(c);
    if (!c.ok && !missed.includes(qi)) setMissed((m) => [...m, qi]);
    if (c.partial && !missed.includes(qi)) setPartials((p) => p + 1);
    if (c.ok || !retry) setResolved((r) => r + 1); // sem `retry`, a errada também fica resolvida
  }

  function next() {
    if (last) return onFinish(items.length - missed.length, missed, partials);
    const nextOrder = !res?.ok && retry ? [...order, qi] : order;
    if (nextOrder !== order) setOrder(nextOrder);
    setI(i + 1);
    setRes(null);
    setReported(false);
    if (keep) save({ order: nextOrder, i: i + 1, resolved, missed, partials });
  }

  return (
    <div className="quiz">
      <div className="qtop">
        <div className="bar ch"><i style={{ transform: `scaleX(${resolved / items.length})` }} /></div>
        <span className="eyebrow">{resolved}/{items.length}</span>
      </div>
      <Ask key={i} item={items[qi]} done={!!res} res={res} onCheck={checked} judge={judge} />

      {res && (
        <div className={`feedback ${res.neutral ? "info" : res.partial ? "part" : res.ok ? "ok" : "bad"}`} ref={revealFeedback} role="status">
          <div className="fb-head">
            <span className="fb-ico ch">{res.neutral || res.partial ? <Idea /> : res.ok ? <Check /> : <Close />}</span>
            <h3>{res.title ?? (res.ok ? "Correto!" : "Não foi desta")}</h3>
          </div>
          {(!res.ok || res.partial) && res.answer && <div className="fb-block"><span className="eyebrow">{res.label === "Escreve assim" ? "Escreve assim" : "Resposta certa"}</span><b className="fb-answer">{res.answer}</b></div>}
          {!res.ok && res.steps && <div className="fb-block"><span className="eyebrow">Ordem certa</span><ol className="fb-steps">{res.steps.map((s) => <li key={s}>{s}</li>)}</ol></div>}
          {res.why && <div className="fb-block"><span className="eyebrow"><Idea />{res.label && res.label !== "Escreve assim" ? res.label : "Porquê"}</span><p>{res.why}</p></div>}
          {res.partial && <p className="fb-note">Conta como meio ponto: aproveita para fixar o que faltou.</p>}
          {!res.ok && retry && <p className="fb-note">Esta pergunta volta no fim, até acertares.</p>}
          <button type="button" className={`btn block ${res.neutral || res.partial ? "" : res.ok ? "ok" : "bad"}`} autoFocus onClick={next}>
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
