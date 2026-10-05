// Categorias do Explorar. A IA escolhe uma ao criar o tema (ver app/api/trail); os ícones estão em components/CategoryIcon.tsx.
export const CATEGORIES = [
  ["ciencias", "Ciências"],
  ["historia", "História"],
  ["linguas", "Línguas"],
  ["artes", "Artes e letras"],
  ["tecnologia", "Tecnologia"],
  ["saude", "Saúde"],
  ["dinheiro", "Dinheiro"],
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
