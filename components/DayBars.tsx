"use client";

import { NEW_LESSONS_PER_DAY, NEW_TOPICS_PER_DAY } from "@/lib/limits";

export function Bar({ label, used, max }: { label: string; used: number; max: number }) {
  const full = used >= max;
  return (
    <div className="daybar">
      <div className="row-between"><span className="eyebrow">{label}</span><span className="eyebrow">{full ? "Completo por hoje" : `${used} de ${max}`}</span></div>
      <div className="bar ch" role="progressbar" aria-label={label} aria-valuenow={Math.min(used, max)} aria-valuemin={0} aria-valuemax={max}>
        <i style={{ transform: `scaleX(${Math.min(1, used / max)})` }} />
      </div>
    </div>
  );
}

/** Barras dos limites de hoje: lições novas (do estado local) e temas novos com IA (do servidor; `topics` null = não mostrar). */
export function DayBars({ lessons, topics }: { lessons: number; topics?: number | null }) {
  return (
    <div className="daybars">
      <Bar label="Lições novas hoje" used={lessons} max={NEW_LESSONS_PER_DAY} />
      {topics != null && <Bar label="Temas novos com IA hoje" used={topics} max={NEW_TOPICS_PER_DAY} />}
    </div>
  );
}
