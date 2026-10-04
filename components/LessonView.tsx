"use client";

import { useEffect, useState } from "react";
import { Deck } from "./Deck";
import { Mascot } from "./Mascot";
import { Quiz, type QuizItem } from "./Quiz";
import { Tutor } from "./Tutor";
import { ensureLesson, judgeAnswer } from "@/lib/api";
import { applyRating, bumpStreak, rate, update } from "@/lib/store";
import type { Lesson, Trail } from "@/lib/types";

const STEPS = ["Aprender", "Memorizar", "Testar"];

/** As perguntas de escolha múltipla vêm primeiro (o índice delas é o das perguntas guardadas na revisão); depois os outros tipos. */
const quizItems = (l: Lesson): QuizItem[] => [
  ...l.quiz.map((q) => ({ kind: "mc" as const, ...q })),
  ...(l.cloze ?? []).map((c) => ({ kind: "cloze" as const, ...c })),
  ...(l.order ?? []).map((o) => ({ kind: "order" as const, ...o })),
  ...(l.short ?? []).map((s) => ({ kind: "short" as const, ...s })),
];

/** Lição guiada: 1) entender o conceito, 2) fixar na memória com cartões, 3) testar com o quiz. O tutor fica à mão em qualquer passo. */
export function LessonView({ trail, index, onBack, onNext, notify }: {
  trail: Trail;
  index: number;
  onBack: () => void;
  onNext: () => void;
  notify: (m: string) => void;
}) {
  const concept = trail.concepts[index];
  const lesson = concept.lesson;
  const [step, setStep] = useState(0);
  const [reached, setReached] = useState(0); // passo mais avançado já liberado
  const [reveal, setReveal] = useState(1); // quantos blocos da explicação já apareceram
  const [tutor, setTutor] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<{ first: number; total: number; gain: number; fresh: boolean; pass: boolean } | null>(null);
  const [warm, setWarm] = useState<number | null>(null); // resposta ao aquecimento (-1 = passou)
  const [showSol, setShowSol] = useState(false);
  const [attempt, setAttempt] = useState(0); // muda a cada "Repetir o teste", para o teste recomeçar

  useEffect(() => {
    if (lesson || error) return;
    ensureLesson(trail.id, index).catch((e) => setError(e instanceof Error ? e.message : "Não consegui montar a lição."));
  }, [lesson, error, trail.id, index]);

  const go = (s: number) => { setStep(s); setReached((r) => Math.max(r, s)); window.scrollTo({ top: 0, behavior: "smooth" }); };

  // Domínio: o conceito só fica concluído com pelo menos 2/3 das perguntas certas à primeira.
  function finishQuiz(first: number, missed: number[]) {
    const total = quizItems(lesson!).length;
    const pass = first >= Math.ceil((total * 2) / 3);
    const fresh = index === trail.done; // só o conceito atual libera o próximo
    const gain = pass ? (fresh ? 10 * first + 10 : 5 * first) : 5 * first;
    const key = `${trail.id}:${index}`;
    update((s) => {
      const cards = { ...s.cards };
      for (const k of missed) { // as perguntas de escolha múltipla falhadas entram na revisão espaçada
        if (k >= lesson!.quiz.length) continue;
        const id = `${key}:q${k}`;
        if (!cards[id]) cards[id] = rate(undefined, 0);
      }
      return {
        ...s,
        ...bumpStreak(s),
        xp: s.xp + gain,
        cards,
        stats: s.stats?.[key] ? s.stats : { ...s.stats, [key]: { t: first, n: total } }, // só conta o 1.º teste do conceito
        trails: s.trails.map((t) => (t.id === trail.id && fresh && pass ? { ...t, done: t.done + 1 } : t)),
      };
    });
    setResult({ first, total, gain, fresh, pass });
  }

  function rateCard(id: string, r: 0 | 1 | 2) {
    let due = 0;
    update((s) => {
      const next = applyRating(s, id, r);
      due = next.cards[id].due;
      return next;
    });
    return due;
  }

  const hasNext = index + 1 < trail.concepts.length;
  const blocks = lesson ? [...lesson.intro, `Exemplo: ${lesson.example}`] : [];

  return (
    <div className="lesson">
      <button type="button" className="linkbtn back" onClick={onBack}>← Voltar à trilha</button>
      <div className="eyebrow">{trail.topic} · Conceito {index + 1} de {trail.concepts.length}</div>
      <h1 className="h-screen">{concept.title}</h1>

      {result && !result.pass ? (
        <div className="result">
          <div className="result-mascot"><Mascot mood="think" /></div>
          <h2 className="h-screen">Quase lá</h2>
          <p className="sub">Acertaste {result.first} de {result.total} à primeira. Revê a explicação e tenta outra vez.</p>
          <div className="xp">+{result.gain} XP</div>
          <div className="result-actions">
            <button type="button" className="btn" onClick={() => { setResult(null); setReveal(blocks.length); go(0); }}><span className="face">Rever a explicação</span></button>
            <button type="button" className="btn soft" onClick={() => { setResult(null); setAttempt((a) => a + 1); go(2); }}><span className="face">Repetir o teste</span></button>
          </div>
        </div>
      ) : result ? (
        <div className="result">
          <div className="result-mascot"><Mascot mood="happy" /></div>
          <h2 className="h-screen">Conceito dominado</h2>
          <p className="sub">Acertaste {result.first} de {result.total} à primeira.</p>
          <div className="xp">+{result.gain} XP</div>
          {result.fresh
            ? <p className="sub small">Os cartões deste conceito entram na tua revisão espaçada. Eu aviso quando for hora de rever.</p>
            : <p className="sub small">Já tinhas concluído este conceito, por isso o XP é menor.</p>}
          <div className="result-actions">
            {hasNext && <button type="button" className="btn" onClick={onNext}><span className="face">Próximo conceito</span></button>}
            <button type="button" className="btn soft" onClick={() => { notify("Progresso guardado"); onBack(); }}><span className="face">Voltar à trilha</span></button>
          </div>
        </div>
      ) : !lesson ? (
        <div className="loading" role="status">
          {error ? (
            <>
              <div className="hero-mascot"><Mascot mood="sad" /></div>
              <div className="note ch" role="alert">{error}</div>
              <button type="button" className="btn" onClick={() => setError(null)}><span className="face">Tentar outra vez</span></button>
            </>
          ) : (
            <>
              <div className="hero-mascot"><Mascot mood="think" /></div>
              <p className="sub center">A preparar a lição: explicação, cartões e teste. Leva uns segundos.</p>
            </>
          )}
        </div>
      ) : (
        <>
          <ol className="stepper" aria-label="Passos da lição">
            {STEPS.map((label, i) => (
              <li key={label}>
                <button type="button" disabled={i > reached} aria-current={step === i ? "step" : undefined}
                  className={`stp ch${i < step || i < reached ? " done" : ""}${step === i ? " cur" : ""}`} onClick={() => setStep(i)}>
                  <span className="stp-n">{i + 1}</span><span className="stp-l">{label}</span>
                </button>
              </li>
            ))}
          </ol>

          {step === 0 && (
            <section className="step" aria-label="Aprender">
              {lesson.warmup && warm === null ? (
                <>
                  <p className="step-intro">Antes de começar: o que achas? Não conta para nada, é só para pensares no assunto.</p>
                  <h2 className="q">{lesson.warmup.q}</h2>
                  <div className="opts" role="group" aria-label="Alternativas">
                    {lesson.warmup.options.map((o, k) => <button key={k} type="button" className="opt pane" onClick={() => setWarm(k)}><span className="in">{o}</span></button>)}
                  </div>
                  <button type="button" className="linkbtn" onClick={() => setWarm(-1)}>Não faço ideia, vamos ver</button>
                </>
              ) : <>
              <p className="step-intro">Primeiro, percebe o que é.</p>
              <div className="blocks">
                {blocks.slice(0, reveal).map((b, i) => (
                  <div key={i} className={`pane reveal${i === blocks.length - 1 ? " tint" : ""}`}><div className="in"><p>{b}</p></div></div>
                ))}
              </div>
              {reveal >= blocks.length && lesson.solution && (showSol
                ? <div className="pane reveal"><div className="in"><p><b>Solução:</b> {lesson.solution}</p></div></div>
                : <button type="button" className="btn soft block" onClick={() => setShowSol(true)}><span className="face">Mostrar a solução</span></button>)}
              {reveal >= blocks.length && lesson.warmup && warm !== null && (
                <div className="pane tint reveal"><div className="in">
                  <p><b>Lembras-te da pergunta do início?</b> {lesson.warmup.q}</p>
                  <p>Resposta: {lesson.warmup.options[lesson.warmup.answer]}. {warm === lesson.warmup.answer ? "Acertaste." : warm >= 0 ? "Não faz mal: agora já sabes." : ""}</p>
                </div></div>
              )}
              {reveal < blocks.length ? (
                <button type="button" className="btn block" onClick={() => setReveal((r) => r + 1)}><span className="face">Continuar</span></button>
              ) : (
                <button type="button" className="btn block" onClick={() => go(1)}><span className="face">Percebi, vamos memorizar</span></button>
              )}
              </>}
            </section>
          )}

          {step === 1 && (
            <section className="step" aria-label="Memorizar">
              <p className="step-intro">Agora fixa na memória. Vira cada cartão e diz o quanto te lembraste. Os que errares voltam até acertares.</p>
              <Deck
                requeue
                items={lesson.cards.map((c, k) => ({ id: `${trail.id}:${index}:${k}`, term: c.term, definition: c.definition }))}
                onRate={rateCard}
                onEnd={() => go(2)}
                endTitle="Memorizado"
                endText="Hora de testar o que aprendeste."
                endLabel="Ir para o teste"
              />
            </section>
          )}

          {step === 2 && (
            <section className="step" aria-label="Testar">
              <p className="step-intro">Por fim, testa os teus conhecimentos.</p>
              <Quiz key={attempt} items={quizItems(lesson)} onFinish={finishQuiz}
                judge={(s, answer) => judgeAnswer({ topic: trail.topic, title: concept.title, question: s.q, ref: s.ref, answer })} />
            </section>
          )}

          <div className="tutor-box">
            <button type="button" className="btn soft sm" aria-expanded={tutor} onClick={() => setTutor((t) => !t)}>
              <span className="face">{tutor ? "Fechar o tutor" : "Tirar uma dúvida com o tutor"}</span>
            </button>
            <div hidden={!tutor} className="tutor-panel"><Tutor topic={trail.topic} title={concept.title} lesson={lesson} /></div>
          </div>

          {trail.sources.length > 0 && (
            <div className="sources"><span className="eyebrow">Fontes</span>
              {trail.sources.map((s) => <a key={s.url} className="chip ch srcchip" href={s.url} target="_blank" rel="noreferrer">{s.site ?? "Fonte"} · {s.title}</a>)}
            </div>
          )}
        </>
      )}
    </div>
  );
}
