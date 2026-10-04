import { tokens } from "./topic";
import type { Source } from "./types";

// Busca o tema em vários projetos abertos da Wikimedia (todos gratuitos e sem chave) e junta os textos
// introdutórios para a IA se basear em fatos, em vez de inventar. Cada fonte vira um link para o usuário.
const SITES = [
  { host: "pt.wikipedia.org", label: "Wikipédia" },
  { host: "pt.wikibooks.org", label: "Wikilivros" },
  { host: "pt.wikiversity.org", label: "Wikiversidade" },
  { host: "pt.wikisource.org", label: "Wikisource" },
  { host: "en.wikipedia.org", label: "Wikipedia (inglês)" },
];

type Page = { title: string; fullurl: string; extract?: string };

async function search(host: string, query: string): Promise<Page | null> {
  const params = new URLSearchParams({
    action: "query", format: "json", generator: "search", gsrsearch: query, gsrlimit: "1",
    prop: "extracts|info", exintro: "1", explaintext: "1", inprop: "url", redirects: "1",
  });
  try {
    const res = await fetch(`https://${host}/w/api.php?${params}`, {
      headers: { "user-agent": "NOOBrain/0.2 (projeto de estudo)" },
      signal: AbortSignal.timeout(8_000),
    });
    if (!res.ok) return null;
    const data = await res.json();
    return Object.values<Page>(data?.query?.pages ?? {})[0] ?? null;
  } catch {
    return null;
  }
}

/** Só aceita o resultado se o título compartilha alguma palavra com o tema (evita fonte sem relação). */
function relevant(topic: string, title: string) {
  const want = new Set(tokens(topic));
  return tokens(title).some((w) => want.has(w));
}

export async function findSources(topic: string): Promise<{ sources: Source[]; text: string }> {
  const found = await Promise.all(SITES.map(async (s) => ({ s, page: await search(s.host, topic) })));
  const good = found.filter((f) => f.page?.extract && relevant(topic, f.page.title));
  // a Wikipedia em inglês só entra se nada em português foi encontrado
  const picks = good.some((f) => f.s.host.startsWith("pt.")) ? good.filter((f) => f.s.host.startsWith("pt.")) : good;

  const sources: Source[] = picks.map((f) => ({ title: f.page!.title, url: f.page!.fullurl, site: f.s.label }));
  const text = picks
    .map((f) => `[${f.s.label}: ${f.page!.title}]\n${f.page!.extract!.slice(0, 1500)}`)
    .join("\n\n")
    .slice(0, 4500);
  return { sources, text };
}
