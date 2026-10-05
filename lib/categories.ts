// Categorias do Explorar. A IA escolhe uma ao criar o tema (ver app/api/trail); os ícones estão em components/CategoryIcon.tsx.
export const CATEGORIES = [
  ["ciencias", "Ciências"],
  ["historia", "História"],
  ["linguas", "Línguas"],
  ["artes", "Artes e letras"],
  ["tecnologia", "Tecnologia"],
  ["saude", "Saúde"],
  ["dinheiro", "Dinheiro"],
  ["oficios", "Mãos à obra"],
  ["sociedade", "Sociedade e mente"],
  ["desporto", "Desporto e jogos"],
  ["outros", "Outros"],
] as const;
export type Category = (typeof CATEGORIES)[number][0];
export const CATEGORY_IDS = CATEGORIES.map(([id]) => id) as Category[];
export const categoryName = (c: string) => CATEGORIES.find(([id]) => id === c)?.[1] ?? "Outros";

// Temas iniciais do catálogo, criados antes de haver categorias (chave do catálogo → categoria).
const KNOWN: Record<string, Category> = {
  "core teoria": "artes", fotossintese: "ciencias", "sistema solar": "ciencias", "fernando pessoa": "artes", ingle: "linguas",
  "cravo revolucao": "historia", "artificial inteligencia": "tecnologia", "primeiro socorro": "saude", "financa pessoai": "dinheiro",
};

/** Categoria de um tema do catálogo: a guardada ou, nos temas antigos ("outros"), a conhecida. */
export const categoryOf = (key: string, category?: string | null): Category =>
  category && category !== "outros" && (CATEGORY_IDS as string[]).includes(category) ? (category as Category) : KNOWN[key] ?? "outros";

// Línguas em pausa desde 05/10/2026, até haver um formato próprio (ver PLANO-0.11.md, 3.4). Nada é apagado.
export const LANGUAGES_ON = false;
const LANG_WORDS = ["ingles", "english", "espanhol", "castelhano", "frances", "alemao", "italiano", "mandarim", "chines", "japones", "coreano", "russo", "arabe", "latim", "holandes", "sueco", "polaco", "turco", "hindi"];
const LANG_NOT = ["literatura", "historia", "cultura", "revolucao", "cozinha", "arte"];
const plain = (s: string) => s.normalize("NFD").replace(/[̀-ͯ]/g, "").toLowerCase();
/** O tema é aprender uma língua? "Literatura inglesa" e "Revolução Francesa" não são. */
export function isLanguageTopic(topic: string): boolean {
  const t = plain(topic);
  const words = t.split(/[^a-z0-9]+/).filter(Boolean);
  if (words.some((w) => LANG_NOT.includes(w))) return false;
  return words.some((w) => LANG_WORDS.includes(w)) || /\blingua gestual\b/.test(t);
}
export const LANGUAGES_PAUSED = "Aprender línguas está em pausa enquanto preparamos uma forma melhor de o fazer. Experimenta outro tema.";
