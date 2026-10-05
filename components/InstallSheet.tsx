"use client";

import { useEffect, useRef } from "react";
import { Book, Download, Share } from "./Icons";

/** Passos para instalar no iPhone (o Safari não tem botão de instalar). */
export function InstallSheet({ onClose }: { onClose: () => void }) {
  const ref = useRef<HTMLDialogElement>(null);
  useEffect(() => { ref.current?.showModal(); }, []);
  return (
    <dialog ref={ref} className="sheet" aria-labelledby="inst-t" onClose={onClose} onClick={(e) => e.target === ref.current && ref.current?.close()}>
      <div className="pane"><div className="in set">
        <h2 id="inst-t">Instalar o NOOBrain</h2>
        <ol className="steps">
          <li><span className="w-ico ch"><Share /></span><span>Toca em <b>Partilhar</b>, na barra do navegador (o quadrado com uma seta).</span></li>
          <li><span className="w-ico ch"><Book /></span><span>Escolhe <b>Adicionar ao ecrã principal</b>.</span></li>
          <li><span className="w-ico ch"><Download /></span><span>Toca em <b>Adicionar</b>. Pronto!</span></li>
        </ol>
        <button type="button" className="btn block" onClick={() => ref.current?.close()}><span className="face">Percebi</span></button>
      </div></div>
    </dialog>
  );
}
