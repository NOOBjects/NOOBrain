import type { MetadataRoute } from "next";

// Permite "Adicionar ao ecrã principal" no telemóvel. Ícones gerados a partir de app/icon.svg.
export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "NOOBrain",
    short_name: "NOOBrain",
    description: "Aprende qualquer tema com trilhas, tutor, cartões e revisão espaçada.",
    lang: "pt-PT",
    start_url: "/",
    display: "standalone",
    background_color: "#edf3ff",
    theme_color: "#005fd9",
    icons: [
      { src: "/icon-192.png", sizes: "192x192", type: "image/png" },
      { src: "/icon-512.png", sizes: "512x512", type: "image/png" },
      { src: "/icon.svg", sizes: "any", type: "image/svg+xml" },
    ],
  };
}
