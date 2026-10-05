"use client";

import { useEffect, useRef } from "react";
import { Bug, Hammer, Heart, Idea } from "./Icons";
import { Soon } from "./Soon";
import { highlights, LATEST, SOON } from "@/lib/changelog";
import { needsInstall, setNotify } from "@/lib/reminders";
import { update } from "@/lib/store";
import type { State } from "@/lib/types";

const IPHONE = "No iPhone, os avisos só funcionam com o NOOBrain no ecrã principal: Partilhar → Adicionar ao ecrã principal.";
const markSeen = () => update((s) => ({ ...s, seenVersion: LATEST.version }));

/** Resposta à pergunta "Queres receber avisos de novidades?". */
async function answer(yes: boolean, toast: (m: string) => void) {
  if (!yes) return update((s) => ({ ...s, notify: { ...s.notify, news: false } }));
  const ok = await setNotify("news", true);
  toast(ok ? "Combinado: avisamos-te das novidades." : needsInstall() ? IPHONE : "O navegador não deixou ligar os avisos. Podes tentar de novo em Novidades.");
}

/**
 * Um aviso de cada vez, por esta ordem:
 * 1. conta nova: boas-vindas à beta, com a pergunta dos avisos (janela por cima de tudo);
 * 2. conta antiga que ainda não respondeu: só a pergunta;
 * 3. há uma versão nova por ver: as novidades dela.
 */
export function Announce({ state, uid, onNews, toast }: { state: State; uid: string; onNews: () => void; toast: (m: string) => void }) {
  // Quem fechou o aviso da beta antigo (guardado só neste navegador) já não vê as boas-vindas outra vez.
  const legacy = (() => { try { return localStorage.getItem(`noobrain:beta-seen:${uid}`) === "1"; } catch { return false; } })();
  if (state.seenVersion === undefined && !legacy) return <Welcome toast={toast} />;
  if (state.notify?.news === undefined)
    return (
      <div className="pane tint announce" role="status"><div className="in">
        <b>Queres receber um aviso quando houver novidades?</b>
        <p className="sub small">Só nas atualizações importantes. Podes mudar isto quando quiseres em Novidades.</p>
        <div className="pair">
          <button type="button" className="btn sm" onClick={() => void answer(true, toast)}><span className="face">Sim, avisa-me</span></button>
          <button type="button" className="btn soft sm" onClick={() => void answer(false, toast)}><span className="face">Agora não</span></button>
        </div>
      </div></div>
    );
  if (state.seenVersion !== LATEST.version)
    return (
      <div className="pane tint announce" role="status"><div className="in">
        <div className="eyebrow">Novidades · versão {LATEST.version}</div>
        <b>{LATEST.title}</b>
        <ul className="news-list sub small">{highlights(LATEST).map((t) => <li key={t}>{t}</li>)}</ul>
        <div className="pair">
          <button type="button" className="btn sm" onClick={() => { markSeen(); onNews(); }}><span className="face">Ver tudo</span></button>
          <button type="button" className="btn soft sm" onClick={markSeen}><span className="face">Fechar</span></button>
        </div>
      </div></div>
    );
  // O «Em breve»: aparece uma vez a cada conta (e outra vez quando a lista muda).
  if (state.soon !== SOON.id) return <Soon onClose={() => update((s) => ({ ...s, soon: SOON.id }))} />;
  return null;
}

/** Boas-vindas à beta: janela nativa (<dialog>), que trata do foco e do fundo. Só fecha com uma resposta. */
function Welcome({ toast }: { toast: (m: string) => void }) {
  const ref = useRef<HTMLDialogElement>(null);
  useEffect(() => {
    const d = ref.current;
    if (d && !d.open) { d.showModal(); d.scrollTop = 0; }
  }, []);
  function close(yes: boolean) {
    markSeen();
    void answer(yes, toast);
    ref.current?.close();
  }
  return (
    <dialog ref={ref} className="sheet" aria-labelledby="welcome-t" onCancel={(e) => e.preventDefault()}>
      <div className="pane hero"><div className="in">
        <div className="w-head">
          <span className="chip ch beta">Beta {LATEST.version}</span>
          <h2 id="welcome-t">Boas-vindas ao NOOBrain</h2>
          <p>Aprende o que quiseres, ao teu ritmo. Estamos a construir isto contigo.</p>
        </div>
        <ul className="w-list">
          <li><span className="w-ico ch"><Hammer /></span><div><b>Em construção</b><span>Algumas coisas podem falhar ou mudar.</span></div></li>
          <li><span className="w-ico ch"><Idea /></span><div><b>Tu decides o que vem a seguir</b><span>Partilha e vota ideias na aba Ideias.</span></div></li>
          <li><span className="w-ico ch"><Bug /></span><div><b>Viste um erro?</b><span>Usa «Reportar erro» no teste ou no tutor.</span></div></li>
          <li><span className="w-ico ch"><Heart /></span><div><b>É gratuito</b><span>Fundraising em breve.</span></div></li>
        </ul>
        <div className="w-ask">
          <b>Queres um aviso quando houver novidades?</b>
          <span>Só nas atualizações importantes. Podes mudar isto em Novidades.</span>
          <div className="pair">
            <button type="button" className="btn sm" onClick={() => close(true)}><span className="face">Sim, avisa-me</span></button>
            <button type="button" className="btn soft sm" onClick={() => close(false)}><span className="face">Agora não</span></button>
          </div>
        </div>
      </div></div>
    </dialog>
  );
}
