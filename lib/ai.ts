// Único ponto de contacto com a IA. Para trocar de fornecedor, só este ficheiro muda.
// Fornecedor atual: Groq (plano gratuito, API compatível com a da OpenAI). A chave vem de .env.local e nunca sai do servidor.

export type AiErrorCode = "sem-chave" | "limite" | "falha";

export class AiError extends Error {
  constructor(public code: AiErrorCode, message: string) {
    super(message);
  }
}

// Modelos em ordem de preferência. Cada um tem o seu limite gratuito; se um estiver esgotado ou em baixo, tenta o próximo.
const MODELS = (process.env.AI_MODEL || "openai/gpt-oss-120b,qwen/qwen3.8-27b,openai/gpt-oss-20b").split(",").map((m) => m.trim());

// Mensagem de sistema: o app é usado também por adolescentes.
const REGRAS =
  "És o tutor do NOOBrain, um app de aprendizagem usado também por adolescentes. Responde só sobre o tema de estudo, com linguagem adequada a todas as idades. Recusa com gentileza conteúdo sexual, violento, perigoso ou de ódio e volta ao tema. Nunca peças dados pessoais.";

// O plano gratuito permite 30 pedidos por minuto por modelo. Usamos 25 para ter margem e
// fazemos quem passar do limite esperar a sua vez (até 25 s) em vez de falhar.
const RPM = Number(process.env.AI_RPM) || 25;
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

/** Pede uma resposta em JSON que obedece ao `schema` (JSON Schema, modo `strict`). */
export async function generateJson<T>(prompt: string, schema: object): Promise<T> {
  const key = process.env.AI_API_KEY;
  if (!key) throw new AiError("sem-chave", "AI_API_KEY não configurada");

  // 429, 5xx ou modelo indisponível: passa ao modelo seguinte. Se todos falharem, espera um pouco e repete a volta.
  let res!: Response;
  search: for (let round = 0; round < 2; round++) {
    for (const model of MODELS) {
      await acquire();
      res = await fetch("https://api.groq.com/openai/v1/chat/completions", {
        method: "POST",
        headers: { "content-type": "application/json", authorization: `Bearer ${key}` },
        body: JSON.stringify({
          model,
          messages: [{ role: "system", content: REGRAS }, { role: "user", content: prompt }],
          temperature: 0.4,
          reasoning_effort: "low",
          response_format: { type: "json_schema", json_schema: { name: "resposta", strict: true, schema } },
        }),
        signal: AbortSignal.timeout(55_000),
      });
      if (res.ok || ![400, 404, 429, 500, 502, 503].includes(res.status)) break search;
      console.warn("Groq", model, res.status, "- a tentar o modelo seguinte");
    }
    await new Promise((r) => setTimeout(r, 2500));
  }

  if (res.status === 429) throw new AiError("limite", "Limite gratuito atingido");
  if (!res.ok) {
    console.error("Groq", res.status, (await res.text()).slice(0, 500));
    throw new AiError("falha", `Groq respondeu ${res.status}`);
  }

  const data = await res.json();
  const text: unknown = data?.choices?.[0]?.message?.content;
  if (typeof text !== "string") throw new AiError("falha", "Resposta vazia da IA");
  try {
    return JSON.parse(text) as T;
  } catch {
    throw new AiError("falha", "A IA não devolveu JSON válido");
  }
}

/** Converte qualquer erro da IA na resposta HTTP que o app mostra à pessoa. */
export function aiErrorResponse(e: unknown): Response {
  const fail = (error: string, status: number) => Response.json({ error }, { status });
  if (e instanceof AiError) {
    if (e.code === "sem-chave") return fail("A chave da IA ainda não foi configurada no servidor.", 503);
    if (e.code === "limite") return fail("A IA gratuita está no limite agora. Tenta outra vez dentro de um minuto.", 429);
  }
  console.error(e);
  return fail("Não consegui falar com a IA agora. Tenta outra vez.", 502);
}
