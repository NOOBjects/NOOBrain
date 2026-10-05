import type { Cloze, Lesson } from "./types";

// Completar a frase: a palavra antes do espaço não pode denunciar nem enganar. "o ___" (com a resposta "corrente") induz ao erro,
// por isso o artigo passa para dentro do espaço: «___» = "a corrente". Serve para lições novas e para as que já estão guardadas.

const ARTICLE: Record<string, [string, string]> = {
  o: ["", "o"], a: ["", "a"], os: ["", "os"], as: ["", "as"], um: ["", "um"], uma: ["", "uma"], uns: ["", "uns"], umas: ["", "umas"],
  do: ["de", "o"], da: ["de", "a"], dos: ["de", "os"], das: ["de", "as"],
  no: ["em", "o"], na: ["em", "a"], nos: ["em", "os"], nas: ["em", "as"],
  ao: ["a", "o"], "à": ["a", "a"], aos: ["a", "os"], "às": ["a", "as"],
  pelo: ["por", "o"], pela: ["por", "a"], pelos: ["por", "os"], pelas: ["por", "as"],
  num: ["em", "um"], numa: ["em", "uma"], dum: ["de", "um"], duma: ["de", "uma"],
};
const BEFORE = /(^|[\s(«"'—-])(o|a|os|as|um|uma|uns|umas|do|da|dos|das|no|na|nos|nas|ao|à|aos|às|pelo|pela|pelos|pelas|num|numa|dum|duma)(\s+)_{3,}/i;
const STARTS = /^(o|a|os|as|um|uma|uns|umas)\s/i;

export function foldArticle(c: Cloze): Cloze {
  const text = c.text.replace(/«\s*_{3,}\s*»/g, "___");
  if ((text.match(/_{3,}/g) ?? []).length !== 1) return c; // só frases com um espaço
  const m = BEFORE.exec(text);
  if (!m || c.answer.split(/\s+/).length > 3 || STARTS.test(c.answer)) return c;
  const [prep, art] = ARTICLE[m[2].toLowerCase()];
  if (art === "a" && !prep && /(ar|er|ir|or)(-se)?$/i.test(c.answer)) return c; // "começou a ___" (pedalar): o "a" é preposição, fica
  const head = text.slice(0, m.index) + m[1] + (prep ? `${prep} ` : "");
  const rest = text.slice(m.index + m[0].length - 3);
  // O espaço fica só com a palavra: quem responde não vê o género nem a concordância; "a corrente" e "corrente" valem o mesmo.
  return { text: head + rest, answer: c.answer, accept: c.accept, bare: true };
}

/** Corrige as frases por completar de uma lição (devolve a mesma lição se não houver nada a mudar). */
export function fixLesson(l: Lesson): Lesson {
  if (!l.cloze?.length) return l;
  return { ...l, cloze: l.cloze.map(foldArticle) };
}

const plain = (s: string) => s.normalize("NFD").replace(/[̀-ͯ]/g, "").toLowerCase().replace(/[^a-z0-9 ]+/g, " ").replace(/\s+/g, " ").trim();
const noArt = (s: string) => s.replace(STARTS, "");

function dist(a: string, b: string) {
  const d = Array.from({ length: b.length + 1 }, (_, j) => j);
  for (let i = 1; i <= a.length; i++) {
    let prev = d[0];
    d[0] = i;
    for (let j = 1; j <= b.length; j++) {
      const tmp = d[j];
      d[j] = Math.min(d[j] + 1, d[j - 1] + 1, prev + (a[i - 1] === b[j - 1] ? 0 : 1));
      prev = tmp;
    }
  }
  return d[b.length];
}

/** "ok" = certo; "near" = quase (um ou dois erros de escrita); "no" = errado. Ignora acentos, maiúsculas e o artigo à frente. */
export function judgeCloze(c: Cloze, typed: string): "ok" | "near" | "no" {
  const t = noArt(plain(typed));
  if (!t) return "no";
  const options = [c.answer, ...c.accept].map((a) => noArt(plain(a))).filter(Boolean);
  if (options.some((a) => a === t)) return "ok";
  const near = options.some((a) => Math.min(a.length, t.length) >= 5 && dist(a, t) <= (a.length >= 10 ? 2 : 1));
  return near ? "near" : "no";
}
