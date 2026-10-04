"use client";

import type { User } from "@supabase/supabase-js";
import { useEffect, useRef, useState } from "react";
import { getRaw, parse, replace } from "./store";
import { supabase } from "./supabase";
import type { State } from "./types";
import { useAppState } from "./useAppState";

async function push(uid: string, s: State, setStatus: (x: SyncStatus) => void) {
  setStatus("syncing");
  const { error } = await supabase!.from("progress").upsert({ user_id: uid, data: s, updated_at: new Date().toISOString() });
  setStatus(error ? "error" : "saved");
}

export type SyncStatus = "off" | "syncing" | "saved" | "error";

/**
 * Mantém o estado do navegador e a nuvem iguais enquanto há uma conta ativa.
 * Regra: o estado com `updatedAt` mais recente vence. Sem conta, nada sai do navegador.
 */
export function useSync() {
  const state = useAppState();
  const [user, setUser] = useState<User | null>(null);
  const [ready, setReady] = useState(!supabase); // sem Supabase configurado, não há o que esperar
  const [status, setStatus] = useState<SyncStatus>("off");
  const synced = useRef<string | null>(null); // usuário cujo estado inicial já foi conciliado

  useEffect(() => {
    if (!supabase) return;
    supabase.auth.getSession().then(({ data }) => { setUser(data.session?.user ?? null); setReady(true); });
    const { data } = supabase.auth.onAuthStateChange((_e, session) => setUser(session?.user ?? null));
    return () => data.subscription.unsubscribe();
  }, []);

  // Ao entrar: baixa o estado da nuvem e concilia com o do navegador.
  useEffect(() => {
    if (!supabase || !user) { synced.current = null; return; }
    const uid = user.id;
    (async () => {
      setStatus("syncing");
      const { data, error } = await supabase!.from("progress").select("data").maybeSingle();
      if (error) return setStatus("error");
      const remote = data?.data as State | undefined;
      const local = parse(getRaw());
      if (remote && remote.updatedAt > local.updatedAt) replace(remote);
      synced.current = uid;
      if (!remote || remote.updatedAt <= local.updatedAt) await push(uid, local, setStatus);
      else setStatus("saved");
    })();
  }, [user]);

  // Depois de conciliado: cada mudança local sobe para a nuvem, com 1,5 s de espera para agrupar cliques.
  useEffect(() => {
    if (!user || synced.current !== user.id || !state.updatedAt) return;
    const t = setTimeout(() => push(user.id, state, setStatus), 1500);
    return () => clearTimeout(t);
  }, [state, user]);


  return { user, ready, status };
}
