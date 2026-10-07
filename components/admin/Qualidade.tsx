"use client";

import { act, Danger, Empty, Loading, useSection, type Say } from "./shared";

type Item = { trail_key: string; level: string; concept_key: string; marks: string[]; word?: string; reports: number[]; snippet: string };

/** Lições do catálogo com palavras do Brasil ou com erros reportados. «Refazer lição» apaga só essa lição. */
export function Qualidade({ say }: { say: Say }) {
  const { data, error, reload } = useSection<{ suspicious: Item[]; scanned: number }>("qualidade");
  if (!data) return <Loading error={error} />;
  if (!data.suspicious.length) return <Empty>Nenhuma lição suspeita em {data.scanned} analisadas.</Empty>;
  return (
    <div className="list">
      <p className="sub small">{data.suspicious.length} lições a rever, de {data.scanned} analisadas.</p>
      {data.suspicious.map((i) => {
        const id = `${i.trail_key}|${i.level}|${i.concept_key}`;
        return (
          <div key={id} className="pane"><div className="in set">
            <div><b>{i.concept_key}</b><div className="sub small">{i.trail_key} · {i.level}</div></div>
            {i.marks.length > 0 && <div className="topic-chips">{i.marks.map((m) => <span key={m} className="chip ch warnchip">{m}</span>)}</div>}
            {i.reports.length > 0 && <span className="sub small">{i.reports.length} {i.reports.length === 1 ? "erro reportado" : "erros reportados"}</span>}
            {i.snippet && <p className="sub small pre"><Mark text={i.snippet} marks={i.word ? [i.word, ...i.marks] : i.marks} /></p>}
            <Danger label="Refazer lição" sure="Apagar esta lição? A próxima pessoa que a abrir gera uma nova."
              onConfirm={async () => { if (await act({ act: "lesson-redo", trail_key: i.trail_key, level: i.level, concept_key: i.concept_key }, say, "Lição apagada. Nasce de novo quando alguém a abrir.")) void reload(); }} />
          </div></div>
        );
      })}
    </div>
  );
}

/** Realça no texto as palavras suspeitas. */
function Mark({ text, marks }: { text: string; marks: string[] }) {
  if (!marks.length) return <>{text}</>;
  const re = new RegExp(`(${marks.map((m) => m.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")).join("|")})`, "gi");
  return <>{text.split(re).map((p, k) => (k % 2 ? <mark key={k}>{p}</mark> : p))}</>;
}
