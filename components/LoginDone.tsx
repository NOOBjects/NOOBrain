"use client";

import { useEffect } from "react";
import { Check, HeroIco } from "./Icons";
import { supabase } from "@/lib/supabase";

/** Fim do login do Google aberto numa janela à parte: o Supabase lê a sessão do endereço e avisa o separador do app; depois fecha-se. */
export function LoginDone() {
  useEffect(() => {
    const done = () => {
      window.close();
      setTimeout(() => window.location.replace("/"), 500); // se o navegador não deixar fechar, segue para o app
    };
    const sub = supabase?.auth.onAuthStateChange((e) => { if (e === "SIGNED_IN") done(); });
    const t = setTimeout(done, 4000); // login cancelado ou com erro: fecha na mesma
    return () => { sub?.data.subscription.unsubscribe(); clearTimeout(t); };
  }, []);
  return (
    <main className="account">
      <HeroIco><Check /></HeroIco>
      <p className="sub center">A concluir a entrada. Esta janela fecha-se sozinha.</p>
    </main>
  );
}
