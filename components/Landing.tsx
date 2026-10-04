import { CatalogChips } from "./CatalogChips";
import type { PublicTopic } from "@/lib/catalog-public";

const BLOCKS = [
  ["Uma trilha para cada tema", "Escreve o que queres aprender e recebes uma sequência de conceitos, do mais básico ao mais avançado, com fontes abertas."],
  ["Lições guiadas", "Cada conceito tem explicação curta, cartões de memória, um teste e um tutor para tirar dúvidas."],
  ["Revisão espaçada", "Os cartões voltam na altura certa, mesmo antes de esquecer. Aprendes uma vez e lembras-te."],
];

/** Texto público da página inicial. Gerado no servidor para o Google ler; quem tem sessão não o vê. */
export function Landing({ topics }: { topics: PublicTopic[] }) {
  return (
    <section className="landing">
      <h1 className="h-screen">Aprende qualquer tema, um conceito de cada vez</h1>
      <p className="sub">O NOOBrain é gratuito: trilhas, lições, cartões e revisão espaçada sobre o que quiseres, em português de Portugal.</p>
      <div className="landing-blocks">
        {BLOCKS.map(([title, text]) => (
          <div key={title} className="pane"><div className="in"><h2>{title}</h2><p className="sub">{text}</p></div></div>
        ))}
      </div>
      <CatalogChips topics={topics} />
    </section>
  );
}
