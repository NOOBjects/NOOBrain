// Perfil público de cada conta (tabela `profiles` no Supabase). O XP e a sequência são copiados do progresso por um gatilho do banco.
export type Profile = {
  id: string;
  username: string;
  display_name: string;
  avatar: number;
  bio: string;
  in_ranking: boolean;
  xp: number;
  streak: number;
  topics_done: number;
  week_xp: number;
  created_at: string;
};

export const PROFILE_COLUMNS = "id,username,display_name,avatar,bio,in_ranking,xp,streak,topics_done,week_xp,created_at";
export const USERNAME = /^[a-z0-9_]{3,20}$/;

/** Segunda-feira da semana atual em Lisboa (AAAA-MM-DD): a mesma conta que o banco faz em `week_start`. */
export function weekStart(now = new Date()) {
  const p = Object.fromEntries(new Intl.DateTimeFormat("en-CA", { timeZone: "Europe/Lisbon", year: "numeric", month: "2-digit", day: "2-digit", weekday: "short" }).formatToParts(now).map((x) => [x.type, x.value]));
  const d = new Date(Date.UTC(Number(p.year), Number(p.month) - 1, Number(p.day)));
  d.setUTCDate(d.getUTCDate() - ((d.getUTCDay() + 6) % 7));
  return d.toISOString().slice(0, 10);
}
