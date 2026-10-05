"use client";

import { useEffect, useState } from "react";
import { Check, Lock } from "./Icons";

export type ToastMsg = { text: string; n: number; icon?: "ok" | "lock" };

/**
 * Aviso rápido no fundo do ecrã, sempre por cima da ilha do menu.
 * Fica mais tempo quando o texto é longo e guarda o texto enquanto desaparece (sem "saltar" a meio da animação).
 */
export function Toast({ msg, onDone }: { msg: ToastMsg | null; onDone: () => void }) {
  const [last, setLast] = useState<ToastMsg | null>(msg);
  if (msg && msg !== last) setLast(msg);
  useEffect(() => {
    if (!msg) return;
    const t = setTimeout(onDone, Math.min(7000, Math.max(2600, msg.text.length * 60)));
    return () => clearTimeout(t);
  }, [msg, onDone]);
  const shown = msg ?? last;
  return (
    <div className={`toast${msg ? " show" : ""}`} role="status" aria-live="polite">
      {shown && <div className="ch"><span className="toast-ico ch" aria-hidden="true">{shown.icon === "lock" ? <Lock /> : <Check />}</span><span>{shown.text}</span></div>}
    </div>
  );
}
