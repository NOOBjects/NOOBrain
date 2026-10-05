"use client";

import { useCallback, useEffect, useState } from "react";
import { Switch } from "./Switch";
import { call, setTestLimits, testLimits } from "@/lib/api";
import { update } from "@/lib/store";

type Idea = { id: number; title: string; body: string; status: string; reply: string | null; votes: number; created_at: string };
type Report = { id: number; what: string; detail: string; created_at: string; resolved: boolean };
type Opinion = { id: number; rating: number; text: string; context: string; created_at: string };
type Topic = { key: string; level: string; topic: string; uses: number; category: string };
type Data = {
  numbers: { accounts: number; active: number; devices: number; lessons: number; topics: number; aiToday: number; aiKinds: Record<string, number>; rating: number | null };
  ideas: Idea[]; reports: Report[]; feedback: Opinion[]; catalog: Topic[];
  tools: { usage: Record<string, number>; max: Record<string, number> };
};

const STATUS: [string, string][] = [["recebida", "Recebida"], ["planeada", "Planeada"], ["em_curso", "Em curso"], ["feita", "Feita"], ["recusada", "Recusada"]];
const TABS = [["numeros", "Números"], ["ideias", "Ideias"], ["erros", "Erros"], ["opiniao", "Opinião"], ["catalogo", "Catálogo"], ["ferramentas", "Ferramentas"]] as const;
const when = (iso: string) => new Date(iso).toLocaleString("pt-PT", { day: "numeric", month: "short", hour: "2-digit", minute: "2-digit" });

/** Painel de administração: ideias, erros reportados, opiniões, números e catálogo. Só aparece a quem está em ADMIN_IDS. */
export function Admin({ onBack }: { onBack: () => void }) {
  const [data, setData] = useState<Data | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [tab, setTab] = useState<(typeof TABS)[number][0]>("numeros");
  const [del, setDel] = useState<string | null>(null);
  const [limits, setLimits] = useState(testLimits);
  const [who, setWho] = useState("");
  const [done, setDone] = useState<string | null>(null);

  const load = useCallback(() => call<Data>("/api/admin").then(setData, (e: Error) => setError(e.message)), []);
  useEffect(() => { void Promise.resolve().then(load); }, [load]);

  async function act(body: object, ok = "Guardado") {
    try { await call("/api/admin", body); setError(null); await load(); return ok; } catch (e) { setError((e as Error).message); return null; }
  }

  return (
    <div className="admin">
      <button type="button" className="linkbtn back" onClick={onBack}>← Voltar ao perfil</button>
      <h1 className="h-screen">Administração</h1>
      <div className="seg six" role="tablist" aria-label="Secções">
        {TABS.map(([id, label]) => <button key={id} type="button" role="tab" className="ch" aria-selected={tab === id} onClick={() => setTab(id)}>{label}</button>)}
      </div>
      {error && <div className="note ch" role="alert">{error}</div>}
      {!data && !error && <p className="sub center">A carregar…</p>}

      {data && tab === "numeros" && (
        <div className="stats-grid">
          {([["Contas", data.numbers.accounts], ["Ativas (7 dias)", data.numbers.active], ["Pedidos à IA hoje", data.numbers.aiToday], ["Aparelhos com avisos", data.numbers.devices],
            ["Temas no catálogo", data.numbers.topics], ["Lições no catálogo", data.numbers.lessons], ["Opinião média", data.numbers.rating ?? "—"],
            ...Object.entries(data.numbers.aiKinds).map(([k, n]) => [`IA hoje: ${k}`, n])] as [string, number | string][]).map(([label, n]) => (
            <div key={label} className="pane"><div className="in stat-box"><span className="stat-n">{n}</span><span className="eyebrow">{label}</span></div></div>
          ))}
        </div>
      )}

      {data && tab === "ideias" && (
        <div className="list">
          {!data.ideas.length && <p className="sub center">Ainda sem ideias.</p>}
          {data.ideas.map((i) => <IdeaRow key={i.id} idea={i} onSave={(status, reply) => act({ act: "idea", id: i.id, status, reply })} />)}
        </div>
      )}

      {data && tab === "erros" && (
        <div className="list">
          {!data.reports.length && <p className="sub center">Nenhum erro reportado.</p>}
          {data.reports.map((r) => (
            <div key={r.id} className={`pane${r.resolved ? " flat dim" : ""}`}><div className="in set">
              <div className="row-between"><span className="chip ch">{r.what}</span><span className="sub small">{when(r.created_at)}</span></div>
              <p className="sub small pre">{r.detail}</p>
              <button type="button" className="btn soft sm" onClick={() => void act({ act: "report", id: r.id, resolved: !r.resolved })}><span className="face">{r.resolved ? "Reabrir" : "Marcar como resolvido"}</span></button>
            </div></div>
          ))}
        </div>
      )}

      {data && tab === "opiniao" && (
        <div className="list">
          {!data.feedback.length && <p className="sub center">Ainda sem opiniões.</p>}
          {data.feedback.map((f) => (
            <div key={f.id} className="pane"><div className="in set">
              <div className="row-between"><b>{"★".repeat(f.rating)}{"☆".repeat(5 - f.rating)}</b><span className="sub small">{when(f.created_at)} · {f.context}</span></div>
              {f.text && <p className="sub small pre">{f.text}</p>}
            </div></div>
          ))}
        </div>
      )}

      {data && tab === "ferramentas" && (
        <div className="stack">
          <section className="pane"><div className="in set">
            <div className="eyebrow">Limites diários</div>
            <p className="sub small">As contas de dono não têm limites. Liga isto para testares como uma pessoa normal (só neste navegador).</p>
            <div className="menu-row static"><span>Testar como pessoa normal</span><Switch on={limits} onChange={(on) => { setTestLimits(on); setLimits(on); setDone(on ? "Limites ligados nesta conta, neste navegador." : "Limites desligados (és dono outra vez)."); }} label="Testar como pessoa normal" /></div>
          </div></section>
          <section className="pane"><div className="in set">
            <div className="eyebrow">Uso de IA de hoje</div>
            <p>Temas {data.tools.usage.trail ?? 0} de {data.tools.max.trail} · lições {data.tools.usage.lesson ?? 0} de {data.tools.max.lesson} · tutor {data.tools.usage.tutor ?? 0} de {data.tools.max.tutor}</p>
            <button type="button" className="btn soft" onClick={() => void act({ act: "usage" }).then((m) => m && setDone("O teu uso de IA de hoje foi reposto."))}><span className="face">Repor o meu uso de IA</span></button>
            <label className="lbl" htmlFor="who">Ou de outra conta (@nome)</label>
            <input id="who" className="field ch" value={who} onChange={(e) => setWho(e.target.value)} autoComplete="off" autoCapitalize="none" placeholder="@nome" />
            <button type="button" className="btn soft" disabled={!who.trim()} onClick={() => void act({ act: "usage", username: who }).then((m) => { if (m) { setDone(`O uso de IA de hoje de ${who.trim()} foi reposto.`); setWho(""); } })}><span className="face">Repor o uso dessa conta</span></button>
          </div></section>
          <section className="pane"><div className="in set">
            <div className="eyebrow">Lições novas de hoje</div>
            <p className="sub small">Volta a zero a contagem de lições novas deste aparelho (o limite de 6 por dia).</p>
            <button type="button" className="btn soft" onClick={() => { update((s) => ({ ...s, daily: undefined })); setDone("Lições novas de hoje repostas."); }}><span className="face">Repor as lições novas</span></button>
          </div></section>
          <section className="pane"><div className="in set">
            <div className="eyebrow">Português de Portugal</div>
            <p className="sub small">Aplica a revisão automática (palavras do Brasil, grafias antigas, gerúndio) a todas as trilhas e lições que já estão no catálogo.</p>
            <button type="button" className="btn soft" onClick={() => void call<{ changed: number }>("/api/admin", { act: "ptpt" }).then((r) => setDone(r.changed ? `Corrigi ${r.changed} entradas do catálogo.` : "O catálogo já está em português de Portugal."), (e: Error) => setError(e.message))}><span className="face">Rever o catálogo</span></button>
          </div></section>
          {done && <p className="sub center" role="status">{done}</p>}
        </div>
      )}

      {data && tab === "catalogo" && (
        <div className="list">
          {data.catalog.map((t) => {
            const id = `${t.key}|${t.level}`;
            return (
              <div key={id} className="pane"><div className="in due-row">
                <div><b>{t.topic}</b><div className="sub small">{t.level} · {t.category} · {t.uses} usos</div></div>
                {del === id ? (
                  <span className="acts-inline">
                    <button type="button" className="btn bad sm" onClick={() => { setDel(null); void act({ act: "topic", key: t.key, level: t.level }); }}><span className="face">Apagar</span></button>
                    <button type="button" className="linkbtn" onClick={() => setDel(null)}>Cancelar</button>
                  </span>
                ) : <button type="button" className="linkbtn" onClick={() => setDel(id)}>Apagar</button>}
              </div></div>
            );
          })}
        </div>
      )}
    </div>
  );
}

function IdeaRow({ idea, onSave }: { idea: Idea; onSave: (status: string, reply: string) => Promise<string | null> }) {
  const [status, setStatus] = useState(idea.status);
  const [reply, setReply] = useState(idea.reply ?? "");
  const [msg, setMsg] = useState<string | null>(null);
  const changed = status !== idea.status || reply !== (idea.reply ?? "");
  return (
    <div className="pane"><div className="in set">
      <div className="row-between"><b>{idea.title}</b><span className="chip ch">▲ {idea.votes}</span></div>
      {idea.body && <p className="sub small pre">{idea.body}</p>}
      <label className="lbl" htmlFor={`st${idea.id}`}>Estado</label>
      <select id={`st${idea.id}`} className="field ch" value={status} onChange={(e) => setStatus(e.target.value)}>
        {STATUS.map(([v, l]) => <option key={v} value={v}>{l}</option>)}
      </select>
      <label className="lbl" htmlFor={`re${idea.id}`}>Resposta da NOOBjects</label>
      <textarea id={`re${idea.id}`} className="field ch" rows={2} maxLength={400} value={reply} onChange={(e) => setReply(e.target.value)} />
      <button type="button" className="btn sm" disabled={!changed} onClick={async () => setMsg(await onSave(status, reply))}><span className="face">Guardar</span></button>
      {msg && <p className="sub small" role="status">{msg}{status !== idea.status ? "" : ""}</p>}
    </div></div>
  );
}
