"use client";

import { useEffect, useState } from "react";
import { Avatar } from "./Avatar";
import { TeamTag } from "./TeamTag";
import { TrophyCup } from "./Trophies";
import { lastWeek } from "@/lib/awards";
import { weekStart, type Profile } from "@/lib/profile";
import { supabase } from "@/lib/supabase";

type Row = Pick<Profile, "id" | "username" | "display_name" | "avatar" | "week_xp">;

/** Ranking da semana (reinicia às segundas, hora de Lisboa). Só entra quem não o desligou nas Definições. */
export function Ranking({ me, onBack }: { me: Profile; onBack: () => void }) {
  const [rows, setRows] = useState<Row[] | null>(null);
  const [place, setPlace] = useState<number | null>(null);
  const [failed, setFailed] = useState(false);
  const [podium, setPodium] = useState<{ place: number; xp: number; p: Pick<Row, "id" | "username" | "display_name" | "avatar"> | undefined }[]>([]);

  useEffect(() => {
    let live = true;
    const wk = weekStart();
    (async () => {
      const list = await supabase!.from("profiles").select("id,username,display_name,avatar,week_xp").eq("week_start", wk).eq("in_ranking", true).gt("week_xp", 0).order("week_xp", { ascending: false }).limit(50);
      if (!live) return;
      if (list.error) return setFailed(true);
      setRows(list.data as Row[]);
      if (me.in_ranking && me.week_xp > 0) {
        const above = await supabase!.from("profiles").select("id", { count: "exact", head: true }).eq("week_start", wk).eq("in_ranking", true).gt("week_xp", me.week_xp);
        if (live && above.count !== null) setPlace(above.count + 1);
      }
    })();
    (async () => { // pódio da semana passada
      const aw = await supabase!.from("weekly_awards").select("user_id,place,xp").eq("week_start", lastWeek()).lte("place", 3).order("place");
      if (!live || !aw.data?.length) return;
      const ps = await supabase!.from("profiles").select("id,username,display_name,avatar").in("id", aw.data.map((a) => a.user_id));
      if (live) setPodium(aw.data.map((a) => ({ place: a.place, xp: a.xp, p: ps.data?.find((x) => x.id === a.user_id) })));
    })();
    return () => { live = false; };
  }, [me]);

  return (
    <div className="explore">
      <button type="button" className="linkbtn back" onClick={onBack}>← Voltar ao perfil</button>
      <h1 className="h-screen">Ranking da semana</h1>
      <p className="sub">Recomeça às segundas. {place ? `Estás em ${place}.º lugar.` : me.in_ranking ? "Ganha XP esta semana para entrares." : "Estás fora do ranking (nas Definições podes voltar)."}</p>
      {podium.length > 0 && (
        <section className="podium-wrap" aria-labelledby="pod-t">
          <h2 id="pod-t" className="h-sec">Pódio da semana passada</h2>
          <ol className="podium" style={{ padding: 0, margin: 0 }}>
            {podium.map((a) => (
              <li key={a.place}>
                <TrophyCup place={a.place} size={a.place === 1 ? 56 : 44} />
                {a.p && <Avatar n={a.p.avatar} size={36} />}
                <b>{a.p?.display_name || (a.p ? `@${a.p.username}` : "—")}</b>
                <span className="sub small">{a.xp} XP</span>
              </li>
            ))}
          </ol>
        </section>
      )}
      {failed && <div className="note ch" role="alert">Não consegui carregar o ranking. Tenta outra vez mais tarde.</div>}
      {rows && !rows.length && <p className="sub center">Ainda ninguém ganhou XP esta semana. Sê a primeira pessoa!</p>}
      <ol className="rank">
        {rows?.map((r, i) => (
          <li key={r.id} className={`pane rise${r.id === me.id ? " is-mine" : ""}`} style={{ ["--i" as string]: i }}><div className="in rank-row">
            <span className="rank-n">{i + 1}</span>
            <Avatar n={r.avatar} size={40} />
            <div className="rank-id"><b>{r.display_name || `@${r.username}`}</b> <TeamTag id={r.id} /><div className="sub small">@{r.username}</div></div>
            <span className="stat-n">{r.week_xp}</span>
          </div></li>
        ))}
      </ol>
    </div>
  );
}
