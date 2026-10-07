"use client";

import { Empty, Loading, useSection, when } from "./shared";

/** Últimas 200 ações do painel: quem, o quê, em quê e quando. */
export function Registo() {
  const { data, error } = useSection<{ log: { id: number; actor_name: string | null; action: string; target: string | null; detail: Record<string, unknown> | null; created_at: string }[] }>("registo");
  if (!data) return <Loading error={error} />;
  if (!data.log.length) return <Empty>Ainda sem ações registadas.</Empty>;
  return (
    <div className="list">
      {data.log.map((r) => (
        <div key={r.id} className="pane flat"><div className="in set">
          <div className="row-between"><b>{r.action}</b><span className="sub small">{when(r.created_at)}</span></div>
          <span className="sub small">{r.actor_name ? `@${r.actor_name}` : "—"}{r.target ? ` → ${r.target}` : ""}</span>
          {r.detail && <span className="sub small pre">{JSON.stringify(r.detail)}</span>}
        </div></div>
      ))}
    </div>
  );
}
