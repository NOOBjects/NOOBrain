// Revisão ortográfica PT-PT depois da IA: troca grafias brasileiras ou castelhanas comuns pelas de Portugal (AO90).
// Só palavras inequívocas (ex.: "celular" fica, porque em biologia é PT-PT). Mantém maiúscula inicial.
const WORDS: [string, string][] = [
  ["elétron", "eletrão"], ["elétrons", "eletrões"], ["eletron", "eletrão"], ["eletrons", "eletrões"], ["electrón", "eletrão"], ["electrones", "eletrões"], ["electrons", "eletrões"],
  ["próton", "protão"], ["prótons", "protões"], ["nêutron", "neutrão"], ["nêutrons", "neutrões"],
  ["oxigênio", "oxigénio"], ["hidrogênio", "hidrogénio"], ["nitrogênio", "nitrogénio"], ["neurônio", "neurónio"], ["neurônios", "neurónios"],
  ["fenômeno", "fenómeno"], ["fenômenos", "fenómenos"], ["gênero", "género"], ["gêneros", "géneros"], ["gênio", "génio"], ["Antônio", "António"],
  ["quilômetro", "quilómetro"], ["quilômetros", "quilómetros"], ["polinômio", "polinómio"], ["binômio", "binómio"], ["tênis", "ténis"], ["bebê", "bebé"], ["bebês", "bebés"],
  ["transferencia", "transferência"], ["energia luminica", "energia luminosa"],
  ["liberado", "libertado"], ["liberada", "libertada"], ["liberados", "libertados"], ["liberadas", "libertadas"], ["liberar", "libertar"], ["libera", "liberta"], ["liberam", "libertam"],
  ["registrar", "registar"], ["registro", "registo"], ["registros", "registos"], ["contato", "contacto"], ["contatos", "contactos"],
  ["equipe", "equipa"], ["equipes", "equipas"], ["usuário", "utilizador"], ["usuários", "utilizadores"], ["ônibus", "autocarro"], ["trem", "comboio"],
  ["banheiro", "casa de banho"], ["geladeira", "frigorífico"], ["esporte", "desporto"], ["esportes", "desportos"], ["de fato", "de facto"], ["fato de", "facto de"],
];
const STEMS: [string, string][] = [
  ["econômic", "económic"], ["astronômic", "astronómic"], ["atômic", "atómic"], ["anatômic", "anatómic"], ["harmônic", "harmónic"], ["carbônic", "carbónic"],
  ["acadêmic", "académic"], ["polêmic", "polémic"], ["sistêmic", "sistémic"], ["endêmic", "endémic"], ["epidêmi", "epidémi"], ["pandêmi", "pandémi"], ["genôm", "genom"],
];

const cap = (from: string, to: string) => (from[0] === from[0].toUpperCase() && from[0] !== from[0].toLowerCase() ? to[0].toUpperCase() + to.slice(1) : to);
const esc = (s: string) => s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
const L = "A-Za-zÀ-ÖØ-öø-ÿ"; // letras (para não trocar pedaços de outras palavras)
const RULES: [RegExp, string][] = [
  ...WORDS.map(([a, b]) => [new RegExp(`(?<![${L}])${esc(a)}(?![${L}])`, "gi"), b] as [RegExp, string]),
  ...STEMS.map(([a, b]) => [new RegExp(`(?<![${L}])${esc(a)}(?=[${L}]*)`, "gi"), b] as [RegExp, string]),
];

/** Texto com a ortografia de Portugal. "Por que" no início de uma pergunta passa a "Porque é que". */
export function ptpt(text: string): string {
  // \n ou \t literais que a IA deixa no texto; fora dos blocos de código (`...`), onde podem ser o assunto da lição
  let t = text.includes("\\") ? text.split(/(`[^`]*`)/).map((p, i) => (i % 2 ? p : p.replace(/\\[nt]/g, " ").replace(/ {2,}/g, " "))).join("") : text;
  for (const [re, to] of RULES) t = t.replace(re, (m) => cap(m, to));
  return t.replace(/(^|[.!?]\s+|¿)Por que (?!raz[ãa]o|motivo)(?=[^?]*\?)/g, "$1Porque é que ");
}

/** Aplica `ptpt` a todas as frases de um objeto (lição, trilha), sem mexer nos números nem nas chaves. */
export function ptptDeep<T>(v: T): T {
  if (typeof v === "string") return ptpt(v) as T;
  if (Array.isArray(v)) return v.map(ptptDeep) as T;
  if (v && typeof v === "object") return Object.fromEntries(Object.entries(v).map(([k, x]) => [k, ptptDeep(x)])) as T;
  return v;
}
