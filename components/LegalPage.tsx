import Link from "next/link";
import type { ReactNode } from "react";
import { BETA, VERSION } from "@/lib/config";
import { CONTACT, UPDATED } from "@/lib/legal";

/** Casca das páginas de texto legal: título, data e botão para voltar à app. */
export function LegalPage({ title, children }: { title: string; children: ReactNode }) {
  return (
    <main className="legal">
      <Link href="/" className="linkbtn">← Voltar ao NOOBrain</Link>
      <div className="eyebrow">NOOBrain · por NOOBjects</div>
      <h1 className="h-screen">{title}</h1>
      <p className="sub small">Última atualização: {UPDATED}</p>
      <div className="pane"><div className="in prose">{children}</div></div>
      <LegalLinks />
    </main>
  );
}

/** Ligações para as duas páginas, usadas no fim delas e no rodapé da app. */
export function LegalLinks({ onIdea }: { onIdea?: () => void }) {
  return (
    <p className="sub small legal-links">
      <Link href="/privacidade">Política de privacidade</Link> · <Link href="/termos">Termos de serviço</Link>
      <br />✦ Feito com IA · NOOBjects
      {BETA && <><br />Versão beta {VERSION} · {onIdea ? <button type="button" className="linkbtn" onClick={onIdea}>Dar uma ideia</button> : <a href={`mailto:${CONTACT}?subject=Ideia para o NOOBrain`}>Dar uma ideia</a>}</>}
    </p>
  );
}
