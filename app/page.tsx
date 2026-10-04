import { App } from "@/components/App";
import { Landing } from "@/components/Landing";
import { listTopics } from "@/lib/catalog-public";

// Atualiza a lista de temas uma vez por dia.
export const revalidate = 86400;

export default async function Home() {
  return <App landing={<Landing topics={await listTopics(8)} />} />;
}
