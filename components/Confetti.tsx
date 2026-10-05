import type { CSSProperties } from "react";

// Posições "aleatórias" fixas (iguais em cada desenho): sem Math.random no render.
const r = (i: number, k: number) => { const x = Math.sin(i * 12.9898 + k * 78.233) * 43758.5453; return x - Math.floor(x); };
const PIECES = Array.from({ length: 36 }, (_, i) => ({
  "--x": `${(r(i, 1) * 100).toFixed(1)}vw`,
  "--dx": `${((r(i, 2) - 0.5) * 30).toFixed(1)}vw`,
  "--rot": `${Math.round((r(i, 3) - 0.5) * 1080)}deg`,
  "--d": `${(r(i, 4) * 0.35).toFixed(2)}s`,
  "--t": `${(1.3 + r(i, 5) * 0.9).toFixed(2)}s`,
  "--w": `${Math.round(6 + r(i, 6) * 7)}px`,
}) as CSSProperties);

/** Chuva de confettis só com CSS (transform e opacity), nas cores da marca. Desaparece sozinha; "reduzir movimento" desliga-a. */
export function Confetti() {
  return (
    <div className="confetti" aria-hidden="true">
      {PIECES.map((style, i) => <i key={i} style={style} />)}
    </div>
  );
}
