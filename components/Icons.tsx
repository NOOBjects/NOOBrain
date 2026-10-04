import type { ReactNode } from "react";

const stroke = { fill: "none", stroke: "currentColor", strokeWidth: 3.5, strokeLinecap: "square" as const };

function Svg({ children }: { children: ReactNode }) {
  return <svg className="ico" viewBox="0 0 24 24" aria-hidden="true">{children}</svg>;
}

export const Flame = () => <Svg><path fill="currentColor" d="M12 2 L17 8 L19 14 L16 20 L12 22 L8 20 L5 14 L7 10 L10 12 Z" /></Svg>;
export const Bolt = () => <Svg><path fill="currentColor" d="M13 2 L5 13 L11 13 L9 22 L19 10 L13 10 Z" /></Svg>;
export const Check = () => <Svg><path {...stroke} strokeLinejoin="miter" d="M4 12.5 L9.5 18 L20 6.5" /></Svg>;
export const Lock = () => (
  <Svg>
    <path fill="currentColor" d="M6 11 H18 V21 H6 Z" />
    <path {...stroke} d="M8.5 11 V8 L10.5 5.5 H13.5 L15.5 8 V11" />
  </Svg>
);
export const Plus = () => <Svg><path {...stroke} d="M12 5 V19 M5 12 H19" /></Svg>;
export const Route = () => <Svg><path {...stroke} strokeLinejoin="miter" d="M5 20 V14 H19 V8 H5 V4" /></Svg>;
export const Book = () => <Svg><path {...stroke} strokeLinejoin="miter" d="M4 5 L12 7 L20 5 V19 L12 21 L4 19 Z M12 7 V21" /></Svg>;
export const Sync = () => <Svg><path {...stroke} d="M18 9 A7 7 0 0 0 6 10 M6 15 A7 7 0 0 0 18 14 M19 4 V9 H14 M5 20 V15 H10" /></Svg>;
export const User = () => <Svg><path {...stroke} strokeLinejoin="miter" d="M8 8 L10 5 H14 L16 8 V10 L14 13 H10 L8 10 Z M4 21 L6 17 H18 L20 21" /></Svg>;
export const Compass = () => <Svg><path {...stroke} strokeLinejoin="miter" d="M12 3 L19 6 L21 12 L19 18 L12 21 L5 18 L3 12 L5 6 Z M15 9 L13 13 L9 15 L11 11 Z" /></Svg>;
export const Idea = () => <Svg><path {...stroke} strokeLinejoin="miter" d="M9 18 H15 M10 21 H14 M8 15 L6 10 L9 5 H15 L18 10 L16 15 Z" /></Svg>;
export const ChevronDown = () => <Svg><path {...stroke} strokeLinejoin="miter" d="M5 9 L12 16 L19 9" /></Svg>;
export const ChevronUp = () => <Svg><path {...stroke} strokeLinejoin="miter" d="M5 15 L12 8 L19 15" /></Svg>;
export const Eye = () => (
  <Svg>
    <path {...stroke} strokeLinejoin="miter" d="M2 12 L7 7 H17 L22 12 L17 17 H7 Z" />
    <path fill="currentColor" d="M10 10 H14 V14 H10 Z" />
  </Svg>
);
export const EyeOff = () => (
  <Svg>
    <path {...stroke} strokeLinejoin="miter" d="M2 12 L7 7 H17 L22 12 L17 17 H7 Z" />
    <path {...stroke} d="M4 20 L20 4" />
  </Svg>
);
export const Spark = () => <Svg><path fill="currentColor" d="M12 2 L14 10 L22 12 L14 14 L12 22 L10 14 L2 12 L10 10 Z" /></Svg>;
export const Up = () => <Svg><path {...stroke} strokeLinejoin="miter" d="M12 20 V5 M5 12 L12 5 L19 12" /></Svg>;
export const Bug = () => (
  <Svg>
    <path fill="currentColor" d="M9 7 H15 L17 10 V16 L15 19 H9 L7 16 V10 Z" />
    <path {...stroke} strokeWidth={2.5} d="M3 10 L7 12 M21 10 L17 12 M3 18 L7 16 M21 18 L17 16 M9 4 L10 7 M15 4 L14 7" />
  </Svg>
);
export const Hammer = () => (
  <Svg>
    <path {...stroke} d="M5 20 L13 12" />
    <path fill="currentColor" d="M10 4 H18 L21 8 L17 12 L13 8 Z" />
  </Svg>
);
export const Heart = () => <Svg><path fill="currentColor" d="M12 20 L4 12 V8 L7 5 H10 L12 7 L14 5 H17 L20 8 V12 Z" /></Svg>;
/** Ícone grande num quadrado chanfrado: no lugar do mascote nos ecrãs onde ele só repetia. */
export const HeroIco = ({ children }: { children: ReactNode }) => <span className="hero-ico" aria-hidden="true"><span className="ch">{children}</span></span>;
