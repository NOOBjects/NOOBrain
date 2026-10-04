"use client";

import { useMemo, useSyncExternalStore } from "react";
import { getRaw, getServerRaw, parse, subscribe } from "./store";

export function useAppState() {
  const raw = useSyncExternalStore(subscribe, getRaw, getServerRaw);
  return useMemo(() => parse(raw), [raw]);
}
