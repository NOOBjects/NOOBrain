import { weekStart } from "./profile";

// Prémios do ranking semanal (tabela `weekly_awards`, escrita pela função `close_week` do banco): só cosméticos.
export type Award = { week_start: string; place: number; xp: number };

export const PLACE_NAME = (p: number) => (p === 1 ? "Campeão da semana" : p === 2 ? "2.º lugar" : p === 3 ? "3.º lugar" : "Top 10");

/** Segunda-feira da semana passada (a que o pódio mostra). */
export const lastWeek = () => weekStart(new Date(Date.now() - 7 * 86_400_000));

/** Contagem por tipo: ouro, prata, bronze e top 10 (4.º a 10.º). */
export function tally(list: Pick<Award, "place">[]) {
  return { ouro: list.filter((a) => a.place === 1).length, prata: list.filter((a) => a.place === 2).length, bronze: list.filter((a) => a.place === 3).length, top10: list.filter((a) => a.place >= 4).length };
}
