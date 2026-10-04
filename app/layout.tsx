import type { Metadata, Viewport } from "next";
import { Chakra_Petch, Figtree } from "next/font/google";
import "./globals.css";
import { SITE_URL } from "@/lib/config";

const chakra = Chakra_Petch({ variable: "--font-chakra", subsets: ["latin"], weight: ["500", "600", "700"] });
const figtree = Figtree({ variable: "--font-figtree", subsets: ["latin"] });

const description = "Aprende qualquer tema com trilhas, tutor, cartões e revisão espaçada.";

// Ícones e imagem de partilha vêm dos ficheiros em app/ (favicon.ico, icon.svg, apple-icon.png, opengraph-image.png).
export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: "NOOBrain",
  description,
  applicationName: "NOOBrain",
  appleWebApp: { title: "NOOBrain" },
  openGraph: { type: "website", siteName: "NOOBrain", title: "NOOBrain", description, locale: "pt_PT" },
  twitter: { card: "summary_large_image" },
  // Google Search Console (código público; não apagar, senão a verificação cai)
  verification: { google: "F0M2HB1yt5vAGHrdWXXQJ-WhpBBKT34Q37PBHWpdQPk" },
};

// Cor da barra do navegador no telemóvel = fundo do site (--bg claro e escuro em globals.css)
export const viewport: Viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#edf3ff" },
    { media: "(prefers-color-scheme: dark)", color: "#050e24" },
  ],
};

const webApp = {
  "@context": "https://schema.org",
  "@type": "WebApplication",
  name: "NOOBrain",
  url: SITE_URL,
  description,
  applicationCategory: "EducationalApplication",
  operatingSystem: "Web",
  inLanguage: "pt-PT",
  offers: { "@type": "Offer", price: "0", priceCurrency: "EUR" },
  publisher: { "@type": "Organization", name: "NOOBjects" },
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="pt-PT" className={`${chakra.variable} ${figtree.variable}`} suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: 'try{var t=localStorage.getItem("noobrain:theme");if(t==="light"||t==="dark")document.documentElement.dataset.theme=t}catch(e){}' }} />
      </head>
      <body>
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(webApp) }} />
        {children}
      </body>
    </html>
  );
}
