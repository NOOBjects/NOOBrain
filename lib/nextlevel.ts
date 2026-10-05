// Começar o mesmo tema noutro nível: do catálogo, se existir (instantâneo); senão, criado pela IA.
import { createTrail } from "./api";
import { loadCatalog, startFromCatalog } from "./catalog-client";
import { update } from "./store";
import type { Level } from "./levels";
import type { State, Trail } from "./types";

export async function startLevel(topic: string, key: string, level: Level, state: State): Promise<Trail> {
  const row = (await loadCatalog().catch(() => [])).find((r) => r.key === key && r.level === level);
  if (row) return startFromCatalog(row, state);
  const made = await createTrail(topic, level);
  update((s) => ({ ...s, trails: [{ ...made, diagnostic: undefined }, ...s.trails], active: made.id }));
  return made;
}
