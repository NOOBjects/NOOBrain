"use client";

import { useEffect, useRef, useState, type ReactNode } from "react";
import { ChevronUp } from "./Icons";

export type IslandItem = { id: string; label: string; icon: ReactNode; badge?: number; dot?: boolean; onClick: () => void };

/**
 * Menu flutuante, solto da borda da tela. Some ao rolar para baixo e volta ao rolar para cima.
 * Quatro botões principais e, na seta, uma gaveta "Mais opções" que abre para cima.
 * `view` fecha a gaveta ao mudar de ecrã; `moreActive` pinta a seta quando o ecrã atual vive na gaveta.
 */
export function Island({ items, drawer, current, view, moreActive }: { items: IslandItem[]; drawer: IslandItem[]; current: string; view: string; moreActive: boolean }) {
  const [hidden, setHidden] = useState<null | "scroll">(null);
  const [open, setOpen] = useState(false);
  const wrap = useRef<HTMLDivElement>(null);
  const more = useRef<HTMLButtonElement>(null);
  const first = useRef<HTMLButtonElement>(null);
  const [seen, setSeen] = useState(view);
  if (seen !== view) { setSeen(view); setOpen(false); } // fecha ao mudar de ecrã

  const close = (refocus = false) => { setOpen(false); if (refocus) more.current?.focus(); };
  useEffect(() => {
    if (!open) return;
    first.current?.focus();
    const key = (e: KeyboardEvent) => { if (e.key === "Escape") close(true); };
    const away = (e: PointerEvent) => { if (!wrap.current?.contains(e.target as Node)) setOpen(false); };
    const scroll = () => setOpen(false);
    document.addEventListener("keydown", key);
    document.addEventListener("pointerdown", away);
    window.addEventListener("scroll", scroll, { passive: true });
    return () => { document.removeEventListener("keydown", key); document.removeEventListener("pointerdown", away); window.removeEventListener("scroll", scroll); };
  }, [open]);

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

  const dot = drawer.some((d) => d.dot);
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
          <button ref={more} type="button" className={`isl-more ch${moreActive ? " on" : ""}`} aria-label="Mais opções" aria-expanded={open} aria-controls="isl-drawer" onClick={() => setOpen((o) => !o)}>
            <span className={`isl-chev${open ? " open" : ""}`}><ChevronUp /></span>
            {dot && <span className="dot" aria-hidden="true" />}
          </button>
        </nav></div>
        {open && (
          <div id="isl-drawer" className="drawer"><div className="menu-list">
            {drawer.map((it, i) => (
              <button key={it.id} ref={i === 0 ? first : undefined} type="button" className="menu-row" onClick={() => { setOpen(false); it.onClick(); }}>
                {it.icon}<span>{it.label}</span>{it.dot && <b className="dot" aria-label="novo" />}
              </button>
            ))}
          </div></div>
        )}
      </div>
      <button type="button" className={`island-peek ch${hidden ? " show" : ""}`} aria-label="Mostrar o menu" tabIndex={hidden ? 0 : -1} onClick={() => setHidden(null)}><ChevronUp /></button>
    </>
  );
}
