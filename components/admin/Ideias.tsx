"use client";

import { useState } from "react";
import { act, Danger, Empty, Loading, useSection, when, type Say } from "./shared";

type Idea = { id: number; title: string; body: string; status: string; reply: string | null; votes: number; created_at: string; appeal: string | null };
const STATUS: [string, string][] = [["recebida", "Recebida"], ["planeada", "Planeada"], ["em_curso", "Em curso"], ["feita", "Feita"], ["recusada", "Recusada"]];

/** Ideias: filtrar (com «Recursos»), responder, mudar o estado e apagar. */
export function Ideias({ say }: { say: Say }) {
  const { data, error, reload } = useSection<{ ideas: Idea[] }>("ideias");
  const [only, setOnly] = useState(false);
  if (!data) return <Loading error={error} />;
  const appeals = data.ideas.filter((i) => i.status === "recurso").length;
  const list = data.ideas.filter((i) => !only || i.status === "recurso");
  return (
    <div className="list">
      <div className="topic-chips" role="group" aria-label="Filtro">
        <button type="button" className="chip ch" aria-pressed={!only} onClick={() => setOnly(false)}>Todas ({data.ideas.length})</button>
        <button type="button" className="chip ch" aria-pressed={only} onClick={() => setOnly(true)}>Recursos ({appeals})</button>
      </div>
      {!list.length && <Empty>{only ? "Nenhum pedido de revisão." : "Ainda sem ideias."}</Empty>}
      {list.map((i) => (
        <IdeaRow key={i.id} idea={i}
          onSave={async (status, reply) => { const r = await act({ act: "idea", id: i.id, status, reply }, say, "Ideia guardada."); if (r) void reload(); return !!r; }}
          onDelete={async () => { if (await act({ act: "idea-del", id: i.id }, say, "Ideia apagada.")) void reload(); }} />
      ))}
    </div>
  );
}

function IdeaRow({ idea, onSave, onDelete }: { idea: Idea; onSave: (status: string, reply: string) => Promise<boolean>; onDelete: () => void }) {
  const [status, setStatus] = useState(idea.status);
  const [reply, setReply] = useState(idea.reply ?? "");
  const changed = status !== idea.status || reply !== (idea.reply ?? "");
  return (
    <div className="pane"><div className="in set">
      <div className="row-between"><b>{idea.title}</b><span className="chip ch">▲ {idea.votes}</span></div>
      <span className="sub small">{when(idea.created_at)}</span>
      {idea.body && <p className="sub small pre">{idea.body}</p>}
      {idea.appeal && <div className="note ch"><b>Pedido de revisão do autor:</b> {idea.appeal}</div>}
      <label className="lbl" htmlFor={`st${idea.id}`}>Estado</label>
      <select id={`st${idea.id}`} className="field ch" value={status} onChange={(e) => setStatus(e.target.value)}>
        {idea.status === "recurso" && <option value="recurso" disabled>Em recurso (decide: aceitar ou manter recusada)</option>}
        {STATUS.map(([v, l]) => <option key={v} value={v}>{l}</option>)}
      </select>
      <label className="lbl" htmlFor={`re${idea.id}`}>Resposta da NOOBjects</label>
      <textarea id={`re${idea.id}`} className="field ch" rows={2} maxLength={400} value={reply} onChange={(e) => setReply(e.target.value)} />
      <div className="row-between center-y" style={{ width: "100%" }}>
        <button type="button" className="btn sm" disabled={!changed} onClick={() => void onSave(status, reply)}><span className="face">Guardar</span></button>
        <Danger label="Apagar" sure={`Apagar «${idea.title.slice(0, 40)}»? Os votos também desaparecem.`} onConfirm={onDelete} />
      </div>
    </div></div>
  );
}
