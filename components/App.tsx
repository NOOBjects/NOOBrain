"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { Account } from "./Account";
import { Bolt, Book, Flame, Plus, Route, Sync, User } from "./Icons";
import { Island } from "./Island";
import { LessonView } from "./LessonView";
import { Mascot, type Mood } from "./Mascot";
import { NewTopic } from "./NewTopic";
import { ReviewView } from "./ReviewView";
import { TrailNode } from "./TrailNode";
import { notifyDue } from "@/lib/reminders";
import { ZIGZAG } from "@/lib/sample";
import { activeTrail, dueCards, update } from "@/lib/store";
import { useAppState } from "@/lib/useAppState";
import { useSync } from "@/lib/useSync";

type View = "trilha" | "licao" | "revisar" | "novo" | "conta";

export function App() {
  const s = useAppState();
  const { user, status } = useSync();
  const [view, setView] = useState<View>("trilha");
  const [lesson, setLesson] = useState(0);
  const [toast, setToast] = useState<string | null>(null);
  const [mood, setMood] = useState<Mood>("idle");

  const trail = activeTrail(s);
  const total = trail.concepts.length;
  const pct = Math.round((trail.done / total) * 100);
  const dueCount = useMemo(() => dueCards(s).length, [s]);
  const current = Math.min(trail.done, total - 1);
  const streakAtRisk = s.streak > 0 && s.lastDay !== new Date().toLocaleDateString("sv");

  // Lembretes: selo no título da aba e aviso do sistema quando o app está em segundo plano.
  const due = useRef(dueCount);
  useEffect(() => {
    due.current = dueCount;
    document.title = dueCount > 0 ? `(${dueCount}) NOOBrain` : "NOOBrain";
  }, [dueCount]);
  useEffect(() => {
    const tick = () => notifyDue(due.current);
    const id = setInterval(tick, 60_000);
    document.addEventListener("visibilitychange", tick);
    return () => { clearInterval(id); document.removeEventListener("visibilitychange", tick); };
  }, []);

  useEffect(() => {
    if (!toast) return;
    const t = setTimeout(() => setToast(null), 2400);
    return () => clearTimeout(t);
  }, [toast]);

  const notify = (m: string) => setToast(m);
  function celebrate() {
    setMood("happy");
    setTimeout(() => setMood("idle"), 1400);
  }
  function go(v: View) {
    setView(v);
    window.scrollTo({ top: 0 });
  }
  function openLesson(i: number) {
    setLesson(i);
    go("licao");
  }

  const items = [
    { id: "trilha", label: "Trilha", icon: <Route />, onClick: () => go("trilha") },
    { id: "licao", label: "Lição", icon: <Book />, onClick: () => openLesson(current) },
    { id: "revisar", label: "Revisar", icon: <Sync />, onClick: () => go("revisar"), badge: dueCount },
    { id: "conta", label: user ? "Conta" : "Entrar", icon: <User />, onClick: () => go("conta") },
  ];

  return (
    <div className="app">
      <header className="top">
        <div className="brand">
          <div className="brand-mascot"><Mascot mood={mood} /></div>
          <div className="brand-text"><div className="name"><b>NOOB</b>rain</div><div className="by">por NOOBjects</div></div>
        </div>
        <div className="stats">
          <span className="stat s" title="Dias seguidos"><Flame />{s.streak}</span>
          <span className="stat x" title="Pontos de experiência"><Bolt />{s.xp}</span>
        </div>
        <button type="button" className="iconbtn ch" aria-label="Novo tema" onClick={() => go("novo")}><Plus /></button>
      </header>

      <main className="content">
        {view === "novo" && (
          <NewTopic trails={s.trails}
            onOpen={(t) => { update((x) => ({ ...x, active: t.id })); go("trilha"); notify(`Abri a trilha “${t.topic}”`); }}
            onDone={(t) => { go("trilha"); notify(`Trilha pronta: ${t}`); celebrate(); }} />
        )}

        {view === "revisar" && <ReviewView state={s} />}

        {view === "conta" && <Account user={user} status={status} />}

        {view === "licao" && (
          <LessonView key={`${trail.id}:${lesson}`} trail={trail} index={lesson} notify={notify}
            onBack={() => go("trilha")} onNext={() => { setLesson((i) => i + 1); celebrate(); window.scrollTo({ top: 0 }); }} />
        )}

        {view === "trilha" && (
          <>
            <div className="unit">
              <div>
                <div className="eyebrow">{trail.level}</div>
                <h1 className="h-screen">{trail.topic}</h1>
              </div>
              {trail.example && <span className="chip ex ch">Exemplo</span>}
            </div>

            {dueCount > 0 && (
              <div className="nudge pane tint"><div className="in">
                <div><b>{dueCount === 1 ? "1 cartão" : `${dueCount} cartões`} para revisar</b><div className="sub small">Revisar agora fixa o que você aprendeu.</div></div>
                <button type="button" className="btn sm" onClick={() => go("revisar")}><span className="face">Revisar</span></button>
              </div></div>
            )}
            {streakAtRisk && (
              <div className="nudge pane"><div className="in">
                <div><b>Sua sequência de {s.streak} {s.streak === 1 ? "dia" : "dias"} termina hoje</b><div className="sub small">Conclua uma lição para mantê-la.</div></div>
                <button type="button" className="btn sm" onClick={() => openLesson(current)}><span className="face">Estudar</span></button>
              </div></div>
            )}

            {s.trails.length > 1 && (
              <div className="topic-chips" role="group" aria-label="Seus temas">
                {s.trails.map((t) => (
                  <button key={t.id} type="button" className="chip ch" aria-pressed={t.id === trail.id} onClick={() => update((x) => ({ ...x, active: t.id }))}>{t.topic}</button>
                ))}
              </div>
            )}

            {trail.sources.length > 0 ? (
              <div className="sources">{trail.sources.map((src) => <a key={src.url} className="chip ch srcchip" href={src.url} target="_blank" rel="noreferrer">{src.site ?? "Fonte"} · {src.title}</a>)}</div>
            ) : !trail.example && (
              <span className="chip ch warnchip">Sem fonte encontrada. Confira o conteúdo com cuidado.</span>
            )}

            <div className="pane gap"><div className="in prog">
              <div className="prog-top"><span>Progresso</span><span>{trail.done} de {total}</span></div>
              <div className="bar ch" role="progressbar" aria-valuenow={pct} aria-valuemin={0} aria-valuemax={100}><i style={{ width: `${pct}%` }} /></div>
            </div></div>

            <div className="trail">
              {trail.concepts.map((c, i) => (
                <TrailNode key={c.title + i} title={c.title} offset={ZIGZAG[i % ZIGZAG.length]}
                  state={i < trail.done ? "done" : i === trail.done ? "cur" : "lock"}
                  onClick={() => (i <= trail.done ? openLesson(i) : notify("Conclua o conceito atual para liberar este."))} />
              ))}
            </div>
            {trail.done >= total && <p className="sub center">Trilha concluída. Que tal revisar os cartões ou criar um novo tema?</p>}
          </>
        )}
      </main>

      <Island items={items} current={view === "novo" ? "" : view} />

      <div className={`toast ch${toast ? " show" : ""}`} role="status" aria-live="polite">{toast}</div>
    </div>
  );
}
