// Qual é a versão publicada neste momento? O navegador compara com a que tem carregada e avisa para atualizar.
export const dynamic = "force-dynamic";

export function GET() {
  return Response.json({ build: process.env.VERCEL_GIT_COMMIT_SHA ?? "dev" }, { headers: { "cache-control": "no-store" } });
}
