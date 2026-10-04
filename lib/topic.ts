// Detecção de temas parecidos, sem depender de rede nem de IA.
// Ideia: "Fernando Pessoa", "Fernando Pessoa poeta" e "o poeta Fernando Pessoa" viram a mesma chave,
// enquanto "Juros compostos" e "Juros simples" continuam diferentes.

const STOP = new Set(["o", "a", "os", "as", "um", "uma", "de", "da", "do", "das", "dos", "e", "em", "no", "na", "nos", "nas", "para", "por", "sobre", "que", "com", "ao", "aos", "ser", "como"]);

// Palavras que só dizem "quero saber sobre isso" e não mudam o assunto.
const GENERIC = new Set([
  "poeta", "escritor", "autor", "vida", "obra", "obras", "biografia", "historia", "resumo", "introducao", "basico", "conceito",
  "curso", "aula", "tema", "assunto", "explicacao", "explicado", "completo", "guia", "tudo", "aprender", "estudar", "iniciante", "geral",
]);

const strip = (s: string) => s.normalize("NFD").replace(/[̀-ͯ]/g, "").toLowerCase();

function singular(w: string) {
  if (w.endsWith("oes")) return `${w.slice(0, -3)}ao`;
  return w.length > 3 && w.endsWith("s") ? w.slice(0, -1) : w;
}

export function tokens(topic: string): string[] {
  return strip(topic)
    .split(/[^a-z0-9]+/)
    .filter((w) => w && !STOP.has(w))
    .map(singular)
    .filter((w) => !STOP.has(w));
}

/** Chave canônica do tema: palavras relevantes, sem repetição, em ordem alfabética. */
export function topicKey(topic: string): string {
  const all = tokens(topic);
  const core = all.filter((w) => !GENERIC.has(w));
  return [...new Set(core.length ? core : all)].sort().join(" ");
}

export function distance(a: string, b: string): number {
  const d = Array.from({ length: a.length + 1 }, (_, i) => [i, ...Array(b.length).fill(0)]);
  for (let j = 1; j <= b.length; j++) d[0][j] = j;
  for (let i = 1; i <= a.length; i++)
    for (let j = 1; j <= b.length; j++)
      d[i][j] = Math.min(d[i - 1][j] + 1, d[i][j - 1] + 1, d[i - 1][j - 1] + (a[i - 1] === b[j - 1] ? 0 : 1));
  return d[a.length][b.length];
}

/** Dois temas são o mesmo assunto? Chaves iguais, ou quase iguais (erro de digitação). */
export function sameTopic(a: string, b: string): boolean {
  const ka = topicKey(a);
  const kb = topicKey(b);
  if (!ka || !kb) return false;
  if (ka === kb) return true;
  return Math.min(ka.length, kb.length) >= 8 && distance(ka, kb) <= 1;
}
