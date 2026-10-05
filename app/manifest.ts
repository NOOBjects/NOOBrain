import type { MetadataRoute } from "next";

// Permite "Adicionar ao ecrã principal" no telemóvel. Ícones gerados a partir de app/icon.svg.
export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "NOOBrain",
    short_name: "NOOBrain",
    description: "Aprende qualquer tema com trilhas, tutor, cartões e revisão espaçada.",
    lang: "pt-PT",
    id: "/",
    start_url: "/",
    scope: "/",
    display: "standalone",
    display_override: ["standalone"],
    orientation: "portrait",
    categories: ["education"],
    background_color: "#edf3ff",
    theme_color: "#005fd9",
    icons: [
      { src: "/icon-192.png", sizes: "192x192", type: "image/png" },
      { src: "/icon-512.png", sizes: "512x512", type: "image/png" },
      { src: "/icon-maskable-512.png", sizes: "512x512", type: "image/png", purpose: "maskable" },
      { src: "/icon.svg", sizes: "any", type: "image/svg+xml" },
    ],
    screenshots: [
      { src: "/shot-phone.png", sizes: "1080x1920", type: "image/png", form_factor: "narrow", label: "A trilha de conceitos" },
      { src: "/shot-wide.png", sizes: "1920x1080", type: "image/png", form_factor: "wide", label: "A trilha no computador" },
    ],
    shortcuts: [
      { name: "Rever", url: "/?v=revisar", icons: [{ src: "/icon-192.png", sizes: "192x192" }] },
      { name: "Explorar", url: "/?v=explorar", icons: [{ src: "/icon-192.png", sizes: "192x192" }] },
    ],
  };
}
