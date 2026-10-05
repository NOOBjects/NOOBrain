"use client";

import type { AuthError } from "@supabase/supabase-js";
import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { Eye, EyeOff, HeroIco, Sync } from "./Icons";
import { Mascot, type Mood } from "./Mascot";
import { supabase } from "@/lib/supabase";
import { distance } from "@/lib/topic";
import { OAUTH_KEY } from "@/lib/useSync";

// O botão do Google só aparece depois de o Google estar ligado no Supabase (ver .env.example).
const GOOGLE = process.env.NEXT_PUBLIC_GOOGLE_LOGIN === "1";
const LAST_EMAIL = "noobrain:email";

/** Navegador embutido noutra app (Instagram, Facebook, TikTok, WebView...): o Google costuma bloquear o login aí. */
function inAppBrowser() {
  const ua = navigator.userAgent;
  // App instalado no ecrã principal (iPhone): o identificador não traz "Safari", mas não é outra app.
  if (matchMedia("(display-mode: standalone)").matches || (navigator as Navigator & { standalone?: boolean }).standalone) return false;
  if (/FBAN|FBAV|Instagram|Line\/|Snapchat|TikTok|BytedanceWebview|MicroMessenger|LinkedInApp|Twitter|; wv\)/i.test(ua)) return true;
  return /iPhone|iPad|iPod/.test(ua) && !/Safari|CriOS|FxiOS|EdgiOS|OPiOS/.test(ua); // WebView do iOS não traz "Safari"
}
const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

type Mode = "entrar" | "criar" | "esqueci" | "nova" | "enviado";
type Sent = "signup" | "reset";
type Msg = { ok: boolean; text: string; act?: "entrar" | "reenviar" };

const TITLE: Record<Mode, string> = {
  entrar: "Que bom ver-te!",
  criar: "Vamos começar?",
  esqueci: "Esqueceste-te da palavra-passe?",
  nova: "Escolhe uma palavra-passe nova",
  enviado: "Vê o teu e-mail",
};
const SUB: Record<Exclude<Mode, "enviado">, string> = {
  entrar: "Inicia sessão para continuares de onde paraste, em qualquer aparelho.",
  criar: "Cria a tua conta grátis. O teu progresso fica guardado e acompanha-te em qualquer aparelho.",
  esqueci: "Sem problema. Indica o teu e-mail e enviamos-te um link para criares uma nova.",
  nova: "Quase lá. Usa pelo menos 8 caracteres.",
};
const LABEL: Record<Exclude<Mode, "enviado">, string> = { entrar: "Entrar", criar: "Criar conta", esqueci: "Enviar link", nova: "Guardar palavra-passe" };
const LEVELS = ["", "Fraca", "Razoável", "Boa", "Forte"];

/** Pontua de 1 a 4: tamanho (8 e 12) e variedade (maiúsculas e minúsculas, números, símbolos). */
function strength(p: string) {
  if (p.length < 8) return 1;
  let n = p.length >= 12 ? 1 : 0;
  n += /[a-z]/.test(p) && /[A-Z]/.test(p) ? 1 : 0;
  n += /\d/.test(p) ? 1 : 0;
  n += /[^A-Za-z0-9]/.test(p) ? 1 : 0;
  return Math.min(4, Math.max(1, n));
}

// ponytail: lista curta; um domínio fora dela só recebe sugestão se estiver a 1 ou 2 letras de um daqui.
const DOMAINS = ["gmail.com", "hotmail.com", "hotmail.pt", "outlook.com", "outlook.pt", "live.com", "live.com.pt", "sapo.pt", "yahoo.com", "icloud.com", "me.com", "proton.me", "protonmail.com", "msn.com", "hotmail.es", "outlook.es", "yahoo.com.br"];
/** "ana@gmial.com" → "ana@gmail.com". Devolve null se não houver sugestão. */
function suggest(email: string) {
  const [name, dom] = email.trim().toLowerCase().split("@");
  if (!name || !dom || DOMAINS.includes(dom)) return null;
  const near = DOMAINS.find((d) => distance(dom, d) <= 2);
  return near ? `${name}@${near}` : null;
}

/** Atalho para a caixa de correio, quando o domínio é conhecido. */
function inbox(email: string) {
  const d = email.split("@")[1]?.toLowerCase() ?? "";
  if (d === "gmail.com") return { name: "Gmail", url: "https://mail.google.com/" };
  if (/^(outlook|hotmail|live|msn)\./.test(d)) return { name: "Outlook", url: "https://outlook.live.com/mail/" };
  if (/^yahoo\./.test(d)) return { name: "Yahoo Mail", url: "https://mail.yahoo.com/" };
  if (d === "icloud.com" || d === "me.com") return { name: "iCloud Mail", url: "https://www.icloud.com/mail" };
  return null;
}

/** Mensagem em português para cada erro do Supabase (pelo código, que não muda com a língua). */
function explain(error: AuthError): Msg {
  switch (error.code) {
    case "invalid_credentials": return { ok: false, text: "E-mail ou palavra-passe incorretos." };
    case "email_not_confirmed": return { ok: false, text: "Ainda falta confirmar o e-mail. Abre o link que te enviámos.", act: "reenviar" };
    case "user_already_exists":
    case "email_exists": return { ok: false, text: "Este e-mail já tem conta.", act: "entrar" };
    case "same_password": return { ok: false, text: "Escolhe uma palavra-passe diferente da anterior." };
    case "weak_password": return { ok: false, text: "Palavra-passe demasiado fraca. Usa mais caracteres e mistura letras, números e símbolos." };
    case "email_address_invalid": return { ok: false, text: "Este e-mail não parece válido." };
    case "over_email_send_rate_limit":
    case "over_request_rate_limit": return { ok: false, text: "Demasiadas tentativas. Espera um minuto e tenta outra vez." };
    case "reauthentication_needed": return { ok: false, text: "Por segurança, termina a sessão e usa «Esqueci-me da palavra-passe»." };
    case "captcha_failed": return { ok: false, text: "O início de sessão com e-mail está temporariamente indisponível. Usa o Google ou tenta daqui a pouco." };
    case "signup_disabled": return { ok: false, text: "De momento não é possível criar contas." };
  }
  if (error.name === "AuthRetryableFetchError") return { ok: false, text: "Sem ligação. Verifica a internet e tenta outra vez." };
  console.error("auth", error.code, error.message);
  return { ok: false, text: "Não foi possível continuar. Tenta outra vez." };
}

const LINK_ERROR: Record<string, string> = {
  otp_expired: "Este link expirou ou já foi usado. Se estavas a confirmar a conta, tenta entrar; se querias mudar a palavra-passe, pede um link novo.",
  access_denied: "O início de sessão foi cancelado.",
};

type Props = {
  ready: boolean;
  changing: boolean; // com sessão iniciada, a alterar a palavra-passe
  onChangingEnd: (changed: boolean) => void;
  recovery: boolean;
  onRecovered: () => void;
  linkError: string | null;
  onClearLink: () => void;
  onSignedIn: (text: string) => void;
};

export function Account({ ready, recovery, onRecovered, changing, onChangingEnd, linkError, onClearLink, onSignedIn }: Props) {
  const [pick, setMode] = useState<Mode>("entrar");
  const mode: Mode = recovery || changing ? "nova" : pick;
  const [email, setEmail] = useState(() => { try { return localStorage.getItem(LAST_EMAIL) ?? ""; } catch { return ""; } });
  const [password, setPassword] = useState("");
  const [show, setShow] = useState(false);
  const [caps, setCaps] = useState(false);
  const [focus, setFocus] = useState<"" | "email" | "senha">("");
  const [busy, setBusy] = useState(false);
  const [age, setAge] = useState(false); // "Tenho 13 anos ou mais" (registo por e-mail)
  const [msg, setMsg] = useState<Msg | null>(null);
  const [bad, setBad] = useState<{ email?: string; password?: string }>({});
  const [sent, setSent] = useState<Sent>("signup");
  const [wait, setWait] = useState(0); // segundos até poder reenviar o e-mail

  useEffect(() => {
    if (wait <= 0) return;
    const t = setTimeout(() => setWait((w) => w - 1), 1000);
    return () => clearTimeout(t);
  }, [wait]);

  // Voltar atrás a partir da página do Google traz esta página de volta "congelada" com o botão a girar: desbloquear.
  useEffect(() => {
    const onShow = (e: PageTransitionEvent) => { if (e.persisted) { setBusy(false); setMsg(null); } };
    window.addEventListener("pageshow", onShow);
    return () => window.removeEventListener("pageshow", onShow);
  }, []);
  const [embedded] = useState(() => typeof navigator !== "undefined" && inAppBrowser());
  // Login do Google na janela à parte: a sessão chega a este separador pelo Supabase (BroadcastChannel).
  const popup = useRef(false);
  useEffect(() => {
    const sub = supabase?.auth.onAuthStateChange((e) => {
      if (e === "SIGNED_IN" && popup.current) { popup.current = false; onSignedIn("Sessão iniciada com o Google."); }
    });
    return () => sub?.data.subscription.unsubscribe();
  }, [onSignedIn]);
  const android = embedded && /Android/i.test(navigator.userAgent);
  function copyLink() {
    const link = window.location.origin;
    const fail = () => setMsg({ ok: false, text: `Não consegui copiar. Escreve no navegador: ${window.location.host}` });
    if (!navigator.clipboard) return fail();
    navigator.clipboard.writeText(link).then(() => setMsg({ ok: true, text: "Link copiado. Cola-o no Chrome ou no Safari." }), fail);
  }
  if (!supabase)
    return (
      <div className="account">
        <h1 className="h-screen">Conta</h1>
        <div className="note ch" role="status">As contas ainda não estão configuradas neste ambiente. O progresso fica guardado só neste aparelho.</div>
      </div>
    );

  if (!ready)
    return (
      <div className="account">
        <div className="loading" role="status">
          <HeroIco><Sync /></HeroIco>
          <p className="sub">A verificar a sessão…</p>
        </div>
      </div>
    );

  const needsEmail = mode === "entrar" || mode === "criar" || mode === "esqueci";
  const needsPass = mode === "entrar" || mode === "criar" || mode === "nova";
  const needsNew = mode === "criar" || mode === "nova";
  const score = strength(password);
  const fix = suggest(email);
  const box = inbox(email);
  const note: Msg | null = msg ?? (linkError ? { ok: false, text: LINK_ERROR[linkError] ?? "Não foi possível concluir o início de sessão. Tenta outra vez." } : null);

  function go(m: Mode) {
    setMode(m);
    setMsg(null);
    setBad({});
    setPassword("");
    setShow(false);
    if (linkError) onClearLink();
  }

  function sentScreen(kind: Sent) {
    setSent(kind);
    setWait(60);
    go("enviado");
  }

  function remember(addr: string) {
    try { localStorage.setItem(LAST_EMAIL, addr); } catch { /* sem armazenamento: segue */ }
  }

  // Num navegador normal, o Google abre numa janela à parte (no telemóvel, um separador) que se fecha sozinha no fim:
  // a página do Google nunca entra no histórico do app, por isso "voltar" não leva de volta ao login.
  // No app instalado e dentro de outras apps fica o método antigo (a página muda para o Google e volta).
  async function google() {
    setMsg(null);
    const own = !embedded && !matchMedia("(display-mode: standalone)").matches;
    const win = own ? window.open("", "noobrain-google", "popup,width=480,height=680") : null; // tem de abrir já, no clique
    popup.current = !!win;
    if (!win) {
      setBusy(true);
      try { sessionStorage.setItem(OAUTH_KEY, "1"); } catch { /* sem armazenamento: só não haverá boas-vindas */ }
    }
    const { data, error } = await supabase!.auth.signInWithOAuth({
      provider: "google",
      options: { redirectTo: `${window.location.origin}${win ? "/entrar" : ""}`, skipBrowserRedirect: true },
    });
    if (error || !data.url) { win?.close(); setBusy(false); return setMsg(error ? explain(error) : { ok: false, text: "Não foi possível continuar. Tenta outra vez." }); }
    if (!win) return window.location.assign(data.url);
    win.location.href = data.url;
    setMsg({ ok: true, text: "Continua na janela do Google. Quando terminares, ela fecha-se sozinha." });
  }

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    popup.current = false; // entrar com e-mail depois de fechar a janela do Google
    setMsg(null);
    if (linkError) onClearLink();
    const addr = email.trim().toLowerCase();
    const errs: { email?: string; password?: string } = {};
    if (needsEmail && !EMAIL.test(addr)) errs.email = addr ? "Este e-mail parece incompleto." : "Escreve o teu e-mail.";
    if (needsPass && !password) errs.password = "Escreve a palavra-passe.";
    else if (needsNew && password.length < 8) errs.password = "Usa pelo menos 8 caracteres.";
    setBad(errs);
    if (errs.email || errs.password) return document.getElementById(errs.email ? "email" : "password")?.focus();
    if (mode === "criar" && !age) return setMsg({ ok: false, text: "Confirma que tens 13 anos ou mais para criares conta." });

    setBusy(true);
    const auth = supabase!.auth;
    const back = window.location.origin;
    let error: AuthError | null = null;
    if (mode === "entrar") ({ error } = await auth.signInWithPassword({ email: addr, password, }));
    else if (mode === "criar") {
      const r = await auth.signUp({ email: addr, password, options: { emailRedirectTo: back, data: { age_ok: true } } });
      error = r.error;
      if (!error && !r.data.session) { setBusy(false); remember(addr); return sentScreen("signup"); }
    } else if (mode === "nova") ({ error } = await auth.updateUser({ password }));
    else {
      ({ error } = await auth.resetPasswordForEmail(addr, { redirectTo: back }));
      if (!error) { setBusy(false); return sentScreen("reset"); }
    }
    setBusy(false);
    if (error) return setMsg(explain(error));

    if (mode === "nova") {
      setPassword("");
      if (changing) return onChangingEnd(true);
      onRecovered();
      return onSignedIn("Palavra-passe alterada. Sessão iniciada.");
    }
    remember(addr);
    onSignedIn(mode === "criar" ? "Conta criada. Boas-vindas!" : "Sessão iniciada.");
  }

  async function resend(kind: Sent) {
    setMsg(null);
    setBusy(true);
    const addr = email.trim().toLowerCase();
    const back = window.location.origin;
    const { error } = kind === "signup"
      ? await supabase!.auth.resend({ type: "signup", email: addr, options: { emailRedirectTo: back } })
      : await supabase!.auth.resetPasswordForEmail(addr, { redirectTo: back });
    setBusy(false);
    if (error) return setMsg(explain(error));
    setWait(60);
    setMsg({ ok: true, text: "Enviámos outro link." });
  }

  const checkCaps = (e: React.KeyboardEvent) => setCaps(e.getModifierState("CapsLock"));
  const mood: Mood = busy ? "think"
    : note ? (note.ok ? "happy" : "sad")
    : mode === "enviado" ? "happy"
    : focus === "senha" ? (show ? "peek" : "shy")
    : focus === "email" ? "peek"
    : "calm";

  return (
    <div className="account">
      <div className="hero-mascot"><Mascot mood={mood} /></div>
      {(mode === "entrar" || mode === "criar") && (
        <div className="seg" role="group" aria-label="Entrar ou criar conta">
          <button type="button" className="ch" aria-pressed={mode === "entrar"} onClick={() => go("entrar")}>Entrar</button>
          <button type="button" className="ch" aria-pressed={mode === "criar"} onClick={() => go("criar")}>Criar conta</button>
        </div>
      )}
      <div className="swap" key={mode}>
        <h1 className="h-screen">{TITLE[mode]}</h1>
        {mode === "enviado" ? (
          <p className="sub">
            {sent === "signup"
              ? <>Enviámos um link de confirmação para <b>{email.trim().toLowerCase()}</b>. Abre-o neste aparelho para ativar a conta.</>
              : <>Se <b>{email.trim().toLowerCase()}</b> tiver conta, o link para criares uma palavra-passe nova já vai a caminho.</>}
            {" "}Não chegou? Vê também a pasta de spam.
          </p>
        ) : (
          <p className="sub">{SUB[mode]}</p>
        )}

        {GOOGLE && (mode === "entrar" || mode === "criar") && (
          <>
            {embedded && (
              <div className="note ch" role="note">
                Abriste o NOOBrain dentro de outra app (como o Instagram ou o Facebook) e aqui o Google costuma bloquear a entrada.
                {android ? " Abre no Chrome ou entra com e-mail." : " Toca em ⋯ e escolhe «Abrir no navegador», ou entra com e-mail."}
                {android && <a className="linkbtn" href={`intent://${window.location.host}/#Intent;scheme=https;package=com.android.chrome;end`}>Abrir no Chrome</a>}
                <button type="button" className="linkbtn" onClick={copyLink}>Copiar o link</button>
              </div>
            )}
            <button type="button" className="btn soft block" disabled={busy} onClick={google}>
              <span className="face"><i className="gicon" aria-hidden="true" />Continuar com o Google</span>
            </button>
            {mode === "criar" && <p className="sub small">Com o Google, a conta é criada logo, se ainda não existir.</p>}
            <div className="or" aria-hidden="true"><span>ou com e-mail</span></div>
          </>
        )}

        {mode === "enviado" ? (
          <div className="account-form">
            {note && <div className={`note ch${note.ok ? " good" : ""}`} role="alert">{note.text}</div>}
            {box && <a className="btn block" href={box.url} target="_blank" rel="noreferrer"><span className="face">Abrir o {box.name}</span></a>}
            <button type="button" className={`btn block${box ? " soft" : ""}`} disabled={busy || wait > 0} onClick={() => resend(sent)}>
              <span className="face">{wait > 0 ? `Reenviar daqui a ${wait} s` : "Reenviar e-mail"}</span>
            </button>
            <button type="button" className="linkbtn" onClick={() => go(sent === "signup" ? "criar" : "esqueci")}>Enganei-me no e-mail</button>
            {sent === "signup" && <button type="button" className="linkbtn" onClick={() => go("entrar")}>Já confirmei, quero entrar</button>}
          </div>
        ) : (
          <form
            noValidate
            onSubmit={submit}
            className="account-form"
            onFocus={(e) => { setFocus(e.target.id === "email" ? "email" : e.target.id === "password" || e.target.id === "eye" ? "senha" : ""); }}
            onBlur={(e) => { if (!e.currentTarget.contains(e.relatedTarget as Node | null)) setFocus(""); }}
          >
            {needsEmail && (
              <div className="fld">
                <label className="lbl" htmlFor="email">E-mail</label>
                <input
                  id="email" type="email" className="field ch" placeholder="nome@exemplo.pt" value={email}
                  onChange={(e) => { setEmail(e.target.value); setBad((b) => ({ ...b, email: undefined })); }}
                  autoComplete="email" inputMode="email" autoCapitalize="none" spellCheck={false}
                  enterKeyHint={mode === "esqueci" ? "send" : "next"}
                  aria-invalid={!!bad.email} aria-describedby={bad.email ? "email-err" : undefined}
                />
                {bad.email && <p id="email-err" className="hint bad">{bad.email}</p>}
                {!bad.email && fix && focus !== "email" && (
                  <p className="hint">Querias dizer <button type="button" className="linkbtn" onClick={() => setEmail(fix)}>{fix}</button>?</p>
                )}
              </div>
            )}

            {needsPass && (
              <div className="fld">
                <div className="lblrow">
                  <label className="lbl" htmlFor="password">{mode === "nova" ? "Nova palavra-passe" : "Palavra-passe"}</label>
                  {mode === "entrar" && <button type="button" className="linkbtn" onClick={() => go("esqueci")}>Esqueci-me da palavra-passe</button>}
                </div>
                <div className="passrow">
                  <input
                    id="password" type={show ? "text" : "password"} className="field ch" value={password}
                    onChange={(e) => { setPassword(e.target.value); setBad((b) => ({ ...b, password: undefined })); }}
                    onKeyDown={checkCaps} onKeyUp={checkCaps}
                    autoComplete={mode === "entrar" ? "current-password" : "new-password"} enterKeyHint="go"
                    aria-invalid={!!bad.password}
                    aria-describedby={[bad.password && "password-err", needsNew && "password-help"].filter(Boolean).join(" ") || undefined}
                  />
                  <button id="eye" type="button" className="eye ch" aria-label={show ? "Esconder palavra-passe" : "Mostrar palavra-passe"} aria-pressed={show} onClick={() => setShow(!show)}>
                    {show ? <EyeOff /> : <Eye />}
                  </button>
                </div>
                {caps && <p className="hint">As maiúsculas estão ligadas (Caps Lock).</p>}
                {bad.password && <p id="password-err" className="hint bad">{bad.password}</p>}
                {needsNew && (
                  <div className="meter" data-score={password ? score : 0}>
                    <div className="bars" aria-hidden="true">{[1, 2, 3, 4].map((n) => <i key={n} className={password && n <= score ? "on" : ""} />)}</div>
                    <span id="password-help" role="status">
                      {!password ? "Usa 12 caracteres ou mais, com letras, números e símbolos."
                        : password.length === 7 ? "Falta 1 carácter."
                        : password.length < 8 ? `Faltam ${8 - password.length} caracteres.`
                        : `Força: ${LEVELS[score]}`}
                    </span>
                  </div>
                )}
              </div>
            )}

            {note && (
              <div className={`note ch${note.ok ? " good" : ""}`} role="alert">
                {note.text}
                {note.act && (
                  <button type="button" className="linkbtn" onClick={() => { if (note.act === "entrar") return go("entrar"); setSent("signup"); go("enviado"); void resend("signup"); }}>
                    {note.act === "entrar" ? "Entrar com este e-mail" : "Pedir novo link de confirmação"}
                  </button>
                )}
              </div>
            )}
            {mode === "criar" && (
              <label className="sub small" style={{ display: "flex", gap: 8, alignItems: "flex-start" }}>
                <input type="checkbox" checked={age} onChange={(e) => setAge(e.target.checked)} required style={{ marginTop: 3 }} />
                Confirmo que tenho 13 anos ou mais
              </label>
            )}
            <button type="submit" className="btn block" disabled={busy}><span className="face">{busy ? "Um momento…" : LABEL[mode]}</span></button>
            {mode === "criar" && <p className="sub small">O teu e-mail e o teu progresso ficam guardados na União Europeia. Ao criares conta, aceitas os <Link href="/termos">Termos</Link> e a <Link href="/privacidade">Política de privacidade</Link>.</p>}
            {mode === "esqueci" && <button type="button" className="linkbtn" onClick={() => go("entrar")}>Voltar a entrar</button>}
            {changing && <button type="button" className="linkbtn" onClick={() => { onChangingEnd(false); setMsg(null); }}>Cancelar</button>}
          </form>
        )}
      </div>
    </div>
  );
}
