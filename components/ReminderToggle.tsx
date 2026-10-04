"use client";

import { useSyncExternalStore } from "react";
import { disable, enable, needsInstall, serverSnapshot, snapshot, subscribe } from "@/lib/reminders";

export function ReminderToggle() {
  const state = useSyncExternalStore(subscribe, snapshot, serverSnapshot);
  if (needsInstall()) return <p className="sub small">No iPhone, os avisos só funcionam com o NOOBrain no ecrã principal: Partilhar → Adicionar ao ecrã principal.</p>;
  if (state === "na") return <p className="sub small">Os lembretes não estão disponíveis neste navegador ou foram bloqueados nas permissões do site.</p>;
  return (
    <div className="remind">
      <p className="sub small">{state === "on" ? "Vais receber um aviso quando houver cartões para rever." : "Recebe um aviso quando for hora de rever."}</p>
      <button type="button" className="btn soft sm" onClick={() => (state === "on" ? disable() : void enable())}>
        <span className="face">{state === "on" ? "Desligar lembretes" : "Ligar lembretes"}</span>
      </button>
    </div>
  );
}
