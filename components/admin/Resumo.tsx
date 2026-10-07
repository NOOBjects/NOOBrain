"use client";

import { Loading, useSection } from "./shared";

type D = { numbers: { accounts: number; news: number; active: number; devices: number; topics: number; lessons: number; aiToday: number; aiMax: number; aiKinds: Record<string, number>; rating: number | null } };

/** Números atuais: contas, atividade, IA de hoje e catálogo. */
export function Resumo() {
  const { data, error } = useSection<D>("resumo");
  if (!data) return <Loading error={error} />;
  const n = data.numbers;
  const rows: [string, string | number][] = [
    ["Contas", n.accounts], ["Contas novas (7 dias)", n.news], ["Ativas (7 dias)", n.active], ["Aparelhos com avisos", n.devices],
    ["Pedidos à IA hoje", `${n.aiToday} de ${n.aiMax}`], ["Temas no catálogo", n.topics], ["Lições no catálogo", n.lessons], ["Opinião média", n.rating ?? "—"],
    ...Object.entries(n.aiKinds).map(([k, v]) => [`IA hoje: ${k}`, v] as [string, number]),
  ];
  return (
    <div className="stats-grid">
      {rows.map(([label, v]) => <div key={label} className="pane"><div className="in stat-box"><span className="stat-n">{v}</span><span className="eyebrow">{label}</span></div></div>)}
    </div>
  );
}
