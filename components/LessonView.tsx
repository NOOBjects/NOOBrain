"use client";

import { useEffect, useState } from "react";
import { Deck } from "./Deck";
import { Mascot } from "./Mascot";
import { Quiz } from "./Quiz";
import { Tutor } from "./Tutor";
import { ensureLesson } from "@/lib/api";
import { bumpStreak, rate, update } from "@/lib/store";
import type { Trail } from "@/lib/types";

const STEPS = ["Aprender", "Memorizar", "Testar"];

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
  const [result, setResult] = useState<{ correct: number; gain: number; first: boolean } | null>(null);

  useEffect(() => {
    if (lesson || error) return;
    ensureLesson(trail.id, index).catch((e) => setError(e instanceof Error ? e.message : "Não consegui montar a lição."));
  }, [lesson, error, trail.id, index]);

  const go = (s: number) => { setStep(s); setReached((r) => Math.max(r, s)); window.scrollTo({ top: 0, behavior: "smooth" }); };

  function finishQuiz(correct: number) {
    const first = index === trail.done; // só o conceito atual libera o próximo
    const gain = first ? 10 * correct + 10 : 5 * correct;
    update((s) => ({
      ...s,
      ...bumpStreak(s),
      xp: s.xp + gain,
      trails: s.trails.map((t) => (t.id === trail.id && first ? { ...t, done: t.done + 1 } : t)),
    }));
    setResult({ correct, gain, first });
  }

  function rateCard(id: string, r: 0 | 1 | 2) {
    let due = 0;
    update((s) => {
      const next = rate(s.cards[id], r);
      due = next.due;
      return { ...s, cards: { ...s.cards, [id]: next } };
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

      {result ? (
        <div className="result">
          <div className="result-mascot"><Mascot mood="happy" /></div>
          <h2 className="h-screen">Conceito dominado</h2>
          <p className="sub">Você acertou {result.correct} de {lesson?.quiz.length} no teste.</p>
          <div className="xp">+{result.gain} XP</div>
          {result.first
            ? <p className="sub small">Os cartões deste conceito entram na sua revisão espaçada. Eu aviso quando for hora de rever.</p>
            : <p className="sub small">Você já tinha concluído este conceito, então o XP é menor.</p>}
          <div className="result-actions">
            {hasNext && <button type="button" className="btn" onClick={onNext}><span className="face">Próximo conceito</span></button>}
            <button type="button" className="btn soft" onClick={() => { notify("Progresso salvo"); onBack(); }}><span className="face">Voltar à trilha</span></button>
          </div>
        </div>
      ) : !lesson ? (
        <div className="loading" role="status">
          {error ? (
            <>
              <div className="hero-mascot"><Mascot mood="sad" /></div>
              <div className="note ch" role="alert">{error}</div>
              <button type="button" className="btn" onClick={() => setError(null)}><span className="face">Tentar de novo</span></button>
            </>
          ) : (
            <>
              <div className="hero-mascot"><Mascot mood="think" /></div>
              <p className="sub center">Preparando a lição: explicação, cartões e teste. Leva alguns segundos.</p>
            </>
          )}
        </div>
      ) : (
        <>
          <ol className="stepper" aria-label="Passos da lição">
            {STEPS.map((label, i) => (
              <li key={label}>
                <button type="button" disabled={i > reached} aria-current={step === i ? "step" : undefined}
                  className={`stp${i < step || i < reached ? " done" : ""}${step === i ? " cur" : ""}`} onClick={() => setStep(i)}>
                  <span className="stp-n">{i + 1}</span><span className="stp-l">{label}</span>
                </button>
              </li>
            ))}
          </ol>

          {step === 0 && (
            <section className="step" aria-label="Aprender">
              <p className="step-intro">Primeiro, entenda o que é.</p>
              <div className="blocks">
                {blocks.slice(0, reveal).map((b, i) => (
                  <div key={i} className={`pane reveal${i === blocks.length - 1 ? " tint" : ""}`}><div className="in"><p>{b}</p></div></div>
                ))}
              </div>
              {reveal < blocks.length ? (
                <button type="button" className="btn block" onClick={() => setReveal((r) => r + 1)}><span className="face">Continuar</span></button>
              ) : (
                <button type="button" className="btn block" onClick={() => go(1)}><span className="face">Entendi, vamos memorizar</span></button>
              )}
            </section>
          )}

          {step === 1 && (
            <section className="step" aria-label="Memorizar">
              <p className="step-intro">Agora fixe na memória. Vire cada cartão e diga o quanto lembrou. Os que você errar voltam até você acertar.</p>
              <Deck
                requeue
                items={lesson.cards.map((c, k) => ({ id: `${trail.id}:${index}:${k}`, term: c.term, definition: c.definition }))}
                onRate={rateCard}
                onEnd={() => go(2)}
                endTitle="Memorizado"
                endText="Hora de testar o que você aprendeu."
                endLabel="Ir para o teste"
              />
            </section>
          )}

          {step === 2 && (
            <section className="step" aria-label="Testar">
              <p className="step-intro">Por fim, teste seus conhecimentos.</p>
              <Quiz questions={lesson.quiz} onFinish={finishQuiz} />
            </section>
          )}

          <div className="tutor-box">
            <button type="button" className="btn soft sm" aria-expanded={tutor} onClick={() => setTutor((t) => !t)}>
              <span className="face">{tutor ? "Fechar o tutor" : "Tirar dúvida com o tutor"}</span>
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
