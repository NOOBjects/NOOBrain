import Link from "next/link";
import type { PublicTopic } from "@/lib/catalog-public";

/** "Já há lições sobre:" — ligações para as páginas públicas dos temas mais usados. Gerado no servidor. */
export function CatalogChips({ topics }: { topics: PublicTopic[] }) {
  if (!topics.length) return null;
  return (
    <div className="catalog-chips">
      <h2 className="eyebrow">Já há lições sobre:</h2>
      <div className="sources">
        {topics.map((t) => <Link key={t.slug} href={`/temas/${t.slug}`} className="chip ch srcchip">{t.topic}</Link>)}
      </div>
    </div>
  );
}
