"use client";

import { useCallback, useRef, useState } from "react";

// Guarda no separador (sessionStorage) onde a pessoa ia numa lição: sair para as Ideias ou para o Perfil e voltar continua no mesmo ponto.
const read = <T,>(key: string, initial: T): T => {
  try { const v = sessionStorage.getItem(key); return v === null ? initial : (JSON.parse(v) as T); } catch { return initial; }
};

/** Como `useState`, mas o valor sobrevive a sair deste ecrã (e a recarregar a página). */
export function useKept<T>(key: string, initial: T) {
  const [value, setValue] = useState<T>(() => read(key, initial));
  const latest = useRef(value);
  const set = useCallback((next: T | ((prev: T) => T)) => {
    const v = typeof next === "function" ? (next as (prev: T) => T)(latest.current) : next;
    latest.current = v;
    setValue(v);
    try { sessionStorage.setItem(key, JSON.stringify(v)); } catch { /* sem armazenamento: só não se lembra */ }
  }, [key]);
  return [value, set] as const;
}

/** Esquece tudo o que foi guardado com este prefixo (lição concluída ou recomeçada). */
export function dropKept(prefix: string) {
  try { for (const k of Object.keys(sessionStorage)) if (k.startsWith(prefix)) sessionStorage.removeItem(k); } catch { /* sem armazenamento */ }
}
