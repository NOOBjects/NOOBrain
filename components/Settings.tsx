"use client";

import type { User } from "@supabase/supabase-js";
import Link from "next/link";
import { useState } from "react";
import { ReminderToggle } from "./ReminderToggle";
import { BETA, VERSION } from "@/lib/config";
import { CONTACT } from "@/lib/legal";
import type { Profile } from "@/lib/profile";
import { initial, update } from "@/lib/store";
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

export function Settings({ user, profile, state, status, onChangePassword, onSignOut, onBack }: {
  user: User; profile: Profile; state: State; status: SyncStatus;
  onChangePassword: () => void; onSignOut: () => Promise<void>; onBack: () => void;
}) {
  const [theme, setTheme] = useState<Theme>(readTheme);
  const [reset, setReset] = useState("");
  const [del, setDel] = useState("");
  const [error, setError] = useState<string | null>(null);

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
        <div className="eyebrow">Lembretes</div>
        <ReminderToggle />
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
        <button type="button" className="btn soft" disabled={reset !== "RECOMEÇAR"} onClick={() => { update(() => ({ ...initial })); setReset(""); }}>
          <span className="face">Apagar trilhas e progresso</span>
        </button>
        <label className="lbl" htmlFor="del">Apagar conta: escreve o teu @nome ({profile.username})</label>
        <input id="del" className="field ch" value={del} onChange={(e) => setDel(e.target.value)} autoComplete="off" autoCapitalize="none" />
        <button type="button" className="btn bad" disabled={del !== profile.username} onClick={() => void deleteAccount()}>
          <span className="face">Apagar a conta para sempre</span>
        </button>
        {error && <div className="note ch" role="alert">{error}</div>}
      </div></section>

      <section className="pane gap"><div className="in set">
        <div className="eyebrow">Sobre</div>
        <p>O NOOBrain ajuda-te a aprender qualquer tema, um conceito de cada vez, com trilhas, lições, cartões e revisão espaçada.{BETA && ` Versão beta ${VERSION}.`}</p>
        <p>O NOOBrain é feito quase 100% com inteligência artificial: o código foi escrito por modelos de IA. As ideias, o design, as decisões e o cuidado com cada detalhe são do Rodrigo, da NOOBjects.</p>
        <p className="sub small">As fontes são wikis abertas (Wikipédia, Wikilivros, Wikiversidade e Wikisource), sob licença CC BY-SA.</p>
        <p className="sub small"><Link href="/termos">Termos</Link> · <Link href="/privacidade">Privacidade</Link> · <a href={`mailto:${CONTACT}`}>{CONTACT}</a></p>
        <div className="chip ch">Fundraising em breve</div>
      </div></section>
    </div>
  );
}
