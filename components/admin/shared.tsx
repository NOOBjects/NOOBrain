"use client";

import { useCallback, useEffect, useState } from "react";
import { call } from "@/lib/api";

export type Role = "dono" | "admin" | "moderador";
export type Say = (text: string, bad?: boolean) => void;
export const when = (iso: string) => new Date(iso).toLocaleString("pt-PT", { day: "numeric", month: "short", hour: "2-digit", minute: "2-digit" });
export const ROLE_LABEL: Record<Role, string> = { dono: "Dono", admin: "Admin", moderador: "Moderador" };

/** Lê um separador do painel (`/api/admin?o=…`). `reload` volta a pedir. */
export function useSection<T>(section: string, query = "") {
  const [data, setData] = useState<T | null>(null);
  const [error, setError] = useState<string | null>(null);
  const url = `/api/admin?o=${section}${query}`;
  const reload = useCallback(() => call<T>(url).then((d) => { setData(d); setError(null); }, (e: Error) => setError(e.message)), [url]);
  useEffect(() => { void Promise.resolve().then(reload); }, [reload]);
  return { data, error, reload };
}

/** Faz uma ação do painel e avisa do resultado. Devolve a resposta se correu bem, `null` se falhou. */
export async function act<T = object>(body: object, say: Say, ok?: string): Promise<T | null> {
  try {
    const r = await call<T>("/api/admin", body);
    if (ok) say(ok);
    return r;
  } catch (e) {
    say((e as Error).message, true);
    return null;
  }
}

/** Botão destrutivo com confirmação em dois passos («Apagar» → «Tens a certeza?»). */
export function Danger({ label, sure, onConfirm }: { label: string; sure: string; onConfirm: () => void }) {
  const [ask, setAsk] = useState(false);
  return ask ? (
    <span className="acts-inline">
      <span className="sub small">{sure}</span>
      <button type="button" className="btn bad sm" onClick={() => { setAsk(false); onConfirm(); }}><span className="face">Confirmar</span></button>
      <button type="button" className="linkbtn" onClick={() => setAsk(false)}>Cancelar</button>
    </span>
  ) : <button type="button" className="linkbtn" onClick={() => setAsk(true)}>{label}</button>;
}

export const Empty = ({ children }: { children: React.ReactNode }) => <p className="sub center">{children}</p>;
export const Loading = ({ error }: { error: string | null }) => error ? <div className="note ch" role="alert">{error}</div> : <p className="sub center">A carregar…</p>;
