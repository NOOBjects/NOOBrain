"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";

/** "Já há lições sobre:" no ecrã de entrada: os 8 temas mais usados do catálogo. */
export function CatalogChips() {
  const [topics, setTopics] = useState<string[]>([]);
  useEffect(() => {
    let live = true;
    supabase?.from("catalog_trails").select("topic").order("uses", { ascending: false }).limit(8).then(({ data }) => {
      if (live && data) setTopics([...new Set(data.map((r) => r.topic as string))]);
    });
    return () => { live = false; };
  }, []);
  if (!topics.length) return null;
  return (
    <div className="catalog-chips">
      <div className="eyebrow">Já há lições sobre:</div>
      <div className="sources">{topics.map((t) => <span key={t} className="chip ch">{t}</span>)}</div>
    </div>
  );
}
