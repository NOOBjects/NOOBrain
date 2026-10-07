"use client";

import { act, Empty, Loading, useSection, when, type Say } from "./shared";

type Report = { id: number; what: string; detail: string; created_at: string; resolved: boolean };

/** Erros reportados nos testes e no tutor. Marcar como resolvido avisa quem os reportou. */
export function Erros({ say }: { say: Say }) {
  const { data, error, reload } = useSection<{ reports: Report[] }>("erros");
  if (!data) return <Loading error={error} />;
  if (!data.reports.length) return <Empty>Nenhum erro reportado.</Empty>;
  return (
    <div className="list">
      {data.reports.map((r) => (
        <div key={r.id} className={`pane${r.resolved ? " flat dim" : ""}`}><div className="in set">
          <div className="row-between"><span className="chip ch">{r.what}</span><span className="sub small">{when(r.created_at)}</span></div>
          <p className="sub small pre">{r.detail}</p>
          <button type="button" className="btn soft sm" onClick={async () => { if (await act({ act: "report", id: r.id, resolved: !r.resolved }, say, r.resolved ? "Erro reaberto." : "Erro resolvido. Quem o reportou foi avisado.")) void reload(); }}>
            <span className="face">{r.resolved ? "Reabrir" : "Marcar como resolvido"}</span>
          </button>
        </div></div>
      ))}
    </div>
  );
}
