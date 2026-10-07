"use client";

import { useState } from "react";
import { Switch } from "../Switch";
import { act as doAct, Loading, useSection, when, type Say } from "./shared";
import { call, setTestLimits, testLimits } from "@/lib/api";
import { update } from "@/lib/store";

type D = { glossary: { word: string; replacement: string }[]; notices: { title: string; at: string; n: number }[]; usage: Record<string, number>; max: Record<string, number>; pushReady: boolean };

/** Ferramentas: avisos da equipa, limites e uso de IA, português de Portugal, glossário e atualizações. */
export function Ferramentas({ say }: { say: Say }) {
  const { data: d, error, reload } = useSection<D>("ferramentas");
  const [limits, setLimits] = useState(testLimits);
  const [who, setWho] = useState("");
  const [gw, setGw] = useState("");
  const [gr, setGr] = useState("");
  const [found, setFound] = useState<{ word: string; replacement: string }[] | null>(null);
  const [scanning, setScanning] = useState(false);
  const [nAud, setNAud] = useState<"all" | "team" | "users">("all");
  const [nUsers, setNUsers] = useState("");
  const [nTitle, setNTitle] = useState("");
  const [nBody, setNBody] = useState("");
  const [nLink, setNLink] = useState("");
  const [nPush, setNPush] = useState(false);
  const [sending, setSending] = useState(false);
  const accounts = "";
  const setDone = (m: string) => say(m);
  const setError = (m: string) => say(m, true);
  const load = reload;
  const act = (body: object) => doAct(body, say).then((r) => { if (r) void reload(); return r ? "ok" : null; });
  const run = act;
  if (!d) return <Loading error={error} />;
  const pushReady = d.pushReady;
  void accounts; void when;
  return (
    <div className="stack">
          <section className="pane"><div className="in set">
            <div className="eyebrow">Enviar um aviso</div>
            <p className="sub small">Aparece nas notificações de quem escolheres e, se quiseres, também chega ao telemóvel de quem tem os avisos ligados.</p>
            <label className="lbl" htmlFor="n-aud">Para quem</label>
            <select id="n-aud" className="field ch" value={nAud} onChange={(e) => setNAud(e.target.value as "all" | "team" | "users")}>
              <option value="all">Toda a gente</option>
              <option value="team">Só a equipa</option>
              <option value="users">Pessoas escolhidas (@nomes)</option>
            </select>
            {nAud === "users" && <input className="field ch" aria-label="@nomes, separados por vírgula" placeholder="@ana, @joao_99" value={nUsers} onChange={(e) => setNUsers(e.target.value)} autoCapitalize="none" autoComplete="off" />}
            <label className="lbl" htmlFor="n-title">Título</label>
            <input id="n-title" className="field ch" value={nTitle} maxLength={120} onChange={(e) => setNTitle(e.target.value)} autoComplete="off" />
            <label className="lbl" htmlFor="n-body">Texto (opcional)</label>
            <textarea id="n-body" className="field ch" rows={3} value={nBody} maxLength={600} onChange={(e) => setNBody(e.target.value)} />
            <label className="lbl" htmlFor="n-link">Ao tocar, abre</label>
            <select id="n-link" className="field ch" value={nLink} onChange={(e) => setNLink(e.target.value)}>
              <option value="">Só a lista de notificações</option>
              <option value="novidades">Novidades</option><option value="ideias">Ideias</option><option value="explorar">Explorar</option><option value="revisar">Rever</option><option value="perfil">Perfil</option><option value="ranking">Ranking</option>
            </select>
            <div className="menu-row static"><span>Enviar também para o telemóvel{pushReady ? "" : " (avisos desligados no servidor)"}</span><Switch on={nPush && pushReady} onChange={setNPush} label="Enviar também para o telemóvel" /></div>
            <button type="button" className="btn" disabled={sending || nTitle.trim().length < 3 || (nAud === "users" && !nUsers.trim())} onClick={() => {
              if (nAud === "all" && !window.confirm(`Enviar este aviso a ${accounts} contas?`)) return;
              setSending(true);
              void call<{ sent: number; pushed: number }>("/api/admin", { act: "notice", audience: nAud, usernames: nUsers, title: nTitle, body: nBody, link: nLink, push: nPush })
                .then((r) => { setDone(`Aviso enviado a ${r.sent} ${r.sent === 1 ? "conta" : "contas"}${nPush ? ` (${r.pushed} no telemóvel)` : ""}.`); setNTitle(""); setNBody(""); void load(); }, (e: Error) => setError(e.message))
                .finally(() => setSending(false));
            }}><span className="face">{sending ? "A enviar…" : "Enviar aviso"}</span></button>
            {d.notices.length > 0 && <>
              <div className="eyebrow">Últimos avisos</div>
              <ul className="gloss">{d.notices.map((n) => <li key={n.at}><span>{n.title}</span><span className="sub small">{when(n.at)} · {n.n}</span></li>)}</ul>
            </>}
          </div></section>
          <section className="pane"><div className="in set">
            <div className="eyebrow">Limites diários</div>
            <p className="sub small">As contas de dono não têm limites. Liga isto para testares como uma pessoa normal (só neste navegador).</p>
            <div className="menu-row static"><span>Testar como pessoa normal</span><Switch on={limits} onChange={(on) => { setTestLimits(on); setLimits(on); setDone(on ? "Limites ligados nesta conta, neste navegador." : "Limites desligados (és dono outra vez)."); }} label="Testar como pessoa normal" /></div>
          </div></section>
          <section className="pane"><div className="in set">
            <div className="eyebrow">Uso de IA de hoje</div>
            <p>Temas {d.usage.trail ?? 0} de {d.max.trail} · lições {d.usage.lesson ?? 0} de {d.max.lesson} · tutor {d.usage.tutor ?? 0} de {d.max.tutor}</p>
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
            <p className="sub small">Aplica a revisão automática (palavras do Brasil, grafias antigas, gerúndio e o glossário abaixo) a todas as trilhas e lições do catálogo. Quem tiver uma trilha mudada recebe o aviso «atualizar».</p>
            <button type="button" className="btn soft" onClick={() => void call<{ changed: number; trails: number }>("/api/admin", { act: "ptpt" }).then((r) => setDone(r.changed ? `Corrigi ${r.changed} entradas (${r.trails} trilhas). Quem as tem vai receber o aviso para atualizar.` : "O catálogo já está em português de Portugal."), (e: Error) => setError(e.message))}><span className="face">Rever o catálogo</span></button>
          </div></section>
          <section className="pane"><div className="in set">
            <div className="eyebrow">Glossário: palavras de Portugal</div>
            <p className="sub small">Palavra do Brasil → palavra de Portugal. Vale logo para tudo o que a IA escrever daqui para a frente; para o que já existe, usa «Rever o catálogo».</p>
            {d.glossary.length > 0 && (
              <ul className="gloss">{d.glossary.map((g) => <li key={g.word}><span>{g.word} → <b>{g.replacement}</b></span><button type="button" className="linkbtn" onClick={() => void run({ act: "gloss-del", word: g.word })}>Apagar</button></li>)}</ul>
            )}
            <div className="pair"><input className="field ch" aria-label="Palavra do Brasil" placeholder="do Brasil" value={gw} onChange={(e) => setGw(e.target.value)} autoCapitalize="none" /><input className="field ch" aria-label="Palavra de Portugal" placeholder="de Portugal" value={gr} onChange={(e) => setGr(e.target.value)} autoCapitalize="none" /></div>
            <button type="button" className="btn soft" disabled={!gw.trim() || !gr.trim()} onClick={() => void act({ act: "gloss", word: gw, replacement: gr }).then((m) => { if (m) { setGw(""); setGr(""); setDone("Palavra guardada."); } })}><span className="face">Acrescentar ao glossário</span></button>
            <button type="button" className="btn soft" disabled={scanning} onClick={() => { setScanning(true); setFound(null); void call<{ scanned: number; suggestions: { word: string; replacement: string }[] }>("/api/admin", { act: "gloss-scan" }).then((r) => { setFound(r.suggestions); setDone(r.suggestions.length ? `A IA leu ${r.scanned} palavras e sugere ${r.suggestions.length}.` : `A IA leu ${r.scanned} palavras e não encontrou nada do Brasil.`); }, (e: Error) => setError(e.message)).finally(() => setScanning(false)); }}><span className="face">{scanning ? "A IA está a ler o catálogo…" : "Procurar palavras do Brasil com a IA"}</span></button>
            {found && found.length > 0 && (
              <ul className="gloss">{found.map((g) => (
                <li key={g.word}><span>{g.word} → <b>{g.replacement}</b></span>
                  <span className="acts-inline">
                    <button type="button" className="linkbtn" onClick={() => void act({ act: "gloss", word: g.word, replacement: g.replacement }).then((m) => m && setFound((f) => f && f.filter((x) => x.word !== g.word)))}>Aceitar</button>
                    <button type="button" className="linkbtn" onClick={() => setFound((f) => f && f.filter((x) => x.word !== g.word))}>Ignorar</button>
                  </span></li>
              ))}</ul>
            )}
          </div></section>
          <section className="pane"><div className="in set">
            <div className="eyebrow">Atualizações</div>
            <p className="sub small">Pede a toda a gente que atualize as trilhas guardadas (fica o progresso). Usa depois de refazeres conteúdo à mão. Quem tem a app aberta recebe sozinho o aviso de «nova versão» a cada publicação.</p>
            <button type="button" className="btn soft" onClick={() => void call<{ trails: number }>("/api/admin", { act: "refresh-all" }).then((r) => setDone(`Pedi a atualização de ${r.trails} trilhas do catálogo.`), (e: Error) => setError(e.message))}><span className="face">Pedir a todos que atualizem as trilhas</span></button>
          </div></section>
          
    </div>
  );
}
