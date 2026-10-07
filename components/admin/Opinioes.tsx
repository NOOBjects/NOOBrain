"use client";

import { Empty, Loading, useSection, when } from "./shared";

type Opinion = { id: number; rating: number; text: string; context: string; created_at: string };

/** Opiniões das pessoas, com a média por momento em que foi pedida. */
export function Opinioes() {
  const { data, error } = useSection<{ feedback: Opinion[]; byContext: { context: string; n: number; avg: number }[] }>("opinioes");
  if (!data) return <Loading error={error} />;
  if (!data.feedback.length) return <Empty>Ainda sem opiniões.</Empty>;
  return (
    <div className="list">
      <div className="topic-chips" aria-label="Média por momento">
        {data.byContext.map((c) => <span key={c.context} className="chip ch">{c.context}: {c.avg} ({c.n})</span>)}
      </div>
      {data.feedback.map((f) => (
        <div key={f.id} className="pane"><div className="in set">
          <div className="row-between"><b>{"★".repeat(f.rating)}{"☆".repeat(5 - f.rating)}</b><span className="sub small">{when(f.created_at)} · {f.context}</span></div>
          {f.text && <p className="sub small pre">{f.text}</p>}
        </div></div>
      ))}
    </div>
  );
}
