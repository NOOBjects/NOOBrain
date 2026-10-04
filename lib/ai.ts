// Único ponto de contato com a IA. Para trocar de provedor, só este arquivo muda.
// Provedor atual: Google Gemini (plano gratuito). A chave vem de .env.local e nunca sai do servidor.

export type AiErrorCode = "sem-chave" | "limite" | "falha";

export class AiError extends Error {
  constructor(public code: AiErrorCode, message: string) {
    super(message);
  }
}

// Modelos em ordem de preferência. Se o primeiro estiver sobrecarregado (503) ou sumir (404), tenta o próximo.
const MODELS = (process.env.AI_MODEL || "gemini-3.8-flash,gemini-3.7-flash,gemini-3.1-flash-lite").split(",").map((m) => m.trim());

// O plano gratuito permite 10 pedidos por minuto. Usamos 9 para ter margem e
// fazemos quem passar do limite esperar sua vez (até 25 s) em vez de falhar.
const RPM = Number(process.env.AI_RPM) || 9;
const MAX_WAIT = 25_000;
const stamps: number[] = [];

async function acquire() {
  const start = Date.now();
  for (;;) {
    const now = Date.now();
    while (stamps.length && now - stamps[0] >= 60_000) stamps.shift();
    if (stamps.length < RPM) {
      stamps.push(now);
      return;
    }
    const wait = stamps[0] + 60_000 - now + 50;
    if (now - start + wait > MAX_WAIT) throw new AiError("limite", "Fila da IA cheia");
    await new Promise((r) => setTimeout(r, wait));
  }
}

/** Pede uma resposta em JSON que obedece ao `schema` (formato de esquema da API Gemini). */
export async function generateJson<T>(prompt: string, schema: object): Promise<T> {
  const key = process.env.AI_API_KEY;
  if (!key) throw new AiError("sem-chave", "AI_API_KEY não configurada");
  const body = JSON.stringify({
    contents: [{ role: "user", parts: [{ text: prompt }] }],
    generationConfig: { responseMimeType: "application/json", responseSchema: schema, temperature: 0.4 },
  });

  // O Google às vezes responde 500/503 por alta demanda. Percorremos a lista de modelos e, se todos falharem, esperamos e repetimos.
  let res!: Response;
  search: for (let round = 0; round < 2; round++) {
    for (const model of MODELS) {
      await acquire();
      res = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent`, {
        method: "POST",
        headers: { "content-type": "application/json", "x-goog-api-key": key },
        body,
        signal: AbortSignal.timeout(55_000),
      });
      if (![404, 500, 503].includes(res.status)) break search;
      console.warn("Gemini", model, res.status, "- tentando o próximo modelo");
    }
    await new Promise((r) => setTimeout(r, 2500));
  }

  if (res.status === 429) throw new AiError("limite", "Limite gratuito atingido");
  if (!res.ok) {
    console.error("Gemini", res.status, (await res.text()).slice(0, 500));
    throw new AiError("falha", `Gemini respondeu ${res.status}`);
  }

  const data = await res.json();
  const text: unknown = data?.candidates?.[0]?.content?.parts?.[0]?.text;
  if (typeof text !== "string") throw new AiError("falha", "Resposta vazia da IA");
  try {
    return JSON.parse(text) as T;
  } catch {
    throw new AiError("falha", "A IA não devolveu JSON válido");
  }
}

/** Converte qualquer erro da IA na resposta HTTP que o app mostra ao usuário. */
export function aiErrorResponse(e: unknown): Response {
  const fail = (error: string, status: number) => Response.json({ error }, { status });
  if (e instanceof AiError) {
    if (e.code === "sem-chave") return fail("A chave da IA ainda não foi configurada no servidor.", 503);
    if (e.code === "limite") return fail("A IA gratuita está no limite agora. Tente de novo em um minuto.", 429);
  }
  console.error(e);
  return fail("Não consegui falar com a IA agora. Tente de novo.", 502);
}
