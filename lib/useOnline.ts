"use client";

import { useSyncExternalStore } from "react";

function subscribe(cb: () => void) {
  window.addEventListener("online", cb);
  window.addEventListener("offline", cb);
  return () => { window.removeEventListener("online", cb); window.removeEventListener("offline", cb); };
}

/** true com ligação à internet (o navegador diz quando muda). No servidor, assume-se que sim. */
export const useOnline = () => useSyncExternalStore(subscribe, () => navigator.onLine, () => true);
