// Allégations interdites dans les boutiques — même liste que la fonction
// SQL texte_sans_allegation (supabase/migrations/0001_boutique.sql). La
// base refuse de toute façon ; ici on explique AVANT l'envoi, en français.
//
// Pourquoi : les produits sont publiés sans relecture préalable (décision
// du 22/10/2026). Une promesse de guérison sur un produit vendu via Lafi
// engage Lafi et peut détourner quelqu'un d'un traitement.
const MOTIFS: { motif: RegExp; explication: string }[] = [
  { motif: /gu[eéè]ri/i, explication: "« guérit » / « guérison » : une promesse de guérison n'est pas autorisée" },
  { motif: /miracle|miraculeu/i, explication: "« miracle »" },
  { motif: /100 ?%/i, explication: "« 100 % »" },
  { motif: /garanti/i, explication: "« garanti »" },
  { motif: /sans (aucun )?(danger|risque|effet secondaire)/i, explication: "« sans danger » / « sans risque » : aucune préparation n'est sans risque pour tout le monde" },
  { motif: /remplace (le |les |votre |ton |tes )?(m[eé]dicament|traitement)/i, explication: "« remplace le traitement »" },
  {
    motif: /(soigne|traite|gu[eé]rit|contre) (le |la |les |l')?(cancer|diab[eè]te|vih|sida|h[eé]patite|[eé]pilepsie|st[eé]rilit[eé]|infertilit[eé])/i,
    explication: "promettre de traiter une maladie grave (cancer, diabète, VIH, hépatite, épilepsie, stérilité)",
  },
];

export function allegationsTrouvees(...textes: (string | null | undefined)[]): string[] {
  const texte = textes.filter(Boolean).join(" ");
  return MOTIFS.filter((m) => m.motif.test(texte)).map((m) => m.explication);
}
