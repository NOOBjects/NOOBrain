"use client";

import type { User } from "@supabase/supabase-js";
import { HeroIco, User as UserIcon } from "./Icons";
import { ProfileForm } from "./ProfileForm";

/** Primeiro ecrã de quem entra pela primeira vez: escolher @nome e avatar. */
export function Onboarding({ user, onSaved }: { user: User; onSaved: () => void }) {
  return (
    <div className="account">
      <HeroIco><UserIcon /></HeroIco>
      <h1 className="h-screen">Cria o teu perfil</h1>
      <p className="sub">Escolhe o teu @nome e um avatar. O @nome é público e podes mudá-lo mais tarde.</p>
      <ProfileForm user={user} profile={null} onSaved={onSaved} />
    </div>
  );
}
