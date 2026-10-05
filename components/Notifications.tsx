"use client";

import { useEffect, useState } from "react";
import { Bell, Bug, Download, Idea, Spark, Sync, Trophy } from "./Icons";
import type { Notice } from "@/lib/inbox";

const ICON: Record<Notice["kind"], React.ReactNode> = { ideia: <Idea />, erro: <Bug />, aviso: <Bell />, sistema: <Spark />, conquista: <Trophy />, app: <Download />, versao: <Spark /> };

/** "agora", "há 5 min", "há 3 h", "ontem" ou a data. */
export function ago(at: number, now = Date.now()) {
  const m = Math.max(0, Math.round((now - at) / 60_000));
  if (m < 1) return "agora";
  if (m < 60) return `há ${m} min`;
  if (m < 60 * 24) return `há ${Math.round(m / 60)} h`;
  if (m < 60 * 48) return "ontem";
  return new Date(at).toLocaleDateString("pt-PT", { day: "numeric", month: "short" });
}

/** Área de notificações: ideias que mudaram de estado, erros resolvidos, avisos da equipa e o que aconteceu neste aparelho (conquistas, meta, atualizações). */
export function Notifications({ items, due, onOpen, onReview, markAll, clear }: {
  items: Notice[];
  due: number;
  onOpen: (link: string) => void;
  onReview: () => void;
  markAll: () => Promise<void>;
  clear: () => Promise<void>;
}) {
  // Quais eram novas quando a página abriu: ficam destacadas mesmo depois de marcadas como lidas.
  const [fresh] = useState(() => new Set(items.filter((i) => i.unread).map((i) => i.id)));
  const unread = items.filter((i) => i.unread).length;
  useEffect(() => {
    if (!unread) return;
    const t = setTimeout(() => { void markAll(); }, 1500);
    return () => clearTimeout(t);
  }, [unread, markAll]);

  return (
    <div className="inbox">
      <h1 className="h-screen">Notificações</h1>
      {due > 0 && (
        <button type="button" className="pane note-row tint" onClick={onReview}>
          <span className="in"><span className="ico ch"><Sync /></span><span className="note-t"><b>{due === 1 ? "Tens 1 cartão para rever" : `Tens ${due} cartões para rever`}</b><span className="sub small">Toca para rever agora.</span></span></span>
        </button>
      )}
      {!items.length && !due && <p className="sub center">Ainda não tens notificações. Quando alguém responder a uma ideia tua, um erro for resolvido ou a equipa tiver um aviso, aparece aqui.</p>}
      <ul className="note-list">
        {items.map((n, i) => {
          const body = (
            <span className="in">
              <span className="ico ch">{ICON[n.kind]}</span>
              <span className="note-t"><b>{n.title}</b>{n.body && <span className="sub small">{n.body}</span>}<span className="sub small when">{ago(n.at)}</span></span>
              {fresh.has(n.id) && <i className="dot" aria-label="nova" />}
            </span>
          );
          return (
            <li key={n.id} className="rise" style={{ ["--i" as string]: i }}>
              {n.link
                ? <button type="button" className={`pane note-row${fresh.has(n.id) ? " tint" : ""}`} onClick={() => onOpen(n.link)}>{body}</button>
                : <div className={`pane note-row${fresh.has(n.id) ? " tint" : ""}`}>{body}</div>}
            </li>
          );
        })}
      </ul>
      {items.length > 0 && <div className="inbox-end"><button type="button" className="btn soft sm" onClick={() => void clear()}><span className="face">Limpar tudo</span></button></div>}
    </div>
  );
}
