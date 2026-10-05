"use client";

import { useEffect, useState } from "react";
import { call } from "./api";

export type Quota = { unlimited?: boolean; trail?: { used: number; max: number } } | null;

/** Quanto da cota de temas novos de hoje já foi gasto (null enquanto carrega ou sem ligação). */
export function useQuota(enabled = true): Quota {
  const [q, setQ] = useState<Quota>(null);
  useEffect(() => {
    if (!enabled) return;
    let live = true;
    call<NonNullable<Quota>>("/api/quota").then((r) => live && setQ(r), () => {});
    return () => { live = false; };
  }, [enabled]);
  return q;
}
