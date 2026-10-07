"use client";

import { useEffect, useState } from "react";

// Quem é da equipa (para a etiqueta «Equipa»). Pede-se uma vez por visita ao site e guarda-se em memória.
let cache: Promise<Set<string>> | null = null;
const load = () => (cache ??= fetch("/api/staff").then((r) => r.json()).then((d: { ids: string[] }) => new Set(d.ids)).catch(() => { cache = null; return new Set<string>(); }));

export function useStaff() {
  const [ids, setIds] = useState<Set<string>>(new Set());
  useEffect(() => { let live = true; void load().then((s) => live && setIds(s)); return () => { live = false; }; }, []);
  return ids;
}
