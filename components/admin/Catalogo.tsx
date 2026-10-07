"use client";

import { useState } from "react";
import { act, Danger, Empty, Loading, useSection, type Say } from "./shared";

type Topic = { key: string; level: string; topic: string; uses: number; category: string };

/** Catálogo: pesquisar, mudar a categoria e refazer (apagar) uma trilha. */
export function Catalogo({ say }: { say: Say }) {
  const { data, error, reload } = useSection<{ catalog: Topic[]; categories: { id: string; name: string }[] }>("catalogo");
  const [q, setQ] = useState("");
  if (!data) return <Loading error={error} />;
  const list = data.catalog.filter((t) => !q.trim() || t.topic.toLowerCase().includes(q.trim().toLowerCase()));
  return (
    <div className="list">
      <input className="field ch" type="search" aria-label="Pesquisar no catálogo" placeholder="Pesquisar um tema" value={q} onChange={(e) => setQ(e.target.value)} />
      {!list.length && <Empty>Nada encontrado.</Empty>}
      {list.map((t) => (
        <div key={`${t.key}|${t.level}`} className="pane"><div className="in set">
          <div><b>{t.topic}</b><div className="sub small">{t.level} · {t.uses} usos</div></div>
          <label className="lbl" htmlFor={`cat-${t.key}-${t.level}`}>Categoria</label>
          <select id={`cat-${t.key}-${t.level}`} className="field ch" value={t.category}
            onChange={async (e) => { if (await act({ act: "category", key: t.key, level: t.level, category: e.target.value }, say, "Categoria mudada.")) void reload(); }}>
            {data.categories.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
          </select>
          <Danger label="Refazer trilha" sure={`Apagar «${t.topic}» (${t.level}) e as suas lições? A próxima pessoa gera-as de novo.`}
            onConfirm={async () => { if (await act({ act: "topic", key: t.key, level: t.level }, say, "Trilha apagada. Nasce de novo quando alguém a pedir.")) void reload(); }} />
        </div></div>
      ))}
    </div>
  );
}
