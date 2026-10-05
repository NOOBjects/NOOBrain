"use client";

import type { User } from "@supabase/supabase-js";
import Link from "next/link";
import { useEffect, useState } from "react";
import { ReminderToggle } from "./ReminderToggle";
import { BETA, VERSION } from "@/lib/config";
import { CONTACT } from "@/lib/legal";
import type { Profile } from "@/lib/profile";
import { call } from "@/lib/api";
import { GOALS, goalOf, initial, update } from "@/lib/store";
import { supabase } from "@/lib/supabase";
import type { State } from "@/lib/types";
import type { SyncStatus } from "@/lib/useSync";

const THEME = "noobrain:theme";
type Theme = "auto" | "light" | "dark";
const THEMES: [Theme, string][] = [["auto", "Automático"], ["light", "Claro"], ["dark", "Escuro"]];

const STATUS: Record<SyncStatus, string> = {
  off: "Sem sincronização",
  syncing: "A sincronizar…",
  saved: "Progresso guardado na nuvem",
  error: "Não foi possível sincronizar. O progresso continua guardado neste aparelho.",
};

function readTheme(): Theme {
  try { const t = localStorage.getItem(THEME); return t === "light" || t === "dark" ? t : "auto"; } catch { return "auto"; }
}

const GOAL_LABEL: Record<number, string> = { 10: "Leve", 30: "Normal", 50: "Intensa" };

export function Settings({ user, profile, state, status, onChangePassword, onSignOut, onBack, onProfile, onAdmin }: {
  user: User; profile: Profile; state: State; status: SyncStatus;
  onChangePassword: () => void; onSignOut: () => Promise<void>; onBack: () => void; onProfile: () => void; onAdmin: () => void;
}) {
  const [isAdmin, setIsAdmin] = useState(false);
  useEffect(() => {
    let live = true;
    call<{ admin: boolean }>("/api/admin?o=me").then((r) => live && setIsAdmin(r.admin), () => {});
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

  return (
    <div className="settings">
      <button type="button" className="linkbtn back" onClick={onBack}>← Voltar ao perfil</button>
      <h1 className="h-screen">Definições</h1>

      <section className="pane gap"><div className="in set">
        <div className="eyebrow">Aparência</div>
        <div className="seg three" role="group" aria-label="Tema">
          {THEMES.map(([id, label]) => <button key={id} type="button" className="ch" aria-pressed={theme === id} onClick={() => pickTheme(id)}>{label}</button>)}
        </div>
      </div></section>

      <section className="pane gap"><div className="in set">
        <div className="eyebrow">Meta diária</div>
        <div className="seg three" role="group" aria-label="Meta diária de XP">
          {GOALS.map((g) => (
            <button key={g} type="button" className="ch" aria-pressed={goal === g} onClick={() => update((s) => ({ ...s, goal: g }))}>
              {GOAL_LABEL[g]}<small>{g} XP</small>
            </button>
          ))}
        </div>
        <p className="sub small">Uma lição dá cerca de 40 XP; cada cartão certo na revisão dá 1. A sequência tem um dia de folga por semana.</p>
      </div></section>

      <section className="pane gap"><div className="in set">
        <div className="eyebrow">Avisos</div>
        <ReminderToggle />
        <ReminderToggle kind="news" quiet />
        <button type="button" className="btn soft sm" onClick={() => void sendTest()}><span className="face">Enviar aviso de teste</span></button>
        {test && <p className="sub small" role="status">{test}</p>}
      </div></section>

      <section className="pane gap"><div className="in set">
        <div className="eyebrow">Ranking</div>
        <p className="sub small">{profile.in_ranking ? "O teu nome aparece no ranking da semana." : "Estás fora do ranking."}</p>
        <button type="button" className="btn soft sm" onClick={() => void toggleRanking()}><span className="face">{profile.in_ranking ? "Sair do ranking" : "Aparecer no ranking"}</span></button>
      </div></section>

      <section className="pane gap"><div className="in set">
        <div className="eyebrow">Conta</div>
        <p className="sub">{user.email}{user.app_metadata.provider === "google" ? " · com o Google" : ""}</p>
        <div className={`chip ch ${status === "error" ? "warnchip" : ""}`} role="status">{STATUS[status]}</div>
        {user.app_metadata.providers?.includes("email") && (
          <button type="button" className="btn soft" onClick={onChangePassword}><span className="face">Alterar palavra-passe</span></button>
        )}
        <button type="button" className="btn soft" onClick={() => void onSignOut()}><span className="face">Terminar sessão</span></button>
      </div></section>

      <section className="pane gap"><div className="in set">
        <div className="eyebrow">Dados</div>
        <button type="button" className="btn soft" onClick={download}><span className="face">Descarregar os meus dados</span></button>
        <label className="lbl" htmlFor="reset">Recomeçar do zero: escreve RECOMEÇAR</label>
        <input id="reset" className="field ch" value={reset} onChange={(e) => setReset(e.target.value)} autoComplete="off" />
        <button type="button" className="btn soft" disabled={reset !== "RECOMEÇAR"} onClick={() => { update((x) => ({ ...initial, seenVersion: x.seenVersion, notify: x.notify, goal: x.goal, tour: true, badges: {}, asked: x.asked })); setReset(""); }}>
          <span className="face">Apagar trilhas e progresso</span>
        </button>
        <label className="lbl" htmlFor="del">Apagar conta: escreve o teu @nome ({profile.username})</label>
        <input id="del" className="field ch" value={del} onChange={(e) => setDel(e.target.value)} autoComplete="off" autoCapitalize="none" />
        <button type="button" className="btn bad" disabled={del !== profile.username} onClick={() => void deleteAccount()}>
          <span className="face">Apagar a conta para sempre</span>
        </button>
        {error && <div className="note ch" role="alert">{error}</div>}
      </div></section>

      {isAdmin && (
        <section className="pane gap"><div className="in set">
          <div className="eyebrow">Administração</div>
          <p className="sub small">Ideias, erros reportados, opiniões, números e catálogo.</p>
          <button type="button" className="btn soft sm" onClick={onAdmin}><span className="face">Abrir o painel</span></button>
        </div></section>
      )}

      <section className="pane gap"><div className="in set">
        <div className="eyebrow">Sobre</div>
        <p>O NOOBrain ajuda-te a aprender qualquer tema, um conceito de cada vez, com trilhas, lições, cartões e revisão espaçada.{BETA && ` Versão beta ${VERSION}.`}</p>
        <span className="chip ch ai">✦ Feito com IA · NOOBjects</span>
        <p>O NOOBrain é feito quase 100% com inteligência artificial: o código foi escrito por modelos de IA. As ideias, o design, as decisões e o cuidado com cada detalhe são do Rodrigo, da NOOBjects.</p>
        <p className="sub small">As fontes são wikis abertas (Wikipédia, Wikilivros, Wikiversidade e Wikisource), sob licença CC BY-SA.</p>
        <p className="sub small"><Link href="/termos">Termos</Link> · <Link href="/privacidade">Privacidade</Link> · <a href={`mailto:${CONTACT}`}>{CONTACT}</a></p>
        <div className="chip ch">Fundraising em breve</div>
      </div></section>
    </div>
  );
}
