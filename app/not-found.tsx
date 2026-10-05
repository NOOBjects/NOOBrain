import Link from "next/link";
import { Mascot } from "@/components/Mascot";

export const metadata = { title: "Página não encontrada · NOOBrain" };

/** 404: o mascote triste e um caminho de volta. */
export default function NotFound() {
  return (
    <main className="legal notfound">
      <div className="hero-mascot"><Mascot mood="sad" title="Mascote triste" /></div>
      <div className="eyebrow">Erro 404</div>
      <h1 className="h-screen">Esta página não existe</h1>
      <p className="sub">O endereço pode estar errado ou a página mudou de sítio.</p>
      <Link href="/" className="btn"><span className="face">Ir para o início</span></Link>
    </main>
  );
}
