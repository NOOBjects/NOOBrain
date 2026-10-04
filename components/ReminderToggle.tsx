"use client";

import { useSyncExternalStore } from "react";
import { needsInstall, serverSnapshot, setNotify, snapshot, subscribe } from "@/lib/reminders";
import { wants } from "@/lib/store";
import { useAppState } from "@/lib/useAppState";

const TEXT = {
  reviews: { on: "Vais receber um aviso quando houver cartões para rever.", off: "Recebe um aviso quando for hora de rever.", stop: "Desligar lembretes", start: "Ligar lembretes" },
  news: { on: "Vais receber um aviso quando o NOOBrain tiver novidades.", off: "Recebe um aviso quando o NOOBrain tiver novidades.", stop: "Desligar avisos de novidades", start: "Ligar avisos de novidades" },
};

/** Liga e desliga um tipo de aviso: lembretes de revisão (por omissão) ou novidades do app. */
export function ReminderToggle({ kind = "reviews", quiet = false }: { kind?: "reviews" | "news"; quiet?: boolean }) {
  const device = useSyncExternalStore(subscribe, snapshot, serverSnapshot);
  const s = useAppState();
  const t = TEXT[kind];
  if (quiet && (needsInstall() || device === "na")) return null; // a explicação já aparece no outro interruptor
  if (needsInstall()) return <p className="sub small">No iPhone, os avisos só funcionam com o NOOBrain no ecrã principal: Partilhar → Adicionar ao ecrã principal.</p>;
  if (device === "na") return <p className="sub small">Os avisos não estão disponíveis neste navegador ou foram bloqueados nas permissões do site.</p>;
  const on = device === "on" && wants(s, kind);
  return (
    <div className="remind">
      <p className="sub small">{on ? t.on : t.off}</p>
      <button type="button" className="btn soft sm" onClick={() => void setNotify(kind, !on)}>
        <span className="face">{on ? t.stop : t.start}</span>
      </button>
    </div>
  );
}
