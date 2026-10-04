// Cache em memória do servidor: se duas pessoas pedirem o mesmo tema (ou a mesma lição) enquanto a
// instância está viva, a segunda não gasta cota da IA. Some quando o servidor reinicia, e isso é aceitável.
const store = new Map<string, { at: number; value: unknown }>();
const TTL = 6 * 3600_000;

export function cached<T>(key: string): T | undefined {
  const hit = store.get(key);
  if (!hit) return undefined;
  if (Date.now() - hit.at > TTL) {
    store.delete(key);
    return undefined;
  }
  return hit.value as T;
}

export function remember(key: string, value: unknown) {
  if (store.size >= 300) store.delete(store.keys().next().value!);
  store.set(key, { at: Date.now(), value });
}
