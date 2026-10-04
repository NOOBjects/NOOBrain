import type { Metadata } from "next";
import { Chakra_Petch, Figtree } from "next/font/google";
import "./globals.css";

const chakra = Chakra_Petch({ variable: "--font-chakra", subsets: ["latin"], weight: ["500", "600", "700"] });
const figtree = Figtree({ variable: "--font-figtree", subsets: ["latin"] });

export const metadata: Metadata = {
  title: "NOOBrain",
  description: "Aprenda qualquer tema com trilhas, tutor, cartões e revisão espaçada.",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="pt-BR" className={`${chakra.variable} ${figtree.variable}`}>
      <body>{children}</body>
    </html>
  );
}
