// Instalar o app no ecrã principal. O Chrome/Edge dão um evento (`beforeinstallprompt`) que guardamos para o botão;
// o Safari do iPhone não o tem, por isso mostramos os passos à mão.
import { useSyncExternalStore } from "react";

type Prompt = Event & { prompt: () => Promise<void>; userChoice: Promise<{ outcome: string }> };
export type InstallState = "installed" | "prompt" | "ios" | "none";

let saved: Prompt | null = null;
let installed = false;
const listeners = new Set<() => void>();
const emit = () => listeners.forEach((l) => l());

if (typeof window !== "undefined") {
  window.addEventListener("beforeinstallprompt", (e) => { e.preventDefault(); saved = e as Prompt; emit(); });
  window.addEventListener("appinstalled", () => { saved = null; installed = true; emit(); window.dispatchEvent(new Event("noobrain:installed")); });
}

const standalone = () => window.matchMedia("(display-mode: standalone)").matches || (navigator as Navigator & { standalone?: boolean }).standalone === true;

function snapshot(): InstallState {
  if (installed || standalone()) return "installed";
  if (saved) return "prompt";
  // Safari, Chrome, Edge e Firefox do iPhone/iPad deixam adicionar ao ecrã principal pelo botão Partilhar
  if (/iPhone|iPad|iPod/.test(navigator.userAgent)) return "ios";
  return "none";
}

export const useInstall = (): InstallState =>
  useSyncExternalStore((cb) => { listeners.add(cb); return () => { listeners.delete(cb); }; }, snapshot, () => "none");

/** Abre a janela de instalação do navegador (só quando `useInstall()` é "prompt"). */
export async function install() {
  const p = saved;
  if (!p) return;
  await p.prompt();
  await p.userChoice.catch(() => null);
  saved = null;
  emit();
}
