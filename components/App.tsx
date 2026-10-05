"use client";

import dynamic from "next/dynamic";
import { useCallback, useEffect, useMemo, useRef, useState, useSyncExternalStore, type ReactNode } from "react";
import { flushSync } from "react-dom";
import { Account } from "./Account";
import { Announce } from "./Announce";
import { Confetti } from "./Confetti";
import { Feedback, FeedbackDialog, feedbackAsk } from "./Feedback";
import { Compass, Download, Flame, Gear, HeroIco, Idea, Offline, Plus, Route, Shield, Spark, Speech, Sync, Trophy, User } from "./Icons";
import { InstallSheet } from "./InstallSheet";
import { RestView } from "./RestView";
import { UpdateBanner } from "./UpdateBanner";
import { Island } from "./Island";
import { LegalLinks } from "./LegalPage";
import { Mascot, type Mood } from "./Mascot";
import { Toast, type ToastMsg } from "./Toast";
import { TrailView } from "./TrailView";
import { newBadges, type Badge } from "@/lib/badges";
import { call } from "@/lib/api";
import { refreshGlossary } from "@/lib/glossary";
import { supabase } from "@/lib/supabase";
import { BETA, VERSION } from "@/lib/config";
import { install, useInstall } from "@/lib/install";
import { NEW_LESSONS_PER_DAY } from "@/lib/limits";
import { LATEST } from "@/lib/changelog";
import { disable as disableReminders, notifyDue, syncPush } from "@/lib/reminders";
import { activeTrail, currentStreak, day, dueCards, frozeYesterday, goalOf, lessonsToday, markLesson, todayXp, update } from "@/lib/store";
import { useAppState, useHydrated } from "@/lib/useAppState";
import { useOnline } from "@/lib/useOnline";
import { useSync } from "@/lib/useSync";

// Ecrãs que quem chega à página inicial não usa: só descarregam quando são abertos (página inicial mais leve).
const Loading = () => <div className="loading" role="status"><span className="spinner ch" aria-hidden="true" /><span className="sr">A carregar…</span></div>;
const Explore = dynamic(() => import("./Explore").then((m) => m.Explore), { loading: Loading });
const Ideas = dynamic(() => import("./Ideas").then((m) => m.Ideas), { loading: Loading });
const LessonView = dynamic(() => import("./LessonView").then((m) => m.LessonView), { loading: Loading });
const News = dynamic(() => import("./News").then((m) => m.News), { loading: Loading });
const NewTopic = dynamic(() => import("./NewTopic").then((m) => m.NewTopic), { loading: Loading });
const Onboarding = dynamic(() => import("./Onboarding").then((m) => m.Onboarding), { loading: Loading });
const ProfileView = dynamic(() => import("./ProfileView").then((m) => m.ProfileView), { loading: Loading });
const Ranking = dynamic(() => import("./Ranking").then((m) => m.Ranking), { loading: Loading });
const ReviewView = dynamic(() => import("./ReviewView").then((m) => m.ReviewView), { loading: Loading });
const Settings = dynamic(() => import("./Settings").then((m) => m.Settings), { loading: Loading });
const Challenge = dynamic(() => import("./Challenge").then((m) => m.Challenge), { loading: Loading });
const Admin = dynamic(() => import("./Admin").then((m) => m.Admin), { loading: Loading });
const BadgeDialog = dynamic(() => import("./Badges").then((m) => m.BadgeDialog));
const Tour = dynamic(() => import("./Tour").then((m) => m.Tour));

type View = "trilha" | "licao" | "revisar" | "novo" | "explorar" | "conta" | "perfil" | "definicoes" | "ranking" | "ideias" | "novidades" | "desafio" | "admin";
const VIEWS: string[] = ["licao", "revisar", "novo", "explorar", "perfil", "definicoes", "ranking", "ideias", "novidades", "desafio", "admin"]; // "trilha" é o endereço sem ?v=

// Cada ecrã tem endereço próprio (/?v=revisar, /?v=licao&c=2). Assim o "voltar" do telemóvel anda entre ecrãs, como num site,
// e recarregar a página não perde o sítio. O Next deixa usar pushState sem recarregar (ver guia "single-page-applications").
const NAV = "noobrain:nav";
const IN_APP = { nb: 1 }; // marca as entradas do histórico criadas já com sessão iniciada
function onNav(cb: () => void) {
  window.addEventListener("popstate", cb);
  window.addEventListener(NAV, cb);
  return () => { window.removeEventListener("popstate", cb); window.removeEventListener(NAV, cb); };
}
/** Muda de ecrã. `replace` troca a entrada atual do histórico em vez de criar outra (ex.: depois de concluir um passo). */
function navigate(v: View, c?: number, replace = false, sub?: string) {
  const search = v === "trilha" || v === "conta" ? "" : `?v=${v}${c === undefined ? "" : `&c=${c}`}${sub ? `&s=${sub}` : ""}`;
  if (search === window.location.search) return;
  const run = () => {
    window.history[replace ? "replaceState" : "pushState"](IN_APP, "", search || window.location.pathname);
    window.dispatchEvent(new Event(NAV));
  };
  // Transição suave entre ecrãs (View Transitions API), só onde existe e sem "reduzir movimento".
  const doc = document as Document & { startViewTransition?: (cb: () => void) => unknown };
  if (doc.startViewTransition && !matchMedia("(prefers-reduced-motion: reduce)").matches) doc.startViewTransition(() => flushSync(run));
  else run();
}

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

/** Anel octogonal da meta diária à volta do raio do XP: enche com o XP de hoje e fica amarelo quando a meta se cumpre. */
function GoalRing({ value, goal }: { value: number; goal: number }) {
  const pct = Math.min(100, Math.round((value / goal) * 100));
  return (
    <svg className={`goal-ring${pct >= 100 ? " met" : ""}`} viewBox="0 0 32 32" aria-hidden="true">
      <path className="gr-track" d="M11 2 H21 L30 11 V21 L21 30 H11 L2 21 V11 Z" pathLength={100} />
      <path className="gr-fill" d="M16 2 H21 L30 11 V21 L21 30 H11 L2 21 V11 L11 2 Z" pathLength={100} strokeDasharray={`${pct} 100`} />
      <path className="gr-bolt" d="M17.5 8 L11 17 H15.5 L14 24 L21 14.5 H16.5 Z" />
    </svg>
  );
}

const TEMA = "noobrain:tema"; // tema escolhido numa página pública, à espera do login

export function App({ landing }: { landing?: ReactNode }) {
  const s = useAppState();
  const hydrated = useHydrated(); // antes disto, o que há são valores de exemplo, não os da pessoa
  const online = useOnline();
  const { user, ready, loading, status, recovery, endRecovery, linkError, clearLinkError, signOut, welcome, profile, reloadProfile } = useSync();
  const search = useSyncExternalStore(onNav, () => window.location.search, () => "");
  const params = new URLSearchParams(search);
  const asked = params.get("v") ?? "";
  const pick = (VIEWS.includes(asked) ? asked : "trilha") as View;
  // links de e-mail (nova palavra-passe ou link com erro) levam direto à conta; sem conta, só existe o ecrã de entrada
  const [changing, setChanging] = useState(false); // a alterar a palavra-passe, vindo das definições
  const view: View = !user || recovery || linkError || changing ? "conta" : pick;
  const booting = !!user && view !== "conta" && (loading || profile === undefined);
  const needsProfile = !!user && view !== "conta" && profile === null;
  const inApp = !!user && !!profile && !loading; // sessão, perfil e progresso prontos
  const showStats = hydrated && !loading && !(view === "conta" && !user);
  const [toast, setToast] = useState<ToastMsg | null>(null);
  const [mood, setMood] = useState<Mood>("idle");
  const [burst, setBurst] = useState(0); // muda para lançar confettis
  const [badges, setBadges] = useState<Badge[] | null>(null);
  const [feedback, setFeedback] = useState(false);
  const [showInstall, setShowInstall] = useState(false);
  const installState = useInstall();
  const [isAdmin, setIsAdmin] = useState(false);

  const trail = activeTrail(s);
  const total = trail?.concepts.length ?? 0;
  const dueCount = useMemo(() => dueCards(s).length, [s]);
  const current = trail ? Math.min(trail.done, total - 1) : 0;
  // Lição pedida no endereço (?c=), sem passar do conceito atual (os seguintes ainda estão fechados).
  const lesson = trail ? Math.min(Math.max(0, Math.floor(Number(params.get("c"))) || 0), current) : 0;
  // Limite diário de lições novas: a do conceito atual conta uma vez por dia; repetir lições já feitas nunca conta.
  const lessonId = trail ? `${trail.id}:${lesson}` : "";
  const newToday = lessonsToday(s);
  const isNewLesson = !!trail && lesson === trail.done;
  const resting = view === "licao" && isNewLesson && !newToday.includes(lessonId) && newToday.length >= NEW_LESSONS_PER_DAY;
  const streak = currentStreak(s);
  const goal = goalOf(s);
  const xpToday = todayXp(s);

  const notify = useCallback((text: string, icon?: ToastMsg["icon"]) => setToast((t) => ({ text, icon, n: (t?.n ?? 0) + 1 })), []);
  const hideToast = useCallback(() => setToast(null), []);
  useEffect(() => {
    if (!welcome) return;
    const t = setTimeout(() => notify("Sessão iniciada com o Google."), 0);
    return () => clearTimeout(t);
  }, [welcome, notify]);

  const celebrate = useCallback((big = false) => {
    setMood("happy");
    setTimeout(() => setMood("idle"), 1400);
    if (big) setBurst((b) => b + 1);
  }, []);
  useEffect(() => {
    if (!burst) return;
    const t = setTimeout(() => setBurst(0), 2600);
    return () => clearTimeout(t);
  }, [burst]);

  // Lembretes: selo no título da aba e aviso do sistema quando o app está em segundo plano.
  const due = useRef(dueCount);
  useEffect(() => {
    due.current = s.notify?.reviews === false ? 0 : dueCount; // lembretes de revisão desligados: sem aviso local
    document.title = dueCount > 0 ? `(${dueCount}) NOOBrain` : "NOOBrain";
  }, [dueCount, s.notify?.reviews]);
  useEffect(() => {
    const tick = () => notifyDue(due.current);
    const id = setInterval(tick, 60_000);
    document.addEventListener("visibilitychange", tick);
    return () => { clearInterval(id); document.removeEventListener("visibilitychange", tick); };
  }, []);

  // Service worker sempre registado (no site publicado): guarda o app para abrir sem ligação.
  useEffect(() => {
    if (process.env.NODE_ENV === "production" && "serviceWorker" in navigator) navigator.serviceWorker.register("/sw.js").catch(() => {});
  }, []);

  // Meta diária: celebra quando o XP de hoje passa a meta (só durante o uso, não ao carregar da nuvem).
  const lastXp = useRef<number | null>(null);
  useEffect(() => {
    if (!inApp) { lastXp.current = null; return; }
    const before = lastXp.current;
    lastXp.current = xpToday;
    if (before !== null && before < goal && xpToday >= goal) {
      notify(`Meta de hoje cumprida: ${goal} XP`);
      celebrate(true);
    }
  }, [inApp, xpToday, goal, notify, celebrate]);

  useEffect(() => { if (inApp) void syncPush(); }, [inApp]);
  const [, setGloss] = useState(0); // o glossário de palavras de Portugal chegou: volta a desenhar os textos
  useEffect(() => { if (inApp && supabase) void refreshGlossary(supabase as never).then(() => setGloss((n) => n + 1)); }, [inApp]);
  useEffect(() => {
    if (inApp && view === "licao" && isNewLesson && !newToday.includes(lessonId) && newToday.length < NEW_LESSONS_PER_DAY) update((x) => ({ ...x, ...markLesson(x, lessonId) }));
  }, [inApp, view, isNewLesson, lessonId, newToday]);
  useEffect(() => {
    if (!inApp) return;
    let live = true;
    call<{ admin: boolean }>("/api/admin?o=me").then((r) => live && setIsAdmin(r.admin), () => {});
    return () => { live = false; };
  }, [inApp]);
  useEffect(() => {
    const done = () => notify("NOOBrain instalado. Encontra-o no ecrã principal.");
    window.addEventListener("noobrain:installed", done);
    return () => window.removeEventListener("noobrain:installed", done);
  }, [notify]);

  // Conquistas: na primeira verificação regista as que já existiam sem alarido; depois, cada nova abre uma janela.
  useEffect(() => {
    if (!inApp) return;
    const fresh = newBadges(s);
    if (!fresh.length && s.badges) return;
    const now = Date.now();
    update((x) => ({ ...x, badges: { ...x.badges, ...Object.fromEntries(fresh.map((b) => [b.id, now])) } }));
    if (!s.badges || !fresh.length) return;
    setTimeout(() => setBadges((b) => [...(b ?? []), ...fresh]), 600); // sem limpar: o próprio update acima volta a correr este efeito
  }, [inApp, s]);

  // Dia de folga gasto ontem: avisa uma vez.
  useEffect(() => {
    if (!inApp || !frozeYesterday(s)) return;
    const k = `noobrain:froze:${day()}`;
    try { if (sessionStorage.getItem(k)) return; } catch { return; }
    const t = setTimeout(() => {
      try { sessionStorage.setItem(k, "1"); } catch { /* sem armazenamento */ }
      notify("Ontem usaste o dia de folga da semana: a tua sequência continua.");
    }, 800);
    return () => clearTimeout(t);
  }, [inApp, s, notify]);

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
        navigate("explorar");
      } catch { /* sem armazenamento */ }
    }, 0);
    return () => clearTimeout(id);
  }, [user, profile]);

  // Com sessão e perfil feitos, "voltar" nunca regressa a ecrãs de antes (entrada, perfil): o histórico anterior à marca é ignorado.
  useEffect(() => {
    if (!user || !profile) return;
    if (window.history.state?.nb !== 1) window.history.replaceState(IN_APP, "");
    const back = () => { if (window.history.state?.nb !== 1) window.history.go(1); };
    // Voltar a esta página vindo de outra (cache do navegador) mostraria o ecrã de entrada de antes: recarrega.
    const show = (e: PageTransitionEvent) => { if (e.persisted) window.location.reload(); };
    window.addEventListener("popstate", back);
    window.addEventListener("pageshow", show);
    return () => { window.removeEventListener("popstate", back); window.removeEventListener("pageshow", show); };
  }, [user, profile]);

  function go(v: View, c?: number, replace = false, sub?: string) {
    clearLinkError();
    navigate(v, c, replace, sub);
    window.scrollTo({ top: 0 });
  }
  const openLesson = (i: number) => go("licao", i);
  async function leave() { // terminar sessão: o endereço volta ao início
    navigate("trilha", undefined, true);
    await disableReminders();
    await signOut();
  }

  const items = [
    { id: "trilha", label: "Trilha", icon: <Route />, onClick: () => go("trilha") },
    { id: "explorar", label: "Explorar", icon: <Compass />, onClick: () => go("explorar") },
    { id: "revisar", label: "Rever", icon: <Sync />, onClick: () => go("revisar"), badge: hydrated ? dueCount : 0 },
    { id: "perfil", label: "Perfil", icon: <User />, onClick: () => go("perfil") },
  ];
  const drawer = [
    { id: "ideias", label: "Ideias", icon: <Idea />, onClick: () => go("ideias") },
    { id: "ranking", label: "Ranking", icon: <Trophy />, onClick: () => go("ranking") },
    { id: "novidades", label: "Novidades", icon: <Spark />, dot: s.seenVersion !== LATEST.version, onClick: () => go("novidades") },
    { id: "opiniao", label: "Dar opinião", icon: <Speech />, onClick: () => setFeedback(true) },
    ...(installState === "prompt" || installState === "ios"
      ? [{ id: "instalar", label: "Instalar o app", icon: <Download />, onClick: () => (installState === "prompt" ? void install() : setShowInstall(true)) }] : []),
    { id: "definicoes", label: "Definições", icon: <Gear />, onClick: () => go("definicoes") },
    ...(isAdmin ? [{ id: "admin", label: "Administração", icon: <Shield />, onClick: () => go("admin") }] : []),
  ];
  const ask = inApp && trail ? feedbackAsk(s, trail) : null;
  const showTour = inApp && view === "trilha" && s.seenVersion !== undefined && !s.tour && s.trails.length === 0;

  return (
    <div className="app">
      <header className={`top${view === "conta" ? " on-account" : ""}`}>
        <div className="brand">
          <div className="brand-mascot"><Mascot mood={mood} /></div>
          <div className="brand-text"><div className="name"><b>NOOB</b>rain</div><div className="by">por NOOBjects</div></div>
          {BETA && (user && profile
            ? <button type="button" className="chip ch beta" title={`Versão beta ${VERSION}: ver as novidades`} onClick={() => go("novidades")}>Beta</button>
            : <span className="chip ch beta" title={`Versão beta ${VERSION}`}>Beta</span>)}
        </div>
        {showStats && <div className="stats">
          <span className={`stat s${streak ? "" : " zero"}`} title={streak ? `${streak} ${streak === 1 ? "dia seguido" : "dias seguidos"}` : "Sem sequência: estuda hoje para começar"}><Flame />{streak}</span>
          <button type="button" className="stat x" title={`Meta de hoje: ${Math.min(xpToday, goal)} de ${goal} XP`} aria-label={`${s.xp} XP. Meta de hoje: ${Math.min(xpToday, goal)} de ${goal} XP`} onClick={() => user && profile && go("perfil")}>
            <GoalRing value={xpToday} goal={goal} />{s.xp}<XpGain xp={s.xp} />
          </button>
        </div>}
        {!(view === "conta" && !user) && <button type="button" className="iconbtn ch" aria-label="Novo tema" title="Novo tema" onClick={() => go("novo")}><Plus /></button>}
      </header>

      {!online && hydrated && (
        <div className="offline ch" role="status"><Offline /><span><b>Sem ligação.</b> O progresso fica guardado e sobe quando voltares.</span></div>
      )}

      <main key={view} className="content view-in">
        {/* nada de dados antes de ler o navegador */}
        {!hydrated ? landing : booting ? (
          <div className="loading" role="status"><HeroIco><Sync /></HeroIco><p className="sub center">A carregar o teu progresso…</p></div>
        ) : needsProfile ? <Onboarding user={user!} onSaved={() => { void reloadProfile(); go("trilha", undefined, true); }} /> : <>
        {inApp && <UpdateBanner state={s} signedIn notify={notify} />}
        {view === "novidades" && <News state={s} onIdeas={() => go("ideias")} />}
        {view === "novo" && (
          <NewTopic trails={s.trails} online={online} onExplore={() => go("explorar")}
            onOpen={(t) => { update((x) => ({ ...x, active: t.id })); go("trilha", undefined, true); notify(`Abri a trilha “${t.topic}”`); }}
            onDone={(t) => { go("trilha", undefined, true); notify(`Trilha pronta: ${t}`); celebrate(); }} />
        )}

        {view === "explorar" && (
          <Explore state={s} initialQuery={tema} onNew={() => go("novo")}
            onStart={(t) => { go("trilha", undefined, true); notify(`Trilha pronta: ${t.topic}`); celebrate(); }} />
        )}

        {view === "revisar" && <ReviewView state={s} />}
        {view === "desafio" && inApp && <Challenge state={s} onDone={() => go("trilha", undefined, true)} />}

        {view === "conta" && (
          <Account ready={ready} recovery={recovery} onRecovered={endRecovery}
            changing={changing} onChangingEnd={(changed) => { setChanging(false); if (changed) notify("Palavra-passe alterada."); }}
            linkError={linkError} onClearLink={clearLinkError}
            onSignedIn={notify} />
        )}
        {view === "conta" && !user && landing}

        {view === "perfil" && user && profile && (
          <ProfileView user={user} profile={profile} state={s} onSaved={() => { void reloadProfile(); notify("Perfil guardado"); }}
            onSettings={() => go("definicoes")} notify={notify}
            onOpenTrail={(id) => { update((x) => ({ ...x, active: id })); go("trilha"); }} />
        )}

        {view === "ideias" && user && profile && <Ideas user={user} onBack={() => go("perfil")} notify={notify} />}

        {view === "ranking" && user && profile && <Ranking me={profile} onBack={() => go("perfil")} />}

        {view === "admin" && user && profile && <Admin onBack={() => go("perfil")} />}

        {view === "definicoes" && user && profile && (
          <Settings user={user} profile={profile} state={s} status={status} sub={params.get("s")} onSub={(x) => go("definicoes", undefined, false, x ?? undefined)} onNews={() => go("novidades")} onChangePassword={() => setChanging(true)}
            onSignOut={leave} onBack={() => go("perfil")} onProfile={() => void reloadProfile()} onAdmin={() => go("admin")} />
        )}

        {(view === "trilha" || view === "licao") && !trail && (
          <>
            {user && profile && view === "trilha" && <Announce state={s} uid={user.id} onNews={() => go("novidades")} toast={notify} />}
            <div className="hero-new">
              <HeroIco><Route /></HeroIco>
              <h1 className="h-screen">Escolhe o teu primeiro tema</h1>
              <p className="sub">Escreve qualquer tema e eu monto-te uma trilha com lições, cartões e testes.</p>
              <div className="stack">
                <button type="button" className="btn block" onClick={() => go("explorar")}><span className="face">Explorar temas</span></button>
                <button type="button" className="btn soft block" onClick={() => go("novo")}><span className="face">Criar um tema</span></button>
              </div>
            </div>
          </>
        )}

        {view === "licao" && trail && resting && <RestView due={dueCount} onReview={() => go("revisar")} onTrail={() => go("trilha")} onBack={() => go("trilha")} />}
        {view === "licao" && trail && !resting && (
          <LessonView key={`${trail.id}:${lesson}`} trail={trail} index={lesson} notify={notify} online={online}
            onBack={() => go("trilha")} onNext={() => { go("licao", lesson + 1, true); celebrate(); }}
            onMastered={(last) => celebrate(last)} />
        )}

        {view === "trilha" && trail && (
          <TrailView state={s} trail={trail} dueCount={dueCount} notify={notify}
            onLesson={openLesson} onReview={() => go("revisar")} onChallenge={() => go("desafio")}>
            {user && <Announce state={s} uid={user.id} onNews={() => go("novidades")} toast={notify} />}
            {ask && <Feedback ask={ask} uid={user!.id} onDone={(sent) => sent && notify("Obrigado! Lemos todas as respostas.")} />}
          </TrailView>
        )}
        </>}
      </main>
      <footer className="foot"><LegalLinks onIdea={user && profile ? () => go("ideias") : undefined} onNews={user && profile ? () => go("novidades") : undefined} /></footer>

      {user && !needsProfile && <Island items={items} drawer={drawer} view={view} current={view === "licao" || view === "desafio" ? "trilha" : view} moreActive={["ideias", "ranking", "novidades", "definicoes", "admin"].includes(view)} />}
      {feedback && user && <FeedbackDialog uid={user.id} onClose={() => setFeedback(false)} onIdeas={() => go("ideias")} onSent={() => notify("Obrigado! Lemos todas as respostas.")} />}
      {showInstall && <InstallSheet onClose={() => setShowInstall(false)} />}

      {burst > 0 && <Confetti key={burst} />}
      {badges && <BadgeDialog badges={badges} onClose={() => setBadges(null)} />}
      {showTour && !badges && <Tour onDone={() => update((x) => ({ ...x, tour: true }))} />}
      <Toast msg={toast} onDone={hideToast} />
    </div>
  );
}
