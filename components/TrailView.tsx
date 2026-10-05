"use client";

import { useState } from "react";
import { Archive, Bolt, Flame, Sync } from "./Icons";
import { TrailNode, ZIGZAG } from "./TrailNode";
import { canChallenge } from "@/lib/challenge";
import { ptpt } from "@/lib/ptpt";
import { currentStreak, day, update } from "@/lib/store";
import type { State, Trail } from "@/lib/types";

type Props = {
  state: State;
  trail: Trail;
  dueCount: number;
  onLesson: (i: number) => void;
  onReview: () => void;
  onChallenge: () => void;
  notify: (m: string, icon?: "ok" | "lock") => void;
  children?: React.ReactNode; // avisos no topo (novidades, opinião)
};

/** Ecrã principal: a trilha ativa, com os temas, o progresso e o caminho de conceitos. */
export function TrailView({ state: s, trail, dueCount, onLesson, onReview, onChallenge, notify, children }: Props) {
  const [del, setDel] = useState(false);
  const [showArchived, setShowArchived] = useState(false);
  const total = trail.concepts.length;
  const pct = total ? Math.round((trail.done / total) * 100) : 0;
  const current = Math.min(trail.done, total - 1);
  const streak = currentStreak(s);
  const streakAtRisk = streak > 0 && s.lastDay !== day();
  const open = s.trails.filter((t) => !t.archived);
  const archived = s.trails.filter((t) => t.archived);
  const finished = trail.done >= total;
  const challenge = canChallenge(s) && s.challenge !== day();

  function setArchived(id: string, on: boolean) {
    update((x) => {
      const trails = x.trails.map((t) => (t.id === id ? { ...t, archived: on || undefined } : t));
      const next = on ? trails.find((t) => !t.archived)?.id ?? id : id;
      return { ...x, trails, active: next };
    });
    notify(on ? `“${trail.topic}” foi para as arquivadas` : `“${trail.topic}” voltou aos teus temas`);
  }

  function remove() {
    const id = trail.id;
    update((x) => {
      const left = x.trails.filter((t) => t.id !== id);
      const cards = Object.fromEntries(Object.entries(x.cards).filter(([k]) => !k.startsWith(`${id}:`)));
      return { ...x, trails: left, active: left.find((t) => !t.archived)?.id ?? left[0]?.id ?? "", cards };
    });
    setDel(false);
    notify("Trilha apagada");
  }

  return (
    <>
      {children}
      <div className="unit">
        <div>
          <div className="eyebrow">{trail.archived ? `Arquivada · ${trail.level}` : trail.level}</div>
          <h1 className="h-screen">{trail.topic}</h1>
        </div>
      </div>

      {(open.length > 1 || archived.length > 0) && (
        <div className="topic-chips" role="group" aria-label="Os teus temas">
          {open.map((t) => (
            <button key={t.id} type="button" className="chip ch" aria-pressed={t.id === trail.id} onClick={() => update((x) => ({ ...x, active: t.id }))}>{t.topic}</button>
          ))}
          {archived.length > 0 && (
            <button type="button" className="chip ch chip-ghost" aria-expanded={showArchived} onClick={() => setShowArchived((v) => !v)}>
              <Archive />Arquivadas ({archived.length})
            </button>
          )}
        </div>
      )}
      {showArchived && archived.length > 0 && (
        <div className="topic-chips archived" role="group" aria-label="Temas arquivados">
          {archived.map((t) => (
            <button key={t.id} type="button" className="chip ch" aria-pressed={t.id === trail.id} onClick={() => update((x) => ({ ...x, active: t.id }))}>{t.topic}</button>
          ))}
        </div>
      )}

      {trail.archived && (
        <div className="nudge pane tint"><div className="in">
          <div><b>Esta trilha está arquivada</b><div className="sub small">Os cartões dela não entram na revisão.</div></div>
          <button type="button" className="btn sm" onClick={() => setArchived(trail.id, false)}><span className="face">Reabrir</span></button>
        </div></div>
      )}

      {dueCount > 0 && (
        <div className="nudge pane tint"><div className="in">
          <span className="nudge-ico ch" aria-hidden="true"><Sync /></span>
          <div className="nudge-t"><b>{dueCount === 1 ? "1 cartão" : `${dueCount} cartões`} para rever</b><div className="sub small">Rever agora fixa o que aprendeste.</div></div>
          <button type="button" className="btn sm" onClick={onReview}><span className="face">Rever</span></button>
        </div></div>
      )}
      {streakAtRisk && !finished && (
        <div className="nudge pane"><div className="in">
          <span className="nudge-ico ch sun" aria-hidden="true"><Flame /></span>
          <div className="nudge-t"><b>A tua sequência de {streak} {streak === 1 ? "dia" : "dias"} está à espera</b><div className="sub small">Estuda hoje para a manteres.</div></div>
          <button type="button" className="btn sm" onClick={() => onLesson(current)}><span className="face">Estudar</span></button>
        </div></div>
      )}
      {challenge && (
        <div className="nudge pane"><div className="in">
          <span className="nudge-ico ch" aria-hidden="true"><Bolt /></span>
          <div className="nudge-t"><b>Desafio do dia</b><div className="sub small">5 perguntas de tudo o que já aprendeste. XP a dobrar.</div></div>
          <button type="button" className="btn sm" onClick={onChallenge}><span className="face">Jogar</span></button>
        </div></div>
      )}

      {trail.sources.length > 0 ? (
        <div className="sources">{trail.sources.map((src) => <a key={src.url} className="chip ch srcchip" href={src.url} target="_blank" rel="noreferrer">{src.site ?? "Fonte"} · {src.title}</a>)}</div>
      ) : (
        <span className="chip ch warnchip">Sem fonte encontrada. Confirma o conteúdo com cuidado.</span>
      )}

      <div className="pane gap"><div className="in prog">
        <div className="prog-top"><span>Progresso</span><span>{trail.done} de {total}</span></div>
        <div className="bar ch" role="progressbar" aria-label="Progresso da trilha" aria-valuenow={pct} aria-valuemin={0} aria-valuemax={100}><i style={{ transform: `scaleX(${pct / 100})` }} /></div>
      </div></div>

      <div className="trail">
        {trail.concepts.map((c, i) => (
          <TrailNode key={c.title + i} index={i} title={ptpt(c.title)} offset={ZIGZAG[i % ZIGZAG.length]}
            state={i < trail.done ? "done" : i === trail.done ? "cur" : "lock"}
            onClick={() => (i <= trail.done ? onLesson(i) : notify("Conclui o conceito atual para desbloquear este.", "lock"))} />
        ))}
      </div>
      {finished && <p className="sub center">Trilha concluída. Revê os cartões quando chegar a hora, ou começa um tema novo.</p>}

      <div className="trail-del">
        {del ? (
          <>
            <span className="sub small">Apagar “{trail.topic}” e o progresso dela? Não dá para desfazer.</span>
            <button type="button" className="btn bad sm" onClick={remove}><span className="face">Apagar</span></button>
            <button type="button" className="linkbtn" onClick={() => setDel(false)}>Cancelar</button>
          </>
        ) : (
          <>
            {!trail.archived && <button type="button" className="linkbtn" onClick={() => setArchived(trail.id, true)}>Arquivar</button>}
            <button type="button" className="linkbtn" onClick={() => setDel(true)}>Apagar esta trilha</button>
          </>
        )}
      </div>
    </>
  );
}
