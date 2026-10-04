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
