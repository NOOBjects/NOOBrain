"use client";

import type { User } from "@supabase/supabase-js";
import Link from "next/link";
import { useEffect, useState, useSyncExternalStore, type ReactNode } from "react";
import { InstallSheet } from "./InstallSheet";
import { ReminderToggle } from "./ReminderToggle";
import { Switch } from "./Switch";
import { BETA, VERSION } from "@/lib/config";
import { CONTACT } from "@/lib/legal";
import type { Profile } from "@/lib/profile";
import { call } from "@/lib/api";
import { install, useInstall } from "@/lib/install";
import { serverSnapshot, snapshot as remindSnapshot, subscribe as remindSubscribe } from "@/lib/reminders";
import { GOALS, goalOf, initial, update } from "@/lib/store";
import { supabase } from "@/lib/supabase";
import type { State } from "@/lib/types";
import type { SyncStatus } from "@/lib/useSync";

const THEME = "noobrain:theme";
type Theme = "auto" | "light" | "dark";
const THEMES: [Theme, string][] = [["auto", "Automático"], ["light", "Claro"], ["dark", "Escuro"]];

const STATUS: Record<SyncStatus, string> = { off: "Sem ligação", syncing: "A guardar…", saved: "Guardado", error: "Erro ao guardar" };

function readTheme(): Theme {
  try { const t = localStorage.getItem(THEME); return t === "light" || t === "dark" ? t : "auto"; } catch { return "auto"; }
}

const GOAL_LABEL: Record<number, string> = { 10: "Leve", 30: "Normal", 50: "Intensa" };

/** Linha da lista: com `onClick` é um botão (e `›` quando abre um subecrã); sem ele, só mostra o valor. */
function Row({ label, value, onClick, chevron, brand }: { label: string; value?: ReactNode; onClick?: () => void; chevron?: boolean; brand?: boolean }) {
  const body = <><span>{label}</span>{value !== undefined && <em className="val">{value}</em>}{chevron && <i aria-hidden="true">›</i>}</>;
  return onClick
    ? <button type="button" className={`menu-row${brand ? " brand" : ""}`} onClick={onClick}>{body}</button>
    : <div className="menu-row static">{body}</div>;
}
const Group = ({ title, children }: { title: string; children: ReactNode }) => (
  <section className="set-group"><div className="eyebrow">{title}</div><div className="menu-list">{children}</div></section>
);

const SUBS = ["meta", "avisos", "recomecar", "apagar", "sobre"];
const SUB_TITLE: Record<string, string> = { meta: "Meta diária", avisos: "Avisos", recomecar: "Recomeçar do zero", apagar: "Apagar a conta", sobre: "Sobre o NOOBrain" };

export function Settings({ user, profile, state, status, sub, onSub, onChangePassword, onSignOut, onBack, onProfile, onAdmin, onNews }: {
  user: User; profile: Profile; state: State; status: SyncStatus; sub: string | null; onSub: (s: string | null) => void;
  onChangePassword: () => void; onSignOut: () => Promise<void>; onBack: () => void; onProfile: () => void; onAdmin: () => void; onNews: () => void;
}) {
  const device = useSyncExternalStore(remindSubscribe, remindSnapshot, serverSnapshot);
  const installState = useInstall();
  const [sheet, setSheet] = useState(false);
  const [hint, setHint] = useState(false);
  const [role, setRole] = useState<string | null>(null);
  useEffect(() => {
    let live = true;
    call<{ role: string | null }>("/api/admin?o=me").then((r) => live && setRole(r.role), () => {});
    return () => { live = false; };
  }, []);
  const goal = goalOf(state);
  const [theme, setTheme] = useState<Theme>(readTheme);
  const [reset, setReset] = useState("");
  const [del, setDel] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [test, setTest] = useState<string | null>(null);

  function pickTheme(t: Theme) {
    setTheme(t);
    try { if (t === "auto") localStorage.removeItem(THEME); else localStorage.setItem(THEME, t); } catch { /* sem armazenamento: só vale nesta sessão */ }
    if (t === "auto") document.documentElement.removeAttribute("data-theme");
    else document.documentElement.setAttribute("data-theme", t);
  }

  function download() {
    const url = URL.createObjectURL(new Blob([JSON.stringify({ perfil: profile, progresso: state }, null, 2)], { type: "application/json" }));
    const a = Object.assign(document.createElement("a"), { href: url, download: "noobrain.json" });
    a.click();
    URL.revokeObjectURL(url);
  }

  async function sendTest() {
    setTest(null);
    const { data } = await supabase!.auth.getSession();
    const res = await fetch("/api/push/test", { method: "POST", headers: { authorization: `Bearer ${data.session?.access_token ?? ""}` } });
    const body = await res.json().catch(() => ({}));
    setTest(res.ok ? "Enviado. Se não chegar, confirma as permissões do navegador." : body.error ?? "Não consegui enviar.");
  }

  async function toggleRanking() {
    const { error: err } = await supabase!.from("profiles").update({ in_ranking: !profile.in_ranking }).eq("id", user.id);
    if (err) return setError("Não consegui guardar. Tenta outra vez.");
    onProfile();
  }

  async function deleteAccount() {
    setError(null);
    const { data } = await supabase!.auth.getSession();
    const res = await fetch("/api/account", { method: "DELETE", headers: { authorization: `Bearer ${data.session?.access_token ?? ""}` } });
    if (!res.ok) return setError("Não consegui apagar a conta. Tenta outra vez.");
    await onSignOut();
  }

  const providers = user.app_metadata.providers ?? [];
  const entras = providers.includes("google") && providers.includes("email") ? "Google e e-mail" : providers.includes("google") ? "Google" : "E-mail";
  const sec = sub && SUBS.includes(sub) ? sub : null;
  const back = () => onSub(null);

  if (sec) {
    return (
      <div className="settings">
        <button type="button" className="linkbtn back" onClick={back}>← Definições</button>
        <h1 className="h-screen">{SUB_TITLE[sec]}</h1>

        {sec === "meta" && (
          <section className="pane gap"><div className="in set">
            <div className="seg three" role="group" aria-label="Meta diária de XP">
              {GOALS.map((g) => (
                <button key={g} type="button" className="ch" aria-pressed={goal === g} onClick={() => update((s) => ({ ...s, goal: g }))}>
                  {GOAL_LABEL[g]}<small>{g} XP</small>
                </button>
              ))}
            </div>
            <p className="sub small">Uma lição dá cerca de 40 XP; cada cartão certo na revisão dá 1. A sequência tem um dia de folga por semana.</p>
          </div></section>
        )}

        {sec === "avisos" && (
          <section className="pane gap"><div className="in set">
            <ReminderToggle />
            <ReminderToggle kind="news" quiet />
            <button type="button" className="btn soft sm" onClick={() => void sendTest()}><span className="face">Enviar aviso de teste</span></button>
            {test && <p className="sub small" role="status">{test}</p>}
          </div></section>
        )}

        {sec === "recomecar" && (
          <section className="pane gap"><div className="in set">
            <p>Apaga todas as trilhas e o teu progresso. A conta, o perfil e as definições ficam.</p>
            <label className="lbl" htmlFor="reset">Escreve RECOMEÇAR para confirmar</label>
            <input id="reset" className="field ch" value={reset} onChange={(e) => setReset(e.target.value)} autoComplete="off" />
            <button type="button" className="btn soft" disabled={reset !== "RECOMEÇAR"} onClick={() => { update((x) => ({ ...initial, seenVersion: x.seenVersion, notify: x.notify, goal: x.goal, tour: true, badges: {}, asked: x.asked })); setReset(""); back(); }}>
              <span className="face">Apagar trilhas e progresso</span>
            </button>
          </div></section>
        )}

        {sec === "apagar" && (
          <section className="pane is-wrong gap"><div className="in set">
            <p>Isto apaga para sempre a tua conta, o teu perfil, o ranking, as ideias e todo o progresso. Não dá para desfazer.</p>
            <label className="lbl" htmlFor="del">Escreve o teu @nome ({profile.username}) para confirmar</label>
            <input id="del" className="field ch" value={del} onChange={(e) => setDel(e.target.value)} autoComplete="off" autoCapitalize="none" />
            <button type="button" className="btn bad" disabled={del !== profile.username} onClick={() => void deleteAccount()}>
              <span className="face">Apagar a conta para sempre</span>
            </button>
            {error && <div className="note ch" role="alert">{error}</div>}
          </div></section>
        )}

        {sec === "sobre" && (
          <section className="pane gap"><div className="in set">
            <p>O NOOBrain ajuda-te a aprender qualquer tema, um conceito de cada vez, com trilhas, lições, cartões e revisão espaçada.{BETA && ` Versão beta ${VERSION}.`}</p>
            <p>O NOOBrain é feito pela NOOBjects.</p>
            <p className="sub small">As fontes são wikis abertas (Wikipédia, Wikilivros, Wikiversidade e Wikisource), sob licença CC BY-SA.</p>
            <p className="sub small"><Link href="/termos">Termos</Link> · <Link href="/privacidade">Privacidade</Link> · <a href={`mailto:${CONTACT}`}>{CONTACT}</a></p>
            <div className="chip ch">Fundraising em breve</div>
          </div></section>
        )}
      </div>
    );
  }

  return (
    <div className="settings">
      <button type="button" className="linkbtn back" onClick={onBack}>← Voltar ao perfil</button>
      <h1 className="h-screen">Definições</h1>

      <Group title="Estudo">
        <Row label="Meta diária" value={`${GOAL_LABEL[goal]} · ${goal} XP`} chevron onClick={() => onSub("meta")} />
        <Row label="Avisos" value={device === "on" ? "Ligados" : device === "na" ? "Bloqueados" : "Desligados"} chevron onClick={() => onSub("avisos")} />
      </Group>

      <Group title="Aparência">
        <div className="menu-row col static"><span>Tema</span>
          <div className="seg three" role="group" aria-label="Tema">
            {THEMES.map(([id, label]) => <button key={id} type="button" className="ch" aria-pressed={theme === id} onClick={() => pickTheme(id)}>{label}</button>)}
          </div>
        </div>
      </Group>

      <section className="set-group">
        <div className="eyebrow">Privacidade</div>
        <div className="menu-list"><div className="menu-row static"><span>Aparecer no ranking</span><Switch on={profile.in_ranking} onChange={() => void toggleRanking()} label="Aparecer no ranking" /></div></div>
        <p className="sub small set-note">Desligado, o teu nome sai do ranking e o perfil público deixa de aparecer no Google.</p>
        {error && !sub && <div className="note ch" role="alert">{error}</div>}
      </section>

      <Group title="App">
        {installState === "installed" ? <Row label="Instalar o app" value="Já instalado" />
          : <Row label="Instalar o app" chevron onClick={() => (installState === "prompt" ? void install() : installState === "ios" ? setSheet(true) : setHint((h) => !h))} />}
        <Row label="Novidades" value={`Versão ${VERSION}`} chevron onClick={onNews} />
      </Group>

      {hint && installState === "none" && <p className="sub small set-note">Este navegador não deixa instalar. Abre o site no Chrome ou no Edge (computador ou Android), ou no iPhone ou iPad.</p>}

      <Group title="Conta">
        <Row label="E-mail" value={user.email} />
        <Row label="Entras com" value={entras} />
        <Row label="Sincronização" value={STATUS[status]} />
        {providers.includes("email") && <Row label="Alterar palavra-passe" chevron onClick={onChangePassword} />}
        <Row label="Terminar sessão" brand onClick={() => void onSignOut()} />
      </Group>

      <Group title="Dados">
        <Row label="Descarregar os meus dados" onClick={download} />
        <Row label="Recomeçar do zero" chevron onClick={() => onSub("recomecar")} />
        <Row label="Apagar a conta" chevron onClick={() => onSub("apagar")} />
      </Group>

      {role && (
        <Group title="Equipa"><Row label="Painel de administração" value={role === "dono" ? "Dono" : role === "admin" ? "Admin" : "Moderador"} chevron onClick={onAdmin} /></Group>
      )}

      <Group title="Sobre"><Row label="Sobre o NOOBrain" chevron onClick={() => onSub("sobre")} /></Group>

      <p className="sub small set-foot">NOOBrain{BETA ? ` beta ${VERSION}` : ` ${VERSION}`} · NOOBjects</p>
      {sheet && <InstallSheet onClose={() => setSheet(false)} />}
    </div>
  );
}
