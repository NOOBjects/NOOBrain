import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { LegalLinks } from "@/components/LegalPage";
import { getTheme } from "@/lib/catalog-public";
import { SITE_URL } from "@/lib/config";

// Páginas geradas à primeira visita e renovadas uma vez por dia.
export const revalidate = 86400;
export const generateStaticParams = async () => [];

type Props = { params: Promise<{ slug: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const t = await getTheme(slug);
  if (!t) return { title: "Tema não encontrado", robots: { index: false } };
  const [a, b] = t.concepts;
  const description = `Trilha gratuita de ${t.topic}: ${a?.title}${b ? ` e ${b.title}` : ""}, entre outros ${t.concepts.length} conceitos, com lições, cartões e testes.`;
  const title = `Aprender ${t.topic} passo a passo · NOOBrain`;
  return {
    title,
    description,
    alternates: { canonical: `/temas/${slug}` },
    openGraph: { type: "article", siteName: "NOOBrain", title, description, locale: "pt_PT", url: `/temas/${slug}` },
  };
}

export default async function ThemePage({ params }: Props) {
  const { slug } = await params;
  const t = await getTheme(slug);
  if (!t) notFound();

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Course",
    name: `Aprender ${t.topic}`,
    description: t.concepts.map((c) => c.title).join(", "),
    url: `${SITE_URL}/temas/${slug}`,
    inLanguage: "pt-PT",
    isAccessibleForFree: true,
    provider: { "@type": "Organization", name: "NOOBjects", url: SITE_URL },
  };

  return (
    <main className="legal">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd).replace(/</g, "\\u003c") }} />
      <Link href="/" className="linkbtn">← Voltar ao NOOBrain</Link>
      <div className="eyebrow">{t.level} · {t.concepts.length} conceitos</div>
      <h1 className="h-screen">Aprender {t.topic} passo a passo</h1>
      <div className="pane"><div className="in prose">
        <ol>
          {t.concepts.map((c) => <li key={c.title}><b>{c.title}</b>. {c.summary}</li>)}
        </ol>
      </div></div>
      {t.sources.length > 0 && (
        <div className="sources"><span className="eyebrow">Fontes</span>
          {t.sources.map((s) => <a key={s.url} className="chip ch srcchip" href={s.url} target="_blank" rel="noreferrer">{s.site ?? "Fonte"} · {s.title}</a>)}
        </div>
      )}
      <Link href={`/?tema=${slug}`} className="btn block"><span className="face">Começar esta trilha</span></Link>
      <LegalLinks />
    </main>
  );
}
