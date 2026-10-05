import { sameTopic, tokens } from "./topic";
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

type Book = { key: string; title: string; author_name?: string[]; author_key?: string[]; edition_count?: number };

/** Open Library (gratuita, sem chave): só entra quando o tema é mesmo um livro ou um autor. */
async function openLibrary(topic: string): Promise<Source | null> {
  try {
    const q = new URLSearchParams({ q: topic, limit: "1", fields: "key,title,author_name,author_key,edition_count" });
    const res = await fetch(`https://openlibrary.org/search.json?${q}`, { headers: { "user-agent": "NOOBrain/0.2 (projeto de estudo)" }, signal: AbortSignal.timeout(6_000) });
    if (!res.ok) return null;
    const doc = ((await res.json())?.docs ?? [])[0] as Book | undefined;
    if (!doc) return null;
    // Livro: só obras conhecidas (várias edições), para um tema como "Fotossíntese" não apanhar um manual com esse título.
    if (sameTopic(topic, doc.title) && (doc.edition_count ?? 0) >= 5) return { title: `${doc.title}${doc.author_name?.[0] ? `, de ${doc.author_name[0]}` : ""}`, url: `https://openlibrary.org${doc.key}`, site: "Open Library" };
    const i = (doc.author_name ?? []).findIndex((a) => a.includes(" ") && sameTopic(topic, a)); // nome completo do autor
    if (i >= 0 && doc.author_key?.[i]) return { title: doc.author_name![i], url: `https://openlibrary.org/authors/${doc.author_key[i]}`, site: "Open Library" };
    return null;
  } catch {
    return null;
  }
}

export async function findSources(topic: string): Promise<{ sources: Source[]; text: string }> {
  const [found, book] = await Promise.all([Promise.all(SITES.map(async (s) => ({ s, page: await search(s.host, topic) }))), openLibrary(topic)]);
  const good = found.filter((f) => f.page?.extract && relevant(topic, f.page.title));
  // a Wikipedia em inglês só entra se nada em português foi encontrado
  const picks = good.some((f) => f.s.host.startsWith("pt.")) ? good.filter((f) => f.s.host.startsWith("pt.")) : good;

  const sources: Source[] = picks.map((f) => ({ title: f.page!.title, url: f.page!.fullurl, site: f.s.label }));
  if (book) sources.push(book);
  const text = picks
    .map((f) => `[${f.s.label}: ${f.page!.title}]\n${f.page!.extract!.slice(0, 1500)}`)
    .join("\n\n")
    .slice(0, 4500);
  return { sources, text };
}
