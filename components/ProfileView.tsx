"use client";

import type { User } from "@supabase/supabase-js";
import { useState } from "react";
import { Avatar } from "./Avatar";
import { ProfileForm } from "./ProfileForm";
import { SITE_URL } from "@/lib/config";
import type { Profile } from "@/lib/profile";
import type { State } from "@/lib/types";

const since = (iso: string) => new Date(iso).toLocaleDateString("pt-PT", { month: "long", year: "numeric" });

/** O perfil da pessoa: avatar, nome, estatísticas e editar. XP e sequência vêm do estado local (sempre em dia). */
export function ProfileView({ user, profile, state, onSaved, onSettings, onRanking, onIdeas, onSignOut, notify }: {
  user: User; profile: Profile; state: State; onSaved: () => void; onSettings: () => void; onRanking: () => void; onIdeas: () => void; onSignOut: () => void; notify: (m: string) => void;
}) {
  const [editing, setEditing] = useState(false);
  const done = state.trails.filter((t) => t.concepts.length > 0 && t.done >= t.concepts.length).length;
  const mastered = Object.values(state.cards).filter((c) => c.box >= 4).length;
  const stats: [string, number][] = [
    ["XP", state.xp], ["Sequência", state.streak], ["Temas concluídos", done], ["Cartões dominados", mastered], ["XP da semana", profile.week_xp],
  ];

  if (editing) {
    return (
      <div className="profile">
        <h1 className="h-screen">Editar perfil</h1>
        <ProfileForm user={user} profile={profile} onSaved={() => { setEditing(false); onSaved(); }} onCancel={() => setEditing(false)} />
      </div>
    );
  }

  return (
    <div className="profile">
      <div className="profile-top">
        <Avatar n={profile.avatar} size={84} />
        <div className="profile-id">
          <h1 className="h-screen">{profile.display_name || `@${profile.username}`}</h1>
          <div className="sub">@{profile.username}</div>
          <div className="sub small">Membro desde {since(profile.created_at)}</div>
        </div>
        <button type="button" className="btn soft sm" onClick={onSettings}><span className="face">Definições</span></button>
      </div>
      {profile.bio && <p className="sub">{profile.bio}</p>}
      <div className="stats-grid">
        {stats.map(([label, n]) => (
          <div key={label} className="pane"><div className="in stat-box"><span className="stat-n">{n}</span><span className="eyebrow">{label}</span></div></div>
        ))}
      </div>
      <div className="acts">
        <button type="button" className="btn block" onClick={() => setEditing(true)}><span className="face">Editar perfil</span></button>
        <button type="button" className="btn block" onClick={async () => {
          try { await navigator.clipboard.writeText(`${SITE_URL}/u/${profile.username}`); notify("Link do perfil copiado"); } catch { notify(`${SITE_URL}/u/${profile.username}`); }
        }}><span className="face">Partilhar perfil</span></button>
        <button type="button" className="btn block" onClick={onRanking}><span className="face">Ranking</span></button>
        <button type="button" className="btn block" onClick={onIdeas}><span className="face">Ideias</span></button>
        <button type="button" className="btn soft block" onClick={onSignOut}><span className="face">Terminar sessão</span></button>
      </div>
    </div>
  );
}
