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
  ["café da manhã", "pequeno-almoço"], ["suco", "sumo"], ["sucos", "sumos"], ["sorvete", "gelado"], ["sorvetes", "gelados"], ["xícara", "chávena"], ["xícaras", "chávenas"], ["aluguel", "aluguer"], ["goleiro", "guarda-redes"], ["goleiros", "guarda-redes"],
  ["câmera", "câmara"], ["câmeras", "câmaras"], ["cadastro", "registo"], ["cadastrar", "registar"], ["deletar", "apagar"],
  ["banheiro", "casa de banho"], ["geladeira", "frigorífico"], ["esporte", "desporto"], ["esportes", "desportos"], ["de fato", "de facto"], ["fato de", "facto de"],
];
const STEMS: [string, string][] = [
  ["econômic", "económic"], ["astronômic", "astronómic"], ["atômic", "atómic"], ["anatômic", "anatómic"], ["harmônic", "harmónic"], ["carbônic", "carbónic"],
  ["acadêmic", "académic"], ["polêmic", "polémic"], ["sistêmic", "sistémic"], ["endêmic", "endémic"], ["epidêmi", "epidémi"], ["pandêmi", "pandémi"], ["genôm", "genom"], ["planej", "plane"],
];

const cap = (from: string, to: string) => (from[0] === from[0].toUpperCase() && from[0] !== from[0].toLowerCase() ? to[0].toUpperCase() + to.slice(1) : to);
const esc = (s: string) => s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
const L = "A-Za-zÀ-ÖØ-öø-ÿ"; // letras (para não trocar pedaços de outras palavras)
const RULES: [RegExp, string][] = [
  ...WORDS.map(([a, b]) => [new RegExp(`(?<![${L}])${esc(a)}(?![${L}])`, "gi"), b] as [RegExp, string]),
  ...STEMS.map(([a, b]) => [new RegExp(`(?<![${L}])${esc(a)}(?=[${L}]*)`, "gi"), b] as [RegExp, string]),
];

// "ô"/"ê" antes de m/n e vogal passam a "ó"/"é" (econômico, fenômeno, gênero, Amazônia). Exceções que ficam como estão.
const ACCENT_KEEP = new Set(["estômago", "estômagos", "fêmea", "fêmeas", "sêmola", "dêmos"]);
const ACCENT = new RegExp(`[${L}]*[ôê][mn][aeiouáéíóúâêôãõ][${L}]*`, "g");
const accent = (w: string) => (ACCENT_KEEP.has(w.toLowerCase()) ? w : w.replace(/ô(?=[mn])/g, "ó").replace(/ê(?=[mn])/g, "é"));

// Gerúndio brasileiro depois de estar/ficar/continuar/andar: "está fazendo" → "está a fazer".
const NOT_GERUND = new Set(["quando", "comando", "bando", "brando", "mando", "lindo", "estupendo", "horrendo", "tremendo", "remendo", "adendo", "dividendo"]);
const AUX = "estou|estás|está|estamos|estão|estava|estavas|estávamos|estavam|esteve|estive|estar|fica|ficam|continua|continuam|anda|andam";
const GERUND = new RegExp(`(?<![${L}])(${AUX})(\\s+)([${L}]*?)(ando|endo|indo)(?![${L}])`, "gi");
const INF = { ando: "ar", endo: "er", indo: "ir" } as const;
const gerund = (m: string, aux: string, sp: string, stem: string, end: keyof typeof INF) => {
  if (NOT_GERUND.has((stem + end).toLowerCase())) return m;
  if (!stem) return end === "indo" ? `${aux}${sp}a ir` : m;
  return `${aux}${sp}a ${stem}${INF[end.toLowerCase() as keyof typeof INF]}`;
};
const LEVEL_BR = /(?<![A-Za-zÀ-ÿ])Intermediário(?![A-Za-zÀ-ÿ])/g;

/** Texto com a ortografia de Portugal. "Por que" no início de uma pergunta passa a "Porque é que". */
export function ptpt(text: string): string {
  // \n ou \t literais que a IA deixa no texto; fora dos blocos de código (`...`), onde podem ser o assunto da lição
  let t = text.includes("\\") ? text.split(/(`[^`]*`)/).map((p, i) => (i % 2 ? p : p.replace(/\\[nt]/g, " ").replace(/ {2,}/g, " "))).join("") : text;
  for (const [re, to] of RULES) t = t.replace(re, (m) => cap(m, to));
  t = t.replace(ACCENT, accent).replace(GERUND, gerund).replace(LEVEL_BR, "Intermédio");
  return t.replace(/(^|[.!?]\s+|¿)Por que (?!raz[ãa]o|motivo)(?=[^?]*\?)/g, "$1Porque é que ");
}

/** Aplica `ptpt` a todas as frases de um objeto (lição, trilha), sem mexer nos números nem nas chaves. */
export function ptptDeep<T>(v: T): T {
  if (typeof v === "string") return ptpt(v) as T;
  if (Array.isArray(v)) return v.map(ptptDeep) as T;
  if (v && typeof v === "object") return Object.fromEntries(Object.entries(v).map(([k, x]) => [k, ptptDeep(x)])) as T;
  return v;
}

/** Marcas de português do Brasil que sobraram (só deteta, não troca): "você", "a gente", "celular"/"tela" de telemóvel, gerúndio. */
export function brMarkers(text: string): string[] {
  const out: string[] = [];
  if (/(?<![A-Za-zÀ-ÿ])vocês?(?![A-Za-zÀ-ÿ])/i.test(text)) out.push("você");
  if (/(?<![A-Za-zÀ-ÿ])a gente(?![A-Za-zÀ-ÿ])/i.test(text)) out.push("a gente");
  if (/celular/i.test(text) && /telefone|ecrã|tela|\bapp\b|ligar|mensagem|bateria|carregar/i.test(text)) out.push("celular");
  if (/(?<![A-Za-zÀ-ÿ])tela(?![A-Za-zÀ-ÿ])/i.test(text) && /celular|computador|telemóvel/i.test(text)) out.push("tela");
  for (const m of text.matchAll(GERUND)) if (!NOT_GERUND.has((m[3] + m[4]).toLowerCase()) && (m[3] || m[4].toLowerCase() === "indo")) out.push(m[0]);
  return out;
}

/** Todos os marcadores encontrados em qualquer texto de um objeto (lição, trilha). */
export function brMarkersDeep(v: unknown): string[] {
  if (typeof v === "string") return brMarkers(v);
  if (Array.isArray(v)) return v.flatMap(brMarkersDeep);
  if (v && typeof v === "object") return Object.values(v).flatMap(brMarkersDeep);
  return [];
}
