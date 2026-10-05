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
export const Close = () => <Svg><path {...stroke} d="M6 6 L18 18 M18 6 L6 18" /></Svg>;
export const Grip = () => <Svg><path fill="currentColor" d="M8 5 H11 V8 H8 Z M13 5 H16 V8 H13 Z M8 10.5 H11 V13.5 H8 Z M13 10.5 H16 V13.5 H13 Z M8 16 H11 V19 H8 Z M13 16 H16 V19 H13 Z" /></Svg>;
export const Trophy = () => <Svg><path {...stroke} strokeLinejoin="miter" d="M7 4 H17 V10 L14 14 H10 L7 10 Z M12 14 V18 M8 20.5 H16 M7 6 H4 V9 L6 11 M17 6 H20 V9 L18 11" /></Svg>;
export const Target = () => (
  <Svg>
    <path {...stroke} strokeLinejoin="miter" d="M9 3 H15 L21 9 V15 L15 21 H9 L3 15 V9 Z" />
    <path fill="currentColor" d="M10 10 H14 V14 H10 Z" />
  </Svg>
);
export const Shield = () => <Svg><path {...stroke} strokeLinejoin="miter" d="M12 3 L19 6 V12 L15 18 L12 20.5 L9 18 L5 12 V6 Z M12 8 V15 M9 11.5 H15" /></Svg>;
export const Archive = () => <Svg><path {...stroke} strokeLinejoin="miter" d="M3 4 H21 V9 H3 Z M5 9 V20 H19 V9 M10 13 H14" /></Svg>;
export const Speaker = () => (
  <Svg>
    <path fill="currentColor" d="M3 9 H7 L12 4 V20 L7 15 H3 Z" />
    <path {...stroke} strokeWidth={2.5} strokeLinejoin="miter" d="M15.5 9 L17 12 L15.5 15 M18.5 6 L21 12 L18.5 18" />
  </Svg>
);
export const Offline = () => <Svg><path {...stroke} strokeLinejoin="miter" d="M2 9 L6 5 H18 L22 9 M5.5 13 L8.5 10 H15.5 L18.5 13 M10 17 H14 M4 21 L20 3" /></Svg>;
export const Grid = () => <Svg><path {...stroke} strokeLinejoin="miter" d="M4 4 H10 V10 H4 Z M14 4 H20 V10 H14 Z M4 14 H10 V20 H4 Z M14 14 H20 V20 H14 Z" /></Svg>;
export const Flask = () => (
  <Svg>
    <path {...stroke} strokeLinejoin="miter" d="M8 3 H16 M10 3 V9 L4 19 V21 H20 V19 L14 9 V3" />
    <path fill="currentColor" d="M7.5 15 H16.5 L19 19 V21 H5 V19 Z" />
  </Svg>
);
export const Column = () => (
  <Svg>
    <path fill="currentColor" d="M2.5 9 L12 3.5 L21.5 9 Z" />
    <path {...stroke} d="M6 11.5 V18 M10 11.5 V18 M14 11.5 V18 M18 11.5 V18 M3 21 H21" />
  </Svg>
);
export const Speech = () => <Svg><path {...stroke} strokeLinejoin="miter" d="M6 4 H18 L21 7 V13 L18 16 H11 L6 20.5 V16 L3 13 V7 Z" /></Svg>;
export const Palette = () => (
  <Svg>
    <path {...stroke} strokeLinejoin="miter" d="M8 3 H16 L21 8 V12 L18 15 H14 V21 H8 L3 16 V8 Z" />
    <path fill="currentColor" d="M7 9 H10 V12 H7 Z M11 6 H14 V9 H11 Z M15 9 H18 V12 H15 Z" />
  </Svg>
);
export const Chip = () => <Svg><path {...stroke} strokeLinejoin="miter" d="M7 7 H17 V17 H7 Z M10 2.5 V7 M14 2.5 V7 M10 17 V21.5 M14 17 V21.5 M2.5 10 H7 M2.5 14 H7 M17 10 H21.5 M17 14 H21.5" /></Svg>;
export const Cross = () => <Svg><path fill="currentColor" d="M9 3 H15 V9 H21 V15 H15 V21 H9 V15 H3 V9 H9 Z" /></Svg>;
export const Coin = () => (
  <Svg>
    <path {...stroke} strokeLinejoin="miter" d="M9 3 H15 L21 9 V15 L15 21 H9 L3 15 V9 Z" />
    <path fill="currentColor" d="M10.5 7 H13.5 V17 H10.5 Z" />
  </Svg>
);
export const Play = () => <Svg><path fill="currentColor" d="M7 4 L19 12 L7 20 Z" /></Svg>;
export const Stop = () => <Svg><path fill="currentColor" d="M6 6 H18 V18 H6 Z" /></Svg>;
export const Star = () => <Svg><path fill="currentColor" d="M12 2.5 L14.6 9 L21.5 9.3 L16.1 13.6 L18 20.5 L12 16.6 L6 20.5 L7.9 13.6 L2.5 9.3 L9.4 9 Z" /></Svg>;
export const Link2 = () => <Svg><path {...stroke} strokeLinejoin="miter" d="M10 6 H6 L3 9 V15 L6 18 H10 M14 6 H18 L21 9 V15 L18 18 H14 M8 12 H16" /></Svg>;
