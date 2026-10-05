"use client";

import { useEffect, useState, useSyncExternalStore } from "react";
import { Speaker, Stop } from "./Icons";
import { canSpeak, speak, stopSpeaking } from "@/lib/speech";

const never = () => () => {};

/** Botão "Ouvir": lê o texto em voz alta; tocar outra vez para. Não aparece onde o navegador não sabe falar. */
export function Listen({ text, lang = "pt", label = "Ouvir", small = false }: { text: string; lang?: string; label?: string; small?: boolean }) {
  const ok = useSyncExternalStore(never, canSpeak, () => false);
  const [on, setOn] = useState(false);
  useEffect(() => () => { if (on) stopSpeaking(); }, [on]);
  if (!ok) return null;
  async function toggle(e: React.MouseEvent) {
    e.stopPropagation(); // dentro de um cartão: não o vira
    if (on) { stopSpeaking(); setOn(false); return; }
    setOn(true);
    await speak(text, lang);
    setOn(false);
  }
  return small ? (
    <button type="button" className="listen-ico ch" aria-label={on ? "Parar" : label} title={on ? "Parar" : label} aria-pressed={on} onClick={toggle} onKeyDown={(e) => e.stopPropagation()}>{on ? <Stop /> : <Speaker />}</button>
  ) : (
    <button type="button" className="btn soft sm listen" aria-pressed={on} onClick={toggle}><span className="face">{on ? <Stop /> : <Speaker />}{on ? "Parar" : label}</span></button>
  );
}
