import { staffIds } from "@/lib/staff";

// Quem é da equipa (donos incluídos), sem papéis: serve para a etiqueta «Equipa» ao lado do @nome. Público, com cache de 5 minutos.
export const revalidate = 300;

export async function GET() {
  return Response.json({ ids: await staffIds() }, { headers: { "cache-control": "public, s-maxage=300, stale-while-revalidate=600" } });
}
