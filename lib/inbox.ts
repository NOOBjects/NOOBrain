"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { supabase } from "./supabase";

/** Uma notificação. As que vêm do servidor (`remote`) estão na tabela `inbox`; as outras nascem neste aparelho (`logActivity`). */
export type Notice = { id: string; kind: "ideia" | "erro" | "aviso" | "sistema" | "conquista" | "app" | "versao"; title: string; body: string; link: string; at: number; unread: boolean; remote: boolean };

const LOG = "noobrain:activity";
const SEEN = "noobrain:activity-seen";
const EVENT = "noobrain:activity-changed";
type Local = Omit<Notice, "unread" | "remote">;

const readLog = (): Local[] => { try { return JSON.parse(localStorage.getItem(LOG) ?? "[]") as Local[]; } catch { return []; } };
const seenAt = () => { try { return Number(localStorage.getItem(SEEN)) || 0; } catch { return 0; } };

/** Regista algo que aconteceu neste aparelho (conquista, meta, aviso de atualização…) para aparecer nas notificações. Repetir o mesmo `id` não duplica. */
export function logActivity(n: Omit<Local, "at"> & { at?: number }) {
  try {
    const list = readLog();
    if (list.some((x) => x.id === n.id)) return;
    localStorage.setItem(LOG, JSON.stringify([{ ...n, at: n.at ?? Date.now() }, ...list].slice(0, 30)));
    window.dispatchEvent(new Event(EVENT));
  } catch { /* sem armazenamento: só não fica na lista */ }
}

/** As notificações da conta: as do servidor (ideias, erros resolvidos, avisos da equipa) e as deste aparelho. Atualiza ao voltar ao separador e de 5 em 5 minutos. */
export function useInbox(uid: string | undefined, version: { latest: string; title: string; date: string; aviso: boolean }) {
  const [remote, setRemote] = useState<Notice[]>([]);
  const [local, setLocal] = useState<Local[]>([]);
  const [seen, setSeen] = useState(0);
  const known = useRef<number | null>(null); // quantas não lidas havia na última leitura (para avisar só das novas)
  const [fresh, setFresh] = useState(0);

  const load = useCallback(async () => {
    if (!uid || !supabase) return;
    const { data, error } = await supabase.from("inbox").select("id,kind,title,body,link,created_at,read_at").order("created_at", { ascending: false }).limit(50);
    if (error || !data) return;
    const list: Notice[] = data.map((r) => ({ id: `r${r.id}`, kind: r.kind, title: r.title, body: r.body, link: r.link, at: Date.parse(r.created_at), unread: !r.read_at, remote: true }));
    setRemote(list);
    const n = list.filter((x) => x.unread).length;
    if (known.current !== null && n > known.current) setFresh(n - known.current);
    known.current = n;
  }, [uid]);

  useEffect(() => {
    const t = setTimeout(() => { void load(); }, 0);
    const again = () => { if (document.visibilityState === "visible") void load(); };
    const id = setInterval(again, 5 * 60_000);
    document.addEventListener("visibilitychange", again);
    return () => { clearTimeout(t); clearInterval(id); document.removeEventListener("visibilitychange", again); };
  }, [load]);

  useEffect(() => {
    const read = () => { setLocal(readLog()); setSeen(seenAt()); };
    const t = setTimeout(read, 0);
    window.addEventListener(EVENT, read);
    return () => { clearTimeout(t); window.removeEventListener(EVENT, read); };
  }, []);

  const versionItem: Notice[] = version.aviso
    ? [{ id: `v${version.latest}`, kind: "versao", title: `Versão ${version.latest}: ${version.title}`, body: "Vê o que mudou.", link: "?v=novidades", at: Date.parse(`${version.date}T12:00:00`), unread: false, remote: false }]
    : [];
  const items = [...remote, ...local.map((l) => ({ ...l, unread: l.at > seen, remote: false })), ...versionItem].sort((a, b) => b.at - a.at);
  const unread = items.filter((x) => x.unread).length;

  /** Marca tudo como lido (no servidor e neste aparelho). */
  const markAll = useCallback(async () => {
    const now = Date.now();
    try { localStorage.setItem(SEEN, String(now)); } catch { /* sem armazenamento */ }
    setSeen(now);
    if (!uid || !supabase) return;
    setRemote((r) => r.map((x) => ({ ...x, unread: false })));
    known.current = 0;
    await supabase.from("inbox").update({ read_at: new Date().toISOString() }).is("read_at", null);
  }, [uid]);

  /** Apaga as notificações do servidor e limpa o registo deste aparelho. */
  const clear = useCallback(async () => {
    try { localStorage.removeItem(LOG); localStorage.setItem(SEEN, String(Date.now())); } catch { /* sem armazenamento */ }
    setLocal([]); setSeen(Date.now());
    if (!uid || !supabase) return;
    setRemote([]);
    known.current = 0;
    await supabase.from("inbox").delete().eq("user_id", uid);
  }, [uid]);

  return { items, unread, fresh, clearFresh: () => setFresh(0), markAll, clear, reload: load };
}
