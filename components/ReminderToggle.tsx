"use client";

import { useSyncExternalStore } from "react";
import { disable, enable, serverSnapshot, snapshot, subscribe } from "@/lib/reminders";

export function ReminderToggle() {
  const state = useSyncExternalStore(subscribe, snapshot, serverSnapshot);
  if (state === "na") return <p className="sub small">Lembretes não estão disponíveis neste navegador ou foram bloqueados nas permissões do site.</p>;
  return (
    <div className="remind">
      <p className="sub small">{state === "on" ? "Você será lembrado quando houver cartões para revisar." : "Receba um aviso quando for hora de revisar."}</p>
      <button type="button" className="btn soft sm" onClick={() => (state === "on" ? disable() : void enable())}>
        <span className="face">{state === "on" ? "Desligar lembretes" : "Ativar lembretes"}</span>
      </button>
    </div>
  );
}
