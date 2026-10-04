"use client";

import { useEffect, useState } from "react";
import { Avatar } from "./Avatar";
import { weekStart, type Profile } from "@/lib/profile";
import { supabase } from "@/lib/supabase";

type Row = Pick<Profile, "id" | "username" | "display_name" | "avatar" | "week_xp">;

/** Ranking da semana (reinicia às segundas, hora de Lisboa). Só entra quem não o desligou nas Definições. */
export function Ranking({ me, onBack }: { me: Profile; onBack: () => void }) {
  const [rows, setRows] = useState<Row[] | null>(null);
  const [place, setPlace] = useState<number | null>(null);
  const [failed, setFailed] = useState(false);

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
    return () => { live = false; };
  }, [me]);

  return (
    <div className="explore">
      <button type="button" className="linkbtn back" onClick={onBack}>← Voltar ao perfil</button>
      <h1 className="h-screen">Ranking da semana</h1>
      <p className="sub">Recomeça às segundas. {place ? `Estás em ${place}.º lugar.` : me.in_ranking ? "Ganha XP esta semana para entrares." : "Estás fora do ranking (nas Definições podes voltar)."}</p>
      {failed && <div className="note ch" role="alert">Não consegui carregar o ranking. Tenta outra vez mais tarde.</div>}
      {rows && !rows.length && <p className="sub center">Ainda ninguém ganhou XP esta semana. Sê a primeira pessoa!</p>}
      <ol className="rank">
        {rows?.map((r, i) => (
          <li key={r.id} className={`pane rise${r.id === me.id ? " is-mine" : ""}`} style={{ ["--i" as string]: i }}><div className="in rank-row">
            <span className="rank-n">{i + 1}</span>
            <Avatar n={r.avatar} size={40} />
            <div className="rank-id"><b>{r.display_name || `@${r.username}`}</b><div className="sub small">@{r.username}</div></div>
            <span className="stat-n">{r.week_xp}</span>
          </div></li>
        ))}
      </ol>
    </div>
  );
}
