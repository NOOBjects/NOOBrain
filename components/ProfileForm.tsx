"use client";

import type { User } from "@supabase/supabase-js";
import { useEffect, useState } from "react";
import { Avatar } from "./Avatar";
import { USERNAME, type Profile } from "@/lib/profile";
import { supabase } from "@/lib/supabase";

/** Nome sugerido a partir do nome do Google ou do e-mail: sem acentos, só a-z, 0-9 e _. */
function suggest(user: User) {
  const base = (user.user_metadata?.full_name as string | undefined) || user.email?.split("@")[0] || "";
  const s = base.normalize("NFD").replace(/[̀-ͯ]/g, "").toLowerCase().replace(/[^a-z0-9_]/g, "").slice(0, 20);
  return s.length >= 3 ? s : "";
}

/** Criar o perfil (sem `profile`) ou editá-lo. */
export function ProfileForm({ user, profile, onSaved, onCancel }: { user: User; profile: Profile | null; onSaved: () => void; onCancel?: () => void }) {
  const [username, setUsername] = useState(profile?.username ?? suggest(user));
  const [name, setName] = useState(profile?.display_name ?? ((user.user_metadata?.full_name as string | undefined) ?? "").slice(0, 40));
  const [avatar, setAvatar] = useState(profile?.avatar ?? 0);
  const [bio, setBio] = useState(profile?.bio ?? "");
  const [age, setAge] = useState(false);
  const [checked, setChecked] = useState<{ name: string; taken: boolean } | null>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const valid = USERNAME.test(username);
  const same = username === profile?.username;
  // Verifica se o @nome está livre 400 ms depois de a pessoa parar de escrever.
  useEffect(() => {
    if (!valid || same) return;
    const t = setTimeout(async () => {
      const { count } = await supabase!.from("profiles").select("id", { count: "exact", head: true }).eq("username", username);
      setChecked({ name: username, taken: (count ?? 0) > 0 });
    }, 400);
    return () => clearTimeout(t);
  }, [username, valid, same]);

  const hint = !username ? "" : !valid ? "Usa 3 a 20 letras minúsculas, números ou _."
    : same ? "" : checked?.name !== username ? "A verificar…" : checked.taken ? "Esse nome já está ocupado." : "Está livre.";
  const blocked = !valid || (!same && (checked?.name !== username || checked.taken));

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    if (blocked) return setError(hint || "Escolhe um @nome.");
    if (!profile && !age) return setError("Confirma que tens 13 anos ou mais.");
    setBusy(true);
    const row = { username, display_name: name.trim(), avatar, bio: bio.trim() };
    const { data, error: err } = profile
      ? await supabase!.from("profiles").update(row).eq("id", user.id).select("avatar")
      : await supabase!.from("profiles").insert({ id: user.id, ...row, age_ok: true }).select("avatar");
    setBusy(false);
    if (err) return setError(err.code === "23505" ? "Esse nome já está ocupado." : err.code === "23514" ? "Esse nome não está disponível." : "Não consegui guardar. Tenta outra vez.");
    if (data?.[0]?.avatar !== avatar) return setError("Não consegui guardar o avatar. Tenta outra vez.");
    onSaved();
  }

  return (
    <form className="account-form" onSubmit={submit}>
      <div className="fld">
        <label className="lbl" htmlFor="username">@nome</label>
        <input id="username" className="field ch" value={username} maxLength={20} autoCapitalize="none" autoComplete="off" spellCheck={false}
          onChange={(e) => setUsername(e.target.value.toLowerCase())} aria-invalid={!!username && blocked} />
        {hint && <p className={`hint${blocked && hint !== "A verificar…" ? " bad" : ""}`}>{hint}</p>}
      </div>
      <div className="fld">
        <label className="lbl" htmlFor="display">Nome a mostrar</label>
        <input id="display" className="field ch" value={name} maxLength={40} onChange={(e) => setName(e.target.value)} autoComplete="off" />
      </div>
      <div className="fld">
        <span className="lbl" id="av-l">Avatar</span>
        <div className="avpick" role="group" aria-labelledby="av-l">
          {[0, 1, 2, 3, 4, 5].map((n) => (
            <button key={n} type="button" className="avbtn" aria-pressed={avatar === n} aria-label={`Avatar ${n + 1}`} onClick={() => setAvatar(n)}><Avatar n={n} size={48} /></button>
          ))}
        </div>
      </div>
      {profile && (
        <div className="fld">
          <label className="lbl" htmlFor="bio">Sobre ti <span className="sub small">({bio.length}/160)</span></label>
          <input id="bio" className="field ch" value={bio} maxLength={160} onChange={(e) => setBio(e.target.value)} autoComplete="off" />
        </div>
      )}
      {!profile && (
        <label className="sub small agebox">
          <input type="checkbox" checked={age} onChange={(e) => setAge(e.target.checked)} />
          Confirmo que tenho 13 anos ou mais
        </label>
      )}
      {error && <div className="note ch" role="alert">{error}</div>}
      <button type="submit" className="btn block" disabled={busy}><span className="face">{busy ? "Um momento…" : profile ? "Guardar" : "Criar perfil"}</span></button>
      {onCancel && <button type="button" className="linkbtn" onClick={onCancel}>Cancelar</button>}
    </form>
  );
}
