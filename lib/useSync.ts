"use client";

import type { User } from "@supabase/supabase-js";
import { useEffect, useRef, useState } from "react";
import { getRaw, initial, parse, replace } from "./store";
import { supabase } from "./supabase";
import type { State } from "./types";
import { useAppState } from "./useAppState";

const OWNER = "noobrain:owner"; // id da conta dona do progresso guardado neste navegador (vazio = progresso sem conta)
export const OAUTH_KEY = "noobrain:oauth"; // marca "saiu para o Google", lida na volta para dar as boas-vindas

function getOwner() {
  try { return localStorage.getItem(OWNER); } catch { return null; }
}
function setOwner(uid: string | null) {
  try { if (uid) localStorage.setItem(OWNER, uid); else localStorage.removeItem(OWNER); } catch { /* sem armazenamento: segue */ }
}
/** true se esta página é a volta do Google (e apaga a marca). */
function takeOAuthMark() {
  try { const v = sessionStorage.getItem(OAUTH_KEY); sessionStorage.removeItem(OAUTH_KEY); return v === "1"; } catch { return false; }
}
/** Erro devolvido no endereço por um link de e-mail ou pelo Google (ex.: link expirado). Limpa o endereço. */
function takeLinkError() {
  const p = new URLSearchParams(`${window.location.search.slice(1)}&${window.location.hash.slice(1)}`);
  const code = p.get("error_code") ?? p.get("error");
  if (code || window.location.href.endsWith("#")) window.history.replaceState(null, "", window.location.pathname);
  return code;
}
// Lido uma única vez por carregamento da página (o React pode correr o efeito duas vezes em desenvolvimento).
let arrival: { back: boolean; linkError: string | null } | null = null;
const readArrival = () => (arrival ??= { back: takeOAuthMark(), linkError: takeLinkError() });

async function push(uid: string, s: State, setStatus: (x: SyncStatus) => void) {
  setStatus("syncing");
  const { error } = await supabase!.from("progress").upsert({ user_id: uid, data: s, updated_at: new Date().toISOString() });
  setStatus(error ? "error" : "saved");
}

export type SyncStatus = "off" | "syncing" | "saved" | "error";

/**
 * Mantém o estado do navegador e a nuvem iguais enquanto há uma conta ativa.
 * - A nuvem manda. Só se o progresso deste navegador já for desta conta (OWNER = id) e mais recente, fica o do navegador.
 * - Conta sem nada na nuvem: começa do zero, a não ser que o navegador já fosse dela.
 */
export function useSync() {
  const state = useAppState();
  const [user, setUser] = useState<User | null>(null);
  const [recovery, setRecovery] = useState(false); // chegou pelo link de "esqueci-me da palavra-passe"
  const [ready, setReady] = useState(!supabase); // sem Supabase configurado, não há o que esperar
  const [status, setStatus] = useState<SyncStatus>("off");
  const [settled, setSettled] = useState<string | null>(null); // conta cujo estado inicial já foi conciliado
  const [linkError, setLinkError] = useState<string | null>(null);
  const [welcome, setWelcome] = useState(false);
  const synced = useRef<string | null>(null); // conta autorizada a receber as mudanças locais

  useEffect(() => {
    if (!supabase) return;
    supabase.auth.getSession().then(({ data }) => {
      const { back, linkError } = readArrival();
      const uid = data.session?.user.id;
      // sessão aberta antes desta versão: o progresso do navegador já era dessa conta
      if (uid && !back && getOwner() === null) setOwner(uid);
      setLinkError(linkError);
      setUser(data.session?.user ?? null);
      setReady(true);
      if (back && uid) {
        setWelcome(true);
        setTimeout(() => setWelcome(false), 2400);
      }
    });
    const { data } = supabase.auth.onAuthStateChange((e, session) => { setUser(session?.user ?? null); if (e === "PASSWORD_RECOVERY") setRecovery(true); });
    return () => data.subscription.unsubscribe();
  }, []);

  // Ao entrar: baixa o estado da nuvem e concilia com o do navegador.
  useEffect(() => {
    if (!supabase || !user) { synced.current = null; return; }
    const uid = user.id;
    let live = true;
    (async () => {
      setStatus("syncing");
      const { data, error } = await supabase!.from("progress").select("data").maybeSingle();
      if (!live) return;
      if (error) { setStatus("error"); setSettled(uid); return; }
      const remote = data?.data as State | undefined;
      const local = parse(getRaw());
      const mine = getOwner() === uid; // o progresso deste navegador já é desta conta
      const next = remote ? (mine && local.updatedAt > remote.updatedAt ? local : remote) : mine ? local : initial;
      if (next !== local) replace(next);
      setOwner(uid);
      synced.current = uid;
      setSettled(uid);
      if (next !== remote) await push(uid, next, setStatus);
      else setStatus("saved");
    })();
    return () => { live = false; };
  }, [user]);

  // Depois de conciliado: cada mudança local sobe para a nuvem, com 1,5 s de espera para agrupar cliques.
  useEffect(() => {
    if (!user || synced.current !== user.id || !state.updatedAt) return;
    const t = setTimeout(() => push(user.id, state, setStatus), 1500);
    return () => clearTimeout(t);
  }, [state, user]);

  /** Terminar sessão: o progresso continua na conta; este navegador fica limpo. */
  async function signOut() {
    await supabase!.auth.signOut(); // primeiro sair, para a limpeza abaixo não subir para a nuvem
    replace(initial);
    setOwner(null);
    setStatus("off");
  }

  return {
    user,
    ready,
    loading: !ready || (!!user && settled !== user.id), // ainda não dá para mostrar XP e sequência certos
    status,
    recovery,
    endRecovery: () => setRecovery(false),
    linkError,
    clearLinkError: () => setLinkError(null),
    signOut,
    welcome,
  };
}
