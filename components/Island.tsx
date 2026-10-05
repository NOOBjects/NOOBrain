"use client";

import { useEffect, useRef, useState, type ReactNode } from "react";
import { ChevronDown, ChevronUp } from "./Icons";

export type IslandItem = { id: string; label: string; icon: ReactNode; badge?: number; onClick: () => void };

/**
 * Menu flutuante, solto da borda da tela. Some ao rolar para baixo e volta ao rolar para cima.
 * Também dá para escondê-lo no botão da seta e trazê-lo de volta pela pílula que fica no lugar.
 */
export function Island({ items, current }: { items: IslandItem[]; current: string }) {
  const [hidden, setHidden] = useState<null | "scroll" | "manual">(null);
  const wrap = useRef<HTMLDivElement>(null);

  // Diz ao resto do app quanto espaço a ilha ocupa em baixo (--dock), para os avisos rápidos ficarem sempre por cima dela.
  useEffect(() => {
    const root = document.documentElement.style;
    const el = wrap.current?.firstElementChild;
    if (!el || hidden) { root.setProperty("--dock", "0px"); return; }
    const set = () => root.setProperty("--dock", `${Math.ceil(el.getBoundingClientRect().height) + 12}px`);
    set();
    const ro = new ResizeObserver(set);
    ro.observe(el);
    return () => { ro.disconnect(); root.setProperty("--dock", "0px"); };
  }, [hidden]);

  useEffect(() => {
    let last = window.scrollY;
    const onScroll = () => {
      const y = window.scrollY;
      if (y > last + 10 && y > 80) setHidden((h) => h ?? "scroll");
      else if (y < last - 10 || y < 80) setHidden((h) => (h === "scroll" ? null : h));
      last = y;
    };
    // no computador, encostar o mouse na borda de baixo também traz o menu de volta
    const onMove = (e: PointerEvent) => {
      if (e.pointerType === "mouse" && e.clientY > window.innerHeight - 56) setHidden((h) => (h === "scroll" ? null : h));
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("pointermove", onMove);
    return () => {
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("pointermove", onMove);
    };
  }, []);

  return (
    <>
      <div ref={wrap} className={`island-wrap${hidden ? " is-hidden" : ""}`} inert={hidden ? true : undefined} onFocus={() => setHidden((h) => (h === "scroll" ? null : h))}>
        <div className="island pane"><nav className="in" aria-label="Menu principal">
          {items.map((it) => (
            <button key={it.id} type="button" className="isl ch" aria-label={it.label} aria-current={current === it.id ? "page" : undefined} onClick={it.onClick}>
              {it.icon}<span className="isl-l">{it.label}</span>
              {!!it.badge && <span key={it.badge} className="badge" aria-label={`${it.badge} para rever`}>{it.badge}</span>}
            </button>
          ))}
          <button type="button" className="isl-hide ch" aria-label="Esconder o menu" onClick={() => setHidden("manual")}><ChevronDown /></button>
        </nav></div>
      </div>
      <button type="button" className={`island-peek ch${hidden ? " show" : ""}`} aria-label="Mostrar o menu" tabIndex={hidden ? 0 : -1} onClick={() => setHidden(null)}><ChevronUp /></button>
    </>
  );
}
