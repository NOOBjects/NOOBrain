"use client";

import { useEffect, useMemo, useRef, useState, type ReactNode } from "react";
import { Account } from "./Account";
import { Explore } from "./Explore";
import { Bolt, Book, Compass, Flame, Plus, Route, Sync, User } from "./Icons";
import { Ideas } from "./Ideas";
import { Island } from "./Island";
import { LegalLinks } from "./LegalPage";
import { LessonView } from "./LessonView";
import { Mascot, type Mood } from "./Mascot";
import { NewTopic } from "./NewTopic";
import { Onboarding } from "./Onboarding";
import { ProfileView } from "./ProfileView";
import { Ranking } from "./Ranking";
import { ReviewView } from "./ReviewView";
import { Settings } from "./Settings";
import { TrailNode, ZIGZAG } from "./TrailNode";
import { BETA, VERSION } from "@/lib/config";
import { disable as disableReminders, notifyDue } from "@/lib/reminders";
import { activeTrail, dueCards, update } from "@/lib/store";
import { useAppState, useHydrated } from "@/lib/useAppState";
import { useSync } from "@/lib/useSync";

type View = "trilha" | "licao" | "revisar" | "novo" | "explorar" | "conta" | "perfil" | "definicoes" | "ranking" | "ideias";

/** "+N XP" que sobe quando o XP aumenta (ganhos grandes são ignorados: são a nuvem a carregar, não uma lição). */
function XpGain({ xp }: { xp: number }) {
  const [prev, setPrev] = useState(xp);
  const [gain, setGain] = useState(0);
  if (xp !== prev) { setPrev(xp); setGain(xp > prev && xp - prev <= 200 ? xp - prev : 0); }
  useEffect(() => {
    if (!gain) return;
    const t = setTimeout(() => setGain(0), 1200);
    return () => clearTimeout(t);
  }, [gain, xp]);
  return gain ? <span key={xp} className="xp-gain" aria-hidden="true">+{gain} XP</span> : null;
}

const TEMA = "noobrain:tema"; // tema escolhido numa página pública, à espera do login

export function App({ landing }: { landing?: ReactNode }) {
  const s = useAppState();
  const hydrated = useHydrated(); // antes disto, o que há são valores de exemplo, não os da pessoa
  const { user, ready, loading, status, recovery, endRecovery, linkError, clearLinkError, signOut, welcome, profile, reloadProfile } = useSync();
  const [pick, setView] = useState<View>("trilha");
  // links de e-mail (nova palavra-passe ou link com erro) levam direto à conta
  // sem conta, só existe o ecrã de entrada
  const [changing, setChanging] = useState(false); // a alterar a palavra-passe, vindo das definições
  const view: View = !user || recovery || linkError || changing ? "conta" : pick;
  const booting = !!user && view !== "conta" && (loading || profile === undefined);
  const needsProfile = !!user && view !== "conta" && profile === null;
  const showStats = hydrated && !loading && !(view === "conta" && !user);
  const [lesson, setLesson] = useState(0);
  const [toast, setToast] = useState<string | null>(null);
  const [mood, setMood] = useState<Mood>("idle");
  // Aviso da beta: uma vez por conta (a chave leva o id da pessoa).
  const betaKey = user ? `noobrain:beta-seen:${user.id}` : null;
  const [betaDone, setBetaDone] = useState<string | null>(null);
  const betaSeen = !betaKey || !hydrated || betaDone === betaKey || (() => { try { return localStorage.getItem(betaKey) === "1"; } catch { return false; } })();
  function closeBeta() {
    setBetaDone(betaKey);
    try { if (betaKey) localStorage.setItem(betaKey, "1"); } catch { /* sem armazenamento: o aviso volta */ }
  }

  const trail = activeTrail(s);
  const total = trail?.concepts.length ?? 0;
  const pct = total ? Math.round((trail!.done / total) * 100) : 0;
  const dueCount = useMemo(() => dueCards(s).length, [s]);
  const current = trail ? Math.min(trail.done, total - 1) : 0;
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

  // "Começar esta trilha" numa página pública: guarda o tema, e depois do login abre o Explorar já à procura dele.
  const [tema, setTema] = useState("");
  useEffect(() => {
    const p = new URLSearchParams(window.location.search).get("tema");
    if (!p) return;
    try { sessionStorage.setItem(TEMA, p); } catch { /* sem armazenamento: só não abre o Explorar */ }
    window.history.replaceState(null, "", window.location.pathname);
  }, []);
  useEffect(() => {
    if (!user || !profile) return;
    const id = setTimeout(() => {
      try {
        const t = sessionStorage.getItem(TEMA);
        if (!t) return;
        sessionStorage.removeItem(TEMA);
        setTema(t.replace(/-/g, " "));
        setView("explorar");
      } catch { /* sem armazenamento */ }
    }, 0);
    return () => clearTimeout(id);
  }, [user, profile]);

  const notify = (m: string) => setToast(m);
  function celebrate() {
    setMood("happy");
    setTimeout(() => setMood("idle"), 1400);
  }
  function go(v: View) {
    clearLinkError();
    setView(v);
    window.scrollTo({ top: 0 });
  }
  function openLesson(i: number) {
    setLesson(i);
    go("licao");
  }

  const items = [
    { id: "trilha", label: "Trilha", icon: <Route />, onClick: () => go("trilha") },
    { id: "licao", label: "Lição", icon: <Book />, onClick: () => (trail ? openLesson(current) : go("novo")) },
    { id: "explorar", label: "Explorar", icon: <Compass />, onClick: () => go("explorar") },
    { id: "revisar", label: "Rever", icon: <Sync />, onClick: () => go("revisar"), badge: hydrated ? dueCount : 0 },
    { id: "perfil", label: "Perfil", icon: <User />, onClick: () => go("perfil") },
  ];

  return (
    <div className="app">
      <header className={`top${view === "conta" ? " on-account" : ""}`}>
        <div className="brand">
          <div className="brand-mascot"><Mascot mood={mood} /></div>
          <div className="brand-text"><div className="name"><b>NOOB</b>rain</div><div className="by">por NOOBjects</div></div>
          {BETA && <span className="chip ch beta" title={`Versão beta ${VERSION}`}>Beta</span>}
        </div>
        {showStats && <div className="stats">
          <span className="stat s" title="Dias seguidos"><Flame />{s.streak}</span>
          <span className="stat x" title="Pontos de experiência"><Bolt />{s.xp}<XpGain xp={s.xp} /></span>
        </div>}
        {!(view === "conta" && !user) && <button type="button" className="iconbtn ch" aria-label="Novo tema" onClick={() => go("novo")}><Plus /></button>}
      </header>

      <main key={view} className="content view-in">
        {BETA && user && profile && !betaSeen && (
          <div className="pane tint gap" role="status"><div className="in">
            <b>O NOOBrain está em beta</b>
            <p className="sub small">Algumas coisas podem falhar ou mudar. As tuas ideias ajudam a decidir o que vem a seguir. Fundraising em breve.</p>
            <div className="beta-row">
              <button type="button" className="btn sm" onClick={closeBeta}><span className="face">Começar</span></button>
              <button type="button" className="btn soft sm" onClick={() => { closeBeta(); go("ideias"); }}><span className="face">Dar uma ideia</span></button>
            </div>
          </div></div>
        )}
        {/* nada de dados antes de ler o navegador; e o conflito de progresso passa à frente de tudo */}
        {!hydrated ? landing : booting ? (
          <div className="loading" role="status"><div className="hero-mascot"><Mascot mood="think" /></div><p className="sub center">A carregar o teu progresso…</p></div>
        ) : needsProfile ? <Onboarding user={user!} onSaved={() => { void reloadProfile(); go("trilha"); }} /> : <>
        {view === "novo" && (
          <NewTopic trails={s.trails}
            onOpen={(t) => { update((x) => ({ ...x, active: t.id })); go("trilha"); notify(`Abri a trilha “${t.topic}”`); }}
            onDone={(t) => { go("trilha"); notify(`Trilha pronta: ${t}`); celebrate(); }} />
        )}

        {view === "explorar" && (
          <Explore state={s} initialQuery={tema} onNew={() => go("novo")}
            onStart={(t) => { go("trilha"); notify(`Trilha pronta: ${t.topic}`); celebrate(); }} />
        )}

        {view === "revisar" && <ReviewView state={s} />}

        {view === "conta" && (
          <Account ready={ready} recovery={recovery} onRecovered={endRecovery}
            changing={changing} onChangingEnd={(changed) => { setChanging(false); setView("definicoes"); if (changed) notify("Palavra-passe alterada."); }}
            linkError={linkError} onClearLink={() => { setView("conta"); clearLinkError(); }}
            onSignedIn={(t) => { go("trilha"); notify(t); }} />
        )}
        {view === "conta" && !user && landing}

        {view === "perfil" && user && profile && (
          <ProfileView user={user} profile={profile} state={s} onSaved={() => { void reloadProfile(); notify("Perfil guardado"); }} onSettings={() => go("definicoes")} onRanking={() => go("ranking")} onIdeas={() => go("ideias")} notify={notify} />
        )}

        {view === "ideias" && user && profile && <Ideas user={user} onBack={() => go("perfil")} />}

        {view === "ranking" && user && profile && <Ranking me={profile} onBack={() => go("perfil")} />}

        {view === "definicoes" && user && profile && (
          <Settings user={user} profile={profile} state={s} status={status} onChangePassword={() => setChanging(true)}
            onSignOut={async () => { setView("trilha"); await disableReminders(); await signOut(); }} onBack={() => go("perfil")} onProfile={() => void reloadProfile()} />
        )}

        {(view === "trilha" || view === "licao") && !trail && (
          <div className="hero-new">
            <div className="hero-mascot"><Mascot /></div>
            <h1 className="h-screen">Escolhe o teu primeiro tema</h1>
            <p className="sub">Escreve qualquer tema e eu monto-te uma trilha com lições, cartões e testes.</p>
            <button type="button" className="btn block" onClick={() => go("explorar")}><span className="face">Explorar temas</span></button>
            <button type="button" className="btn soft block" onClick={() => go("novo")}><span className="face">Criar um tema</span></button>
          </div>
        )}

        {view === "licao" && trail && (
          <LessonView key={`${trail.id}:${lesson}`} trail={trail} index={lesson} notify={notify}
            onBack={() => go("trilha")} onNext={() => { setLesson((i) => i + 1); celebrate(); window.scrollTo({ top: 0 }); }} />
        )}

        {view === "trilha" && trail && (
          <>
            <div className="unit">
              <div>
                <div className="eyebrow">{trail.level}</div>
                <h1 className="h-screen">{trail.topic}</h1>
              </div>
            </div>

            {dueCount > 0 && (
              <div className="nudge pane tint"><div className="in">
                <div><b>{dueCount === 1 ? "1 cartão" : `${dueCount} cartões`} para rever</b><div className="sub small">Rever agora fixa o que aprendeste.</div></div>
                <button type="button" className="btn sm" onClick={() => go("revisar")}><span className="face">Rever</span></button>
              </div></div>
            )}
            {streakAtRisk && (
              <div className="nudge pane"><div className="in">
                <div><b>A tua sequência de {s.streak} {s.streak === 1 ? "dia" : "dias"} termina hoje</b><div className="sub small">Conclui uma lição para a manteres.</div></div>
                <button type="button" className="btn sm" onClick={() => openLesson(current)}><span className="face">Estudar</span></button>
              </div></div>
            )}

            {s.trails.length > 1 && (
              <div className="topic-chips" role="group" aria-label="Os teus temas">
                {s.trails.map((t) => (
                  <button key={t.id} type="button" className="chip ch" aria-pressed={t.id === trail.id} onClick={() => update((x) => ({ ...x, active: t.id }))}>{t.topic}</button>
                ))}
              </div>
            )}

            {trail.sources.length > 0 ? (
              <div className="sources">{trail.sources.map((src) => <a key={src.url} className="chip ch srcchip" href={src.url} target="_blank" rel="noreferrer">{src.site ?? "Fonte"} · {src.title}</a>)}</div>
            ) : (
              <span className="chip ch warnchip">Sem fonte encontrada. Confirma o conteúdo com cuidado.</span>
            )}

            <div className="pane gap"><div className="in prog">
              <div className="prog-top"><span>Progresso</span><span>{trail.done} de {total}</span></div>
              <div className="bar ch" role="progressbar" aria-valuenow={pct} aria-valuemin={0} aria-valuemax={100}><i style={{ transform: `scaleX(${pct / 100})` }} /></div>
            </div></div>

            <div className="trail">
              {trail.concepts.map((c, i) => (
                <TrailNode key={c.title + i} index={i} title={c.title} offset={ZIGZAG[i % ZIGZAG.length]}
                  state={i < trail.done ? "done" : i === trail.done ? "cur" : "lock"}
                  onClick={() => (i <= trail.done ? openLesson(i) : notify("Conclui o conceito atual para desbloquear este."))} />
              ))}
            </div>
            {trail.done >= total && <p className="sub center">Trilha concluída. Que tal rever os cartões ou criar um novo tema?</p>}
          </>
        )}
        </>}
      </main>
      <footer className="foot"><LegalLinks onIdea={user && profile ? () => go("ideias") : undefined} /></footer>

      {user && !needsProfile && <Island items={items} current={view === "novo" ? "" : view === "definicoes" || view === "ranking" || view === "ideias" ? "perfil" : view} />}

      <div className={`toast ch${toast || welcome ? " show" : ""}`} role="status" aria-live="polite">{toast ?? (welcome ? "Sessão iniciada com o Google." : null)}</div>
    </div>
  );
}
