"use client";

import type { User } from "@supabase/supabase-js";
import { useState } from "react";
import { Mascot } from "./Mascot";
import { ReminderToggle } from "./ReminderToggle";
import { supabase } from "@/lib/supabase";
import type { SyncStatus } from "@/lib/useSync";

const STATUS: Record<SyncStatus, string> = {
  off: "Sem sincronização",
  syncing: "Sincronizando…",
  saved: "Progresso salvo na nuvem",
  error: "Não consegui sincronizar. Seu progresso continua salvo neste aparelho.",
};

export function Account({ user, status }: { user: User | null; status: SyncStatus }) {
  const [mode, setMode] = useState<"entrar" | "criar">("entrar");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState<{ ok: boolean; text: string } | null>(null);

  if (!supabase)
    return (
      <div className="account">
        <h1 className="h-screen">Conta</h1>
        <div className="note ch" role="status">As contas ainda não foram configuradas neste ambiente. O progresso fica salvo só neste aparelho.</div>
      </div>
    );

  if (user)
    return (
      <div className="account">
        <div className="hero-mascot"><Mascot mood="happy" /></div>
        <h1 className="h-screen">Você está conectado</h1>
        <p className="sub">{user.email}</p>
        <div className={`chip ch ${status === "error" ? "warnchip" : ""}`} role="status">{STATUS[status]}</div>
        <p className="sub small">Entre com a mesma conta em outro aparelho para continuar de onde parou.</p>
        <ReminderToggle />
        <button type="button" className="btn soft" onClick={() => supabase!.auth.signOut()}><span className="face">Sair</span></button>
      </div>
    );

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setMsg(null);
    if (password.length < 8) return setMsg({ ok: false, text: "A senha precisa ter pelo menos 8 caracteres." });
    setBusy(true);
    const { data, error } =
      mode === "entrar"
        ? await supabase!.auth.signInWithPassword({ email, password })
        : await supabase!.auth.signUp({ email, password });
    setBusy(false);
    if (error) {
      const m = error.message.toLowerCase();
      return setMsg({
        ok: false,
        text: m.includes("invalid login") ? "E-mail ou senha incorretos."
          : m.includes("already") ? "Este e-mail já tem conta. Use Entrar."
          : m.includes("rate") ? "Muitas tentativas. Espere um pouco e tente de novo."
          : m.includes("not confirmed") ? "Confirme seu e-mail pelo link que enviamos."
          : "Não foi possível continuar. Confira os dados e tente de novo.",
      });
    }
    if (mode === "criar" && !data.session) setMsg({ ok: true, text: "Conta criada. Enviamos um e-mail de confirmação: abra o link e depois entre aqui." });
  }

  return (
    <div className="account">
      <div className="hero-mascot"><Mascot mood={msg && !msg.ok ? "sad" : "idle"} /></div>
      <h1 className="h-screen">{mode === "entrar" ? "Entrar" : "Criar conta"}</h1>
      <p className="sub">Com uma conta, seu progresso acompanha você em qualquer aparelho. É opcional: sem conta, tudo fica salvo só neste navegador.</p>
      <form onSubmit={submit} className="account-form">
        <label className="sr" htmlFor="email">E-mail</label>
        <input id="email" type="email" className="field ch" placeholder="E-mail" value={email} onChange={(e) => setEmail(e.target.value)} required autoComplete="email" />
        <label className="sr" htmlFor="password">Senha</label>
        <input id="password" type="password" className="field ch" placeholder="Senha (mínimo 8 caracteres)" value={password} onChange={(e) => setPassword(e.target.value)} required minLength={8} autoComplete={mode === "entrar" ? "current-password" : "new-password"} />
        {msg && <div className={`note ch${msg.ok ? " good" : ""}`} role="alert">{msg.text}</div>}
        <button type="submit" className="btn block" disabled={busy}><span className="face">{busy ? "Aguarde…" : mode === "entrar" ? "Entrar" : "Criar conta"}</span></button>
        <button type="button" className="linkbtn" onClick={() => { setMode(mode === "entrar" ? "criar" : "entrar"); setMsg(null); }}>
          {mode === "entrar" ? "Ainda não tenho conta" : "Já tenho conta"}
        </button>
      </form>
    </div>
  );
}
