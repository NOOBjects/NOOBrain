import { Chip, Coin, Column, Cross, Flask, Palette, Spark, Speech } from "./Icons";
import type { Category } from "@/lib/categories";

// Ícones provisórios das categorias, no traço dos outros ícones (o Rodrigo vai desenhar os definitivos).
const ICON: Record<Category, () => React.ReactNode> = { ciencias: Flask, historia: Column, linguas: Speech, artes: Palette, tecnologia: Chip, saude: Cross, dinheiro: Coin, outros: Spark };

export function CategoryIcon({ c }: { c: Category }) {
  const Icon = ICON[c];
  return <Icon />;
}
