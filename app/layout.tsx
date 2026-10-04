import type { Metadata, Viewport } from "next";
import { Chakra_Petch, Figtree } from "next/font/google";
import "./globals.css";

const chakra = Chakra_Petch({ variable: "--font-chakra", subsets: ["latin"], weight: ["500", "600", "700"] });
const figtree = Figtree({ variable: "--font-figtree", subsets: ["latin"] });

const description = "Aprende qualquer tema com trilhas, tutor, cartões e revisão espaçada.";

// Ícones e imagem de partilha vêm dos ficheiros em app/ (favicon.ico, icon.svg, apple-icon.png, opengraph-image.png).
export const metadata: Metadata = {
  metadataBase: new URL("https://noobrain.vercel.app"),
  title: "NOOBrain",
  description,
  applicationName: "NOOBrain",
  appleWebApp: { title: "NOOBrain" },
  openGraph: { type: "website", siteName: "NOOBrain", title: "NOOBrain", description, locale: "pt_PT" },
  twitter: { card: "summary_large_image" },
};

// Cor da barra do navegador no telemóvel = fundo do site (--bg claro e escuro em globals.css)
export const viewport: Viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#edf3ff" },
    { media: "(prefers-color-scheme: dark)", color: "#050e24" },
  ],
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="pt-PT" className={`${chakra.variable} ${figtree.variable}`}>
      <body>{children}</body>
    </html>
  );
}
