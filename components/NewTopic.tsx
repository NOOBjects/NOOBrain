"use client";

import { useState } from "react";
import { Mascot } from "./Mascot";
import { createTrail } from "@/lib/api";
import { update } from "@/lib/store";
import { sameTopic } from "@/lib/topic";
import type { Trail } from "@/lib/types";

const SUGGESTIONS = ["Fotossíntese", "Juros compostos", "Git básico", "Revolução Francesa"];

export function NewTopic({ trails, onOpen, onDone }: {
  trails: Trail[];
  onOpen: (trail: Trail) => void;
  onDone: (topic: string) => void;
}) {
  const [topic, setTopic] = useState("");
  const [level, setLevel] = useState("Iniciante");
  const [force, setForce] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Já existe uma trilha sobre o mesmo assunto, mesmo escrito com outras palavras? Então abrimos essa, sem gastar IA.
  const match = !force ? trails.find((t) => t.level === level && sameTopic(t.topic, topic)) : undefined;

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (match) return onOpen(match);
    if (topic.trim().length < 2) return setError("Escreve um tema ou escolhe uma sugestão.");
    setError(null);
    setLoading(true);
    try {
      const trail = await createTrail(topic, level);
      // a trilha de exemplo sai de cena quando a primeira trilha de verdade chega
      update((s) => ({ ...s, trails: [trail, ...s.trails.filter((t) => !t.example)], active: trail.id }));
      onDone(trail.topic);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Sem ligação. Tenta outra vez.");
      setLoading(false);
    }
  }

  return (
    <div className="newtopic">
      <div className="hero-new">
        <div className="hero-mascot"><Mascot mood={loading ? "think" : error ? "sad" : "idle"} /></div>
        <h1 className="h-screen">O que queres aprender?</h1>
        <p className="sub">Escreve qualquer tema. A trilha é montada para ti.</p>
      </div>

      <form onSubmit={submit}>
        <label className="sr" htmlFor="topic">Tema</label>
        <input id="topic" className="field ch" value={topic} onChange={(e) => { setTopic(e.target.value); setForce(false); }}
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
        {error && <div className="note ch" role="alert">{error}</div>}
        <button type="submit" className="btn block" disabled={loading}>
          <span className="face">{loading ? "A montar a trilha…" : match ? "Abrir trilha existente" : "Gerar trilha"}</span>
        </button>
        {loading && <p className="sub center" role="status">A procurar fontes abertas e a organizar os conceitos. Leva uns segundos.</p>}
      </form>
    </div>
  );
}
