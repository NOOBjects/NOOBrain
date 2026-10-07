import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Avatar } from "@/components/Avatar";
import { LegalLinks } from "@/components/LegalPage";
import { TeamChip } from "@/components/TeamTag";
import { TrophyLine } from "@/components/Trophies";
import { staffIds } from "@/lib/staff";
import { PROFILE_COLUMNS, USERNAME, type Profile } from "@/lib/profile";
import { supabase } from "@/lib/supabase";

// Perfis públicos: gerados à primeira visita e renovados de hora a hora.
export const revalidate = 3600;
export const generateStaticParams = async () => [];

type Props = { params: Promise<{ username: string }> };

async function load(username: string): Promise<Profile | null> {
  if (!USERNAME.test(username)) return null;
  try {
    const { data } = await supabase!.from("profiles").select(PROFILE_COLUMNS).eq("username", username).maybeSingle();
    return (data as Profile | null) ?? null;
  } catch {
    return null;
  }
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { username } = await params;
  const p = await load(username);
  if (!p) return { title: "Perfil não encontrado", robots: { index: false } };
  return {
    title: `@${p.username} · NOOBrain`,
    description: `${p.display_name || `@${p.username}`} está a aprender no NOOBrain: ${p.xp} XP e ${p.topics_done} temas concluídos.`,
    robots: { index: p.in_ranking },
  };
}

export default async function PublicProfile({ params }: Props) {
  const { username } = await params;
  const p = await load(username);
  if (!p) notFound();
  const team = (await staffIds()).includes(p.id);
  const { data: awards } = await supabase!.from("weekly_awards").select("place").eq("user_id", p.id);
  const stats: [string, number][] = [["XP", p.xp], ["Sequência", p.streak], ["Temas concluídos", p.topics_done]];

  return (
    <main className="legal">
      <Link href="/" className="linkbtn">← NOOBrain</Link>
      <div className="profile-top">
        <Avatar n={p.avatar} size={84} />
        <div className="profile-id">
          <h1 className="h-screen">{p.display_name || `@${p.username}`}</h1>
          <div className="sub">@{p.username} {team && <TeamChip />}</div>
        </div>
      </div>
      {p.bio && <p className="sub">{p.bio}</p>}
      <div className="stats-grid">
        {stats.map(([label, n]) => (
          <div key={label} className="pane"><div className="in stat-box"><span className="stat-n">{n}</span><span className="eyebrow">{label}</span></div></div>
        ))}
      </div>
      <TrophyLine awards={awards ?? []} />
      <Link href="/" className="btn block"><span className="face">Aprender no NOOBrain</span></Link>
      <LegalLinks />
    </main>
  );
}
