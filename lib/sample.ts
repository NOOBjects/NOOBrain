import type { Trail } from "./types";

// Trilha de exemplo mostrada antes de o usuário gerar a primeira.
export const exampleTrail: Trail = {
  id: "exemplo",
  topic: "Fotossíntese",
  key: "fotossintese",
  level: "Iniciante",
  sources: [],
  example: true,
  done: 2,
  concepts: [
    { title: "O que é fotossíntese", summary: "Processo em que plantas, algas e algumas bactérias usam luz para transformar água e gás carbônico em açúcar e oxigênio." },
    { title: "Cloroplastos e clorofila", summary: "O cloroplasto é a organela onde ocorre a fotossíntese. A clorofila é o pigmento verde que absorve a luz." },
    { title: "Reações da luz", summary: "Nas membranas dos tilacoides, a luz quebra a água, libera oxigênio e produz ATP e NADPH." },
    { title: "Ciclo de Calvin", summary: "No estroma do cloroplasto, ATP e NADPH são usados para transformar gás carbônico em açúcar." },
    { title: "Fatores que influenciam", summary: "A intensidade da luz, a concentração de CO₂ e a temperatura mudam a velocidade da fotossíntese." },
    { title: "Revisão final", summary: "Junte as etapas: luz e água geram energia e oxigênio, e essa energia fixa o carbono em açúcar." },
  ],
};

// Deslocamento horizontal de cada nó, em px, para a trilha ziguezaguear.
export const ZIGZAG = [0, 34, 52, 34, 0, -34, -52, -34];
