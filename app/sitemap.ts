import type { MetadataRoute } from "next";
import { listTopics } from "@/lib/catalog-public";
import { SITE_URL } from "@/lib/config";

export const revalidate = 86400;

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const topics = await listTopics();
  return [...["", "/privacidade", "/termos"], ...topics.map((t) => `/temas/${t.slug}`)].map((path) => ({ url: SITE_URL + path }));
}
