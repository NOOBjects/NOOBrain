"use client";

/** Interruptor chanfrado: ligado = cor da marca, desligado = cinzento. */
export function Switch({ on, onChange, label }: { on: boolean; onChange: (on: boolean) => void; label: string }) {
  return (
    <button type="button" role="switch" aria-checked={on} aria-label={label} className="switch ch" onClick={() => onChange(!on)}><i className="ch" /></button>
  );
}
