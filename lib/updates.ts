"use client";

// Atualizações: (1) há uma versão nova da app? (2) alguma trilha guardada neste aparelho ficou para trás do catálogo?
import { useEffect, useMemo, useState } from "react";
import { loadCatalog, type CatalogRow } from "./catalog-client";
import { update } from "./store";
import type { State, Trail } from "./types";

const BUILD = process.env.NEXT_PUBLIC_BUILD ?? "dev";

/** true quando o servidor já tem uma versão mais nova do que a carregada neste separador (confere ao voltar ao app e de 30 em 30 minutos). */
export function useAppUpdate(enabled = true): boolean {
  const [stale, setStale] = useState(false);
  useEffect(() => {
    if (!enabled || BUILD === "dev") return;
    let live = true;
    const check = () => fetch("/api/version", { cache: "no-store" }).then((r) => r.json()).then((d: { build?: string }) => { if (live && d.build && d.build !== "dev" && d.build !== BUILD) setStale(true); }, () => {});
    void check();
    const every = setInterval(check, 30 * 60_000);
    const vis = () => { if (document.visibilityState === "visible") void check(); };
    document.addEventListener("visibilitychange", vis);
    return () => { live = false; clearInterval(every); document.removeEventListener("visibilitychange", vis); };
  }, [enabled]);
  return stale;
}

const rowOf = (rows: CatalogRow[], t: Trail) => rows.find((r) => r.key === t.key && r.level === t.level);
/** Trilhas guardadas cujo conteúdo no catálogo já é mais novo (o dono corrigiu ou melhorou). */
export const staleTrails = (s: State, rows: CatalogRow[]) => s.trails.filter((t) => (rowOf(rows, t)?.rev ?? 0) > (t.rev ?? 0));

/** As trilhas desatualizadas deste aparelho (null enquanto o catálogo carrega). */
export function useStaleTrails(state: State, enabled = true): Trail[] {
  const [rows, setRows] = useState<CatalogRow[] | null>(null);
  useEffect(() => {
    if (!enabled) return;
    let live = true;
    loadCatalog().then((r) => live && setRows(r), () => {});
    return () => { live = false; };
  }, [enabled]);
  return useMemo(() => (rows ? staleTrails(state, rows) : []), [rows, state]);
}

/** Troca o conteúdo das trilhas pelo do catálogo. O progresso (conceitos feitos, cartões, XP) fica; as lições são buscadas outra vez ao abrir. */
export async function refreshTrails(ids: string[]) {
  const rows = await loadCatalog();
  update((s) => ({
    ...s,
    trails: s.trails.map((t) => {
      const r = ids.includes(t.id) ? rowOf(rows, t) : undefined;
      if (!r) return t;
      return { ...t, topic: r.topic, category: r.category, sources: r.sources, rev: r.rev ?? 0, concepts: r.concepts.map(({ title, summary }) => ({ title, summary })), done: Math.min(t.done, r.concepts.length) };
    }),
  }));
}
