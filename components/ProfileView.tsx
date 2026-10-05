"use client";

import type { User } from "@supabase/supabase-js";
import { useState } from "react";
import { Avatar } from "./Avatar";
import { BadgeGrid } from "./Badges";
import { CategoryIcon } from "./CategoryIcon";
import { DayBars } from "./DayBars";
import { Gear } from "./Icons";
import { ProfileForm } from "./ProfileForm";
import { categoryOf } from "@/lib/categories";
import { SITE_URL } from "@/lib/config";
import type { Profile } from "@/lib/profile";
import { currentStreak, dueCards, goalOf, lessonsToday, todayXp } from "@/lib/store";
import { useQuota } from "@/lib/useQuota";
import type { State } from "@/lib/types";

const since = (iso: string) => new Date(iso).toLocaleDateString("pt-PT", { month: "long", year: "numeric" });

/** O perfil da pessoa: identidade, números, meta de hoje, mapa dos temas e conquistas. XP e sequência vêm do estado local (sempre em dia). */
export function ProfileView({ user, profile, state, onSaved, onSettings, notify, onOpenTrail }: {
  user: User; profile: Profile; state: State; onSaved: () => void; onSettings: () => void;
  notify: (m: string) => void; onOpenTrail: (id: string) => void;
}) {
  const [editing, setEditing] = useState(false);
  const quota = useQuota();
  const done = state.trails.filter((t) => t.concepts.length > 0 && t.done >= t.concepts.length).length;
  const mastered = Object.values(state.cards).filter((c) => c.box >= 4).length;
  const kept = Object.values(state.stats ?? {}).filter((c) => c.r7 !== undefined);
  const retention = kept.length ? Math.round((kept.reduce((n, c) => n + (c.r7 ?? 0), 0) / kept.length) * 100) : null;
  const goal = goalOf(state);
  const today = todayXp(state);
  const due = dueCards(state);
  const stats: [string, number | string][] = [
    ["XP", state.xp], ["Dias seguidos", currentStreak(state)], ["Temas concluídos", done], ["Cartões dominados", mastered],
    ["XP da semana", profile.week_xp], ["Retenção aos 7 dias", retention === null ? "—" : `${retention}%`],
  ];

  if (editing) {
    return (
      <div className="profile">
        <h1 className="h-screen">Editar perfil</h1>
        <ProfileForm user={user} profile={profile} onSaved={() => { setEditing(false); onSaved(); }} onCancel={() => setEditing(false)} />
      </div>
    );
  }

  async function share() {
    const url = `${SITE_URL}/u/${profile.username}`;
    try {
      if (navigator.share) { await navigator.share({ title: `@${profile.username} no NOOBrain`, url }); return; }
      await navigator.clipboard.writeText(url);
      notify("Link do perfil copiado");
    } catch (e) {
      if ((e as Error).name !== "AbortError") notify(url);
    }
  }

  return (
    <div className="profile">
      <div className="profile-top">
        <Avatar n={profile.avatar} size={72} />
        <div className="profile-id">
          <h1 className="h-screen">{profile.display_name || `@${profile.username}`}</h1>
          <div className="sub">@{profile.username}</div>
          <div className="sub small">Membro desde {since(profile.created_at)}</div>
        </div>
        <button type="button" className="iconbtn ch" aria-label="Definições" onClick={onSettings}><Gear /></button>
      </div>
      {profile.bio && <p className="sub">{profile.bio}</p>}
      <div className="pair">
        <button type="button" className="btn sm" onClick={() => setEditing(true)}><span className="face">Editar perfil</span></button>
        <button type="button" className="btn soft sm" onClick={() => void share()}><span className="face">Partilhar perfil</span></button>
      </div>

      <div className="pane tint goal-box"><div className="in">
        <div className="row-between"><span className="eyebrow">Meta de hoje</span><span className="eyebrow">{Math.min(today, goal)} / {goal} XP</span></div>
        <div className="bar ch" role="progressbar" aria-label="Meta de hoje" aria-valuenow={Math.min(today, goal)} aria-valuemin={0} aria-valuemax={goal}>
          <i className={today >= goal ? "met" : undefined} style={{ transform: `scaleX(${Math.min(1, today / goal)})` }} />
        </div>
        <p className="sub small">{today >= goal ? "Meta cumprida. Boa!" : `Faltam ${goal - today} XP. Uma lição ou uns cartões chegam.`}</p>
        <DayBars lessons={lessonsToday(state).length} topics={quota?.trail?.used ?? null} />
      </div></div>

      <div className="stats-grid">
        {stats.map(([label, n]) => (
          <div key={label} className="pane"><div className="in stat-box"><span className="stat-n">{n}</span><span className="eyebrow">{label}</span></div></div>
        ))}
      </div>

      <BadgeGrid state={state} />

      {state.trails.length > 0 && (
        <section aria-labelledby="map-t">
          <div className="row-between"><h2 id="map-t" className="h-sec">Os teus temas</h2><span className="eyebrow">{state.trails.length}</span></div>
          <ul className="topic-map">
            {state.trails.map((t) => {
              const total = t.concepts.length || 1;
              const pct = Math.round((t.done / total) * 100);
              const n = due.filter((d) => d.id.startsWith(`${t.id}:`)).length;
              return (
                <li key={t.id}>
                  <button type="button" className={`map-node pane${t.done >= total ? " is-done" : ""}${t.archived ? " is-archived" : ""}`} onClick={() => onOpenTrail(t.id)}>
                    <span className="in">
                      <span className="map-top"><span className="cat-ico ch" aria-hidden="true"><CategoryIcon c={categoryOf(t.key, t.category)} /></span>{n > 0 && <span className="map-due" title={`${n} para rever`}>{n}</span>}</span>
                      <b>{t.topic}</b>
                      <span className="bar ch" aria-hidden="true"><i style={{ transform: `scaleX(${pct / 100})` }} /></span>
                      <span className="sub small">{t.archived ? "Arquivada · " : ""}{t.done} de {t.concepts.length}</span>
                    </span>
                  </button>
                </li>
              );
            })}
          </ul>
        </section>
      )}


    </div>
  );
}
