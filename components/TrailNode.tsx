import type { CSSProperties } from "react";
import { Bolt, Check, Lock } from "./Icons";
import { Mascot } from "./Mascot";

// Deslocamento horizontal de cada nó, em px, para a trilha ziguezaguear.
export const ZIGZAG = [0, 34, 52, 34, 0, -34, -52, -34];

export type NodeState = "done" | "cur" | "lock";

const LABEL: Record<NodeState, string> = { done: "feito", cur: "atual", lock: "bloqueado" };

export function TrailNode({ title, state, offset, onClick }: { title: string; state: NodeState; offset: number; onClick?: () => void }) {
  const Icon = state === "done" ? Check : state === "cur" ? Bolt : Lock;
  return (
    <button
      type="button"
      className={`node ${state}`}
      style={{ "--x": `${offset}px` } as CSSProperties}
      aria-label={`${title} (${LABEL[state]})`}
      aria-disabled={state === "lock" || undefined}
      onClick={onClick}
    >
      {state === "cur" && <span className="pin ch">COMEÇAR</span>}
      <span className="octw"><span className="oct ch"><Icon /></span></span>
      <span className="lab">{title}</span>
      {state === "cur" && <span className="mini"><Mascot /></span>}
    </button>
  );
}
