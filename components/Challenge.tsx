"use client";

import { useState } from "react";
import { HeroIco, Bolt } from "./Icons";
import { Quiz } from "./Quiz";
import { buildChallenge, challengeXp } from "@/lib/challenge";
import { bumpStreak, day, gainXp, update } from "@/lib/store";
import type { State } from "@/lib/types";

/** Desafio do dia: 5 perguntas misturadas, uma tentativa cada, XP a dobrar. */
export function Challenge({ state, onDone }: { state: State; onDone: (xp: number) => void }) {
  const [items] = useState(() => buildChallenge(state));
  const [result, setResult] = useState<{ right: number; xp: number } | null>(null);

  function finish(right: number) {
    const xp = challengeXp(right);
    update((s) => ({ ...s, ...bumpStreak(s), ...gainXp(s, xp), challenge: day() }));
    setResult({ right, xp });
  }

  if (result)
    return (
      <div className="result">
        <HeroIco><Bolt /></HeroIco>
        <h1 className="h-screen">{result.right === items.length ? "Desafio perfeito" : "Desafio feito"}</h1>
        <p className="sub">Acertaste {result.right} de {items.length}. Amanhã há outro.</p>
        <div className="xp">+{result.xp} XP</div>
        <button type="button" className="btn" onClick={() => onDone(result.xp)}><span className="face">Voltar à trilha</span></button>
      </div>
    );

  return (
    <div className="challenge">
      <div className="eyebrow">Desafio do dia · XP a dobrar</div>
      <h1 className="h-screen">5 perguntas, uma tentativa cada</h1>
      <p className="sub gap-b">Perguntas de tudo o que já aprendeste, misturadas.</p>
      <Quiz items={items.map((q) => ({ kind: "mc" as const, q: q.q, options: q.options, answer: q.answer, why: q.why, tag: q.topic }))} retry={false} onFinish={(first) => finish(first)} />
    </div>
  );
}
