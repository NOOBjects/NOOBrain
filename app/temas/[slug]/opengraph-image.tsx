import { ImageResponse } from "next/og";
import { getTheme } from "@/lib/catalog-public";

export const alt = "Trilha de aprendizagem no NOOBrain";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";
export const revalidate = 86400;

// Imagem de partilha de cada tema: cores da marca, cantos retos.
export default async function Image({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const t = await getTheme(slug);
  return new ImageResponse(
    (
      <div style={{ width: "100%", height: "100%", display: "flex", flexDirection: "column", justifyContent: "space-between", background: "#050e24", color: "#eaf1ff", padding: 72 }}>
        <div style={{ fontSize: 36, color: "#5aa2ff", letterSpacing: 4 }}>NOOBRAIN</div>
        <div style={{ display: "flex", flexDirection: "column" }}>
          <div style={{ fontSize: 32, color: "#8ea2cc" }}>Aprender passo a passo</div>
          <div style={{ fontSize: 88, fontWeight: 700, lineHeight: 1.1, marginTop: 12 }}>{t?.topic ?? "NOOBrain"}</div>
        </div>
        <div style={{ display: "flex", background: "#5aa2ff", color: "#04112b", fontSize: 32, padding: "14px 28px", alignSelf: "flex-start" }}>Grátis · por NOOBjects</div>
      </div>
    ),
    size,
  );
}
