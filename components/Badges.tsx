"use client";

import { useEffect, useRef } from "react";
import { Confetti } from "./Confetti";
import { Bolt, Compass, Flame, Lock, Route, Spark, Star, Sync, Target, Trophy } from "./Icons";
import { BADGES, type Badge } from "@/lib/badges";
import type { State } from "@/lib/types";

const ICONS: Record<Badge["icon"], () => React.ReactNode> = { spark: Spark, route: Route, flame: Flame, sync: Sync, compass: Compass, bolt: Bolt, target: Target, star: Star, trophy: Trophy };

export function BadgeIcon({ badge, locked = false }: { badge: Badge; locked?: boolean }) {
  const Icon = ICONS[badge.icon];
  return <span className={`badge-ico ch${locked ? " locked" : ""}`} aria-hidden="true">{locked ? <Lock /> : <Icon />}</span>;
}

/** Grelha do Perfil: as ganhas primeiro, depois as por ganhar (com a dica de como se ganham). */
export function BadgeGrid({ state }: { state: State }) {
  const got = BADGES.filter((b) => state.badges?.[b.id]);
  const todo = BADGES.filter((b) => !state.badges?.[b.id]);
  return (
    <section className="badges" aria-labelledby="badges-t">
      <div className="row-between"><h2 id="badges-t" className="h-sec">Conquistas</h2><span className="eyebrow">{got.length} de {BADGES.length}</span></div>
      <ul className="badge-grid">
        {[...got, ...todo].map((b) => {
          const locked = !state.badges?.[b.id];
          return (
            <li key={b.id} className={`badge-cell${locked ? " is-locked" : ""}`} title={b.how}>
              <BadgeIcon badge={b} locked={locked} />
              <b>{b.name}</b>
              <span>{b.how}</span>
            </li>
          );
        })}
      </ul>
    </section>
  );
}

/** Janela de conquista nova (uma ou várias de uma vez), com confettis. */
export function BadgeDialog({ badges, onClose }: { badges: Badge[]; onClose: () => void }) {
  const ref = useRef<HTMLDialogElement>(null);
  useEffect(() => {
    const d = ref.current;
    if (d && !d.open) d.showModal();
  }, []);
  const one = badges.length === 1;
  return (
    <dialog ref={ref} className="sheet" aria-labelledby="badge-t" onClose={onClose}>
      <Confetti />
      <div className="pane hero"><div className="in">
        {one ? (
          <div className="w-head center">
            <span className="chip ch beta">Conquista nova</span>
            <div className="badge-big"><BadgeIcon badge={badges[0]} /></div>
            <h2 id="badge-t">{badges[0].name}</h2>
            <p>{badges[0].how}</p>
          </div>
        ) : (
          <>
            <div className="w-head">
              <span className="chip ch beta">Conquistas novas</span>
              <h2 id="badge-t">Ganhaste {badges.length} conquistas</h2>
            </div>
            <ul className="w-list">
              {badges.map((b) => <li key={b.id}><BadgeIcon badge={b} /><div><b>{b.name}</b><span>{b.how}</span></div></li>)}
            </ul>
          </>
        )}
        <div className="w-ask">
          <form method="dialog"><button type="submit" className="btn block" autoFocus><span className="face">Continuar</span></button></form>
        </div>
      </div></div>
    </dialog>
  );
}
