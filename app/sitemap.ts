import type { MetadataRoute } from "next";

const site = "https://noobrain.vercel.app";

export default function sitemap(): MetadataRoute.Sitemap {
  return ["", "/privacidade", "/termos"].map((path) => ({ url: site + path }));
}
