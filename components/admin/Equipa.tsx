"use client";

import { useState } from "react";
import { act, Danger, Loading, ROLE_LABEL, useSection, type Say } from "./shared";

type P = { id: string; username: string; display_name: string; avatar: number } | null;
type D = { owners: { user_id: string; profile: P }[]; staff: { user_id: string; role: "admin" | "moderador"; profile: P }[] };

/** Equipa (só o dono): dar, mudar e retirar acessos. Os donos vêm da Vercel e não se alteram aqui. */
export function Equipa({ say }: { say: Say }) {
  const { data, error, reload } = useSection<D>("equipa");
  const [ref, setRef] = useState("");
  const [role, setRole] = useState<"admin" | "moderador">("moderador");
  if (!data) return <Loading error={error} />;
  const name = (p: P, id: string) => (p ? `@${p.username}` : id);
  return (
    <div className="list">
      <section className="pane"><div className="in set">
        <div className="eyebrow">Donos</div>
        {data.owners.map((o) => <div key={o.user_id} className="due-row"><b>{name(o.profile, o.user_id)}</b><span className="sub small">Dono · definido na Vercel</span></div>)}
      </div></section>
      <section className="pane"><div className="in set">
        <div className="eyebrow">Admins e moderadores</div>
        {!data.staff.length && <p className="sub small">Ainda ninguém. Acrescenta abaixo.</p>}
        {data.staff.map((s) => (
          <div key={s.user_id} className="due-row">
            <b>{name(s.profile, s.user_id)}</b>
            <span className="acts-inline">
              <select className="field ch" aria-label={`Papel de ${name(s.profile, s.user_id)}`} value={s.role} style={{ width: "auto" }}
                onChange={async (e) => { if (await act({ act: "staff-set", ref: s.user_id, role: e.target.value }, say, "Papel mudado.")) void reload(); }}>
                <option value="admin">{ROLE_LABEL.admin}</option><option value="moderador">{ROLE_LABEL.moderador}</option>
              </select>
              <Danger label="Retirar" sure={`Retirar ${name(s.profile, s.user_id)} da equipa?`} onConfirm={async () => { if (await act({ act: "staff-del", ref: s.user_id }, say, "Retirado da equipa.")) void reload(); }} />
            </span>
          </div>
        ))}
      </div></section>
      <section className="pane"><div className="in set">
        <div className="eyebrow">Acrescentar à equipa</div>
        <input className="field ch" aria-label="E-mail, @nome ou UID" placeholder="E-mail, @nome ou UID" value={ref} onChange={(e) => setRef(e.target.value)} autoCapitalize="none" autoComplete="off" />
        <select className="field ch" aria-label="Papel" value={role} onChange={(e) => setRole(e.target.value as "admin" | "moderador")}>
          <option value="moderador">Moderador: responde a ideias e erros, vê perfis públicos</option>
          <option value="admin">Admin: também vê dados da conta, age nas contas e envia avisos</option>
        </select>
        <button type="button" className="btn" disabled={ref.trim().length < 3} onClick={async () => { if (await act({ act: "staff-set", ref, role }, say, "Acesso dado.")) { setRef(""); void reload(); } }}><span className="face">Dar acesso</span></button>
      </div></section>
    </div>
  );
}
