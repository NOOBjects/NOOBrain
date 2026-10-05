"use client";

import { Spark } from "./Icons";
import { SOON } from "@/lib/changelog";

/** Cartão «Em breve»: o que vem a seguir, com a borda em gradiente nas cores da marca. `onClose` só existe quando aparece no ecrã inicial. */
export function Soon({ onClose }: { onClose?: () => void }) {
  return (
    <section className="pane soon" aria-labelledby="soon-t"><div className="in">
      <div className="soon-head"><span className="soon-ico ch"><Spark /></span><h2 id="soon-t">Em breve</h2></div>
      <ul className="soon-list">
        {SOON.items.map((i) => <li key={i.title}><b>{i.title}</b><span className="sub small">{i.text}</span></li>)}
      </ul>
      {onClose && <button type="button" className="btn sm" onClick={onClose}><span className="face">Percebi</span></button>}
    </div></section>
  );
}
