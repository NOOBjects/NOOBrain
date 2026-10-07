"use client";

import { Shield } from "./Icons";
import { useStaff } from "@/lib/useStaff";

/** Etiqueta «Equipa» (membros da equipa do NOOBrain). */
export function TeamChip() {
  return <span className="chip ch team" title="Faz parte da equipa do NOOBrain"><Shield />Equipa</span>;
}

/** Mostra a etiqueta se a conta `id` for da equipa. */
export function TeamTag({ id }: { id: string | null | undefined }) {
  const ids = useStaff();
  return id && ids.has(id) ? <TeamChip /> : null;
}
