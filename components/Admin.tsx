"use client";

import { useState } from "react";
import { Catalogo } from "./admin/Catalogo";
import { Equipa } from "./admin/Equipa";
import { Erros } from "./admin/Erros";
import { Ferramentas } from "./admin/Ferramentas";
import { Ideias } from "./admin/Ideias";
import { Opinioes } from "./admin/Opinioes";
import { Pessoas } from "./admin/Pessoas";
import { Qualidade } from "./admin/Qualidade";
import { Registo } from "./admin/Registo";
import { Resumo } from "./admin/Resumo";
import { ROLE_LABEL, type Role } from "./admin/shared";

type Tab = "resumo" | "ideias" | "erros" | "opinioes" | "catalogo" | "qualidade" | "pessoas" | "ferramentas" | "equipa" | "registo";
const TABS: { id: Tab; label: string; only?: Role[] }[] = [
  { id: "resumo", label: "Resumo" }, { id: "ideias", label: "Ideias" }, { id: "erros", label: "Erros" }, { id: "opinioes", label: "Opiniões" },
  { id: "catalogo", label: "Catálogo" }, { id: "qualidade", label: "Qualidade" }, { id: "pessoas", label: "Pessoas" },
  { id: "ferramentas", label: "Ferramentas", only: ["dono", "admin"] }, { id: "equipa", label: "Equipa", only: ["dono"] }, { id: "registo", label: "Registo", only: ["dono", "admin"] },
];

/** Painel de administração. O que cada pessoa vê depende do papel (dono, admin ou moderador); o servidor confere tudo outra vez. */
export function Admin({ role, onBack, notify }: { role: Role; onBack: () => void; notify: (m: string) => void }) {
  const [tab, setTab] = useState<Tab>("resumo");
  const [bad, setBad] = useState<string | null>(null);
  const say = (text: string, isBad = false) => { setBad(isBad ? text : null); notify(text); };
  const tabs = TABS.filter((t) => !t.only || t.only.includes(role));
  return (
    <div className="admin">
      <button type="button" className="linkbtn back" onClick={onBack}>← Voltar ao perfil</button>
      <div className="eyebrow">{ROLE_LABEL[role]}</div>
      <h1 className="h-screen">Administração</h1>
      <div className="topic-chips" role="tablist" aria-label="Secções">
        {tabs.map((t) => <button key={t.id} type="button" role="tab" className="chip ch" aria-selected={tab === t.id} onClick={() => { setTab(t.id); setBad(null); }}>{t.label}</button>)}
      </div>
      {bad && <div className="note ch" role="alert">{bad}</div>}
      {tab === "resumo" && <Resumo />}
      {tab === "ideias" && <Ideias say={say} />}
      {tab === "erros" && <Erros say={say} />}
      {tab === "opinioes" && <Opinioes />}
      {tab === "catalogo" && <Catalogo say={say} />}
      {tab === "qualidade" && <Qualidade say={say} />}
      {tab === "pessoas" && <Pessoas role={role} say={say} />}
      {tab === "ferramentas" && <Ferramentas say={say} />}
      {tab === "equipa" && <Equipa say={say} />}
      {tab === "registo" && <Registo />}
    </div>
  );
}
