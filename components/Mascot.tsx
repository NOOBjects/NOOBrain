import { useId } from "react";
import { BODY, EYES, MASCOT_VIEWBOX, SLOTS } from "@/lib/mascot-paths";

export type Mood = "idle" | "think" | "happy" | "sad";

/*
 * Pupila = quadrado que desliza por baixo de um octógono fixo dentro de cada olho.
 * - No canto superior direito (posição original do logo) o octógono corta a quina.
 * - No centro do globo ocular ela aparece como quadrado inteiro.
 * - No canto oposto, o octógono corta a quina de lá. É o "se adapta ao canto" do desenho.
 * As animações ficam em globals.css (.pupil) e só mexem na posição do quadrado.
 */
const EYE_OFFSET = 207; // distância horizontal entre o olho esquerdo e o direito
const PUPIL = { x: 376, y: 392, size: 60 }; // posição original, olho esquerdo
const EYE_CLIP = "338,392 400,392 438,430 438,491 400,529 338,529 300,491 300,430";

export function Mascot({ mood = "idle", title = "Mascote NOOBjects" }: { mood?: Mood; title?: string }) {
  const clipId = `eye-${useId().replace(/[^a-zA-Z0-9_-]/g, "")}`;
  return (
    <svg className="mascot" data-mood={mood} viewBox={MASCOT_VIEWBOX} role="img" aria-label={title}>
      <defs>
        <clipPath id={clipId}>
          <polygon points={EYE_CLIP} />
        </clipPath>
      </defs>
      <path className="m-body" d={BODY} />
      {EYES.map((d) => <path key={d} className="m-eye" d={d} />)}
      {SLOTS.map((d) => <path key={d} className="m-slot" d={d} />)}
      {[0, 1].map((i) => (
        <g key={i} transform={`translate(${i * EYE_OFFSET} 0)`}>
          <g clipPath={`url(#${clipId})`}>
            <rect className="m-pupil pupil" x={PUPIL.x} y={PUPIL.y} width={PUPIL.size} height={PUPIL.size} />
          </g>
        </g>
      ))}
    </svg>
  );
}
