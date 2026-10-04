"use client";

import { useMemo, useSyncExternalStore } from "react";
import { getRaw, getServerRaw, parse, subscribe } from "./store";

export function useAppState() {
  const raw = useSyncExternalStore(subscribe, getRaw, getServerRaw);
  return useMemo(() => parse(raw), [raw]);
}

const never = () => () => {};
/** false no servidor e no primeiro desenho; true depois, quando os dados do navegador já podem ser lidos. */
export function useHydrated() {
  return useSyncExternalStore(never, () => true, () => false);
}
