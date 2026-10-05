"use client";

import { useState } from "react";
import { refreshTrails, useAppUpdate, useStaleTrails } from "@/lib/updates";
import type { State } from "@/lib/types";

/** Aviso fixo no topo: há uma versão nova da app (recarregar) ou há trilhas desatualizadas neste aparelho (atualizar). */
export function UpdateBanner({ state, signedIn, notify }: { state: State; signedIn: boolean; notify: (m: string) => void }) {
  const newApp = useAppUpdate();
  const stale = useStaleTrails(state, signedIn);
  const [busy, setBusy] = useState(false);

  if (newApp)
    return (
      <div className="pane tint announce" role="status"><div className="in">
        <b>Há uma nova versão do NOOBrain</b>
        <p className="sub small">Atualiza para teres as melhorias e correções mais recentes. O teu progresso fica guardado.</p>
        <button type="button" className="btn sm" onClick={() => window.location.reload()}><span className="face">Atualizar agora</span></button>
      </div></div>
    );
  if (!signedIn || !stale.length) return null;
  return (
    <div className="pane tint announce" role="status"><div className="in">
      <b>{stale.length === 1 ? "Há uma trilha desatualizada" : `Há ${stale.length} trilhas desatualizadas`}</b>
      <p className="sub small">{stale.length === 1 ? `“${stale[0].topic}” foi melhorada` : "Foram melhoradas"}. Atualiza para teres a versão mais recente: o teu progresso fica.</p>
      <button type="button" className="btn sm" disabled={busy} onClick={() => { setBusy(true); void refreshTrails(stale.map((t) => t.id)).then(() => notify(stale.length === 1 ? "Trilha atualizada." : "Trilhas atualizadas."), () => notify("Sem ligação. Tenta outra vez.")).finally(() => setBusy(false)); }}>
        <span className="face">{busy ? "A atualizar…" : "Atualizar agora"}</span>
      </button>
    </div></div>
  );
}
