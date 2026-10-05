// O glossário de palavras de Portugal (tabela ptpt_glossary, gerida no painel) alimenta o `ptpt`. Guarda-se 5 minutos.
import { setExtraRules } from "./ptpt";

type Db = { from: (t: string) => { select: (c: string) => PromiseLike<{ data: { word: string; replacement: string }[] | null }> } };
let at = 0;

export async function refreshGlossary(db: Db, force = false) {
  if (!force && Date.now() - at < 5 * 60_000) return;
  at = Date.now();
  try {
    const { data } = await db.from("ptpt_glossary").select("word,replacement");
    if (data) setExtraRules(data);
  } catch { /* sem glossário: fica só a lista do código */ }
}
