"use client";

import { useEffect, useState } from "react";
import { HeroIco, Idea } from "./Icons";
import { Quiz } from "./Quiz";
import { ApiError, createTrail } from "@/lib/api";
import { loadCatalog, startFromCatalog, type CatalogRow } from "@/lib/catalog-client";
import { parse, getRaw, update } from "@/lib/store";
import { sameTopic } from "@/lib/topic";
import type { Trail } from "@/lib/types";

const SUGGESTIONS = ["Fotossíntese", "Juros compostos", "Git básico", "Revolução Francesa"];

export function NewTopic({ trails, onOpen, onDone, online = true }: {
  trails: Trail[];
  onOpen: (trail: Trail) => void;
  onDone: (topic: string) => void;
  online?: boolean;
}) {
  const [topic, setTopic] = useState("");
  const [level, setLevel] = useState("Iniciante");
  const [force, setForce] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  // Teste rápido para escolher o nível: só no Iniciante e se a trilha trouxe as perguntas.
  const [check, setCheck] = useState<{ trail: Trail; stage: "ask" | "quiz" | "easy" } | null>(null);
  const [options, setOptions] = useState<string[]>([]); // tema ambíguo: significados possíveis
  const [catalog, setCatalog] = useState<CatalogRow[]>([]);
  useEffect(() => {
    let live = true;
    loadCatalog().then((r) => live && setCatalog(r), () => {});
    return () => { live = false; };
  }, []);

  // Já existe uma trilha sobre o mesmo assunto, mesmo escrito com outras palavras? Então abrimos essa, sem gastar IA.
  const match = !force ? trails.find((t) => t.level === level && sameTopic(t.topic, topic)) : undefined;
  // Já está no catálogo partilhado? Começa logo, sem esperar pela IA.
  const ready = !force && !match && topic.trim().length >= 3 ? catalog.find((r) => r.level === level && sameTopic(r.topic, topic)) : undefined;

  async function submit(e?: React.FormEvent, asked = topic) {
    e?.preventDefault();
    if (match) return onOpen(match);
    if (ready) return onDone(startFromCatalog(ready, parse(getRaw())).topic);
    if (asked.trim().length < 2) return setError("Escreve um tema ou escolhe uma sugestão.");
    if (!online) return setError("Sem ligação. Criar um tema precisa de internet.");
    setError(null);
    setOptions([]);
    setLoading(true);
    try {
      const trail = await createTrail(asked, level);
      update((s) => ({ ...s, trails: [{ ...trail, diagnostic: undefined }, ...s.trails], active: trail.id }));
      if (trail.diagnostic?.length === 3 && level === "Iniciante") { setLoading(false); return setCheck({ trail, stage: "ask" }); }
      onDone(trail.topic);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Sem ligação. Tenta outra vez.");
      const opts = err instanceof ApiError && Array.isArray(err.data.options) ? (err.data.options as string[]).filter((o) => typeof o === "string").slice(0, 4) : [];
      setOptions(opts);
      setLoading(false);
    }
  }

  async function goIntermediate(from: Trail) {
    setLoading(true);
    setError(null);
    try {
      const harder = await createTrail(from.topic, "Intermediário");
      update((s) => ({ ...s, trails: [{ ...harder, diagnostic: undefined }, ...s.trails.filter((x) => x.id !== from.id)], active: harder.id }));
      onDone(harder.topic);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Sem ligação. Tenta outra vez.");
      setLoading(false);
    }
  }

  if (check) {
    const { trail } = check;
    return (
      <div className="newtopic">
        <div className="hero-new">
          <HeroIco><Idea /></HeroIco>
          {check.stage === "ask" && <>
            <h1 className="h-screen">Queres um teste rápido?</h1>
            <p className="sub">São 3 perguntas para ver se o nível Iniciante é o certo para ti.</p>
            <button type="button" className="btn block" onClick={() => setCheck({ trail, stage: "quiz" })}><span className="face">Fazer o teste</span></button>
            <button type="button" className="btn soft block" onClick={() => onDone(trail.topic)}><span className="face">Saltar</span></button>
          </>}
          {check.stage === "easy" && <>
            <h1 className="h-screen">Foi fácil!</h1>
            <p className="sub">Acertaste as 3 à primeira. Queres começar no nível Intermediário?</p>
            {error && <div className="note ch" role="alert">{error}</div>}
            <button type="button" className="btn block" disabled={loading} onClick={() => void goIntermediate(trail)}><span className="face">{loading ? "A montar a trilha…" : "Sim, Intermediário"}</span></button>
            <button type="button" className="btn soft block" disabled={loading} onClick={() => onDone(trail.topic)}><span className="face">Ficar no Iniciante</span></button>
          </>}
        </div>
        {check.stage === "quiz" && (
          <Quiz items={trail.diagnostic!.map((q) => ({ kind: "mc" as const, ...q }))} retry={false}
            onFinish={(first) => (first === 3 ? setCheck({ trail, stage: "easy" }) : onDone(trail.topic))} />
        )}
      </div>
    );
  }

  return (
    <div className="newtopic">
      <div className="hero-new">
        <HeroIco><Idea /></HeroIco>
        <h1 className="h-screen">O que queres aprender?</h1>
        <p className="sub">Escreve qualquer tema. A trilha é montada para ti.</p>
      </div>

      <form onSubmit={submit}>
        <label className="sr" htmlFor="topic">Tema</label>
        <input id="topic" className="field ch" value={topic} onChange={(e) => { setTopic(e.target.value); setForce(false); setOptions([]); }}
          placeholder="Ex.: Juros compostos" maxLength={60} disabled={loading} autoComplete="off" />
        <div className="sugg">
          {SUGGESTIONS.map((s) => (
            <button key={s} type="button" className="chip ch" disabled={loading} onClick={() => { setTopic(s); setForce(false); }}>{s}</button>
          ))}
        </div>
        <div className="seg" role="group" aria-label="Nível">
          {["Iniciante", "Intermediário"].map((l) => (
            <button key={l} type="button" className="ch" aria-pressed={level === l} disabled={loading} onClick={() => setLevel(l)}>{l}</button>
          ))}
        </div>
        {match && (
          <div className="note info ch" role="status">
            Já tens a trilha “{match.topic}” neste nível. Vou abrir essa em vez de criar outra.
            <button type="button" className="linkbtn" onClick={() => setForce(true)}>Criar uma nova mesmo assim</button>
          </div>
        )}
        {ready && (
          <div className="note info ch" role="status">
            Já existe uma trilha pronta: “{ready.topic}” ({ready.concepts.length} conceitos). Começas já, sem esperar.
            <button type="button" className="linkbtn" onClick={() => setForce(true)}>Gerar uma nova mesmo assim</button>
          </div>
        )}
        {error && <div className="note ch" role="alert">{error}</div>}
        {options.length > 0 && (
          <div className="sugg" role="group" aria-label="Querias dizer">
            <span className="eyebrow block">Querias dizer…</span>
            {options.map((o) => (
              <button key={o} type="button" className="chip ch" disabled={loading} onClick={() => { setTopic(o); void submit(undefined, o); }}>{o}</button>
            ))}
          </div>
        )}
        <button type="submit" className="btn block" disabled={loading}>
          <span className="face">{loading ? "A montar a trilha…" : match ? "Abrir trilha existente" : ready ? "Começar já" : "Gerar trilha"}</span>
        </button>
        {loading && <p className="sub center" role="status">A procurar fontes abertas e a organizar os conceitos. Leva uns segundos.</p>}
      </form>
    </div>
  );
}
