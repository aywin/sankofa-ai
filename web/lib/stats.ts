import { supabaseServer } from "./supabase";

// Chiffres affichés sur la landing (§9 du brief : "le minimalisme n'est
// crédible que payé par des preuves"). Uniquement des comptages bruts et
// vérifiables — jamais "traditions indépendantes" ou "attestations de
// terrain" en avant : la quasi-totalité du corpus actuel est encore
// démonstrative (lignées `est_demo = true`), et l'afficher comme un
// chiffre de confiance serait exactement le genre d'habillage que ce
// projet s'interdit ailleurs (voir lib/confidence.ts historique).
export interface LafiStats {
  plantesCount: number;
  usagesCount: number;
  etudesCount: number;
  indicationsCount: number;
}

export async function getLafiStats(): Promise<LafiStats> {
  const [taxon, claim, etude, indication] = await Promise.all([
    supabaseServer.from("taxon").select("*", { count: "exact", head: true }),
    supabaseServer.from("claim").select("*", { count: "exact", head: true }),
    supabaseServer.from("etude").select("*", { count: "exact", head: true }),
    supabaseServer.from("indication").select("*", { count: "exact", head: true }),
  ]);

  return {
    plantesCount: taxon.count ?? 0,
    usagesCount: claim.count ?? 0,
    etudesCount: etude.count ?? 0,
    indicationsCount: indication.count ?? 0,
  };
}
